from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from app.models.database import WorkflowType, ExecutionStatus

class TaskDefinition(BaseModel):
    name: str = Field(..., min_length=1)
    description: str
    expected_output: Optional[str] = None
    agent_id: Optional[str] = None
    context: Optional[List[str]] = None
    config: Dict[str, Any] = Field(default_factory=dict)

class WorkflowBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    crew_id: str
    workflow_type: WorkflowType = WorkflowType.SEQUENTIAL
    config: Dict[str, Any] = Field(default_factory=dict)
    tasks: List[TaskDefinition] = Field(default_factory=list)

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    workflow_type: Optional[WorkflowType] = None
    config: Optional[Dict[str, Any]] = None
    tasks: Optional[List[TaskDefinition]] = None

class WorkflowResponse(WorkflowBase):
    id: str
    status: ExecutionStatus
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class WorkflowExecutionRequest(BaseModel):
    workflow_id: str
    inputs: Dict[str, Any] = Field(default_factory=dict)
    config: Dict[str, Any] = Field(default_factory=dict)

class WorkflowExecutionResponse(BaseModel):
    execution_id: str
    workflow_id: str
    status: ExecutionStatus
    created_at: datetime
    estimated_completion: Optional[datetime] = None

class WorkflowListResponse(BaseModel):
    workflows: List[WorkflowResponse]
    total: int
    page: int
    size: int
    pages: int

class WorkflowStatus(BaseModel):
    id: str
    name: str
    status: ExecutionStatus
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    current_task: Optional[str] = None
    current_agent: Optional[str] = None
    started_at: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None
    tokens_used: int = 0
    execution_time: int = 0  # milliseconds

class WorkflowVisualizationNode(BaseModel):
    id: str
    type: str  # 'agent', 'task', 'decision'
    label: str
    position: Dict[str, float]  # x, y coordinates
    data: Dict[str, Any] = Field(default_factory=dict)
    status: ExecutionStatus = ExecutionStatus.PENDING

class WorkflowVisualizationEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    type: str = "default"  # 'default', 'conditional', 'loop'

class WorkflowVisualization(BaseModel):
    nodes: List[WorkflowVisualizationNode]
    edges: List[WorkflowVisualizationEdge]
    metadata: Dict[str, Any] = Field(default_factory=dict)