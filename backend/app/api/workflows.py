from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID

from app.core.database import get_db
from app.models.database import WorkflowModel, CrewModel
from app.schemas.workflow import (
    WorkflowCreate, WorkflowUpdate, WorkflowResponse, WorkflowListResponse,
    WorkflowExecutionRequest, WorkflowExecutionResponse, WorkflowStatus,
    WorkflowVisualization
)
from app.services.workflow_engine import WorkflowEngine

router = APIRouter()

@router.post("/", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow: WorkflowCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new workflow"""
    # Verify crew exists
    crew_query = select(CrewModel).where(CrewModel.id == workflow.crew_id)
    crew_result = await db.execute(crew_query)
    if not crew_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Crew not found")
    
    try:
        db_workflow = WorkflowModel(**workflow.dict())
        db.add(db_workflow)
        await db.commit()
        await db.refresh(db_workflow)
        return WorkflowResponse.from_orm(db_workflow)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create workflow: {str(e)}")

@router.get("/", response_model=WorkflowListResponse)
async def list_workflows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    crew_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List all workflows with pagination"""
    query = select(WorkflowModel)
    
    if crew_id:
        query = query.where(WorkflowModel.crew_id == crew_id)
    
    if status:
        query = query.where(WorkflowModel.status == status)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Get paginated results
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    workflows = result.scalars().all()
    
    return WorkflowListResponse(
        workflows=[WorkflowResponse.from_orm(workflow) for workflow in workflows],
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific workflow by ID"""
    query = select(WorkflowModel).where(WorkflowModel.id == workflow_id)
    result = await db.execute(query)
    workflow = result.scalar_one_or_none()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return WorkflowResponse.from_orm(workflow)

@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: UUID,
    workflow_update: WorkflowUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing workflow"""
    query = select(WorkflowModel).where(WorkflowModel.id == workflow_id)
    result = await db.execute(query)
    workflow = result.scalar_one_or_none()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Check if workflow is running
    if workflow.status == "running":
        raise HTTPException(status_code=400, detail="Cannot update running workflow")
    
    try:
        update_data = workflow_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(workflow, field, value)
        
        await db.commit()
        await db.refresh(workflow)
        return WorkflowResponse.from_orm(workflow)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update workflow: {str(e)}")

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a workflow"""
    query = select(WorkflowModel).where(WorkflowModel.id == workflow_id)
    result = await db.execute(query)
    workflow = result.scalar_one_or_none()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Check if workflow is running
    if workflow.status == "running":
        raise HTTPException(status_code=400, detail="Cannot delete running workflow")
    
    try:
        await db.delete(workflow)
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to delete workflow: {str(e)}")

@router.post("/{workflow_id}/execute", response_model=WorkflowExecutionResponse)
async def execute_workflow(
    workflow_id: UUID,
    execution_request: WorkflowExecutionRequest,
    db: AsyncSession = Depends(get_db),
    workflow_engine: WorkflowEngine = Depends(lambda: router.workflow_engine)
):
    """Execute a workflow"""
    # Get workflow
    query = select(WorkflowModel).where(WorkflowModel.id == workflow_id)
    result = await db.execute(query)
    workflow = result.scalar_one_or_none()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Get crew
    crew_query = select(CrewModel).where(CrewModel.id == workflow.crew_id)
    crew_result = await db.execute(crew_query)
    crew = crew_result.scalar_one_or_none()
    
    if not crew:
        raise HTTPException(status_code=404, detail="Crew not found")
    
    # Check if workflow is already running
    if workflow.status == "running":
        raise HTTPException(status_code=400, detail="Workflow is already running")
    
    try:
        # Prepare crew data
        crew_data = {
            "name": crew.name,
            "description": crew.description,
            "process_type": crew.process_type,
            "config": crew.config,
            "agents": []  # This would need to be populated from crew agents
        }
        
        # Submit to workflow engine
        execution_id = await workflow_engine.submit_workflow(
            workflow_id=str(workflow_id),
            crew_data=crew_data,
            tasks=workflow.tasks,
            inputs=execution_request.inputs
        )
        
        # Update workflow status
        workflow.status = "running"
        await db.commit()
        
        return WorkflowExecutionResponse(
            execution_id=execution_id,
            workflow_id=str(workflow_id),
            status="running",
            created_at=workflow.created_at,
            estimated_completion=None
        )
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to execute workflow: {str(e)}")

@router.get("/{workflow_id}/status", response_model=WorkflowStatus)
async def get_workflow_status(
    workflow_id: UUID,
    workflow_engine: WorkflowEngine = Depends(lambda: router.workflow_engine)
):
    """Get workflow execution status"""
    status = await workflow_engine.get_workflow_status(str(workflow_id))
    
    if not status:
        raise HTTPException(status_code=404, detail="Workflow status not found")
    
    return status

@router.post("/{workflow_id}/cancel")
async def cancel_workflow(
    workflow_id: UUID,
    workflow_engine: WorkflowEngine = Depends(lambda: router.workflow_engine)
):
    """Cancel a running workflow"""
    # Find execution ID
    # This would need to be implemented based on how we track executions
    # For now, return not implemented
    raise HTTPException(status_code=501, detail="Workflow cancellation not yet implemented")

@router.get("/{workflow_id}/visualization", response_model=WorkflowVisualization)
async def get_workflow_visualization(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get workflow visualization data"""
    query = select(WorkflowModel).where(WorkflowModel.id == workflow_id)
    result = await db.execute(query)
    workflow = result.scalar_one_or_none()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Create visualization nodes and edges
    nodes = []
    edges = []
    
    # Add task nodes
    for i, task in enumerate(workflow.tasks):
        node = {
            "id": f"task_{i}",
            "type": "task",
            "label": task.get("name", f"Task {i+1}"),
            "position": {"x": 100 + i * 200, "y": 100},
            "data": task,
            "status": "pending"
        }
        nodes.append(node)
        
        # Add edges between sequential tasks
        if i > 0:
            edges.append({
                "id": f"edge_{i-1}_{i}",
                "source": f"task_{i-1}",
                "target": f"task_{i}",
                "type": "default"
            })
    
    return WorkflowVisualization(
        nodes=nodes,
        edges=edges,
        metadata={
            "workflow_id": str(workflow_id),
            "workflow_name": workflow.name,
            "workflow_type": workflow.workflow_type,
            "total_tasks": len(workflow.tasks)
        }
    )

@router.get("/{workflow_id}/history")
async def get_workflow_history(
    workflow_id: UUID,
    limit: int = Query(50, ge=1, le=1000),
    workflow_engine: WorkflowEngine = Depends(lambda: router.workflow_engine)
):
    """Get workflow execution history"""
    history = await workflow_engine.get_workflow_history(str(workflow_id), limit)
    return {"history": history}

@router.get("/{workflow_id}/performance")
async def get_workflow_performance(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get workflow performance metrics"""
    query = select(WorkflowModel).where(WorkflowModel.id == workflow_id)
    result = await db.execute(query)
    workflow = result.scalar_one_or_none()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # This would integrate with monitoring service
    return {
        "workflow_id": str(workflow_id),
        "workflow_name": workflow.name,
        "total_executions": 0,
        "successful_executions": 0,
        "failed_executions": 0,
        "average_execution_time": 0,
        "last_execution": None,
        "performance_trend": []
    }