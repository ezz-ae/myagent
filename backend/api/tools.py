from fastapi import APIRouter
from ..core.tools import registry
from ..services.voice import VoiceService
from ..services.comms import CommsService

router = APIRouter(prefix="/v1/tools", tags=["tools"])
voice_service = VoiceService()
comms_service = CommsService()

# --- Tool Functions ---

def generate_speech_tool(text: str, language: str = "en"):
    """Generates audio for the given text."""
    audio = voice_service.generate_speech(text, language)
    return {"status": "success" if audio else "failed", "text": text}

def make_phone_call_tool(phone_number: str, text_to_say: str):
    """Initiates a phone call and speaks the provided text."""
    result = comms_service.initiate_call(phone_number)
    return {"status": "initiated" if result else "failed", "call_sid": result.get("call_sid") if result else None}

# --- Register Tools ---

registry.register(
    name="generate_speech",
    description="Convert text to speech audio.",
    parameters={
        "type": "object",
        "properties": {
            "text": {"type": "string", "description": "The text to convert to speech."},
            "language": {"type": "string", "description": "Language code (en/ar)."}
        },
        "required": ["text"]
    },
    func=generate_speech_tool
)

registry.register(
    name="make_phone_call",
    description="Call a phone number and speak a message.",
    parameters={
        "type": "object",
        "properties": {
            "phone_number": {"type": "string", "description": "The target phone number."},
            "text_to_say": {"type": "string", "description": "The message to speak during the call."}
        },
        "required": ["phone_number", "text_to_say"]
    },
    func=make_phone_call_tool
)

@router.get("")
async def list_tools():
    return registry.get_tool_definitions()
