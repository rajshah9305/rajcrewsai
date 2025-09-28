from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from app.models.database import ExecutionStatus

class CrewBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    process_type: str = Field(default="sequential")
    config: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True

class CrewCreate(CrewBase):
    agent_ids: List[str] = Field(default_factory=list)

class CrewUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    process_type: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    agent_ids: Optional[List[str]] = None

class CrewAgent(BaseModel):
    id: str
    name: str
    role: str
    agent_type: str

class CrewResponse(CrewBase):
    id: str
    agents: List[CrewAgent] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CrewListResponse(BaseModel):
    crews: List[CrewResponse]
    total: int
    page: int
    size: int
    pages: int

class CrewExecutionRequest(BaseModel):
    crew_id: str
    inputs: Dict[str, Any] = Field(default_factory=dict)
    config: Dict[str, Any] = Field(default_factory=dict)

class CrewExecutionResponse(BaseModel):
    execution_id: str
    crew_id: str
    status: ExecutionStatus
    created_at: datetime
    estimated_completion: Optional[datetime] = None