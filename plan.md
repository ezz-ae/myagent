Plan: Senior Architect Refactoring — LocalAgent Unified System
{TL;DR}
This plan transforms LocalAgent from a collection of isolated scripts into a professional, modular agentic system. We will refactor the backend into a clean, layered architecture (API -> Services -> Persistence), implement a robust LocalAgent core capable of true Tool Calling (Function Calling), and consolidate the frontend into a single, unified dashboard. Key improvements include moving to a Repository pattern for data persistence, implementing a "Thought-Action-Observation" loop for AI intelligence, and using global state management in the frontend to eliminate the "fragmented app" feel.

Steps

Backend Layered Refactoring (Modularization)

Initialize backend/api/, backend/core/, backend/services/, and backend/persistence/.
Extract session, prompt, and folder management from main.py into backend/persistence/repository.py (Repository Pattern).
Move Twilio and ElevenLabs logic from twilio_hooks.py and main.py into backend/services/comms_service.py and backend/services/voice_service.py.
Split main.py routes into specific modules in backend/api/ (e.g., sessions_router.py, agent_router.py).
Core Agent Intelligence & Tool Registry

Implement backend/core/agent.py featuring a LocalAgent class to manage context, reasoning, and tool selection.
Create backend/core/tools/ and implement a ToolRegistry to formally define and expose local capabilities (file system, comms, memory) to the LLM via Ollama's tool-calling API.
Implement the "Reasoning Loop" in LocalAgent.chat() to allow multi-step actions (e.g., "Think -> Call Tool -> Observe Result -> Respond").
Structured Persistence & SQLite Migration

Introduce a lightweight SQLite database for structured, high-frequency data like ActivityLog and CrossSessionMemory in backend/persistence/database.py.
Maintain JSON storage for Session history to preserve portability and simplicity for the user.
Centralize all I/O through the Repository service to ensure ACID compliance and consistent data state.
Frontend Consolidation & State Management

Collapse duplicated pages (page.tsx, page.tsx) into a single, cohesive /dashboard structure.
Refactor DashboardLayout.tsx to be the primary shell for all user interactions.
Introduce Zustand (or React Context if preferred) in frontend/lib/store/ to manage the global "Agent State" (current session, tool status, real-time activity).
Integration of "Sidecar" Capabilities

Re-register Twilio and ElevenLabs as tools within the ToolRegistry, enabling the Agent to autonomously decide when to initiate calls or generate speech based on user intent.
Implement proactive logging in the ActivityLog for every Agent decision and tool execution.
Verification

Architectural Integrity: Verify main.py is reduced to <100 lines, primarily handling app initialization and router registration.
Intelligence Test: Confirm the Agent can autonomously use a tool (e.g., "Check my local files for...") and report the result in the chat.
Unified UI: Verify that switching between sessions or dashboard tabs maintains a consistent UI state and doesn't feel like navigating between different apps.
API Health: Run pytest (or manual curl checks) against the new modular endpoints to ensure no regressions in basic CRUD operations.
Decisions

Decision: Layered Architecture over Monolith. Chose to split main.py to allow independent scaling and testing of logic vs. transport.
Decision: SQLite for Logs. Chose SQLite over .jsonl for ActivityLog to support complex queries (like dashboard stats) without loading massive files into memory.
Decision: JSON for Sessions. Retained JSON for session history to keep individual chat files human-readable and easy to back up.
Decision: Tool Calling. Pivoted from "prompt injection" to explicit Tool Calling (Function Calling) for more reliable AI autonomy.
