import { useState, useEffect } from "react";
import { useMicStore } from "../../store/mic";
import { Stack, Text, Select, Button, Loader, Center } from "@mantine/core";
import { toast } from "react-toastify";

export const DefaultMicSelector = () => {
  const [options, setoptions] = useState<{ id: string; label: string }[]>([]);
  const micstore = useMicStore();
  const [enumerating, setenumerating] = useState(true);

  const enumerate = () => {
    setenumerating(true);

    navigator.mediaDevices
      .enumerateDevices()
      .then((info) => {
        const devices = info
          .filter((device) => device.kind === "audioinput" && device.deviceId)
          .map((device) => ({ id: device.deviceId, label: device.label }));

        setoptions(devices);
      })
      .catch((e) => {
        const error = e as Error;
        console.log(error);

        toast.error(error.message);
      })
      .finally(() => setenumerating(false));
  };

  useEffect(() => {
    enumerate();
  }, []);

  return (
    <>
      <Stack spacing={15}>
        {enumerating ? (
          <Center>
            <Loader size="sm" />
          </Center>
        ) : (
          <>
            <Stack>
              {options.length === 0 ? (
                <Text color="red" size="sm" style={{ fontStyle: "italic" }}>
                  no microphone(s) detected
                </Text>
              ) : (
                <Select
                  label={
                    <Text color="dark" style={{ fontSize: 16 }}>
                      default microphone
                    </Text>
                  }
                  placeholder="select"
                  size="xs"
                  data={[
                    ...options.map((options) => ({
                      value: options.id,
                      label: options.label
                    })),
                    { value: "-", label: "-" }
                  ]}
                  value={micstore.id}
                  onChange={(value) => {
                    if (!value) return;

                    micstore.setdefaultmicid(value);

                    toast.success("saved");
                  }}
                />
              )}
            </Stack>
            <Button color="dark" onClick={enumerate}>
              refresh
            </Button>
          </>
        )}
      </Stack>
    </>
  );
};
