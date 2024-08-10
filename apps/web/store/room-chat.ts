import { CHAT_MESSAGES_LIMIT } from "../utils/constants";
import { createstore } from "../utils/store";
import type { ChatMessage } from "types";

interface ChatStore {
  messages: ChatMessage[];
  add: (message: ChatMessage) => void;
  reset: () => void;
}

export const useRoomChatStore = createstore<ChatStore>("RoomChat", (set) => ({
  messages: [],
  add: (message) =>
    set((state) => {
      return {
        messages: [...state.messages.slice(-CHAT_MESSAGES_LIMIT + 1), message]
      };
    }),

  reset: () => set({ messages: [] })
}));
