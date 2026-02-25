from fastapi import APIRouter
from ..persistence.repository import Repository
import json
from pathlib import Path

router = APIRouter(prefix="/v1/dashboard", tags=["dashboard"])
repo = Repository()

@router.get("")
async def get_dashboard_config():
    config_file = repo.data_dir / "dashboard.json"
    if not config_file.exists():
        default_config = {
            "widgets": {
                "recent_sessions": True,
                "active_prompts": True,
                "activity_feed": True,
                "recordings": True,
                "task_list": True
            },
            "task_list": [],
            "notes": "Welcome to LocalAgent Dashboard",
            "exclude_first_task": False
        }
        with open(config_file, "w") as f:
            json.dump(default_config, f, indent=2)
        return default_config

    with open(config_file) as f:
        return json.load(f)

@router.get("/stats")
async def get_dashboard_stats():
    sessions = repo.list_sessions()
    total_sessions = len(sessions)
    total_messages = 0
    active_prompts = 0
    
    for s in sessions:
        msgs = repo.load_messages(s.session_id)
        total_messages += len(msgs)
        
        prompt = repo.get_active_prompt(s.session_id)
        if prompt:
            active_prompts += 1
            
    return {
        "totalSessions": total_sessions,
        "totalMessages": total_messages,
        "totalRecordings": 0, # TODO: Integrate with voice service
        "activePrompts": active_prompts
    }
