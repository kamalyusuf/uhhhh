import { Center, Group, Paper, Text } from "@mantine/core";
import { c } from "../utils/constants";
import { Layout } from "./Layout";
import { IconAlertTriangle, IconAlertCircle } from "@tabler/icons";
import { InfoCircle, CircleCheck } from "tabler-icons-react";
import { parse } from "../utils/error";
import { AxiosError } from "axios";
import type { ApiError } from "types";
import { Container } from "./Container";
import { CSSProperties } from "react";

interface Props {
  type: "success" | "error" | "warning" | "info";
  message: AxiosError<ApiError> | string;
  wrap?: boolean;
  style?: CSSProperties;
}

const icons: Record<Props["type"], any> = {
  warning: IconAlertTriangle,
  success: CircleCheck,
  info: InfoCircle,
  error: IconAlertCircle
};

export const Alert = ({ type, message, wrap, style }: Props) => {
  const color = c.colors[type];
  const Icon = icons[type];
  const m = typeof message === "string" ? message : parse(message).messages[0];

  const component = (
    <Container my={wrap ? 20 : undefined} style={style}>
      <Center>
        <Paper
          withBorder
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
              {m}
            </Text>
          </Group>
        </Paper>
      </Center>
    </Container>
  );

  return wrap ? <Layout>{component}</Layout> : component;
};
