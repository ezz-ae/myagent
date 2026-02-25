import { create } from 'zustand';

interface AgentState {
  sessionId: string | null;
  setSessionId: (id: string) => void;

  activeModel: string;
  setActiveModel: (model: string) => void;

  isThinking: boolean;
  setIsThinking: (thinking: boolean) => void;

  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  activeModel: 'llama3.2',
  setActiveModel: (model) => set({ activeModel: model }),

  isThinking: false,
  setIsThinking: (thinking) => set({ isThinking: thinking }),

  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
}));
