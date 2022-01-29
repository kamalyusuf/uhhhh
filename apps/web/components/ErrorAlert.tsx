import { Alert, Text, AlertProps, MantineColor } from "@mantine/core";
import { AlertVariant } from "@mantine/core/lib/components/Alert/Alert";

export const ErrorAlert = ({
  title = "uh-oh! request failed",
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
        <Text color="white" style={{ fontSize: 16 }}>
          {message}
        </Text>
      </Alert>
    </>
  );
};
