"""
LocalAgent Advanced Prompt & Session Management System

Provides:
- SessionManager: Create, load, save sessions with persistent file storage
- PromptManager: Manage active prompts, inject context into system prompts
- ActivityLogger: Log important events (off-topic requests, prompt changes, etc.)
- Prompt types: Task, Learn, Roles, Schedule, Time Target, Read, Debate, Interview, Forbidden Words

All data stored in JSON/JSONL files under /backend/data/
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from enum import Enum
from dataclasses import dataclass, asdict


# ── DATA DIRECTORY SETUP ────────────────────────────────────────────────────

DATA_DIR = Path(__file__).parent / "data"
SESSIONS_DIR = DATA_DIR / "sessions"
FOLDERS_FILE = DATA_DIR / "folders.json"
TEMPLATES_FILE = DATA_DIR / "prompt-templates.json"

# Create directories if they don't exist
DATA_DIR.mkdir(exist_ok=True)
SESSIONS_DIR.mkdir(exist_ok=True)


# ── PROMPT TYPES ────────────────────────────────────────────────────────────

class PromptType(Enum):
    """9 prompt types supported by the system"""
    TASK = "task"                      # Focus on specific task
    FORBIDDEN_WORDS = "forbidden_words"  # Prohibit certain words
    SCHEDULE = "schedule"              # Schedule a task with time
    LEARN = "learn"                    # Learning mode - comprehensive answers
    ROLES = "roles"                    # Act as specific role (doctor, journalist, etc.)
    READ = "read"                      # Read file/folder/link content
    TIME_TARGET = "time_target"        # Complete task within deadline
    DEBATE = "debate"                  # Debate mode - counterarguments
    INTERVIEW = "interview"            # Interview mode - act as journalist


@dataclass
class Prompt:
    """Represents an active prompt"""
    id: str                            # Unique ID
    type: str                          # PromptType value
    name: str                          # Human-readable name
    content: str                       # Prompt content/input
    state: str                         # "active" or "inactive"
    created_at: str                    # ISO timestamp
    metadata: Dict[str, Any]           # Extra data (depends on type)

    def to_dict(self) -> Dict:
        return asdict(self)


# ── PROMPT MANAGER ──────────────────────────────────────────────────────────

class PromptManager:
    """Manages active prompts for a session"""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.session_dir = SESSIONS_DIR / session_id
        self.prompts_file = self.session_dir / "prompts.json"

    def load_prompts(self) -> List[Prompt]:
        """Load all prompts for this session"""
        if not self.prompts_file.exists():
            return []

        try:
            with open(self.prompts_file, 'r') as f:
                data = json.load(f)
            return [Prompt(**p) for p in data.get('active_prompts', [])]
        except Exception as e:
            print(f"Error loading prompts: {e}")
            return []

    def save_prompts(self, prompts: List[Prompt]) -> None:
        """Save prompts to file"""
        self.session_dir.mkdir(parents=True, exist_ok=True)
        with open(self.prompts_file, 'w') as f:
            json.dump({'active_prompts': [p.to_dict() for p in prompts]}, f, indent=2)

    def add_prompt(self, prompt: Prompt) -> None:
        """Add a new active prompt"""
        prompts = self.load_prompts()
        prompts.append(prompt)
        self.save_prompts(prompts)

    def remove_prompt(self, prompt_id: str) -> None:
        """Remove a prompt by ID"""
        prompts = self.load_prompts()
        prompts = [p for p in prompts if p.id != prompt_id]
        self.save_prompts(prompts)

    def get_active_prompt(self) -> Optional[Prompt]:
        """Get the first active prompt (only one at a time)"""
        prompts = self.load_prompts()
        for p in prompts:
            if p.state == "active":
                return p
        return None

    def deactivate_prompt(self, prompt_id: str) -> None:
        """Deactivate a prompt"""
        prompts = self.load_prompts()
        for p in prompts:
            if p.id == prompt_id:
                p.state = "inactive"
        self.save_prompts([p for p in prompts if p.state == "active"])

    def modify_system_prompt(self, base_prompt: str, active_prompt: Prompt) -> str:
        """Inject prompt context into the system prompt"""
        ptype = active_prompt.type

        injections = {
            PromptType.TASK.value: f"You are currently focused on: {active_prompt.content}. If asked off-topic, gently redirect back to this task but still be helpful.",

            PromptType.LEARN.value: "Provide comprehensive, educational, and detailed responses. Include steps, examples, reasoning, and practical insights when teaching. Be thorough and explanatory.",

            PromptType.ROLES.value: f"You are a {active_prompt.content}. Respond with appropriate accuracy and professional standards for this role.",

            PromptType.SCHEDULE.value: f"Task scheduled: {active_prompt.content}. Current time: {datetime.now().strftime('%A %I:%M %p')}. Respond with task urgency in mind.",

            PromptType.TIME_TARGET.value: f"Complete task within: {active_prompt.metadata.get('time_remaining', 'unknown')}. Current deadline: {active_prompt.metadata.get('deadline', 'N/A')}. Be efficient and focused.",

            PromptType.DEBATE.value: "You are in DEBATE mode. Provide strong counterarguments, rebuttals, and opposite perspectives. Challenge assumptions.",

            PromptType.INTERVIEW.value: "You are a journalist conducting an interview. Ask probing questions, follow-ups, and generate insightful questions. Format: Q: [question]\\nA: [response]",

            PromptType.FORBIDDEN_WORDS.value: f"Never use these words in your response: {', '.join(active_prompt.metadata.get('words', []))}. Avoid them completely.",

            PromptType.READ.value: f"The user shared this content:\\n{active_prompt.metadata.get('content', '')}\\n\\nRespond based on this shared content.",
        }

        injection = injections.get(ptype, "")
        if injection:
            return f"{base_prompt}\n\n[ACTIVE PROMPT: {active_prompt.name}]\n{injection}"
        return base_prompt

    def check_off_topic(self, user_message: str, active_prompt: Prompt) -> bool:
        """Detect if user message is off-topic from active prompt"""
        if active_prompt.type != PromptType.TASK.value:
            return False

        # Simple heuristic: check if any keywords from task are in message
        task_keywords = active_prompt.content.lower().split()
        msg_lower = user_message.lower()

        # Filter out common words
        stop_words = {'is', 'a', 'the', 'to', 'of', 'and', 'or', 'in', 'at', 'on', 'for'}
        task_keywords = [w for w in task_keywords if w not in stop_words and len(w) > 2]

        # If very few keywords or no matches, it's off-topic
        matches = sum(1 for kw in task_keywords if kw in msg_lower)
        return len(task_keywords) > 0 and matches == 0

    def remove_forbidden_words(self, text: str, active_prompt: Prompt) -> str:
        """Remove forbidden words from text"""
        if active_prompt.type != PromptType.FORBIDDEN_WORDS.value:
            return text

        forbidden = active_prompt.metadata.get('words', [])
        result = text
        for word in forbidden:
            # Case-insensitive replacement
            result = re.sub(r'\b' + re.escape(word) + r'\b', '[redacted]', result, flags=re.IGNORECASE)
        return result


# ── ACTIVITY LOGGER ──────────────────────────────────────────────────────────

class ActivityLogger:
    """Logs important events for a session (smart filtering, not verbose)"""

    IMPORTANT_EVENTS = {
        'session_created', 'session_archived',
        'prompt_activated', 'prompt_deactivated',
        'off_topic_request', 'prompt_violation',
        'time_warning', 'recording_created',
        'model_error', 'role_switched'
    }

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.session_dir = SESSIONS_DIR / session_id
        self.activity_file = self.session_dir / "activity.jsonl"

    def is_important(self, event_type: str) -> bool:
        """Check if event type should be logged"""
        return event_type in self.IMPORTANT_EVENTS

    def log_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """Log an important event"""
        if not self.is_important(event_type):
            return

        self.session_dir.mkdir(parents=True, exist_ok=True)

        event = {
            'timestamp': datetime.now().isoformat(),
            'type': event_type,
            'data': data
        }

        with open(self.activity_file, 'a') as f:
            f.write(json.dumps(event) + '\n')

    def get_activity_log(self, limit: int = 100) -> List[Dict]:
        """Read recent activity log"""
        if not self.activity_file.exists():
            return []

        try:
            events = []
            with open(self.activity_file, 'r') as f:
                for line in f:
                    if line.strip():
                        events.append(json.loads(line))
            return events[-limit:]
        except Exception as e:
            print(f"Error reading activity log: {e}")
            return []


# ── SESSION MANAGER ──────────────────────────────────────────────────────────

class SessionManager:
    """Manages session creation, loading, and message persistence"""

    def __init__(self):
        self.sessions_dir = SESSIONS_DIR

    def create_session(self, session_id: str, folder_id: str = "default", title: str = None) -> Dict:
        """Create a new session with metadata"""
        session_dir = self.sessions_dir / session_id
        session_dir.mkdir(parents=True, exist_ok=True)

        # Create recordings subdirectory
        (session_dir / "recordings").mkdir(exist_ok=True)

        metadata = {
            'session_id': session_id,
            'folder_id': folder_id,
            'created_at': datetime.now().isoformat(),
            'last_modified': datetime.now().isoformat(),
            'title': title or f"Session {session_id[-8:]}"
        }

        metadata_file = session_dir / "metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)

        return metadata

    def list_sessions(self, folder_id: str = None) -> List[Dict]:
        """List all sessions, optionally filtered by folder"""
        sessions = []
        for session_dir in self.sessions_dir.iterdir():
            if not session_dir.is_dir():
                continue

            metadata_file = session_dir / "metadata.json"
            if metadata_file.exists():
                try:
                    with open(metadata_file, 'r') as f:
                        metadata = json.load(f)
                    if folder_id is None or metadata.get('folder_id') == folder_id:
                        sessions.append(metadata)
                except Exception as e:
                    print(f"Error loading session {session_dir.name}: {e}")

        return sessions

    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get a specific session's metadata"""
        metadata_file = self.sessions_dir / session_id / "metadata.json"
        if metadata_file.exists():
            try:
                with open(metadata_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading session metadata: {e}")
        return None

    def update_session_title(self, session_id: str, new_title: str) -> None:
        """Rename a session"""
        session_dir = self.sessions_dir / session_id
        metadata_file = session_dir / "metadata.json"

        if metadata_file.exists():
            metadata = json.load(open(metadata_file, 'r'))
            metadata['title'] = new_title
            metadata['last_modified'] = datetime.now().isoformat()
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)

    def load_messages(self, session_id: str) -> List[Dict]:
        """Load all messages from a session"""
        messages_file = self.sessions_dir / session_id / "messages.jsonl"
        if not messages_file.exists():
            return []

        messages = []
        try:
            with open(messages_file, 'r') as f:
                for line in f:
                    if line.strip():
                        messages.append(json.loads(line))
        except Exception as e:
            print(f"Error loading messages: {e}")

        return messages

    def save_message(self, session_id: str, message: Dict) -> None:
        """Append a message to session"""
        session_dir = self.sessions_dir / session_id
        session_dir.mkdir(parents=True, exist_ok=True)

        messages_file = session_dir / "messages.jsonl"
        with open(messages_file, 'a') as f:
            f.write(json.dumps(message) + '\n')

        # Update last_modified
        metadata_file = session_dir / "metadata.json"
        if metadata_file.exists():
            metadata = json.load(open(metadata_file, 'r'))
            metadata['last_modified'] = datetime.now().isoformat()
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)

    def save_recording(
        self,
        session_id: str,
        audio_bytes: bytes,
        text: str,
        language: str
    ) -> str:
        """Save a voice recording with metadata"""
        session_dir = self.sessions_dir / session_id
        recordings_dir = session_dir / "recordings"
        recordings_dir.mkdir(parents=True, exist_ok=True)

        # Create filename from timestamp
        timestamp = datetime.now().isoformat().replace(':', '-')
        filename = f"{int(datetime.now().timestamp() * 1000)}"

        # Save audio
        audio_file = recordings_dir / f"{filename}.mp3"
        with open(audio_file, 'wb') as f:
            f.write(audio_bytes)

        # Save metadata
        metadata = {
            'filename': f"{filename}.mp3",
            'timestamp': datetime.now().isoformat(),
            'text': text,
            'language': language,
            'size_bytes': len(audio_bytes)
        }
        metadata_file = recordings_dir / f"{filename}.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)

        return str(audio_file)

    def get_recordings(self, session_id: str) -> List[Dict]:
        """Get all recordings for a session"""
        recordings_dir = self.sessions_dir / session_id / "recordings"
        if not recordings_dir.exists():
            return []

        recordings = []
        try:
            # Find all .json metadata files
            for metadata_file in recordings_dir.glob("*.json"):
                with open(metadata_file, 'r') as f:
                    recordings.append(json.load(f))
        except Exception as e:
            print(f"Error loading recordings: {e}")

        return sorted(recordings, key=lambda x: x['timestamp'], reverse=True)


