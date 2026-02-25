from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from ..core.agent import LocalAgent
from ..persistence.repository import Repository

router = APIRouter(prefix="/v1/chat", tags=["chat"])
repo = Repository()
agent = LocalAgent(repo)

class ChatRequest(BaseModel):
    message: str
    session_id: str
    model: Optional[str] = None

@router.post("")
async def chat(req: ChatRequest):
    reply = await agent.chat(req.session_id, req.message, req.model)
    return {
        "reply": reply,
        "session_id": req.session_id,
        "model": req.model or agent.default_model
    }
