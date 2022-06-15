import { TextInput, ActionIcon } from "@mantine/core";
import { AiOutlineSend } from "react-icons/ai";
import { useState, useCallback, useEffect } from "react";
import { c } from "../../../lib/constants";
import { useSocket } from "../../../hooks/useSocket";

export const RoomChatInput = () => {
  const [content, setContent] = useState("");
  const [count, setCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    setCount(content.length);
  }, [content]);

  const send = useCallback(() => {
    if (!content.trim()) return;

    socket.emit("chat message", { content });
    setContent("");
  }, [content, socket]);

  return (
    <>
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
        onChange={(e) =>
          setContent(e.currentTarget.value.slice(0, c.chat.text_limit))
        }
        onKeyDown={(e) => {
          switch (e.key) {
            case "Enter":
              e.preventDefault();
              send();
              break;
          }
        }}
      />
      <span
        style={{
          color: count >= c.chat.text_limit ? c.colors.red : c.colors.indigo,
          fontSize: 12
        }}
      >
        character count: {count} (max {c.chat.text_limit})
      </span>
    </>
  );
};
