import {
  Box,
  Center,
  Paper,
  TextInput,
  Checkbox,
  Button,
  Group,
  Divider
} from "@mantine/core";
import { Layout } from "../../components/Layout";
import { PageComponent } from "../../types";
import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { useMeStore } from "../../store/me";
import { useSocket } from "../../hooks/useSocket";
import { DefaultMicSelector } from "../audio/DefaultMicSelector";

export const MePage: PageComponent = () => {
  const { me, update } = useMeStore();
  const [name, setName] = useState(me.display_name);
  const [remember, setRemember] = useState(
    localStorage.getItem("remember me") === "true"
  );
  const [mounted, setMounted] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Layout title={`uhhhh | ${me.display_name ?? "user"}`}>
        <Box>
          <Center>
            <Paper
              padding={"xl"}
              shadow={"sm"}
              radius="md"
              style={{ width: 350 }}
            >
              <Group direction="column" grow spacing={10}>
                <Group direction="column" grow>
                  <TextInput
                    placeholder="display name"
                    label="display name"
                    required
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                  />
                  <Checkbox
                    label="remember me"
                    size="xs"
                    checked={remember}
                    onChange={(e) => setRemember(e.currentTarget.checked)}
                  />
                  <Button
                    onClick={() => {
                      if (!name.trim()) {
                        return toast.warn("where yo name at?");
                      }
                      if (name.trim().length < 3) {
                        return toast.warn(
                          "name should be at least 3 characters"
                        );
                      }

                      update(name, remember);
                      socket.emit("update display name", {
                        new_display_name: name
                      });
                      toast.success("saved");
                    }}
                  >
                    update
                  </Button>
                </Group>
                <Divider size="xs" color="indigo" />
                <DefaultMicSelector />
              </Group>
            </Paper>
          </Center>
        </Box>
      </Layout>
    </>
  );
};

MePage.authenticate = "yes";
