from fastapi import APIRouter, HTTPException
from ..persistence.repository import Repository
import json
import uuid
from datetime import datetime

router = APIRouter(prefix="/v1/memory", tags=["memory"])
repo = Repository()

@router.get("")
async def get_memory():
    memory_file = repo.data_dir / "memory.jsonl"
    if not memory_file.exists():
        return {"memories": [], "count": 0}
    
    memories = []
    try:
        with open(memory_file, 'r') as f:
            for line in f:
                if line.strip():
                    memories.append(json.loads(line))
    except Exception:
        pass
    return {"memories": memories[-100:], "count": len(memories)}

@router.post("")
async def add_memory(fact: str, category: str = "general", source_session: str = None):
    memory_file = repo.data_dir / "memory.jsonl"
    entry = {
        "id": f"mem-{uuid.uuid4().hex[:8]}",
        "fact": fact,
        "category": category,
        "source_session": source_session,
        "created_at": datetime.now().isoformat(),
        "relevance_count": 0
    }
    with open(memory_file, 'a') as f:
        f.write(json.dumps(entry) + '\n')
    return {"memory": entry}
