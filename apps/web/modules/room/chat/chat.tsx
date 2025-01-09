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
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--color-primary)",
        height: "100%",
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
        style={{
          height: drawer ? 500 : 520,
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
