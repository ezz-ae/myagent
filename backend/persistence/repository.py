import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from .models import Prompt, SessionMetadata, Message

# Constants for directory paths
DATA_DIR = Path(__file__).parent.parent / "data"
SESSIONS_DIR = DATA_DIR / "sessions"
FOLDERS_FILE = DATA_DIR / "folders.json"
TEMPLATES_FILE = DATA_DIR / "prompt-templates.json"

class Repository:
    """Central repository for all data persistence operations."""

    def __init__(self):
        self.data_dir = DATA_DIR
        self.sessions_dir = SESSIONS_DIR
        self.folders_file = FOLDERS_FILE
        self._ensure_dirs()

    def _ensure_dirs(self):
        self.data_dir.mkdir(exist_ok=True)
        self.sessions_dir.mkdir(exist_ok=True)
        if not self.folders_file.exists():
            self.save_folders({'default': {'id': 'default', 'name': 'Default', 'sessions': []}})

    # --- Session Operations ---

    def create_session(self, session_id: str, folder_id: str = "default", title: str = None) -> SessionMetadata:
        session_dir = self.sessions_dir / session_id
        session_dir.mkdir(parents=True, exist_ok=True)
        (session_dir / "recordings").mkdir(exist_ok=True)

        now = datetime.now().isoformat()
        metadata = SessionMetadata(
            session_id=session_id,
            folder_id=folder_id,
            created_at=now,
            last_modified=now,
            title=title or f"Session {session_id[-8:]}"
        )

        metadata_file = session_dir / "metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata.to_dict(), f, indent=2)

        self.add_session_to_folder(folder_id, session_id)
        return metadata

    def get_session(self, session_id: str) -> Optional[SessionMetadata]:
        metadata_file = self.sessions_dir / session_id / "metadata.json"
        if metadata_file.exists():
            try:
                with open(metadata_file, 'r') as f:
                    data = json.load(f)
                    return SessionMetadata(**data)
            except Exception as e:
                print(f"Error loading session metadata: {e}")
        return None

    def list_sessions(self, folder_id: str = None) -> List[SessionMetadata]:
        sessions = []
        if not self.sessions_dir.exists():
            return []
            
        for session_dir in self.sessions_dir.iterdir():
            if not session_dir.is_dir():
                continue
            metadata = self.get_session(session_dir.name)
            if metadata and (folder_id is None or metadata.folder_id == folder_id):
                sessions.append(metadata)
        return sessions

    def update_session_title(self, session_id: str, new_title: str):
        metadata = self.get_session(session_id)
        if metadata:
            metadata.title = new_title
            metadata.last_modified = datetime.now().isoformat()
            metadata_file = self.sessions_dir / session_id / "metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(metadata.to_dict(), f, indent=2)

    def save_message(self, session_id: str, message: Message):
        session_dir = self.sessions_dir / session_id
        session_dir.mkdir(parents=True, exist_ok=True)

        messages_file = session_dir / "messages.jsonl"
        with open(messages_file, 'a') as f:
            f.write(json.dumps(message.to_dict()) + '\n')

        # Update last_modified
        metadata = self.get_session(session_id)
        if metadata:
            metadata.last_modified = datetime.now().isoformat()
            metadata_file = session_dir / "metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(metadata.to_dict(), f, indent=2)

    def load_messages(self, session_id: str) -> List[Message]:
        messages_file = self.sessions_dir / session_id / "messages.jsonl"
        if not messages_file.exists():
            return []
        
        messages = []
        try:
            with open(messages_file, 'r') as f:
                for line in f:
                    if line.strip():
                        messages.append(Message(**json.loads(line)))
        except Exception as e:
            print(f"Error loading messages: {e}")
        return messages

    # --- Prompt Operations ---

    def load_prompts(self, session_id: str) -> List[Prompt]:
        prompts_file = self.sessions_dir / session_id / "prompts.json"
        if not prompts_file.exists():
            return []
        try:
            with open(prompts_file, 'r') as f:
                data = json.load(f)
            return [Prompt(**p) for p in data.get('active_prompts', [])]
        except Exception as e:
            print(f"Error loading prompts: {e}")
            return []

    def save_prompts(self, session_id: str, prompts: List[Prompt]):
        session_dir = self.sessions_dir / session_id
        session_dir.mkdir(parents=True, exist_ok=True)
        prompts_file = session_dir / "prompts.json"
        with open(prompts_file, 'w') as f:
            json.dump({'active_prompts': [p.to_dict() for p in prompts]}, f, indent=2)

    def add_prompt(self, session_id: str, prompt: Prompt):
        prompts = self.load_prompts(session_id)
        prompts.append(prompt)
        self.save_prompts(session_id, prompts)

    def get_active_prompt(self, session_id: str) -> Optional[Prompt]:
        prompts = self.load_prompts(session_id)
        for p in prompts:
            if p.state == "active":
                return p
        return None

    # --- Folder Operations ---

    def load_folders(self) -> Dict:
        try:
            with open(self.folders_file, 'r') as f:
                return json.load(f)
        except Exception:
            return {'default': {'id': 'default', 'name': 'Default', 'sessions': []}}

    def save_folders(self, folders: Dict):
        with open(self.folders_file, 'w') as f:
            json.dump(folders, f, indent=2)

    def list_folders(self) -> List[Dict]:
        return list(self.load_folders().values())

    def add_session_to_folder(self, folder_id: str, session_id: str):
        folders = self.load_folders()
        if folder_id in folders and session_id not in folders[folder_id]['sessions']:
            folders[folder_id]['sessions'].append(session_id)
            self.save_folders(folders)

    def remove_session_from_folders(self, session_id: str):
        folders = self.load_folders()
        changed = False
        for folder_id in folders:
            if session_id in folders[folder_id].get('sessions', []):
                folders[folder_id]['sessions'].remove(session_id)
                changed = True
        if changed:
            self.save_folders(folders)

    # --- Activity Operations ---

    def log_activity(self, session_id: str, event_type: str, data: Dict[str, Any]):
        activity_file = self.sessions_dir / session_id / "activity.jsonl"
        event = {
            'timestamp': datetime.now().isoformat(),
            'type': event_type,
            'data': data
        }
        with open(activity_file, 'a') as f:
            f.write(json.dumps(event) + '\n')

    def get_activity_log(self, session_id: str, limit: int = 100) -> List[Dict]:
        activity_file = self.sessions_dir / session_id / "activity.jsonl"
        if not activity_file.exists():
            return []
        try:
            events = []
            with open(activity_file, 'r') as f:
                for line in f:
                    if line.strip():
                        events.append(json.loads(line))
            return events[-limit:]
        except Exception as e:
            print(f"Error reading activity log: {e}")
            return []
