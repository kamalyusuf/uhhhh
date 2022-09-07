import {
  Box,
  Center,
  Paper,
  TextInput,
  Checkbox,
  Button,
  Divider,
  Stack
} from "@mantine/core";
import { Layout } from "../../components/Layout";
import { PageComponent } from "../../types";
import { toast } from "react-toastify";
import { useState } from "react";
import { useMeStore } from "../../store/me";
import { useSocket } from "../../hooks/use-socket";
import { DefaultMicSelector } from "../audio/DefaultMicSelector";
import { useMounted } from "../../hooks/use-mounted";

export const MePage: PageComponent = () => {
  const { me, update } = useMeStore();
  const [name, setName] = useState(me.display_name);
  const [remember, setRemember] = useState(
    localStorage.getItem("remember me") === "true"
  );
  const mounted = useMounted();
  const { socket } = useSocket();

  if (!mounted) return null;

  const onSubmit = () => {
    if (!socket) return toast.error("webserver is down");

    if (!name.trim()) return toast.warn("where yo name at?");

    if (name.trim().length < 3)
      return toast.warn("name should be at least 3 characters");

    update(name, remember);

    socket.emit("update display name", {
      new_display_name: name
    });

    toast.success("saved");
  };

  return (
    <>
      <Layout title={me.display_name ?? "uhhhh"}>
        <Box>
          <Center>
            <Paper p={"xl"} shadow={"sm"} radius="md" style={{ width: 350 }}>
              <Stack spacing={10}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    onSubmit();
                  }}
                >
                  <Stack>
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
                    <Button type="submit">update</Button>
                  </Stack>
                </form>
                <Divider size="xs" color="indigo" />
                <DefaultMicSelector />
              </Stack>
            </Paper>
          </Center>
        </Box>
      </Layout>
    </>
  );
};

MePage.authenticate = "yes";
