import { TextInput, ActionIcon, Stack } from "@mantine/core";
import { AiOutlineSend } from "react-icons/ai";
import { useState, useCallback } from "react";
import { c } from "../../../utils/constants";
import { useSocket } from "../../../hooks/use-socket";
import { toast } from "react-toastify";

export const RoomChatInput = () => {
  const [content, setcontent] = useState("");
  const { socket } = useSocket();

  const send = useCallback(() => {
    if (!socket) return toast.error("webserver is down");

    if (!content.trim()) return;

    socket.emit("chat message", { content });
    setcontent("");
  }, [content, socket]);

  return (
    <Stack spacing={5}>
      <TextInput
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
        onChange={(e) => {
          const value = e.currentTarget.value;

          if (!value.trim()) return;

          setcontent(e.currentTarget.value.slice(0, c.chat.text_limit));
        }}
        onKeyDown={(e) => {
          switch (e.key) {
            case "Enter":
              e.preventDefault();
              send();
              break;
          }
        }}
        autoComplete="off"
      />
      <span
        style={{
          color:
            content.length >= c.chat.text_limit
              ? c.colors.red
              : c.colors.indigo,
          fontSize: 12
        }}
      >
        character count: {content.length} (max {c.chat.text_limit})
      </span>
    </Stack>
  );
};
