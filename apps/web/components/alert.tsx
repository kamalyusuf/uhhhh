import { Center, Group, Paper, Stack, Text } from "@mantine/core";
import { c } from "../utils/constants";
import { Layout } from "./layout";
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle
} from "@tabler/icons-react";
import { parseapierror } from "../utils/error";
import { AxiosError } from "axios";
import type { ApiError, EventError } from "types";
import { Container } from "./container";
import { type CSSProperties } from "react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: AxiosError<ApiError> | string | string[] | EventError;
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

            {Array.isArray(message) ? (
              <Stack gap={5}>
                {message.map((m) => (
                  <Text key={m} fw={500} size="lg" c={color}>
                    {m}
                  </Text>
                ))}
              </Stack>
            ) : typeof message === "string" ? (
              <Text fw={500} size="lg" c={color}>
                {message}
              </Text>
            ) : (
              <Stack gap={5}>
                {("errors" in message
                  ? message.errors.map((m) => m.message)
                  : parseapierror(message).messages
                ).map((m) => (
                  <Text key={m} fw={500} size="lg" c={color}>
                    {m}
                  </Text>
                ))}
              </Stack>
            )}
          </Group>
        </Paper>
      </Center>
    </Container>
  );

  return wrap ? <Layout>{component}</Layout> : component;
};
