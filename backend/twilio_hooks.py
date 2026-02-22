"""
Twilio Integration Hooks for LocalAgent
Provides functions to initiate calls, handle webhooks, and manage call state.
To use this, you need to:
1. Sign up at twilio.com and get API credentials
2. Set environment variables:
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_PHONE_NUMBER (your Twilio number, e.g., "+1234567890")
   - TWILIO_WEBHOOK_URL (your server's webhook endpoint)
"""

import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
TWILIO_WEBHOOK_URL = os.getenv("TWILIO_WEBHOOK_URL")

# Initialize Twilio client only if credentials are available
try:
    from twilio.rest import Client
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN else None
except ImportError:
    twilio_client = None


def is_twilio_enabled() -> bool:
    """Check if Twilio is properly configured."""
    return twilio_client is not None and TWILIO_PHONE_NUMBER is not None


def initiate_call(
    to_number: str,
    agent_name: str = "LocalAgent",
    language: str = "en"
) -> Optional[dict]:
    """
    Initiate an outbound call using Twilio.

    Args:
        to_number: Phone number to call (e.g., "+1234567890" or agent name)
        agent_name: Name of the AI agent making the call
        language: Language for the call ("en" for English, "ar" for Arabic)

    Returns:
        Call object with call_sid, status, etc., or None if Twilio not configured

    Example:
        call = initiate_call("+1555123456", language="en")
        if call:
            print(f"Call initiated: {call.sid}")
    """
    if not is_twilio_enabled():
        return None

    try:
        # Build TwiML callback URL (would be hosted on your backend)
        twiml_url = f"{TWILIO_WEBHOOK_URL}/v1/twilio/twiml" if TWILIO_WEBHOOK_URL else None

        # Initiate the call
        call = twilio_client.calls.create(
            from_=TWILIO_PHONE_NUMBER,
            to=to_number,
            url=twiml_url,
            record=True,  # Record calls for quality assurance
            statusCallback=f"{TWILIO_WEBHOOK_URL}/v1/twilio/status" if TWILIO_WEBHOOK_URL else None,
            statusCallbackEvent=["initiated", "ringing", "answered", "completed"],
        )

        return {
            "call_sid": call.sid,
            "status": call.status,
            "from": call.from_,
            "to": call.to,
            "price": call.price,
            "duration": call.duration,
        }
    except Exception as e:
        print(f"Error initiating call: {e}")
        return None


def get_call_status(call_sid: str) -> Optional[dict]:
    """
    Get the current status of a call.

    Args:
        call_sid: The Twilio Call SID

    Returns:
        Call status object or None if not found
    """
    if not twilio_client:
        return None

    try:
        call = twilio_client.calls(call_sid).fetch()
        return {
            "call_sid": call.sid,
            "status": call.status,  # queued, ringing, in-progress, completed, failed, busy, no-answer
            "from": call.from_,
            "to": call.to,
            "start_time": call.start_time,
            "end_time": call.end_time,
            "duration": call.duration,
            "price": call.price,
        }
    except Exception as e:
        print(f"Error fetching call status: {e}")
        return None


def end_call(call_sid: str) -> bool:
    """
    Terminate an active call.

    Args:
        call_sid: The Twilio Call SID

    Returns:
        True if call was successfully terminated, False otherwise
    """
    if not twilio_client:
        return False

    try:
        twilio_client.calls(call_sid).update(status="completed")
        return True
    except Exception as e:
        print(f"Error ending call: {e}")
        return False


def generate_twiml_response(
    text: str,
    language: str = "en",
    gather_digits: bool = False
) -> str:
    """
    Generate TwiML (Twilio Markup Language) for voice response.

    Args:
        text: The text to speak to the caller
        language: Language for TTS ("en" for English, "ar" for Arabic)
        gather_digits: Whether to gather DTMF digits from caller

    Returns:
        TwiML XML string

    Example:
        twiml = generate_twiml_response("Hello, how can I help?", language="en")
    """
    # Map our language codes to Twilio's Polly voice language codes
    voice_map = {
        "en": "Polly.Joanna",  # Female English voice
        "ar": "Polly.Zeina",   # Female Arabic voice
    }
    voice = voice_map.get(language, voice_map["en"])

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="{voice}">{text}</Say>
"""

    if gather_digits:
        twiml += """    <Gather numDigits="1" timeout="5">
        <Say>Press any key to continue</Say>
    </Gather>
"""

    twiml += """</Response>"""

    return twiml


# Call state tracking (in production, use a database)
_active_calls: dict = {}


def add_active_call(call_sid: str, metadata: dict) -> None:
    """Track an active call."""
    _active_calls[call_sid] = metadata


def remove_active_call(call_sid: str) -> None:
    """Remove a call from active tracking."""
    _active_calls.pop(call_sid, None)


def get_active_calls() -> dict:
    """Get all currently active calls."""
    return _active_calls.copy()


# Example usage for FastAPI integration:
"""
from fastapi import FastAPI, Request
from twilio.rest import Client
from twilio_hooks import initiate_call, get_call_status, generate_twiml_response

@app.post("/v1/call/initiate")
async def initiate_phone_call(phone: str, language: str = "en"):
    result = initiate_call(phone, language=language)
    if result:
        return {"status": "initiated", "call_sid": result["call_sid"]}
    return {"status": "error", "message": "Twilio not configured"}

@app.post("/v1/twilio/twiml")
async def twilio_twiml_callback(request: Request):
    # Handle incoming call and generate TwiML response
    twiml = generate_twiml_response("Hello, you've reached LocalAgent. How can I assist you?", language="en")
    return Response(content=twiml, media_type="application/xml")

@app.post("/v1/twilio/status")
async def twilio_status_callback(request: Request):
    # Handle call status updates (called by Twilio webhooks)
    data = await request.form()
    call_sid = data.get("CallSid")
    call_status = data.get("CallStatus")
    print(f"Call {call_sid} status: {call_status}")
    return {"status": "received"}

@app.get("/v1/call/status/{call_sid}")
async def check_call_status(call_sid: str):
    status = get_call_status(call_sid)
    return status or {"error": "Call not found"}
"""
