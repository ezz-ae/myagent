from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..persistence.repository import Repository
from ..persistence.models import SessionMetadata, Message

router = APIRouter(prefix="/v1/sessions", tags=["sessions"])
repo = Repository()

@router.post("")
async def create_session(folder_id: str = "default", title: str = None):
    session_id = f"local-{int(datetime.now().timestamp() * 1000)}"
    return repo.create_session(session_id, folder_id, title)

@router.get("", response_model=List[SessionMetadata])
async def list_sessions(folder_id: Optional[str] = None):
    return repo.list_sessions(folder_id)

@router.get("/{session_id}")
async def get_session(session_id: str):
    metadata = repo.get_session(session_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = repo.load_messages(session_id)
    prompts = repo.load_prompts(session_id)
    
    return {
        "metadata": metadata,
        "messages": [m.to_dict() for m in messages],
        "prompts": [p.to_dict() for p in prompts]
    }

@router.put("/{session_id}")
async def update_session(session_id: str, title: str):
    repo.update_session_title(session_id, title)
    return {"status": "updated"}

@router.delete("/{session_id}")
async def delete_session(session_id: str):
    # For now, just remove from folders
    repo.remove_session_from_folders(session_id)
    return {"status": "removed", "session_id": session_id}
