from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..persistence.repository import Repository
import json
import uuid
from datetime import datetime

router = APIRouter(prefix="/v1/sessions", tags=["secrets"])
repo = Repository()

class SecretRequest(BaseModel):
    name: str
    type: str
    value: str

@router.get("/{session_id}/secrets")
async def get_secrets(session_id: str):
    secrets_file = repo.sessions_dir / session_id / "secrets.json"
    if not secrets_file.exists():
        return {"secrets": []}
    with open(secrets_file) as f:
        return json.load(f)

@router.post("/{session_id}/secrets")
async def add_secret(session_id: str, req: SecretRequest):
    secrets_file = repo.sessions_dir / session_id / "secrets.json"
    secrets_file.parent.mkdir(parents=True, exist_ok=True)
    
    data = {"secrets": []}
    if secrets_file.exists():
        with open(secrets_file) as f:
            data = json.load(f)
            
    new_secret = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "type": req.type,
        "value": req.value,
        "created_at": datetime.now().isoformat()
    }
    data["secrets"].append(new_secret)
    with open(secrets_file, "w") as f:
        json.dump(data, f, indent=2)
    return {"secret": new_secret}
