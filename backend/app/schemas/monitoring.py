from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from app.models.database import ExecutionStatus

class ExecutionLogResponse(BaseModel):
    id: str
    workflow_id: str
    agent_id: Optional[str] = None
    task_name: str
    status: ExecutionStatus
    input_data: Dict[str, Any] = Field(default_factory=dict)
    output_data: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None
    tokens_used: int = 0
    execution_time: int = 0  # milliseconds
    created_at: datetime
    
    class Config:
        from_attributes = True

class SystemMetrics(BaseModel):
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: Dict[str, int] = Field(default_factory=dict)
    active_workflows: int = 0
    total_agents: int = 0
    queue_size: int = 0

class AgentMetrics(BaseModel):
    agent_id: str
    agent_name: str
    total_executions: int = 0
    successful_executions: int = 0
    failed_executions: int = 0
    average_execution_time: float = 0.0
    total_tokens_used: int = 0
    average_tokens_per_execution: float = 0.0
    last_execution: Optional[datetime] = None

class WorkflowMetrics(BaseModel):
    workflow_id: str
    workflow_name: str
    total_executions: int = 0
    successful_executions: int = 0
    failed_executions: int = 0
    average_execution_time: float = 0.0
    total_tokens_used: int = 0
    average_tokens_per_execution: float = 0.0
    last_execution: Optional[datetime] = None

class PerformanceMetrics(BaseModel):
    system: SystemMetrics
    agents: List[AgentMetrics]
    workflows: List[WorkflowMetrics]
    summary: Dict[str, Any] = Field(default_factory=dict)

class RealTimeEvent(BaseModel):
    event_type: str  # 'agent_start', 'agent_complete', 'task_start', 'task_complete', 'error'
    timestamp: datetime
    workflow_id: str
    agent_id: Optional[str] = None
    task_id: Optional[str] = None
    data: Dict[str, Any] = Field(default_factory=dict)
    message: str

class DashboardData(BaseModel):
    active_workflows: List[Dict[str, Any]] = Field(default_factory=list)
    recent_executions: List[ExecutionLogResponse] = Field(default_factory=list)
    system_status: SystemMetrics
    performance_summary: Dict[str, Any] = Field(default_factory=dict)
    alerts: List[Dict[str, Any]] = Field(default_factory=list)