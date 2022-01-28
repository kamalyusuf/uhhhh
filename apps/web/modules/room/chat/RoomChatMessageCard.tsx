import { Box, Group, Text } from "@mantine/core";
import { Message } from "../../../types";

interface Props {
  message: Message;
}

export const RoomChatMessageCard = ({ message }: Props) => {
  return (
    <Group
      align="center"
      position="center"
      style={{ paddingLeft: 7, paddingRight: 7 }}
    >
      <Box
        sx={{
          wordBreak: "break-all",
          display: "block",
          overflow: "hidden",
          width: "100%"
        }}
      >
        <Text
          size="sm"
          sx={{ color: `${message.color}`, display: "inline", fontSize: 14 }}
        >
          {message.creator.display_name}
        </Text>
        <span style={{ color: "white", fontSize: 14 }}>: </span>
        <Text color="white" sx={{ display: "inline", fontSize: 14 }}>
          {message.text}
        </Text>
      </Box>
    </Group>
  );
};
