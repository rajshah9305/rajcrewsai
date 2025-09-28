import asyncio
import logging
from typing import Dict, List, Optional, Any, AsyncGenerator
from cerebras.cloud.sdk import Cerebras
import os

logger = logging.getLogger(__name__)

class CerebrasService:
    """Service for interacting with Cerebras AI API"""
    
    def __init__(self):
        self.api_key = os.getenv("CEREBRAS_API_KEY", "csk-fd9554wf4jdn99yd8wd5j3cyhcwmn53f8vt8nwn9h5449ek5")
        self.base_url = "https://api.cerebras.ai/v1"
        
        if not self.api_key:
            raise ValueError("CEREBRAS_API_KEY environment variable is required")
        
        self.client = Cerebras(
            api_key=self.api_key,
        )
        
        self.available_models = [
            "llama-4-scout-17b-16e-instruct",
            "llama-4-maverick-17b-128e-instruct",
            "llama3.1-8b",
            "llama-3.3-70b",
            "qwen-3-32b",
            "qwen-3-235b-a22b-instruct-2507",
            "qwen-3-235b-a22b-thinking-2507",
            "qwen-3-coder-480b",
            "gpt-oss-120b"
        ]
    
    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available Cerebras models with details"""
        models = []
        for model_name in self.available_models:
            models.append({
                "id": model_name,
                "name": self._format_model_name(model_name),
                "description": self._get_model_description(model_name),
                "context_window": self._get_model_context_window(model_name),
                "recommended_for": self._get_model_use_cases(model_name)
            })
        return models
    
    def _format_model_name(self, model_name: str) -> str:
        """Format model name for display"""
        name_map = {
            "llama-4-scout-17b-16e-instruct": "Llama 4 Scout",
            "llama-4-maverick-17b-128e-instruct": "Llama 4 Maverick",
            "llama3.1-8b": "Llama 3.1 8B",
            "llama-3.3-70b": "Llama 3.3 70B",
            "qwen-3-32b": "Qwen 3 32B",
            "qwen-3-235b-a22b-instruct-2507": "Qwen 3 235B Instruct",
            "qwen-3-235b-a22b-thinking-2507": "Qwen 3 235B Thinking",
            "qwen-3-coder-480b": "Qwen 3 Coder 480B",
            "gpt-oss-120b": "GPT-OSS 120B"
        }
        return name_map.get(model_name, model_name)
    
    def _get_model_description(self, model_name: str) -> str:
        """Get description for model"""
        descriptions = {
            "llama-4-scout-17b-16e-instruct": "Fast, efficient model for general-purpose tasks",
            "llama-4-maverick-17b-128e-instruct": "High-performance model for complex reasoning",
            "llama3.1-8b": "Lightweight model for quick responses",
            "llama-3.3-70b": "Balanced model for diverse applications",
            "qwen-3-32b": "Multilingual model with strong performance",
            "qwen-3-235b-a22b-instruct-2507": "Large instruct model for complex tasks",
            "qwen-3-235b-a22b-thinking-2507": "Advanced reasoning model",
            "qwen-3-coder-480b": "Specialized model for coding tasks",
            "gpt-oss-120b": "Open-source GPT model with broad capabilities"
        }
        return descriptions.get(model_name, "General-purpose AI model")
    
    def _get_model_context_window(self, model_name: str) -> int:
        """Get context window for model"""
        context_windows = {
            "llama-4-scout-17b-16e-instruct": 128000,
            "llama-4-maverick-17b-128e-instruct": 128000,
            "llama3.1-8b": 8192,
            "llama-3.3-70b": 64000,
            "qwen-3-32b": 40000,
            "qwen-3-235b-a22b-instruct-2507": 128000,
            "qwen-3-235b-a22b-thinking-2507": 128000,
            "qwen-3-coder-480b": 128000,
            "gpt-oss-120b": 128000
        }
        return context_windows.get(model_name, 8192)
    
    def _get_model_use_cases(self, model_name: str) -> List[str]:
        """Get recommended use cases for model"""
        use_cases = {
            "llama-4-scout-17b-16e-instruct": ["General chat", "Content creation", "Analysis"],
            "llama-4-maverick-17b-128e-instruct": ["Complex reasoning", "Research", "Problem solving"],
            "llama3.1-8b": ["Quick responses", "Simple tasks", "Mobile applications"],
            "llama-3.3-70b": ["Balanced performance", "Business applications", "Moderate complexity"],
            "qwen-3-32b": ["Multilingual tasks", "Translation", "Cross-cultural analysis"],
            "qwen-3-235b-a22b-instruct-2507": ["Instruction following", "Complex workflows", "Multi-step tasks"],
            "qwen-3-235b-a22b-thinking-2507": ["Advanced reasoning", "Mathematical problems", "Logical analysis"],
            "qwen-3-coder-480b": ["Code generation", "Programming help", "Technical documentation"],
            "gpt-oss-120b": ["Open source projects", "General AI tasks", "Community applications"]
        }
        return use_cases.get(model_name, ["General purpose"])
    
    async def generate_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama-4-scout-17b-16e-instruct",
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        top_p: float = 1.0,
        stream: bool = False,
        response_format: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate completion using Cerebras API"""
        try:
            if model not in self.available_models:
                raise ValueError(f"Model {model} not available. Choose from: {self.available_models}")
            
            # Prepare request parameters
            params = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "top_p": top_p,
                "stream": stream,
            }
            
            if max_tokens:
                params["max_completion_tokens"] = max_tokens
            
            if response_format:
                params["response_format"] = response_format
            
            # Make API call
            if stream:
                return await self._stream_completion(params)
            else:
                response = self.client.chat.completions.create(**params)
                return self._format_response(response)
                
        except Exception as e:
            logger.error(f"Cerebras API error: {e}")
            raise
    
    async def _stream_completion(self, params: Dict[str, Any]) -> AsyncGenerator[str, None]:
        """Stream completion from Cerebras API"""
        try:
            stream = self.client.chat.completions.create(**params)
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Cerebras streaming error: {e}")
            yield f"Error: {str(e)}"
    
    def _format_response(self, response: Any) -> Dict[str, Any]:
        """Format Cerebras API response"""
        return {
            "id": response.id,
            "content": response.choices[0].message.content,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            },
            "created": response.created,
        }
    
    async def test_connection(self, message: str = "Hello, Cerebras!") -> Dict[str, Any]:
        """Test Cerebras API connection"""
        try:
            messages = [{"role": "user", "content": message}]
            response = await self.generate_completion(
                messages=messages,
                model="llama-4-scout-17b-16e-instruct",
                max_tokens=100,
                temperature=0.7
            )
            
            return {
                "success": True,
                "response": response["content"],
                "model": response["model"],
                "tokens_used": response["usage"]["total_tokens"]
            }
        except Exception as e:
            logger.error(f"Cerebras connection test failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_structured_output(
        self,
        messages: List[Dict[str, str]],
        schema: Dict[str, Any],
        model: str = "llama-4-scout-17b-16e-instruct",
        max_tokens: Optional[int] = None,
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        """Generate structured output using JSON schema"""
        try:
            response_format = {
                "type": "json_schema",
                "json_schema": {
                    "name": "structured_output",
                    "strict": True,
                    "schema": schema
                }
            }
            
            result = await self.generate_completion(
                messages=messages,
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                response_format=response_format
            )
            
            # Parse the JSON response
            import json
            content = result["content"]
            if isinstance(content, str):
                try:
                    parsed_content = json.loads(content)
                    return {
                        "success": True,
                        "data": parsed_content,
                        "usage": result["usage"]
                    }
                except json.JSONDecodeError as e:
                    return {
                        "success": False,
                        "error": f"Failed to parse JSON: {e}",
                        "raw_content": content
                    }
            else:
                return {
                    "success": True,
                    "data": content,
                    "usage": result["usage"]
                }
                
        except Exception as e:
            logger.error(f"Structured output generation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }