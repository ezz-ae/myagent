from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from io import BytesIO
from ..services.voice import VoiceService

router = APIRouter(prefix="/v1/speech", tags=["voice"])
service = VoiceService()

class SpeechRequest(BaseModel):
    text: str
    language: Optional[str] = "en"
    voice_id: Optional[str] = None

@router.post("")
async def generate_speech(req: SpeechRequest):
    audio = service.generate_speech(req.text, req.language, req.voice_id)
    if not audio:
        raise HTTPException(status_code=500, detail="Speech generation failed")
    return StreamingResponse(BytesIO(audio), media_type="audio/mpeg")

@router.get("/languages")
async def list_languages():
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "ar", "name": "Arabic"},
        ]
    }
