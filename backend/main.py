import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# API Routers
from .api import sessions, chat, dashboard, tools, prompts, memory, folders, secrets, linkbio, voice, comms

load_dotenv()

app = FastAPI(title="LocalAgent API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(sessions.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(tools.router)
app.include_router(prompts.router)
app.include_router(memory.router)
app.include_router(folders.router)
app.include_router(secrets.router)
app.include_router(linkbio.router)
app.include_router(voice.router)
app.include_router(comms.router)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
