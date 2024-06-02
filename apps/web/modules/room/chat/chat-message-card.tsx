import { Box, Group, Text } from "@mantine/core";
import type { Message } from "../../../types";

interface Props {
  message: Message;
}

export const ChatMessageCard = ({ message }: Props) => {
  return (
    <Group
      align="center"
      justify="center"
      style={{ paddingLeft: 7, paddingRight: 7 }}
    >
      <Box
        style={{
          wordBreak: "break-all",
          display: "block",
          overflow: "hidden",
          width: "100%"
        }}
      >
        <Text
          size="sm"
          style={{ color: `${message.color}`, display: "inline", fontSize: 14 }}
        >
          {message.creator.display_name}
        </Text>
        <span style={{ color: "white", fontSize: 14 }}>: </span>
        <Text c="white" style={{ display: "inline", fontSize: 14 }}>
          {message.content}
        </Text>
      </Box>
    </Group>
  );
};
