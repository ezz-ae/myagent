import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
TWILIO_WEBHOOK_URL = os.getenv("TWILIO_WEBHOOK_URL")

try:
    from twilio.rest import Client
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN else None
except ImportError:
    twilio_client = None

class CommsService:
    def __init__(self):
        self.client = twilio_client
        self.phone_number = TWILIO_PHONE_NUMBER
        self._active_calls: Dict[str, Any] = {}

    def is_enabled(self) -> bool:
        return self.client is not None and self.phone_number is not None

    def initiate_call(self, to_number: str, language: str = "en") -> Optional[dict]:
        if not self.is_enabled():
            return None

        try:
            twiml_url = f"{TWILIO_WEBHOOK_URL}/v1/twilio/twiml" if TWILIO_WEBHOOK_URL else None
            call = self.client.calls.create(
                from_=self.phone_number,
                to=to_number,
                url=twiml_url,
                record=True,
                statusCallback=f"{TWILIO_WEBHOOK_URL}/v1/twilio/status" if TWILIO_WEBHOOK_URL else None,
                statusCallbackEvent=["initiated", "ringing", "answered", "completed"],
            )

            result = {
                "call_sid": call.sid,
                "status": call.status,
                "from": call.from_,
                "to": call.to,
            }
            self._active_calls[call.sid] = {"phone": to_number, "language": language}
            return result
        except Exception as e:
            print(f"Error initiating call: {e}")
            return None

    def end_call(self, call_sid: str) -> bool:
        if not self.client:
            return False
        try:
            self.client.calls(call_sid).update(status="completed")
            self._active_calls.pop(call_sid, None)
            return True
        except Exception as e:
            print(f"Error ending call {call_sid}: {e}")
            return False

    def get_call_status(self, call_sid: str) -> Optional[dict]:
        if not self.client:
            return None
        try:
            call = self.client.calls(call_sid).fetch()
            return {
                "call_sid": call.sid,
                "status": call.status,
                "from": call.from_,
                "to": call.to,
            }
        except Exception as e:
            print(f"Error fetching call status: {e}")
            return None
            
    def generate_twiml_response(self, text: str, language: str = "en") -> str:
        voice_map = {
            "en": "Polly.Joanna",
            "ar": "Polly.Zeina",
        }
        voice = voice_map.get(language, voice_map["en"])
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="{voice}">{text}</Say>
</Response>"""
