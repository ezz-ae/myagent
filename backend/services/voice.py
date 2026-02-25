import os
from io import BytesIO
from typing import Optional, Dict
from fastapi.responses import StreamingResponse

# ElevenLabs client (optional)
try:
    from elevenlabs.client import ElevenLabs
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
    elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY) if ELEVENLABS_API_KEY else None
except (ImportError, Exception):
    elevenlabs_client = None

VOICE_MAP = {
    "en": "21m00Tcm4TlvDq8ikWAM",  # English: Bella (default)
    "ar": "EXAVITQu4vr4xnSDxMaL",  # Arabic: Khalid
}

class VoiceService:
    def __init__(self):
        self.client = elevenlabs_client

    def is_enabled(self) -> bool:
        return self.client is not None

    def generate_speech(self, text: str, language: str = "en", voice_id: Optional[str] = None) -> Optional[bytes]:
        if not self.is_enabled():
            return None

        v_id = voice_id or VOICE_MAP.get(language, VOICE_MAP["en"])
        try:
            audio_bytes = self.client.generate(text=text, voice=v_id)
            return audio_bytes
        except Exception as e:
            print(f"Speech synthesis failed: {e}")
            return None
