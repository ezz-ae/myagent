from fastapi import APIRouter
from ..persistence.repository import Repository
import json

router = APIRouter(prefix="/v1/sessions", tags=["linkbio"])
repo = Repository()

@router.get("/{session_id}/links")
async def get_links(session_id: str):
    links_file = repo.sessions_dir / session_id / "links.json"
    if not links_file.exists():
        return {"links": []}
    with open(links_file) as f:
        return json.load(f)

@router.get("/{session_id}/linkbio-profile")
async def get_profile(session_id: str):
    profile_file = repo.sessions_dir / session_id / "linkbio-profile.json"
    if not profile_file.exists():
        return {"name": "Model Profile", "bio": "Links and resources"}
    with open(profile_file) as f:
        return json.load(f)
