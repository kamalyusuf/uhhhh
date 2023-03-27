import { Center, Group, Paper, Text } from "@mantine/core";
import { c } from "../utils/constants";
import { Layout } from "./layout";
import {
  IconAlertTriangle,
  IconAlertCircle,
  type Icon,
  IconCircleCheck,
  IconInfoCircle
} from "@tabler/icons-react";
import { parseapierror } from "../utils/error";
import { AxiosError } from "axios";
import type { ApiError, EventError } from "types";
import { Container } from "./container";
import { type CSSProperties } from "react";

interface Props {
  type: "success" | "error" | "warning" | "info";
  message: AxiosError<ApiError> | string | EventError | Error;
  wrap?: boolean;
  style?: CSSProperties;
}

const icons: Record<Props["type"], Icon> = {
  warning: IconAlertTriangle,
  success: IconCircleCheck,
  info: IconInfoCircle,
  error: IconAlertCircle
};

export const Alert = ({ type, message, wrap, style }: Props) => {
  const color = c.colors[type];
  const Icon = icons[type];

  const component = (
    <Container my={wrap ? 20 : undefined} style={style}>
      <Center>
        <Paper
          shadow="md"
          p={20}
          radius="md"
          sx={{
            backgroundColor: c.colors.shade,
            borderColor: c.colors.shade
          }}
        >
          <Group spacing={20} align="center">
            <Icon size={28} strokeWidth={2} color={color} />
            <Text weight={500} size="lg" style={{ color }}>
              {msg(message)}
            </Text>
          </Group>
        </Paper>
      </Center>
    </Container>
  );

  return wrap ? <Layout>{component}</Layout> : component;
};

function msg(message: Props["message"]) {
  if (typeof message === "string") return message;

  if (message instanceof AxiosError) return parseapierror(message).messages[0];

  if ("errors" in message) return message.errors[0].message;

  return message.message;
}
