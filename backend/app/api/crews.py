from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from uuid import UUID

from app.core.database import get_db
from app.models.database import CrewModel, CrewAgent, AgentModel
from app.schemas.crew import (
    CrewCreate, CrewUpdate, CrewResponse, CrewListResponse,
    CrewExecutionRequest, CrewExecutionResponse
)
from app.services.crewai_service import CrewAIService
from app.services.workflow_engine import WorkflowEngine

router = APIRouter()

@router.post("/", response_model=CrewResponse, status_code=status.HTTP_201_CREATED)
async def create_crew(
    crew: CrewCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new crew"""
    try:
        # Create crew
        db_crew = CrewModel(**crew.dict(exclude={"agent_ids"}))
        db.add(db_crew)
        await db.flush()  # Get the crew ID
        
        # Add agents to crew
        if crew.agent_ids:
            for agent_id in crew.agent_ids:
                crew_agent = CrewAgent(
                    crew_id=db_crew.id,
                    agent_id=agent_id
                )
                db.add(crew_agent)
        
        await db.commit()
        await db.refresh(db_crew)
        return CrewResponse.from_orm(db_crew)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create crew: {str(e)}")

@router.get("/", response_model=CrewListResponse)
async def list_crews(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List all crews with pagination"""
    query = select(CrewModel)
    
    if is_active is not None:
        query = query.where(CrewModel.is_active == is_active)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Get paginated results with agents
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    crews = result.scalars().all()
    
    return CrewListResponse(
        crews=[CrewResponse.from_orm(crew) for crew in crews],
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/{crew_id}", response_model=CrewResponse)
async def get_crew(
    crew_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific crew by ID"""
    query = select(CrewModel).where(CrewModel.id == crew_id)
    result = await db.execute(query)
    crew = result.scalar_one_or_none()
    
    if not crew:
        raise HTTPException(status_code=404, detail="Crew not found")
    
    return CrewResponse.from_orm(crew)

@router.put("/{crew_id}", response_model=CrewResponse)
async def update_crew(
    crew_id: UUID,
    crew_update: CrewUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing crew"""
    query = select(CrewModel).where(CrewModel.id == crew_id)
    result = await db.execute(query)
    crew = result.scalar_one_or_none()
    
    if not crew:
        raise HTTPException(status_code=404, detail="Crew not found")
    
    try:
        # Update crew fields
        update_data = crew_update.dict(exclude_unset=True, exclude={"agent_ids"})
        for field, value in update_data.items():
            setattr(crew, field, value)
        
        # Update agents if specified
        if crew_update.agent_ids is not None:
            # Remove existing agents
            await db.execute(
                CrewAgent.__table__.delete().where(CrewAgent.crew_id == crew_id)
            )
            
            # Add new agents
            for agent_id in crew_update.agent_ids:
                crew_agent = CrewAgent(
                    crew_id=crew_id,
                    agent_id=agent_id
                )
                db.add(crew_agent)
        
        await db.commit()
        await db.refresh(crew)
        return CrewResponse.from_orm(crew)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update crew: {str(e)}")

@router.delete("/{crew_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_crew(
    crew_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a crew"""
    query = select(CrewModel).where(CrewModel.id == crew_id)
    result = await db.execute(query)
    crew = result.scalar_one_or_none()
    
    if not crew:
        raise HTTPException(status_code=404, detail="Crew not found")
    
    try:
        # Remove crew agents first
        await db.execute(
            CrewAgent.__table__.delete().where(CrewAgent.crew_id == crew_id)
        )
        
        # Delete crew
        await db.delete(crew)
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to delete crew: {str(e)}")

@router.post("/{crew_id}/execute", response_model=CrewExecutionResponse)
async def execute_crew(
    crew_id: UUID,
    execution_request: CrewExecutionRequest,
    db: AsyncSession = Depends(get_db),
    crewai_service: CrewAIService = Depends(lambda: router.crewai_service),
    workflow_engine: WorkflowEngine = Depends(lambda: router.workflow_engine)
):
    """Execute a crew with given inputs"""
    # Get crew
    query = select(CrewModel).where(CrewModel.id == crew_id)
    result = await db.execute(query)
    crew = result.scalar_one_or_none()
    
    if not crew:
        raise HTTPException(status_code=404, detail="Crew not found")
    
    # Get crew agents
    agents_query = select(AgentModel).join(CrewAgent).where(CrewAgent.crew_id == crew_id)
    agents_result = await db.execute(agents_query)
    agents = agents_result.scalars().all()
    
    if not agents:
        raise HTTPException(status_code=400, detail="No agents in crew")
    
    try:
        # Prepare crew data
        crew_data = {
            "name": crew.name,
            "description": crew.description,
            "process_type": crew.process_type,
            "config": crew.config,
            "agents": [{
                "name": agent.name,
                "role": agent.role,
                "goal": agent.goal,
                "backstory": agent.backstory,
                "agent_type": agent.agent_type,
                "tools": agent.tools,
                "model_name": agent.model_name,
                "config": agent.config
            } for agent in agents]
        }
        
        # Create default tasks if none provided
        tasks = []
        if not tasks:
            for i, agent in enumerate(agents):
                tasks.append({
                    "name": f"task_{i+1}",
                    "description": f"Execute task for {agent.role}",
                    "agent_id": agent.id,
                    "expected_output": "Task completion result"
                })
        
        # Submit to workflow engine
        execution_id = await workflow_engine.submit_workflow(
            workflow_id=str(crew_id),
            crew_data=crew_data,
            tasks=tasks,
            inputs=execution_request.inputs
        )
        
        return CrewExecutionResponse(
            execution_id=execution_id,
            crew_id=str(crew_id),
            status="pending",
            created_at=crew.created_at,
            estimated_completion=None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute crew: {str(e)}")

@router.get("/{crew_id}/validate")
async def validate_crew(
    crew_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Validate crew configuration"""
    query = select(CrewModel).where(CrewModel.id == crew_id)
    result = await db.execute(query)
    crew = result.scalar_one_or_none()
    
    if not crew:
        raise HTTPException(status_code=404, detail="Crew not found")
    
    # Get crew agents
    agents_query = select(AgentModel).join(CrewAgent).where(CrewAgent.crew_id == crew_id)
    agents_result = await db.execute(agents_query)
    agents = agents_result.scalars().all()
    
    validation_result = {
        "valid": True,
        "errors": [],
        "warnings": [],
        "info": {
            "crew_name": crew.name,
            "agent_count": len(agents),
            "process_type": crew.process_type
        }
    }
    
    # Validate crew
    if not crew.name:
        validation_result["errors"].append("Crew name is required")
        validation_result["valid"] = False
    
    if len(agents) == 0:
        validation_result["errors"].append("Crew must have at least one agent")
        validation_result["valid"] = False
    
    # Validate agents
    for agent in agents:
        if not agent.role:
            validation_result["errors"].append(f"Agent {agent.name} missing role")
            validation_result["valid"] = False
        
        if not agent.goal:
            validation_result["errors"].append(f"Agent {agent.name} missing goal")
            validation_result["valid"] = False
        
        if not agent.backstory:
            validation_result["errors"].append(f"Agent {agent.name} missing backstory")
            validation_result["valid"] = False
    
    # Add warnings
    if len(agents) == 1:
        validation_result["warnings"].append("Single agent crew may not benefit from multi-agent coordination")
    
    if crew.process_type not in ["sequential", "hierarchical", "parallel"]:
        validation_result["warnings"].append(f"Unknown process type: {crew.process_type}")
    
    return validation_result

@router.get("/{crew_id}/performance")
async def get_crew_performance(
    crew_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get crew performance metrics"""
    # This would integrate with monitoring service
    return {
        "crew_id": str(crew_id),
        "total_executions": 0,
        "successful_executions": 0,
        "failed_executions": 0,
        "average_execution_time": 0,
        "last_execution": None,
        "performance_trend": []
    }