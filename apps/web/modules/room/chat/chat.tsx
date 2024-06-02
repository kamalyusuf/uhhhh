import { Box, Stack } from "@mantine/core";
import { useRef, useEffect } from "react";
import { ChatMessageInput } from "./chat-message-input";
import { Virtuoso } from "react-virtuoso";
import { ChatMessageCard } from "./chat-message-card";
import { useRoomChatStore } from "../../../store/room-chat";
import { Message } from "../../../types";
import { useUserStore } from "../../../store/user";

const useForceScrollToBottom = (messages: Message[]) => {
  const user = useUserStore((state) => state.user);
  const focus = useRef(false);
  const lastfocused = useRef("");

  const check = () => {
    if (messages.length > 0) {
      const lastmessage = messages[messages.length - 1];

      if (
        lastmessage.creator._id === user?._id &&
        lastfocused.current !== lastmessage._id
      ) {
        lastfocused.current = lastmessage._id;

        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    if (messages.length && !focus.current) {
      focus.current = true;

      check();
    }
  }, [messages.length]);

  return check;
};

export const Chat = () => {
  const virtuoso = useRef(null);
  const messages = useRoomChatStore((state) => state.messages);
  const force = useForceScrollToBottom(messages);

  return (
    <Box
      style={(theme) => ({
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: theme.colors.indigo[6],
        height: "100%",
        flex: 0.6,
        padding: 7,
        minWidth: 350
      })}
    >
      <Stack justify="space-between" style={{ height: "100%" }}>
        <Virtuoso
          ref={virtuoso}
          alignToBottom
          style={{ height: "100%" }}
          data={messages}
          initialTopMostItemIndex={
            messages.length > 0 ? messages.length - 1 : 0
          }
          overscan={0}
          itemContent={(_, item) => (
            <ChatMessageCard key={item._id} message={item} />
          )}
          followOutput={(bottom) => {
            if (force()) return "smooth";

            return bottom ? "smooth" : false;
          }}
        />
        <ChatMessageInput />
      </Stack>
    </Box>
  );
};
