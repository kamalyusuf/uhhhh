import { useState, useEffect, useCallback } from "react";
import { useMicStore } from "../../store/mic";
import { Stack, Text, Select, Button, Loader, Center } from "@mantine/core";
import { toast } from "react-toastify";

export const DefaultMicSelector = () => {
  const [mics, setmics] = useState<{ id: string; label: string }[]>([]);
  const [enumerating, setenumerating] = useState(true);
  const micid = useMicStore((state) => state.id);
  const setdefaultmic = useMicStore((state) => state.setdefaultmicid);

  const enumerate = useCallback(() => {
    setenumerating(true);

    navigator.mediaDevices
      .enumerateDevices()
      .then((info) => {
        const devices = info
          .filter((device) => device.kind === "audioinput" && device.deviceId)
          .map((device) => ({ id: device.deviceId, label: device.label }));

        setmics(devices);
      })
      .catch((e) => {
        const error = e as Error;

        toast.error(error.message);
      })
      .finally(() => setenumerating(false));
  }, []);

  useEffect(() => {
    enumerate();
  }, []);

  return (
    <>
      <Stack gap={15}>
        {enumerating ? (
          <Center>
            <Loader size="sm" />
          </Center>
        ) : (
          <>
            <Stack>
              {mics.length === 0 ? (
                <Text c="red" size="sm" style={{ fontStyle: "italic" }}>
                  no microphone(s) detected
                </Text>
              ) : (
                <Select
                  label={
                    <Text c="dark" style={{ fontSize: 16 }}>
                      default microphone
                    </Text>
                  }
                  placeholder="select"
                  size="xs"
                  data={[
                    ...mics.map((mic) => ({
                      value: mic.id,
                      label: mic.label
                    })),
                    { value: "-", label: "-" }
                  ]}
                  value={micid}
                  onChange={(value) => {
                    if (!value) return;

                    setdefaultmic(value);

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
