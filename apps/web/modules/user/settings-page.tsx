import {
  Box,
  Center,
  Paper,
  TextInput,
  Checkbox,
  Button,
  Divider,
  Stack,
  Switch
} from "@mantine/core";
import { Layout } from "../../components/layout";
import { PageComponent } from "../../types";
import { toast } from "react-toastify";
import { useState } from "react";
import { useUserStore } from "../../store/user";
import { useSocket } from "../socket/socket-provider";
import { DefaultMicSelector } from "../audio/default-mic-selector";
import { useSettingsStore } from "../../store/settings";
import { request } from "../../utils/request";

export const SettingsPage: PageComponent = () => {
  const user = useUserStore((state) => state.user)!;
  const update = useUserStore((state) => state.update);
  const [name, setname] = useState(user?.display_name ?? "");
  const { socket } = useSocket();
  const autojoin = useSettingsStore((state) => state.auto_join_room);
  const setsettings = useSettingsStore((state) => state.set);
  const [remember, setremember] = useState(
    localStorage.getItem("remember me") === "true"
  );

  const onsubmit = async () => {
    if (!socket) return toast.error("webserver is down");

    const res = await request({
      socket,
      event: "update display name",
      payload: {
        new_display_name: name
      }
    });

    if (!res.ok) return;

    update(res.peer.display_name, remember);
    toast.success("saved");
  };

  return (
    <>
      <Layout title={`${user.display_name} settings`}>
        <Box>
          <Center>
            <Paper p="xl" shadow="sm" radius="md" style={{ width: 350 }}>
              <Stack gap={10}>
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

                <Switch
                  label="automatically join created room"
                  checked={autojoin}
                  onChange={(event) =>
                    setsettings({ auto_join_room: event.currentTarget.checked })
                  }
                />

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

SettingsPage.authenticate = "yes";
