import { TextInput, ActionIcon, Stack } from "@mantine/core";
import { AiOutlineSend } from "react-icons/ai";
import { useState, useRef } from "react";
import { CHAT_TEXT_LIMIT } from "../../../utils/constants";
import { useSocket } from "../../socket/socket-provider";
import { toast } from "react-toastify";
import { useHotkeys } from "@mantine/hooks";

export const ChatMessageInput = () => {
  const [content, setcontent] = useState("");
  const { socket } = useSocket();
  const ref = useRef<HTMLInputElement>(null);

  useHotkeys([["c", () => ref.current?.focus()]]);

  const send = () => {
    if (!socket) return toast.error("web server is down");

    if (!content.trim()) return;

    socket.emit("chat message", { content });
    setcontent("");
  };

  return (
    <Stack gap={5}>
      <TextInput
        ref={ref}
        placeholder="chat..."
        variant="filled"
        rightSection={
          <ActionIcon variant="filled" color="indigo" onClick={send}>
            <AiOutlineSend />
          </ActionIcon>
        }
        styles={{
          root: {
            width: "100%"
          }
        }}
        value={content}
        onChange={(e) =>
          setcontent(e.currentTarget.value.slice(0, CHAT_TEXT_LIMIT))
        }
        onKeyDown={(event) => {
          switch (event.key) {
            case "Enter":
              event.preventDefault();
              send();
              break;
          }
        }}
        autoComplete="off"
      />
      <span
        style={{
          fontSize: 12,
          color:
            content.length >= CHAT_TEXT_LIMIT
              ? "var(--color-danger)"
              : "var(--color-primary)"
        }}
      >
        character count: {content.length} (max {CHAT_TEXT_LIMIT})
      </span>
    </Stack>
  );
};
