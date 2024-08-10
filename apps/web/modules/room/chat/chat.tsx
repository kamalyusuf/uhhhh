import { Box, ScrollArea, Stack } from "@mantine/core";
import { useRef, useEffect } from "react";
import { ChatMessageInput } from "./chat-message-input";
import { ChatMessageCard } from "./chat-message-card";
import { useRoomChatStore } from "../../../store/room-chat";

export const Chat = () => {
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
        minWidth: 350
      }}
    >
      <Stack gap={0} justify="space-between" style={{ height: "100%" }}>
        <ScrollArea
          viewportRef={viewport}
          type="auto"
          scrollbarSize={6}
          style={{
            height: 500,
            width: "100%"
          }}
          styles={{
            viewport: {
              flexDirection: "column-reverse",
              display: "flex"
            }
          }}
        >
          {messages.map((message) => (
            <ChatMessageCard key={message._id} message={message} />
          ))}
        </ScrollArea>

        <ChatMessageInput />
      </Stack>
    </Box>
  );
};
