from fastapi import APIRouter
from ..persistence.repository import Repository
import uuid

router = APIRouter(prefix="/v1/folders", tags=["folders"])
repo = Repository()

@router.get("")
async def list_folders():
    return repo.list_folders()

@router.post("")
async def create_folder(name: str):
    folder_id = f"folder-{uuid.uuid4().hex[:8]}"
    return repo.create_folder(folder_id, name)

@router.get("/{folder_id}/sessions")
async def get_folder_sessions(folder_id: str):
    return repo.list_sessions(folder_id)
