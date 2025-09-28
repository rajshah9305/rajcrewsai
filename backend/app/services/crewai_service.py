import asyncio
import logging
from typing import Dict, List, Optional, Any, Callable
from crewai import Agent, Crew, Task, Process
from crewai_tools import SerperDevTool, ScrapeWebsiteTool, FileReadTool

from app.services.cerebras_service import CerebrasService
from app.models.database import AgentType, ExecutionStatus

logger = logging.getLogger(__name__)

class CrewAIService:
    """Service for managing CrewAI agents and workflows"""
    
    def __init__(self, cerebras_service: CerebrasService):
        self.cerebras_service = cerebras_service
        self.active_crews: Dict[str, Crew] = {}
        self.execution_callbacks: Dict[str, Callable] = {}
    
    def create_agent(self, agent_data: Dict[str, Any]) -> Agent:
        """Create a CrewAI agent with Cerebras integration"""
        try:
            # Configure Cerebras LLM for the agent
            cerebras_llm = self._create_cerebras_llm(agent_data.get("model_name", "llama-4-scout-17b-16e-instruct"))
            
            # Create tools list
            tools = self._create_tools(agent_data.get("tools", []))
            
            # Create agent
            agent = Agent(
                role=agent_data["role"],
                goal=agent_data["goal"],
                backstory=agent_data["backstory"],
                tools=tools,
                llm=cerebras_llm,
                verbose=True,
                allow_delegation=agent_data.get("agent_type") == AgentType.MANAGER,
                max_iter=agent_data.get("config", {}).get("max_iterations", 5),
                max_execution_time=agent_data.get("config", {}).get("max_execution_time", 300),
                **agent_data.get("config", {})
            )
            
            logger.info(f"Created agent: {agent_data['name']} with role: {agent_data['role']}")
            return agent
            
        except Exception as e:
            logger.error(f"Failed to create agent: {e}")
            raise
    
    def create_crew(self, crew_data: Dict[str, Any], agents: List[Agent]) -> Crew:
        """Create a CrewAI crew with multiple agents"""
        try:
            # Create tasks
            tasks = []
            for task_def in crew_data.get("tasks", []):
                task = self._create_task(task_def, agents)
                tasks.append(task)
            
            # Determine process type
            process_type = self._get_process_type(crew_data.get("process_type", "sequential"))
            
            # Create crew
            crew = Crew(
                agents=agents,
                tasks=tasks,
                process=process_type,
                verbose=True,
                memory=crew_data.get("config", {}).get("memory", False),
                cache=crew_data.get("config", {}).get("cache", True),
                max_rpm=crew_data.get("config", {}).get("max_rpm", 100),
                **crew_data.get("config", {})
            )
            
            logger.info(f"Created crew: {crew_data['name']} with {len(agents)} agents")
            return crew
            
        except Exception as e:
            logger.error(f"Failed to create crew: {e}")
            raise
    
    async def execute_crew(self, crew: Crew, inputs: Dict[str, Any] = None, execution_id: str = None) -> Dict[str, Any]:
        """Execute a crew with monitoring and error handling"""
        try:
            logger.info(f"Starting crew execution: {execution_id}")
            
            # Set up execution tracking
            start_time = asyncio.get_event_loop().time()
            
            # Execute crew
            if inputs:
                result = crew.kickoff(inputs=inputs)
            else:
                result = crew.kickoff()
            
            # Calculate execution metrics
            execution_time = int((asyncio.get_event_loop().time() - start_time) * 1000)
            
            # Extract token usage (this would need to be enhanced based on actual CrewAI output)
            tokens_used = getattr(result, 'tokens_used', 0) if hasattr(result, 'tokens_used') else 0
            
            execution_result = {
                "execution_id": execution_id,
                "status": ExecutionStatus.COMPLETED,
                "result": str(result) if result else "",
                "execution_time": execution_time,
                "tokens_used": tokens_used,
                "agent_outputs": self._extract_agent_outputs(crew)
            }
            
            logger.info(f"Crew execution completed: {execution_id}")
            return execution_result
            
        except Exception as e:
            logger.error(f"Crew execution failed: {e}")
            execution_time = int((asyncio.get_event_loop().time() - start_time) * 1000) if 'start_time' in locals() else 0
            
            return {
                "execution_id": execution_id,
                "status": ExecutionStatus.FAILED,
                "error": str(e),
                "execution_time": execution_time,
                "tokens_used": 0
            }
    
    def _create_cerebras_llm(self, model_name: str):
        """Create Cerebras LLM configuration for CrewAI"""
        from langchain_openai import ChatOpenAI
        
        return ChatOpenAI(
            model=model_name,
            openai_api_key=self.cerebras_service.api_key,
            openai_api_base=self.cerebras_service.base_url,
            temperature=0.7,
            max_tokens=4096,
            streaming=True
        )
    
    def _create_tools(self, tool_configs: List[Dict[str, Any]]) -> List[Any]:
        """Create tools for agents based on configuration"""
        tools = []
        
        for tool_config in tool_configs:
            tool_name = tool_config.get("name")
            
            if tool_name == "serper_dev":
                # Search tool
                search_tool = SerperDevTool(
                    n_results=tool_config.get("n_results", 10),
                    search_url=tool_config.get("search_url", "https://google.serper.dev/search")
                )
                tools.append(search_tool)
                
            elif tool_name == "scrape_website":
                # Web scraping tool
                scrape_tool = ScrapeWebsiteTool(
                    website_url=tool_config.get("website_url", "")
                )
                tools.append(scrape_tool)
                
            elif tool_name == "file_read":
                # File reading tool
                file_tool = FileReadTool(
                    file_path=tool_config.get("file_path", "")
                )
                tools.append(file_tool)
                
            else:
                logger.warning(f"Unknown tool: {tool_name}")
        
        return tools
    
    def _create_task(self, task_def: Dict[str, Any], agents: List[Agent]) -> Task:
        """Create a CrewAI task"""
        # Find the assigned agent
        agent = None
        agent_id = task_def.get("agent_id")
        if agent_id:
            agent = next((a for a in agents if a.role == agent_id), None)
        
        # Use first agent if no specific agent assigned
        if not agent and agents:
            agent = agents[0]
        
        return Task(
            description=task_def["description"],
            expected_output=task_def.get("expected_output", ""),
            agent=agent,
            name=task_def["name"],
            context=task_def.get("context", []),
            **task_def.get("config", {})
        )
    
    def _get_process_type(self, process_type: str):
        """Get CrewAI process type"""
        process_map = {
            "sequential": Process.sequential,
            "hierarchical": Process.hierarchical,
            "parallel": Process.parallel
        }
        return process_map.get(process_type, Process.sequential)
    
    def _extract_agent_outputs(self, crew: Crew) -> Dict[str, Any]:
        """Extract individual agent outputs from crew execution"""
        outputs = {}
        
        # This would need to be implemented based on actual CrewAI output structure
        # For now, return a placeholder
        for i, agent in enumerate(crew.agents):
            outputs[f"agent_{i}_{agent.role}"] = "Task completed"
        
        return outputs
    
    async def execute_workflow_step(
        self,
        agent: Agent,
        task: Task,
        context: Dict[str, Any] = None,
        step_id: str = None
    ) -> Dict[str, Any]:
        """Execute a single workflow step with an agent and task"""
        try:
            logger.info(f"Executing workflow step: {step_id} with agent: {agent.role}")
            
            start_time = asyncio.get_event_loop().time()
            
            # Execute task with agent
            result = agent.execute_task(task, context=context)
            
            execution_time = int((asyncio.get_event_loop().time() - start_time) * 1000)
            
            return {
                "step_id": step_id,
                "status": ExecutionStatus.COMPLETED,
                "result": str(result) if result else "",
                "execution_time": execution_time,
                "agent": agent.role,
                "task": task.name
            }
            
        except Exception as e:
            logger.error(f"Workflow step execution failed: {e}")
            return {
                "step_id": step_id,
                "status": ExecutionStatus.FAILED,
                "error": str(e),
                "agent": agent.role,
                "task": task.name
            }
    
    def create_agents_from_templates(self, templates: List[Dict[str, Any]]) -> List[Agent]:
        """Create multiple agents from template configurations"""
        agents = []
        
        for template in templates:
            try:
                agent = self.create_agent(template)
                agents.append(agent)
            except Exception as e:
                logger.error(f"Failed to create agent from template: {e}")
                continue
        
        return agents
    
    def validate_agent_config(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate agent configuration"""
        errors = {}
        
        required_fields = ["name", "role", "goal", "backstory"]
        for field in required_fields:
            if not agent_data.get(field):
                errors[field] = f"{field} is required"
        
        # Validate model name
        model_name = agent_data.get("model_name", "llama-4-scout-17b-16e-instruct")
        if model_name not in self.cerebras_service.available_models:
            errors["model_name"] = f"Model {model_name} not available"
        
        # Validate tools
        tools = agent_data.get("tools", [])
        for tool in tools:
            if "name" not in tool:
                errors["tools"] = "Tool name is required"
                break
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }