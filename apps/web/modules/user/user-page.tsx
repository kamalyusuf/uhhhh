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
import { Layout } from "../../components/_layout";
import { PageComponent } from "../../types";
import { toast } from "react-toastify";
import { useState } from "react";
import { useUserStore } from "../../store/user";
import { useSocket } from "../../hooks/use-socket";
import { DefaultMicSelector } from "../audio/default-mic-selector";
import { useMounted } from "../../hooks/use-mounted";

export const UserPage: PageComponent = () => {
  const { user, update } = useUserStore((state) => ({
    user: state.user,
    update: state.update
  }));
  const [name, setname] = useState<string>(user?.display_name ?? "");
  const mounted = useMounted();
  const { socket } = useSocket();
  const [remember, setremember] = useState(
    localStorage.getItem("remember me") === "true"
  );

  if (!mounted) return null;

  const onsubmit = () => {
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
      <Layout title={user?.display_name ?? "uhhhh"}>
        <Box>
          <Center>
            <Paper p={"xl"} shadow={"sm"} radius="md" style={{ width: 350 }}>
              <Stack spacing={10}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    onsubmit();
                  }}
                >
                  <Stack>
                    <TextInput
                      placeholder="display name"
                      label="display name"
                      required
                      value={name}
                      onChange={(event) => setname(event.currentTarget.value)}
                    />
                    <Checkbox
                      label="remember me"
                      size="xs"
                      checked={remember}
                      onChange={(e) => setremember(e.currentTarget.checked)}
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

UserPage.authenticate = "yes";
