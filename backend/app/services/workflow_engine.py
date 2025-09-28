import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from uuid import uuid4

from app.services.crewai_service import CrewAIService
from app.services.monitoring_service import MonitoringService
from app.models.database import ExecutionStatus
from app.schemas.workflow import WorkflowStatus, TaskDefinition

logger = logging.getLogger(__name__)

class WorkflowEngine:
    """Engine for executing and managing workflows"""
    
    def __init__(self, crewai_service: CrewAIService, monitoring_service: MonitoringService):
        self.crewai_service = crewai_service
        self.monitoring_service = monitoring_service
        self.active_workflows: Dict[str, Dict[str, Any]] = {}
        self.execution_queue = asyncio.Queue()
        self.max_concurrent_workflows = 10
    
    async def start_engine(self):
        """Start the workflow engine"""
        # Start workflow execution workers
        for i in range(self.max_concurrent_workflows):
            asyncio.create_task(self._workflow_worker(f"worker-{i}"))
        
        logger.info(f"Workflow engine started with {self.max_concurrent_workflows} workers")
    
    async def submit_workflow(
        self,
        workflow_id: str,
        crew_data: Dict[str, Any],
        tasks: List[TaskDefinition],
        inputs: Dict[str, Any] = None
    ) -> str:
        """Submit a workflow for execution"""
        execution_id = str(uuid4())
        
        workflow_data = {
            "execution_id": execution_id,
            "workflow_id": workflow_id,
            "crew_data": crew_data,
            "tasks": tasks,
            "inputs": inputs or {},
            "status": ExecutionStatus.PENDING,
            "created_at": datetime.utcnow(),
            "submitted_at": datetime.utcnow()
        }
        
        # Add to execution queue
        await self.execution_queue.put(workflow_data)
        
        # Track workflow
        self.active_workflows[execution_id] = workflow_data
        
        # Log submission event
        await self.monitoring_service.log_workflow_event(
            workflow_id=workflow_id,
            event_type="workflow_submitted",
            data={
                "execution_id": execution_id,
                "tasks_count": len(tasks),
                "crew_name": crew_data.get("name", "Unknown")
            }
        )
        
        logger.info(f"Workflow submitted: {workflow_id} with execution ID: {execution_id}")
        return execution_id
    
    async def get_workflow_status(self, workflow_id: str) -> Optional[WorkflowStatus]:
        """Get current workflow status"""
        for execution_id, workflow in self.active_workflows.items():
            if workflow["workflow_id"] == workflow_id:
                return WorkflowStatus(
                    id=workflow_id,
                    name=workflow["crew_data"].get("name", "Unknown"),
                    status=workflow["status"],
                    progress=workflow.get("progress", 0.0),
                    current_task=workflow.get("current_task"),
                    current_agent=workflow.get("current_agent"),
                    started_at=workflow.get("started_at"),
                    estimated_completion=workflow.get("estimated_completion"),
                    tokens_used=workflow.get("tokens_used", 0),
                    execution_time=workflow.get("execution_time", 0)
                )
        return None
    
    async def cancel_workflow(self, execution_id: str) -> bool:
        """Cancel a running workflow"""
        if execution_id in self.active_workflows:
            workflow = self.active_workflows[execution_id]
            workflow["status"] = ExecutionStatus.CANCELLED
            workflow["cancelled_at"] = datetime.utcnow()
            
            # Log cancellation
            await self.monitoring_service.log_workflow_event(
                workflow_id=workflow["workflow_id"],
                event_type="workflow_cancelled",
                data={"execution_id": execution_id}
            )
            
            logger.info(f"Workflow cancelled: {execution_id}")
            return True
        return False
    
    async def _workflow_worker(self, worker_id: str):
        """Worker to execute workflows"""
        logger.info(f"Workflow worker started: {worker_id}")
        
        while True:
            try:
                # Get workflow from queue
                workflow_data = await self.execution_queue.get()
                
                # Execute workflow
                await self._execute_workflow(workflow_data)
                
                # Mark task as done
                self.execution_queue.task_done()
                
            except Exception as e:
                logger.error(f"Workflow worker error: {e}")
                await asyncio.sleep(1)
    
    async def _execute_workflow(self, workflow_data: Dict[str, Any]):
        """Execute a complete workflow"""
        execution_id = workflow_data["execution_id"]
        workflow_id = workflow_data["workflow_id"]
        
        try:
            logger.info(f"Starting workflow execution: {execution_id}")
            
            # Update status
            workflow_data["status"] = ExecutionStatus.RUNNING
            workflow_data["started_at"] = datetime.utcnow()
            
            # Log start event
            await self.monitoring_service.log_workflow_event(
                workflow_id=workflow_id,
                event_type="workflow_started",
                data={"execution_id": execution_id}
            )
            
            # Create agents for the workflow
            agents = self.crewai_service.create_agents_from_templates(
                workflow_data["crew_data"].get("agents", [])
            )
            
            if not agents:
                raise ValueError("No agents created for workflow")
            
            # Execute tasks based on workflow type
            tasks = workflow_data["tasks"]
            results = []
            total_tasks = len(tasks)
            
            for i, task_def in enumerate(tasks):
                # Update progress
                progress = (i + 1) / total_tasks
                workflow_data["progress"] = progress
                workflow_data["current_task"] = task_def.name
                
                # Log task start
                await self.monitoring_service.log_workflow_event(
                    workflow_id=workflow_id,
                    event_type="task_started",
                    data={
                        "execution_id": execution_id,
                        "task_name": task_def.name,
                        "progress": progress
                    }
                )
                
                # Execute task
                result = await self._execute_task(task_def, agents, workflow_data["inputs"])
                results.append(result)
                
                # Update current agent
                if result.get("agent"):
                    workflow_data["current_agent"] = result["agent"]
                
                # Log task completion
                await self.monitoring_service.log_workflow_event(
                    workflow_id=workflow_id,
                    event_type="task_completed",
                    data={
                        "execution_id": execution_id,
                        "task_name": task_def.name,
                        "status": result["status"],
                        "execution_time": result.get("execution_time", 0)
                    }
                )
                
                # Check for task failure
                if result["status"] == ExecutionStatus.FAILED:
                    workflow_data["status"] = ExecutionStatus.FAILED
                    workflow_data["error"] = result.get("error", "Task failed")
                    break
                
                # Update inputs for next task
                if result.get("result"):
                    workflow_data["inputs"][f"task_{i}_result"] = result["result"]
            
            # Update final status
            if workflow_data["status"] != ExecutionStatus.FAILED:
                workflow_data["status"] = ExecutionStatus.COMPLETED
                workflow_data["progress"] = 1.0
                workflow_data["results"] = results
            
            workflow_data["completed_at"] = datetime.utcnow()
            
            # Calculate total metrics
            total_execution_time = sum(r.get("execution_time", 0) for r in results)
            total_tokens_used = sum(r.get("tokens_used", 0) for r in results)
            
            workflow_data["execution_time"] = total_execution_time
            workflow_data["tokens_used"] = total_tokens_used
            
            # Log workflow completion
            await self.monitoring_service.log_workflow_event(
                workflow_id=workflow_id,
                event_type="workflow_completed",
                data={
                    "execution_id": execution_id,
                    "status": workflow_data["status"],
                    "execution_time": total_execution_time,
                    "tokens_used": total_tokens_used
                }
            )
            
            # Update monitoring metrics
            await self.monitoring_service.update_workflow_metrics(
                workflow_id=workflow_id,
                metrics={
                    "last_execution": datetime.utcnow().isoformat(),
                    "execution_time": total_execution_time,
                    "tokens_used": total_tokens_used,
                    "status": workflow_data["status"]
                }
            )
            
            logger.info(f"Workflow execution completed: {execution_id} with status: {workflow_data['status']}")
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            workflow_data["status"] = ExecutionStatus.FAILED
            workflow_data["error"] = str(e)
            workflow_data["completed_at"] = datetime.utcnow()
            
            # Log failure
            await self.monitoring_service.log_workflow_event(
                workflow_id=workflow_id,
                event_type="workflow_failed",
                data={
                    "execution_id": execution_id,
                    "error": str(e)
                }
            )
    
    async def _execute_task(
        self,
        task_def: TaskDefinition,
        agents: List[Any],
        inputs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a single task"""
        try:
            # Find the assigned agent
            agent = None
            if task_def.agent_id:
                agent = next((a for a in agents if a.role == task_def.agent_id), None)
            
            # Use first agent if no specific agent assigned
            if not agent and agents:
                agent = agents[0]
            
            if not agent:
                raise ValueError("No agent available for task")
            
            # Create task
            from crewai import Task
            task = Task(
                description=task_def.description,
                expected_output=task_def.expected_output,
                agent=agent,
                name=task_def.name,
                context=task_def.context or [],
                **task_def.config
            )
            
            # Execute task
            result = await self.crewai_service.execute_workflow_step(
                agent=agent,
                task=task,
                context=inputs,
                step_id=f"task_{task_def.name}"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            return {
                "status": ExecutionStatus.FAILED,
                "error": str(e),
                "task_name": task_def.name
            }
    
    async def get_workflow_history(self, workflow_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get workflow execution history"""
        history = []
        
        for execution_id, workflow in self.active_workflows.items():
            if workflow["workflow_id"] == workflow_id:
                history.append({
                    "execution_id": execution_id,
                    "status": workflow["status"],
                    "started_at": workflow.get("started_at"),
                    "completed_at": workflow.get("completed_at"),
                    "execution_time": workflow.get("execution_time", 0),
                    "tokens_used": workflow.get("tokens_used", 0)
                })
        
        # Sort by started_at (most recent first)
        history.sort(key=lambda x: x.get("started_at") or datetime.min, reverse=True)
        
        return history[:limit]
    
    async def cleanup_completed_workflows(self):
        """Clean up completed workflows from memory"""
        completed_workflows = []
        
        for execution_id, workflow in self.active_workflows.items():
            if workflow["status"] in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED, ExecutionStatus.CANCELLED]:
                # Keep only for 1 hour after completion
                completed_at = workflow.get("completed_at")
                if completed_at and (datetime.utcnow() - completed_at).total_seconds() > 3600:
                    completed_workflows.append(execution_id)
        
        # Remove completed workflows
        for execution_id in completed_workflows:
            del self.active_workflows[execution_id]
        
        if completed_workflows:
            logger.info(f"Cleaned up {len(completed_workflows)} completed workflows")