import { Alert, Text, MantineColor } from "@mantine/core";
import { AlertVariant } from "@mantine/core/lib/Alert/Alert";

export const ErrorAlert = ({
  title = "error",
  message,
  color = "red",
  variant = "outline"
}: {
  title?: string;
  message: string;
  color?: MantineColor;
  variant?: AlertVariant;
}) => {
  return (
    <>
      <Alert
        title={title}
        color={color}
        style={{
          marginTop: 30,
          width: 300,
          marginLeft: "auto",
          marginRight: "auto"
        }}
        variant={variant}
      >
        <Text color="dark" weight="bold" style={{ fontSize: 16 }}>
          {message}
        </Text>
      </Alert>
    </>
  );
};
