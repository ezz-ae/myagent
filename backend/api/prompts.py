from fastapi import APIRouter, HTTPException
from ..persistence.repository import Repository
from ..persistence.models import Prompt
from datetime import datetime
import uuid

router = APIRouter(prefix="/v1/sessions", tags=["prompts"])
repo = Repository()

@router.get("/{session_id}/prompts")
async def get_prompts(session_id: str):
    prompts = repo.load_prompts(session_id)
    return {"active_prompts": [p.to_dict() for p in prompts]}

@router.post("/{session_id}/prompts")
async def add_prompt(session_id: str, prompt_type: str, name: str, content: str):
    prompt = Prompt(
        id=f"prompt-{uuid.uuid4().hex[:8]}",
        type=prompt_type,
        name=name,
        content=content,
        state="active",
        created_at=datetime.now().isoformat(),
        metadata={}
    )
    repo.add_prompt(session_id, prompt)
    # repo.log_activity(session_id, "prompt_activated", {"prompt_name": name})
    return prompt.to_dict()

@router.delete("/{session_id}/prompts/{prompt_id}")
async def remove_prompt(session_id: str, prompt_id: str):
    prompts = repo.load_prompts(session_id)
    updated = [p for p in prompts if p.id != prompt_id]
    repo.save_prompts(session_id, updated)
    return {"status": "removed"}
