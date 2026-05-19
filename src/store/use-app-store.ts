import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface DocumentMeta {
  id: string;
  name: string;
  createdAt: number;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// ── Document store — persisted to localStorage ─────────────────────────────
interface DocState {
  documents: DocumentMeta[];
  addDocument: (doc: DocumentMeta) => void;
  removeDocument: (id: string) => void;
  clearDocuments: () => void;
}

export const useDocStore = create<DocState>()(
  persist(
    (set) => ({
      documents: [],
      addDocument: (doc) =>
        set((state) => ({ documents: [doc, ...state.documents] })),
      removeDocument: (id) =>
        set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
      clearDocuments: () => set({ documents: [] }),
    }),
    {
      name: 'openkb-documents',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ── Chat store — persisted to sessionStorage ───────────────────────────────
// Survives navigation & page re-renders; clears when browser tab is closed.
interface ChatState {
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (id: string, content: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      chatMessages: [],
      addChatMessage: (msg) =>
        set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
      updateLastAssistantMessage: (id, content) =>
        set((state) => ({
          chatMessages: state.chatMessages.map((m) =>
            m.id === id ? { ...m, content } : m
          ),
        })),
      clearChat: () => set({ chatMessages: [] }),
    }),
    {
      name: 'openkb-chat',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),
    }
  )
);

// ── Legacy alias so any remaining useAppStore imports still compile ─────────
export const useAppStore = useDocStore;
