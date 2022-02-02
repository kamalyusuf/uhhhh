import React, { useState, useEffect } from "react";
import { useMicStore } from "../../store/mic";
import { Group, Text, Select, Button } from "@mantine/core";
import { toast } from "react-toastify";

export const DefaultMicSelector = () => {
  const [options, setOptions] = useState<{ id: string; label: string }[]>([]);
  const micStore = useMicStore();

  const _fetch = () => {
    navigator.mediaDevices.enumerateDevices().then((info) => {
      const devices = info
        .filter((device) => device.kind === "audioinput" && device.deviceId)
        .map((device) => ({ id: device.deviceId, label: device.label }));
      setOptions(devices);
    });
  };

  useEffect(() => {
    _fetch();
  }, []);

  return (
    <>
      <Group direction="column" grow spacing={15}>
        <Group grow>
          {options.length === 0 ? (
            <Text color="indigo" size="sm" style={{ fontStyle: "italic" }}>
              no microphone(s) detected
            </Text>
          ) : (
            <Select
              label={<Text style={{ fontSize: 16 }}>default microphone</Text>}
              placeholder="select"
              size="xs"
              data={[
                ...options.map((options) => ({
                  value: options.id,
                  label: options.label
                })),
                { value: "-", label: "-" }
              ]}
              value={micStore.id}
              onChange={(value) => {
                micStore.setDefaultMicId(value);
                toast.success("saved");
              }}
            />
          )}
        </Group>
        <Button color="dark" onClick={_fetch}>
          refresh
        </Button>
      </Group>
    </>
  );
};
