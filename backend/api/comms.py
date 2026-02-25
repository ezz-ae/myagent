from fastapi import APIRouter, HTTPException
from ..services.comms import CommsService

router = APIRouter(prefix="/v1/call", tags=["comms"])
service = CommsService()

@router.post("/initiate")
async def initiate_call(phone: str, language: str = "en"):
    result = service.initiate_call(phone, language)
    if not result:
        raise HTTPException(status_code=500, detail="Call initiation failed")
    return result

@router.get("/status/{call_sid}")
async def get_status(call_sid: str):
    status = service.get_call_status(call_sid)
    if not status:
        raise HTTPException(status_code=404, detail="Call not found")
    return status
