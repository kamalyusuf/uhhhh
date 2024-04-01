import { Center, Group, Paper, Text } from "@mantine/core";
import { c } from "../utils/constants";
import { Layout } from "./_layout";
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle
} from "@tabler/icons-react";
import { parseapierror } from "../utils/error";
import { AxiosError } from "axios";
import type { ApiError, EventError } from "types";
import { Container } from "./_container";
import { type CSSProperties } from "react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: AxiosError<ApiError> | string | EventError;
  wrap?: boolean;
  style?: CSSProperties;
}

const icons = {
  warning: IconAlertTriangle,
  success: IconCircleCheck,
  info: IconInfoCircle,
  error: IconAlertCircle
};

export const Alert = ({ type, message, wrap, style }: AlertProps) => {
  const color = c.colors[type];
  const Icon = icons[type];

  const component = (
    <Container my={wrap ? 20 : undefined} style={style}>
      <Center>
        <Paper
          shadow="md"
          p={20}
          radius="md"
          style={{
            backgroundColor: c.colors.shade,
            borderColor: c.colors.shade
          }}
        >
          <Group gap={20} align="center">
            <Icon size={28} strokeWidth={2} color={color} />

            {typeof message === "string" ? (
              <Text fw={500} size="lg" c={color}>
                {message}
              </Text>
            ) : (
              ("errors" in message
                ? message.errors.map((m) => m.message)
                : parseapierror(message).messages
              ).map((m) => (
                <Text fw={500} size="lg" c={color}>
                  {m}
                </Text>
              ))
            )}
          </Group>
        </Paper>
      </Center>
    </Container>
  );

  return wrap ? <Layout>{component}</Layout> : component;
};
