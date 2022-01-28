import { Group, Box } from "@mantine/core";
import React, { useRef } from "react";
import { RoomChatInput } from "./RoomChatInput";
import { Virtuoso } from "react-virtuoso";
import { RoomChatMessageCard } from "./RoomChatMessageCard";
import { useRoomChatStore } from "../../../store/room-chat";

export const RoomChat = () => {
  const virtuoso = useRef(null);
  const { messages } = useRoomChatStore();

  return (
    <Box
      sx={(theme) => ({
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: theme.colors.indigo[6],
        height: "100%",
        flex: 0.6,
        padding: 7
      })}
    >
      <Group
        direction="column"
        grow
        style={{ height: "100%", justifyContent: "space-between" }}
      >
        <Box>
          <Virtuoso
            ref={virtuoso}
            data={messages}
            alignToBottom
            className={"virtuoso"}
            totalCount={messages.length}
            initialTopMostItemIndex={
              messages.length > 0 ? messages.length - 1 : 0
            }
            overscan={0}
            itemContent={(index, item) => (
              <RoomChatMessageCard key={item._id} message={item} />
            )}
            style={{
              height: "100%"
            }}
            followOutput={(bottom) => {
              return bottom ? "smooth" : false;
            }}
          />
        </Box>
        <RoomChatInput />
      </Group>
    </Box>
  );
};
