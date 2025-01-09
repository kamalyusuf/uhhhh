import { useState, useEffect, useRef } from "react";
import { Group, Loader, ActionIcon, Drawer, Badge } from "@mantine/core";
import { useHotkeys, useMounted } from "@mantine/hooks";
import type { Room } from "types";
import { useRoom } from "./use-room";
import { Layout } from "../../components/layout";
import { Container } from "../../components/container";
import { Chat } from "./chat/chat";
import { RoomPanel } from "./room-panel";
import type { PageComponent } from "../../types";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../socket/socket-provider";
import { RoomLogin } from "./room-login";
import { RoomError } from "./room-error";
import { useActiveSpeaker } from "../../hooks/use-active-speaker";
import { Alert } from "../../components/alert";
import { AbsoluteCenter } from "../../components/absolute-center";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { IconMessage } from "@tabler/icons-react";
import { useRoomChatDrawer } from "../../store/room-chat-drawer";
import { useSettingsStore } from "../../store/settings";

interface Props {
  room: Room;
}

export const RoomPage: PageComponent<Props> = ({ room }) => {
  useActiveSpeaker();
  const mounted = useMounted();
  const { join, leave, togglemute } = useRoom(room._id);
  const roomstate = useRoomStore((state) => state.state);
  const { state } = useSocket();
  const [ok, setok] = useState(false);
  const called = useRef(false);
  const { replace, asPath } = useRouter();
  const layout = useSettingsStore((state) => state.layout);
  const { opened, open, close, unread } = useRoomChatDrawer();

  const locked = room.status === "protected";

  useEffect(() => {
    if (
      ((locked && ok) || !locked) &&
      state === "connected" &&
      !called.current
    ) {
      called.current = true;

      join();
    }
  }, [state, ok, locked]);

  useEffect(() => {
    if (roomstate !== "closed") return;

    toast.error("audio connection lost");
    replace("/rooms");
  }, [roomstate, replace]);

  useEffect(() => {
    const listener = () => {
      window.history.pushState(null, "", asPath);
    };

    window.history.pushState(null, "", asPath);
    window.addEventListener("popstate", listener);

    return () => {
      window.removeEventListener("popstate", listener);
    };
  }, [asPath]);

  useHotkeys([["m", () => togglemute()]]);

  if (!mounted) return null;

  if (state === "connecting")
    return (
      <AbsoluteCenter>
        <Loader size="lg" />
      </AbsoluteCenter>
    );

  if (state !== "connected")
    return (
      <Alert
        type="error"
        message="connection failed. try refreshing the page"
        wrap
      />
    );

  if (locked && !ok) return <RoomLogin room={room} onok={setok} />;

  if (roomstate === "error") return <RoomError />;

  if (roomstate === "closed") return null;

  if (roomstate === "connected")
    return (
      <Layout title={room.name}>
        <Container style={{ width: "100%", height: "100%" }}>
          <Group style={{ height: "97%" }} align="start">
            <RoomPanel room={room} actions={{ leave, togglemute }} />
            {layout === "small" ? (
              <>
                <ActionIcon
                  variant="transparent"
                  onClick={open}
                  size={32}
                  style={{
                    position: "fixed",
                    bottom: 16,
                    right: 16
                  }}
                >
                  <IconMessage
                    stroke={1.5}
                    style={{
                      width: "100%",
                      height: "100%"
                    }}
                  />
                  {unread && (
                    <Badge
                      color="red"
                      size="xs"
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        borderRadius: "50%"
                      }}
                    >
                      !
                    </Badge>
                  )}
                </ActionIcon>

                <Drawer opened={opened} onClose={close} size="100%">
                  <Chat drawer />
                </Drawer>
              </>
            ) : (
              <Chat />
            )}
          </Group>
        </Container>
      </Layout>
    );

  return null;
};

RoomPage.authenticate = "yes";
