import { Box, Group, Text } from "@mantine/core";
import { format } from "date-fns";
import { useSettingsStore } from "../../../store/settings";
import { TextHyperlink } from "../../../components/text-hyperlink";
import type { ChatMessage } from "types";

interface Props {
  message: ChatMessage;
}

export const ChatMessageCard = ({ message }: Props) => {
  const timestamp = useSettingsStore((state) => state.message_timestamp);

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
        {timestamp && (
          <span style={{ fontSize: 14, color: "white" }}>
            {format(message.created_at, "HH:mm")}{" "}
          </span>
        )}
        <Text
          size="sm"
          style={{
            color: chatcolor(message.creator._id),
            display: "inline",
            fontSize: 14
          }}
        >
          {message.creator.display_name}
        </Text>
        <span style={{ color: "white", fontSize: 14 }}>: </span>
        <TextHyperlink c="white" style={{ display: "inline", fontSize: 14 }}>
          {message.content}
        </TextHyperlink>
      </Box>
    </Group>
  );
};

function chatcolor(str: string): string {
  let sum = 0;

  for (let x = 0; x < str.length; x++) sum += x * str.charCodeAt(x);

  return colors[sum % colors.length]!;
}

const colors = [
  "#FF4500",
  "#1E90FF",
  "#FFD700",
  "#32CD32",
  "#FF69B4",
  "#8A2BE2",
  "#00FF7F",
  "#DC143C",
  "#4682B4",
  "#9ACD32",
  "#FF7F50",
  "#008B8B",
  "#FFA500",
  "#9932CC",
  "#20B2AA",
  "#FF1493",
  "#00CED1",
  "#8B4513",
  "#5F9EA0",
  "#2E8B57",
  "#DAA520",
  "#4169E1",
  "#00FA9A",
  "#800080",
  "#FF6347"
];
