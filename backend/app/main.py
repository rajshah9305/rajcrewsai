import asyncio
import json
import logging
from contextlib import asynccontextmanager
from typing import Dict, List, Optional

import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import agents, crews, workflows, monitoring
from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import setup_logging
from app.models.database import AgentModel, CrewModel, WorkflowModel, ExecutionLog
from app.services.cerebras_service import CerebrasService
from app.services.crewai_service import CrewAIService
from app.services.monitoring_service import MonitoringService
from app.services.workflow_engine import WorkflowEngine

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Global services
redis_client: Optional[redis.Redis] = None
cerebras_service: Optional[CerebrasService] = None
crewai_service: Optional[CrewAIService] = None
monitoring_service: Optional[MonitoringService] = None
workflow_engine: Optional[WorkflowEngine] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global redis_client, cerebras_service, crewai_service, monitoring_service, workflow_engine
    
    # Startup
    logger.info("Starting CrewNexus API...")
    
    # Initialize Redis
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    
    # Initialize services
    cerebras_service = CerebrasService()
    crewai_service = CrewAIService(cerebras_service)
    monitoring_service = MonitoringService(redis_client)
    workflow_engine = WorkflowEngine(crewai_service, monitoring_service)
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("CrewNexus API started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down CrewNexus API...")
    if redis_client:
        await redis_client.close()
    await engine.dispose()

# Create FastAPI app
app = FastAPI(
    title="CrewNexus API",
    description="Multi-Agent Orchestration Platform with CrewAI and Cerebras AI",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(crews.router, prefix="/api/crews", tags=["crews"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["monitoring"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to CrewNexus API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "services": {
            "database": "connected",
            "redis": "connected" if redis_client else "disconnected",
            "cerebras": "connected" if cerebras_service else "disconnected",
            "crewai": "operational" if crewai_service else "disconnected"
        }
    }
    return health_status

@app.websocket("/ws/monitoring/{workflow_id}")
async def workflow_monitoring(websocket: WebSocket, workflow_id: str):
    """WebSocket endpoint for real-time workflow monitoring"""
    await websocket.accept()
    
    try:
        # Subscribe to workflow events
        channel = f"workflow:{workflow_id}"
        async with redis_client.pubsub() as pubsub:
            await pubsub.subscribe(channel)
            
            # Send initial status
            if workflow_engine:
                status = await workflow_engine.get_workflow_status(workflow_id)
                await websocket.send_json(status)
            
            # Listen for updates
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    await websocket.send_json(data)
                    
                    # Check for workflow completion
                    if data.get("status") in ["completed", "failed", "cancelled"]:
                        break
                        
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for workflow {workflow_id}")
    except Exception as e:
        logger.error(f"WebSocket error for workflow {workflow_id}: {e}")
        await websocket.close()

@app.get("/api/models")
async def get_available_models():
    """Get available Cerebras models"""
    if not cerebras_service:
        raise HTTPException(status_code=503, detail="Cerebras service not available")
    
    models = await cerebras_service.get_available_models()
    return {"models": models}

@app.post("/api/test-cerebras")
async def test_cerebras_connection(request: dict):
    """Test Cerebras API connection"""
    if not cerebras_service:
        raise HTTPException(status_code=503, detail="Cerebras service not available")
    
    try:
        response = await cerebras_service.test_connection(
            message=request.get("message", "Hello, Cerebras!")
        )
        return {"success": True, "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cerebras test failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )