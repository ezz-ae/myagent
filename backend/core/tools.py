from typing import List, Dict, Any, Callable, Optional
import json
from pydantic import BaseModel

class Tool(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]
    func: Callable

class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Tool] = {}

    def register(self, name: str, description: str, parameters: Dict[str, Any], func: Callable):
        self.tools[name] = Tool(
            name=name,
            description=description,
            parameters=parameters,
            func=func
        )

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        """Returns tool definitions in OpenAI/Ollama function calling format."""
        definitions = []
        for tool in self.tools.values():
            definitions.append({
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.parameters
                }
            })
        return definitions

    async def call_tool(self, name: str, arguments: str) -> str:
        if name not in self.tools:
            return f"Error: Tool '{name}' not found."
        
        try:
            args = json.loads(arguments)
            tool = self.tools[name]
            result = await tool.func(**args) if hasattr(tool.func, "__await__") else tool.func(**args)
            return json.dumps(result)
        except Exception as e:
            return f"Error executing tool '{name}': {str(e)}"

# Initialize global registry
registry = ToolRegistry()
