import enum
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base

class AgentType(str, enum.Enum):
    WORKER = "worker"
    MANAGER = "manager"
    RESEARCHER = "researcher"

class ExecutionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class WorkflowType(str, enum.Enum):
    SEQUENTIAL = "sequential"
    HIERARCHICAL = "hierarchical"
    PARALLEL = "parallel"

class AgentModel(Base):
    __tablename__ = "agents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    goal = Column(Text, nullable=False)
    backstory = Column(Text, nullable=False)
    agent_type = Column(Enum(AgentType), default=AgentType.WORKER)
    tools = Column(JSON, default=list)
    config = Column(JSON, default=dict)
    model_name = Column(String(100), default="llama-4-scout-17b-16e-instruct")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    crews = relationship("CrewModel", secondary="crew_agents", back_populates="agents")
    
    __table_args__ = (
        Index("idx_agent_name", "name"),
        Index("idx_agent_type", "agent_type"),
    )

class CrewModel(Base):
    __tablename__ = "crews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    process_type = Column(String(50), default="sequential")
    config = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agents = relationship("AgentModel", secondary="crew_agents", back_populates="crews")
    workflows = relationship("WorkflowModel", back_populates="crew")
    
    __table_args__ = (
        Index("idx_crew_name", "name"),
    )

class CrewAgent(Base):
    __tablename__ = "crew_agents"
    
    crew_id = Column(UUID(as_uuid=True), ForeignKey("crews.id"), primary_key=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkflowModel(Base):
    __tablename__ = "workflows"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    crew_id = Column(UUID(as_uuid=True), ForeignKey("crews.id"))
    workflow_type = Column(Enum(WorkflowType), default=WorkflowType.SEQUENTIAL)
    config = Column(JSON, default=dict)
    tasks = Column(JSON, default=list)
    status = Column(Enum(ExecutionStatus), default=ExecutionStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationships
    crew = relationship("CrewModel", back_populates="workflows")
    execution_logs = relationship("ExecutionLog", back_populates="workflow")
    
    __table_args__ = (
        Index("idx_workflow_crew", "crew_id"),
        Index("idx_workflow_status", "status"),
    )

class ExecutionLog(Base):
    __tablename__ = "execution_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"))
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    task_name = Column(String(255))
    status = Column(Enum(ExecutionStatus))
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(Text)
    tokens_used = Column(Integer, default=0)
    execution_time = Column(Integer, default=0)  # milliseconds
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    workflow = relationship("WorkflowModel", back_populates="execution_logs")
    agent = relationship("AgentModel")
    
    __table_args__ = (
        Index("idx_execution_workflow", "workflow_id"),
        Index("idx_execution_status", "status"),
        Index("idx_execution_created", "created_at"),
    )

class AgentTemplate(Base):
    __tablename__ = "agent_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    role = Column(String(255), nullable=False)
    goal_template = Column(Text, nullable=False)
    backstory_template = Column(Text, nullable=False)
    agent_type = Column(Enum(AgentType), default=AgentType.WORKER)
    suggested_tools = Column(JSON, default=list)
    suggested_model = Column(String(100), default="llama-4-scout-17b-16e-instruct")
    category = Column(String(100), default="general")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index("idx_template_category", "category"),
        Index("idx_template_type", "agent_type"),
    )