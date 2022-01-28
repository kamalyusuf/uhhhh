import { TextInput, ActionIcon } from "@mantine/core";
import { AiOutlineSend } from "react-icons/ai";
import { useRoomChatStore } from "../../../store/room-chat";
import { useState, useCallback, useEffect } from "react";
import { c } from "../../../lib/constants";

export const RoomChatInput = () => {
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);
  const { _add } = useRoomChatStore();

  useEffect(() => {
    setCount(text.length);
  }, [text]);

  const send = useCallback(() => {
    if (!text.trim()) return;
    _add(text);
    setText("");
  }, [text]);

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
        value={text}
        onChange={(e) =>
          setText(e.currentTarget.value.slice(0, c.chat.text_limit))
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
