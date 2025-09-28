import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
import redis.asyncio as redis

from app.models.database import ExecutionStatus
from app.schemas.monitoring import (
    SystemMetrics, AgentMetrics, WorkflowMetrics, 
    PerformanceMetrics, RealTimeEvent, DashboardData
)

logger = logging.getLogger(__name__)

class MonitoringService:
    """Service for monitoring and analytics"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.subscribers: Dict[str, List[Callable]] = {}
        self.monitoring_active = True
    
    async def start_monitoring(self):
        """Start background monitoring tasks"""
        asyncio.create_task(self._system_metrics_collector())
        asyncio.create_task(self._event_processor())
    
    async def stop_monitoring(self):
        """Stop monitoring"""
        self.monitoring_active = False
    
    async def log_workflow_event(
        self,
        workflow_id: str,
        event_type: str,
        data: Dict[str, Any],
        agent_id: Optional[str] = None,
        task_id: Optional[str] = None
    ):
        """Log a workflow event for real-time monitoring"""
        event = RealTimeEvent(
            event_type=event_type,
            timestamp=datetime.utcnow(),
            workflow_id=workflow_id,
            agent_id=agent_id,
            task_id=task_id,
            data=data,
            message=data.get("message", "")
        )
        
        # Store in Redis for real-time access
        await self.redis.publish(
            f"workflow:{workflow_id}",
            json.dumps(event.dict())
        )
        
        # Store in time-series data
        await self.redis.zadd(
            f"workflow_events:{workflow_id}",
            {json.dumps(event.dict()): event.timestamp.timestamp()}
        )
        
        # Notify subscribers
        await self._notify_subscribers(workflow_id, event)
    
    async def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get current workflow status"""
        try:
            # Get latest events
            events = await self.redis.zrevrange(
                f"workflow_events:{workflow_id}",
                0, 10, withscores=True
            )
            
            # Get workflow metrics
            metrics_key = f"workflow_metrics:{workflow_id}"
            metrics = await self.redis.hgetall(metrics_key)
            
            # Get current tasks
            tasks_key = f"workflow_tasks:{workflow_id}"
            current_tasks = await self.redis.lrange(tasks_key, 0, -1)
            
            return {
                "workflow_id": workflow_id,
                "events": [json.loads(event[0]) for event in events],
                "metrics": metrics,
                "current_tasks": current_tasks,
                "last_update": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to get workflow status: {e}")
            return {"error": str(e)}
    
    async def update_workflow_metrics(
        self,
        workflow_id: str,
        metrics: Dict[str, Any]
    ):
        """Update workflow metrics"""
        metrics_key = f"workflow_metrics:{workflow_id}"
        
        # Update metrics
        await self.redis.hset(metrics_key, mapping=metrics)
        
        # Set expiration (24 hours)
        await self.redis.expire(metrics_key, 86400)
    
    async def update_agent_metrics(
        self,
        agent_id: str,
        execution_time: int,
        tokens_used: int,
        success: bool
    ):
        """Update agent performance metrics"""
        metrics_key = f"agent_metrics:{agent_id}"
        
        # Get current metrics
        current_metrics = await self.redis.hgetall(metrics_key)
        
        # Update metrics
        total_executions = int(current_metrics.get("total_executions", 0)) + 1
        successful_executions = int(current_metrics.get("successful_executions", 0))
        failed_executions = int(current_metrics.get("failed_executions", 0))
        
        if success:
            successful_executions += 1
        else:
            failed_executions += 1
        
        total_execution_time = int(current_metrics.get("total_execution_time", 0)) + execution_time
        total_tokens_used = int(current_metrics.get("total_tokens_used", 0)) + tokens_used
        
        # Calculate averages
        average_execution_time = total_execution_time / total_executions if total_executions > 0 else 0
        average_tokens_per_execution = total_tokens_used / total_executions if total_executions > 0 else 0
        
        # Store updated metrics
        updated_metrics = {
            "total_executions": total_executions,
            "successful_executions": successful_executions,
            "failed_executions": failed_executions,
            "total_execution_time": total_execution_time,
            "total_tokens_used": total_tokens_used,
            "average_execution_time": average_execution_time,
            "average_tokens_per_execution": average_tokens_per_execution,
            "last_execution": datetime.utcnow().isoformat()
        }
        
        await self.redis.hset(metrics_key, mapping=updated_metrics)
        await self.redis.expire(metrics_key, 86400)  # 24 hours
    
    async def get_system_metrics(self) -> SystemMetrics:
        """Get current system metrics"""
        try:
            # Get workflow counts
            active_workflows = await self.redis.scard("active_workflows")
            total_agents = await self.redis.scard("registered_agents")
            queue_size = await self.redis.llen("execution_queue")
            
            # Get system stats (this would need system monitoring)
            import psutil
            cpu_usage = psutil.cpu_percent()
            memory_usage = psutil.virtual_memory().percent
            disk_usage = psutil.disk_usage('/').percent
            
            # Get network I/O
            net_io = psutil.net_io_counters()
            
            return SystemMetrics(
                timestamp=datetime.utcnow(),
                cpu_usage=cpu_usage,
                memory_usage=memory_usage,
                disk_usage=disk_usage,
                network_io={
                    "bytes_sent": net_io.bytes_sent,
                    "bytes_recv": net_io.bytes_recv
                },
                active_workflows=active_workflows,
                total_agents=total_agents,
                queue_size=queue_size
            )
        except Exception as e:
            logger.error(f"Failed to get system metrics: {e}")
            return SystemMetrics(
                timestamp=datetime.utcnow(),
                cpu_usage=0.0,
                memory_usage=0.0,
                disk_usage=0.0,
                active_workflows=0,
                total_agents=0,
                queue_size=0
            )
    
    async def get_performance_metrics(self) -> PerformanceMetrics:
        """Get comprehensive performance metrics"""
        system_metrics = await self.get_system_metrics()
        
        # Get agent metrics
        agent_metrics = []
        agent_keys = await self.redis.keys("agent_metrics:*")
        for key in agent_keys:
            agent_id = key.split(":")[1]
            metrics = await self.redis.hgetall(key)
            
            # Get agent info
            agent_info = await self.redis.hgetall(f"agent_info:{agent_id}")
            
            agent_metrics.append(AgentMetrics(
                agent_id=agent_id,
                agent_name=agent_info.get("name", "Unknown"),
                total_executions=int(metrics.get("total_executions", 0)),
                successful_executions=int(metrics.get("successful_executions", 0)),
                failed_executions=int(metrics.get("failed_executions", 0)),
                average_execution_time=float(metrics.get("average_execution_time", 0.0)),
                total_tokens_used=int(metrics.get("total_tokens_used", 0)),
                average_tokens_per_execution=float(metrics.get("average_tokens_per_execution", 0.0)),
                last_execution=datetime.fromisoformat(metrics["last_execution"]) if metrics.get("last_execution") else None
            ))
        
        # Get workflow metrics
        workflow_metrics = []
        workflow_keys = await self.redis.keys("workflow_metrics:*")
        for key in workflow_keys:
            workflow_id = key.split(":")[1]
            metrics = await self.redis.hgetall(key)
            
            # Get workflow info
            workflow_info = await self.redis.hgetall(f"workflow_info:{workflow_id}")
            
            workflow_metrics.append(WorkflowMetrics(
                workflow_id=workflow_id,
                workflow_name=workflow_info.get("name", "Unknown"),
                total_executions=int(metrics.get("total_executions", 0)),
                successful_executions=int(metrics.get("successful_executions", 0)),
                failed_executions=int(metrics.get("failed_executions", 0)),
                average_execution_time=float(metrics.get("average_execution_time", 0.0)),
                total_tokens_used=int(metrics.get("total_tokens_used", 0)),
                average_tokens_per_execution=float(metrics.get("average_tokens_per_execution", 0.0)),
                last_execution=datetime.fromisoformat(metrics["last_execution"]) if metrics.get("last_execution") else None
            ))
        
        # Calculate summary
        summary = {
            "total_executions": sum(m.total_executions for m in workflow_metrics),
            "successful_executions": sum(m.successful_executions for m in workflow_metrics),
            "failed_executions": sum(m.failed_executions for m in workflow_metrics),
            "total_tokens_used": sum(m.total_tokens_used for m in workflow_metrics),
            "average_execution_time": sum(m.average_execution_time for m in workflow_metrics) / len(workflow_metrics) if workflow_metrics else 0,
            "success_rate": (
                sum(m.successful_executions for m in workflow_metrics) / 
                sum(m.total_executions for m in workflow_metrics) * 100
                if workflow_metrics and sum(m.total_executions for m in workflow_metrics) > 0 else 0
            )
        }
        
        return PerformanceMetrics(
            system=system_metrics,
            agents=agent_metrics,
            workflows=workflow_metrics,
            summary=summary
        )
    
    async def get_dashboard_data(self) -> DashboardData:
        """Get dashboard data"""
        # Get active workflows
        active_workflow_ids = await self.redis.smembers("active_workflows")
        active_workflows = []
        
        for wf_id in active_workflow_ids:
            status = await self.get_workflow_status(wf_id)
            if "error" not in status:
                active_workflows.append(status)
        
        # Get recent executions
        recent_executions = []
        execution_keys = await self.redis.keys("execution_log:*")
        for key in execution_keys[:10]:  # Get last 10
            execution_data = await self.redis.hgetall(key)
            if execution_data:
                recent_executions.append(execution_data)
        
        # Get system status
        system_status = await self.get_system_metrics()
        
        # Get performance summary
        performance_summary = {
            "total_workflows": await self.redis.scard("workflows"),
            "total_agents": await self.redis.scard("agents"),
            "total_executions": await self.redis.get("total_executions") or 0,
            "success_rate": await self.redis.get("success_rate") or 0
        }
        
        # Get alerts
        alerts = await self.redis.lrange("alerts", 0, 9)  # Last 10 alerts
        
        return DashboardData(
            active_workflows=active_workflows,
            recent_executions=recent_executions,
            system_status=system_status,
            performance_summary=performance_summary,
            alerts=[json.loads(alert) for alert in alerts]
        )
    
    async def subscribe_to_workflow(self, workflow_id: str, callback: Callable):
        """Subscribe to workflow events"""
        if workflow_id not in self.subscribers:
            self.subscribers[workflow_id] = []
        self.subscribers[workflow_id].append(callback)
    
    async def unsubscribe_from_workflow(self, workflow_id: str, callback: Callable):
        """Unsubscribe from workflow events"""
        if workflow_id in self.subscribers:
            self.subscribers[workflow_id].remove(callback)
            if not self.subscribers[workflow_id]:
                del self.subscribers[workflow_id]
    
    async def _notify_subscribers(self, workflow_id: str, event: RealTimeEvent):
        """Notify subscribers of workflow events"""
        if workflow_id in self.subscribers:
            for callback in self.subscribers[workflow_id]:
                try:
                    await callback(event)
                except Exception as e:
                    logger.error(f"Failed to notify subscriber: {e}")
    
    async def _system_metrics_collector(self):
        """Background task to collect system metrics"""
        while self.monitoring_active:
            try:
                metrics = await self.get_system_metrics()
                
                # Store in Redis
                await self.redis.setex(
                    "system_metrics:latest",
                    300,  # 5 minutes
                    json.dumps(metrics.dict())
                )
                
                # Store historical data
                await self.redis.zadd(
                    "system_metrics:history",
                    {json.dumps(metrics.dict()): metrics.timestamp.timestamp()}
                )
                
                # Trim old data (keep last 24 hours)
                cutoff = (datetime.utcnow() - timedelta(hours=24)).timestamp()
                await self.redis.zremrangebyscore(
                    "system_metrics:history",
                    0,
                    cutoff
                )
                
                await asyncio.sleep(60)  # Collect every minute
                
            except Exception as e:
                logger.error(f"Error collecting system metrics: {e}")
                await asyncio.sleep(60)
    
    async def _event_processor(self):
        """Background task to process events"""
        while self.monitoring_active:
            try:
                # Process workflow events
                # This would handle event processing, alerting, etc.
                await asyncio.sleep(10)  # Process every 10 seconds
                
            except Exception as e:
                logger.error(f"Error processing events: {e}")
                await asyncio.sleep(10)