from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID

from app.core.database import get_db
from app.models.database import AgentModel, AgentTemplate
from app.schemas.agent import (
    AgentCreate, AgentUpdate, AgentResponse, AgentTemplateCreate, 
    AgentTemplateResponse, AgentListResponse
)

router = APIRouter()

@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent: AgentCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new agent"""
    try:
        db_agent = AgentModel(**agent.dict())
        db.add(db_agent)
        await db.commit()
        await db.refresh(db_agent)
        return AgentResponse.from_orm(db_agent)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create agent: {str(e)}")

@router.get("/", response_model=AgentListResponse)
async def list_agents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    agent_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List all agents with pagination"""
    query = select(AgentModel)
    
    if agent_type:
        query = query.where(AgentModel.agent_type == agent_type)
    
    if is_active is not None:
        query = query.where(AgentModel.is_active == is_active)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Get paginated results
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    agents = result.scalars().all()
    
    return AgentListResponse(
        agents=[AgentResponse.from_orm(agent) for agent in agents],
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific agent by ID"""
    query = select(AgentModel).where(AgentModel.id == agent_id)
    result = await db.execute(query)
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return AgentResponse.from_orm(agent)

@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: UUID,
    agent_update: AgentUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing agent"""
    query = select(AgentModel).where(AgentModel.id == agent_id)
    result = await db.execute(query)
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Update fields
    update_data = agent_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(agent, field, value)
    
    try:
        await db.commit()
        await db.refresh(agent)
        return AgentResponse.from_orm(agent)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update agent: {str(e)}")

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete an agent"""
    query = select(AgentModel).where(AgentModel.id == agent_id)
    result = await db.execute(query)
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        await db.delete(agent)
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to delete agent: {str(e)}")

@router.post("/templates/", response_model=AgentTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_agent_template(
    template: AgentTemplateCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new agent template"""
    try:
        db_template = AgentTemplate(**template.dict())
        db.add(db_template)
        await db.commit()
        await db.refresh(db_template)
        return AgentTemplateResponse.from_orm(db_template)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create template: {str(e)}")

@router.get("/templates/", response_model=List[AgentTemplateResponse])
async def list_agent_templates(
    category: Optional[str] = Query(None),
    agent_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List all agent templates"""
    query = select(AgentTemplate)
    
    if category:
        query = query.where(AgentTemplate.category == category)
    
    if agent_type:
        query = query.where(AgentTemplate.agent_type == agent_type)
    
    result = await db.execute(query)
    templates = result.scalars().all()
    
    return [AgentTemplateResponse.from_orm(template) for template in templates]

@router.get("/templates/{template_id}", response_model=AgentTemplateResponse)
async def get_agent_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific agent template"""
    query = select(AgentTemplate).where(AgentTemplate.id == template_id)
    result = await db.execute(query)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return AgentTemplateResponse.from_orm(template)

@router.post("/from-template/{template_id}", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent_from_template(
    template_id: UUID,
    name: str,
    db: AsyncSession = Depends(get_db)
):
    """Create an agent from a template"""
    # Get template
    query = select(AgentTemplate).where(AgentTemplate.id == template_id)
    result = await db.execute(query)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Create agent from template
    agent_data = {
        "name": name,
        "role": template.role,
        "goal": template.goal_template,
        "backstory": template.backstory_template,
        "agent_type": template.agent_type,
        "tools": template.suggested_tools,
        "model_name": template.suggested_model
    }
    
    try:
        db_agent = AgentModel(**agent_data)
        db.add(db_agent)
        await db.commit()
        await db.refresh(db_agent)
        return AgentResponse.from_orm(db_agent)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create agent from template: {str(e)}")

@router.get("/categories/", response_model=List[str])
async def get_agent_categories(
    db: AsyncSession = Depends(get_db)
):
    """Get all agent categories"""
    query = select(AgentTemplate.category).distinct()
    result = await db.execute(query)
    categories = result.scalars().all()
    return list(categories)