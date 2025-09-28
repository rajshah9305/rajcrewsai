from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from app.models.database import AgentType

class AgentTool(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any] = Field(default_factory=dict)

class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=255)
    goal: str = Field(..., min_length=1)
    backstory: str = Field(..., min_length=1)
    agent_type: AgentType = AgentType.WORKER
    tools: List[AgentTool] = Field(default_factory=list)
    config: Dict[str, Any] = Field(default_factory=dict)
    model_name: str = Field(default="llama-4-scout-17b-16e-instruct")
    is_active: bool = True

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, min_length=1, max_length=255)
    goal: Optional[str] = Field(None, min_length=1)
    backstory: Optional[str] = Field(None, min_length=1)
    agent_type: Optional[AgentType] = None
    tools: Optional[List[AgentTool]] = None
    config: Optional[Dict[str, Any]] = None
    model_name: Optional[str] = None
    is_active: Optional[bool] = None

class AgentResponse(AgentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AgentTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    role: str = Field(..., min_length=1, max_length=255)
    goal_template: str = Field(..., min_length=1)
    backstory_template: str = Field(..., min_length=1)
    agent_type: AgentType = AgentType.WORKER
    suggested_tools: List[AgentTool] = Field(default_factory=list)
    suggested_model: str = Field(default="llama-4-scout-17b-16e-instruct")
    category: str = Field(default="general")
    is_active: bool = True

class AgentTemplateCreate(AgentTemplateBase):
    pass

class AgentTemplateResponse(AgentTemplateBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AgentExecutionStatus(BaseModel):
    agent_id: str
    name: str
    status: str
    current_task: Optional[str] = None
    tokens_used: int = 0
    execution_time: int = 0  # milliseconds
    last_update: datetime

class AgentListResponse(BaseModel):
    agents: List[AgentResponse]
    total: int
    page: int
    size: int
    pages: int