from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta

from app.schemas.monitoring import (
    ExecutionLogResponse, PerformanceMetrics, DashboardData,
    SystemMetrics, AgentMetrics, WorkflowMetrics
)
from app.services.monitoring_service import MonitoringService

router = APIRouter()

@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard_data(
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Get dashboard data"""
    try:
        return await monitoring_service.get_dashboard_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")

@router.get("/performance", response_model=PerformanceMetrics)
async def get_performance_metrics(
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Get comprehensive performance metrics"""
    try:
        return await monitoring_service.get_performance_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")

@router.get("/system", response_model=SystemMetrics)
async def get_system_metrics(
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Get current system metrics"""
    try:
        return await monitoring_service.get_system_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system metrics: {str(e)}")

@router.get("/agents", response_model=List[AgentMetrics])
async def get_agent_metrics(
    agent_id: Optional[str] = Query(None),
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Get agent performance metrics"""
    try:
        # Get all performance metrics and extract agent metrics
        performance = await monitoring_service.get_performance_metrics()
        
        if agent_id:
            # Filter by agent_id if specified
            return [agent for agent in performance.agents if agent.agent_id == agent_id]
        
        return performance.agents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent metrics: {str(e)}")

@router.get("/workflows", response_model=List[WorkflowMetrics])
async def get_workflow_metrics(
    workflow_id: Optional[str] = Query(None),
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Get workflow performance metrics"""
    try:
        # Get all performance metrics and extract workflow metrics
        performance = await monitoring_service.get_performance_metrics()
        
        if workflow_id:
            # Filter by workflow_id if specified
            return [workflow for workflow in performance.workflows if workflow.workflow_id == workflow_id]
        
        return performance.workflows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow metrics: {str(e)}")

@router.get("/workflow/{workflow_id}/status")
async def get_workflow_realtime_status(
    workflow_id: str,
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Get real-time workflow status"""
    try:
        return await monitoring_service.get_workflow_status(workflow_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow status: {str(e)}")

@router.get("/workflow/{workflow_id}/events")
async def get_workflow_events(
    workflow_id: str,
    limit: int = Query(50, ge=1, le=1000),
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Get workflow events"""
    try:
        status = await monitoring_service.get_workflow_status(workflow_id)
        events = status.get("events", [])
        return {"events": events[:limit]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow events: {str(e)}")

@router.get("/alerts")
async def get_system_alerts(
    limit: int = Query(20, ge=1, le=100),
    time_range: Optional[str] = Query(None, regex="^(1h|6h|24h|7d)$"),
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Get system alerts"""
    try:
        # This would get alerts from monitoring service
        # For now, return empty list
        return {"alerts": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")

@router.get("/health")
async def get_system_health(
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Get system health status"""
    try:
        system_metrics = await monitoring_service.get_system_metrics()
        
        # Calculate health score
        health_score = 100
        issues = []
        
        if system_metrics.cpu_usage > 80:
            health_score -= 20
            issues.append("High CPU usage")
        
        if system_metrics.memory_usage > 85:
            health_score -= 20
            issues.append("High memory usage")
        
        if system_metrics.disk_usage > 90:
            health_score -= 30
            issues.append("High disk usage")
        
        if system_metrics.active_workflows > 50:
            health_score -= 10
            issues.append("High number of active workflows")
        
        return {
            "health_score": max(health_score, 0),
            "status": "healthy" if health_score > 70 else "warning" if health_score > 40 else "critical",
            "issues": issues,
            "system_metrics": system_metrics.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system health: {str(e)}")

@router.get("/usage")
async def get_usage_statistics(
    time_range: str = Query("24h", regex="^(1h|6h|24h|7d|30d)$"),
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Get usage statistics"""
    try:
        performance = await monitoring_service.get_performance_metrics()
        
        # Calculate statistics based on time range
        # This would need to be enhanced with proper time-based filtering
        stats = {
            "time_range": time_range,
            "total_executions": performance.summary.get("total_executions", 0),
            "successful_executions": performance.summary.get("successful_executions", 0),
            "failed_executions": performance.summary.get("failed_executions", 0),
            "success_rate": performance.summary.get("success_rate", 0),
            "total_tokens_used": performance.summary.get("total_tokens_used", 0),
            "average_execution_time": performance.summary.get("average_execution_time", 0),
            "active_agents": len(performance.agents),
            "active_workflows": len(performance.workflows)
        }
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get usage statistics: {str(e)}")

@router.get("/export")
async def export_monitoring_data(
    format: str = Query("json", regex="^(json|csv)$"),
    time_range: str = Query("24h", regex="^(1h|6h|24h|7d|30d)$"),
    monitoring_service: MonitoringService = Depends(lambda: router.monitoring_service)
):
    """Export monitoring data"""
    try:
        performance = await monitoring_service.get_performance_metrics()
        
        if format == "json":
            return performance.dict()
        elif format == "csv":
            # This would generate CSV data
            # For now, return JSON with CSV content type
            return performance.dict()
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export data: {str(e)}")