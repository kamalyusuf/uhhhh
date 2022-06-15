import create from "zustand";
import { combine, devtools } from "zustand/middleware";
import { Message } from "../types";
import { ChatMessage } from "types";
import { c } from "../lib/constants";

const colors = [
  "#65A30D",
  "#EA580C",
  "#0D9488",
  "#0891B2",
  "#7C3AED",
  "#DB2777",
  "#7C3AED",
  "#4F46E5",
  "#2563EB",
  "#059669",
  "#D97706",
  "#DC2626",
  "#4B5563"
] as const;

const color = (str: string) => {
  let sum = 0;
  for (let x = 0; x < str.length; x++) sum += x * str.charCodeAt(x);
  return colors[sum % colors.length];
};

export const useRoomChatStore = create(
  devtools(
    combine({ messages: [] as Message[] }, (set) => ({
      add: (message: ChatMessage) =>
        set((state) => {
          return {
            messages: [
              ...(state.messages.length <= c.chat.messages_limit
                ? state.messages
                : state.messages.slice(0, c.chat.messages_limit)),
              { ...message, color: color(message.creator._id) }
            ]
          };
        }),
      reset: () => set({ messages: [] })
    })),
    { name: "RoomChat" }
  )
);