# ── FOLDER MANAGER ──────────────────────────────────────────────────────────

class FolderManager:
    """Manages folder organization"""

    def __init__(self):
        self.folders_file = FOLDERS_FILE
        self._ensure_default_folder()

    def _ensure_default_folder(self) -> None:
        """Ensure default folder exists"""
        if not self.folders_file.exists():
            folders = {
                'default': {'id': 'default', 'name': 'Default', 'sessions': []}
            }
            self._save_folders(folders)

    def _load_folders(self) -> Dict:
        """Load all folders"""
        try:
            with open(self.folders_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading folders: {e}")
            return {'default': {'id': 'default', 'name': 'Default', 'sessions': []}}

    def _save_folders(self, folders: Dict) -> None:
        """Save folders"""
        FOLDERS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(self.folders_file, 'w') as f:
            json.dump(folders, f, indent=2)

    def create_folder(self, folder_id: str, name: str) -> Dict:
        """Create a new folder"""
        folders = self._load_folders()
        folders[folder_id] = {'id': folder_id, 'name': name, 'sessions': []}
        self._save_folders(folders)
        return folders[folder_id]

    def list_folders(self) -> List[Dict]:
        """List all folders"""
        return list(self._load_folders().values())

    def add_session_to_folder(self, folder_id: str, session_id: str) -> None:
        """Add a session to a folder"""
        folders = self._load_folders()
        if folder_id in folders and session_id not in folders[folder_id]['sessions']:
            folders[folder_id]['sessions'].append(session_id)
            self._save_folders(folders)

    def remove_session_from_folders(self, session_id: str) -> None:
        """Remove a session from all folders"""
        folders = self._load_folders()
        changed = False
        for folder_id in folders:
            if session_id in folders[folder_id].get('sessions', []):
                folders[folder_id]['sessions'].remove(session_id)
                changed = True
        if changed:
            self._save_folders(folders)


# ── PROMPT TEMPLATE LIBRARY ──────────────────────────────────────────────────

def create_prompt_templates() -> None:
    """Create the prompt templates library"""
    templates = {
        "templates": [
            {
                "id": "task",
                "name": "Task Focus",
                "description": "Stay focused on one specific task",
                "type": PromptType.TASK.value,
                "fields": [{"name": "task", "type": "text", "placeholder": "What task to focus on?"}]
            },
            {
                "id": "learn",
                "name": "Learning Mode",
                "description": "Get comprehensive educational answers",
                "type": PromptType.LEARN.value,
                "fields": [{"name": "topic", "type": "text", "placeholder": "What to learn about?"}]
            },
            {
                "id": "roles",
                "name": "Roles",
                "description": "Act as a specific role (doctor, journalist, etc.)",
                "type": PromptType.ROLES.value,
                "fields": [{"name": "role", "type": "text", "placeholder": "What role? (doctor, teacher, journalist, etc.)"}]
            },
            {
                "id": "schedule",
                "name": "Schedule",
                "description": "Schedule a task with time information",
                "type": PromptType.SCHEDULE.value,
                "fields": [{"name": "schedule", "type": "text", "placeholder": "When? (e.g., 'Monday 9am')"}]
            },
            {
                "id": "time_target",
                "name": "Time Target",
                "description": "Complete task within a deadline",
                "type": PromptType.TIME_TARGET.value,
                "fields": [{"name": "duration", "type": "text", "placeholder": "How long? (e.g., '1 hour', '30 minutes')"}]
            },
            {
                "id": "forbidden_words",
                "name": "Forbidden Words",
                "description": "Prohibit specific words from responses",
                "type": PromptType.FORBIDDEN_WORDS.value,
                "fields": [{"name": "words", "type": "text", "placeholder": "Words to avoid (comma-separated)"}]
            },
            {
                "id": "debate",
                "name": "Debate",
                "description": "Get counterarguments and rebuttals",
                "type": PromptType.DEBATE.value,
                "fields": []
            },
            {
                "id": "interview",
                "name": "Interview",
                "description": "Role-play as a journalist",
                "type": PromptType.INTERVIEW.value,
                "fields": [{"name": "topic", "type": "text", "placeholder": "What to interview about?"}]
            },
            {
                "id": "read",
                "name": "Read",
                "description": "Read and analyze files, folders, or links",
                "type": PromptType.READ.value,
                "fields": [{"name": "source", "type": "text", "placeholder": "File path, folder, or URL"}]
            }
        ]
    }

    if not TEMPLATES_FILE.exists():
        TEMPLATES_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(TEMPLATES_FILE, 'w') as f:
            json.dump(templates, f, indent=2)


# Initialize templates on module load
create_prompt_templates()

print("✅ Prompt system initialized. Data directory: " + str(DATA_DIR))
