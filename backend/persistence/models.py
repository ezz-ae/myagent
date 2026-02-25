from enum import Enum
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional

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

@dataclass
class SessionMetadata:
    """Represents session metadata"""
    session_id: str
    folder_id: str
    created_at: str
    last_modified: str
    title: str

    def to_dict(self) -> Dict:
        return asdict(self)

@dataclass
class Message:
    """Represents a single message in a session"""
    id: str
    role: str
    text: str
    timestamp: str
    model: Optional[str] = None

    def to_dict(self) -> Dict:
        return asdict(self)
