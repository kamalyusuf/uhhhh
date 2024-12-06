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
import { toast } from "react-toastify";
import { useState } from "react";
import { REMEMBER_ME_KEY, useUserStore } from "../../store/user";
import { useSocket } from "../socket/socket-provider";
import { DefaultMicSelector } from "../audio/default-mic-selector";
import { useSettingsStore } from "../../store/settings";
import { request } from "../../utils/request";
import { useShallow } from "../../hooks/use-shallow";
import type { PageComponent } from "../../types";

export const SettingsPage: PageComponent = () => {
  const { update, user } = useUserStore(
    useShallow((state) => ({
      user: state.user!,
      update: state.update
    }))
  );
  const [name, setname] = useState(user.display_name);
  const { socket } = useSocket();
  const { autojoin, notifyonjoin, setsettings, timestamp } = useSettingsStore(
    useShallow((state) => ({
      autojoin: state.auto_join_room,
      notifyonjoin: state.notify_on_join,
      timestamp: state.message_timestamp,
      setsettings: state.set
    }))
  );
  const [remember, setremember] = useState(
    localStorage.getItem(REMEMBER_ME_KEY) === "true"
  );

  const onsubmit = async () => {
    if (!socket) return toast.error("web server is down");

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
                  onSubmit={(event) => {
                    event.preventDefault();

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
                      onChange={(event) =>
                        setremember(event.currentTarget.checked)
                      }
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

                <Switch
                  label="notify when someone joins the room"
                  checked={notifyonjoin}
                  onChange={(event) =>
                    setsettings({ notify_on_join: event.currentTarget.checked })
                  }
                />

                <Switch
                  label="message timestamp"
                  checked={timestamp}
                  onChange={(event) =>
                    setsettings({
                      message_timestamp: event.currentTarget.checked
                    })
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
