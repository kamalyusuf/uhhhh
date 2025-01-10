import { Box, ScrollArea } from "@mantine/core";
import React, { useRef, useEffect } from "react";
import { ChatMessageInput } from "./chat-message-input";
import { ChatMessageCard } from "./chat-message-card";
import { useRoomChatStore } from "../../../store/room-chat";

interface Props {
  drawer?: boolean;
}

export const Chat: React.FC<Props> = ({ drawer }) => {
  const messages = useRoomChatStore((state) => state.messages);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messages.length) return;

    viewport.current?.scrollTo({
      top: viewport.current!.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  return (
    <Box
      style={{
        border: "1px solid var(--color-primary)",
        height: drawer ? "100%" : "100%",
        flex: 0.6,
        padding: 7,
        minWidth: drawer ? undefined : 350,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <ScrollArea
        viewportRef={viewport}
        type="auto"
        scrollbarSize={6}
        h="100%"
        style={{
          width: "100%"
        }}
        styles={{
          viewport: {
            display: "flex",
            flexDirection: "column-reverse"
          }
        }}
      >
        {messages.map((message) => (
          <ChatMessageCard key={message._id} message={message} />
        ))}
      </ScrollArea>

      <ChatMessageInput />
    </Box>
  );
};
