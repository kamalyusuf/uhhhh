import { Box, Stack } from "@mantine/core";
import { useRef, useEffect } from "react";
import { RoomChatInput } from "./RoomChatInput";
import { Virtuoso } from "react-virtuoso";
import { RoomChatMessageCard } from "./RoomChatMessageCard";
import { useRoomChatStore } from "../../../store/room-chat";
import { Message } from "../../../types";
import { useMeStore } from "../../../store/me";

const useForceScrollToBottom = (messages: Message[]) => {
  const { me } = useMeStore();
  const focus = useRef(false);
  const lastFocusedOwnMessage = useRef("");

  const check = () => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      if (
        lastMessage.creator._id === me._id &&
        lastFocusedOwnMessage.current !== lastMessage._id
      )
        return true;
    }

    return false;
  };

  useEffect(() => {
    if (messages.length && !focus.current) {
      focus.current = true;
      check();
    }
  }, [messages, messages.length]);

  return check;
};

export const RoomChat = () => {
  const virtuoso = useRef(null);
  const { messages } = useRoomChatStore();
  const force = useForceScrollToBottom(messages);

  return (
    <Box
      sx={(theme) => ({
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
        <Box>
          <Virtuoso
            ref={virtuoso}
            data={messages}
            alignToBottom
            className="virtuoso"
            initialTopMostItemIndex={
              messages.length > 0 ? messages.length - 1 : 0
            }
            overscan={0}
            itemContent={(index, item) => {
              console.log({ index, item });

              return <RoomChatMessageCard key={item._id} message={item} />;
            }}
            style={{
              height: "100%"
            }}
            followOutput={(bottom) => {
              if (force()) return "smooth";

              return bottom ? "smooth" : false;
            }}
          />
        </Box>
        <RoomChatInput />
      </Stack>
    </Box>
  );
};
