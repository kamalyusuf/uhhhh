import { useState, useEffect, useRef } from "react";
import { Group, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { type Room, RoomStatus } from "types";
import { useRoom } from "./use-room";
import { Layout } from "../../components/layout";
import { Container } from "../../components/container";
import { RoomChat } from "./chat/room-chat";
import { RoomPanel } from "./room-panel";
import type { PageComponent } from "../../types";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../../hooks/use-socket";
import { RoomLogin } from "./room-login";
import { RoomError } from "./room-error";
import { useMounted } from "../../hooks/use-mounted";
import { useActiveSpeaker } from "../../hooks/use-active-speaker";
import { Alert } from "../../components/alert";
import { AbsoluteCenter } from "../../components/absolute-center";

interface Props {
  room: Room;
}

export const RoomPage: PageComponent<Props> = ({ room }) => {
  useActiveSpeaker();
  const mounted = useMounted();
  const { join, leave, mute, unmute } = useRoom(room._id);
  const roomstore = useRoomStore();
  const { state } = useSocket();
  const [ok, setok] = useState(false);
  const matches = useMediaQuery("(max-width: 768px)");
  const called = useRef(false);

  const locked = room.status === RoomStatus.PROTECTED;

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
        message="websocket connection failed. try refreshing the page"
        wrap
      />
    );

  if (locked && !ok)
    return <RoomLogin room={room} onsuccess={(success) => setok(success)} />;

  if (roomstore.state === "error") return <RoomError />;

  if (roomstore.state === "connected")
    return (
      <Layout title={room.name}>
        <Container style={{ width: "100%", height: "100%" }}>
          <Group style={{ height: "97%" }} align="start">
            <RoomPanel room={room} actions={{ leave, mute, unmute }} />
            {!matches && <RoomChat />}
          </Group>
        </Container>
      </Layout>
    );

  return null;
};

RoomPage.authenticate = "yes";