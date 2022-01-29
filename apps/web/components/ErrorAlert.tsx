import { Alert, Text } from "@mantine/core";

export const ErrorAlert = ({
  title = "oops! something went wrong",
  message
}: {
  title?: string;
  message: string;
}) => {
  return (
    <>
      <Alert
        title={title}
        color="red"
        style={{
          marginTop: 30,
          width: 300,
          marginLeft: "auto",
          marginRight: "auto"
        }}
        variant="filled"
      >
        <Text color="white" style={{ fontSize: 16 }}>
          {message}
        </Text>
      </Alert>
    </>
  );
};
