import { useState, useEffect, useRef } from "react";
import { Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { type Room, RoomStatus } from "types";
import { useRoom } from "./useRoom";
import { Layout } from "../../components/Layout";
import { Container } from "../../components/Container";
import { RoomChat } from "./chat/RoomChat";
import { RoomPanel } from "./RoomPanel";
import type { PageComponent } from "../../types";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../../hooks/use-socket";
import { RoomLogin } from "./RoomLogin";
import { RoomError } from "./RoomError";
import { useMounted } from "../../hooks/use-mounted";
import { useActiveSpeaker } from "../../hooks/use-active-speaker";
import { Alert } from "../../components/Alert";

interface Props {
  room: Room;
}

export const RoomPage: PageComponent = ({ room }: Props) => {
  useActiveSpeaker();
  const mounted = useMounted();
  const { join, leave, mute, unmute } = useRoom(room._id);
  const roomStore = useRoomStore();
  const { connected } = useSocket();
  const [ok, setOk] = useState(false);
  const matches = useMediaQuery("(max-width: 768px)");
  const [locked] = useState(room.status === RoomStatus.PROTECTED);
  const called = useRef(false);

  // const locked = room.status === RoomStatus.PROTECTED;

  useEffect(() => {
    if (((locked && ok) || !locked) && connected && !called.current) {
      called.current = true;

      join();
    }
  }, [connected, ok, locked]);

  if (!mounted) return null;

  if (!connected)
    return (
      <Alert
        type="error"
        message="websocket connection failed. try refreshing the page"
        wrap
      />
    );

  if (locked && !ok)
    return <RoomLogin room={room} onSuccess={(success) => setOk(success)} />;

  if (roomStore.state === "error") return <RoomError room={room} />;

  if (roomStore.state === "connected")
    return (
      <Layout title={`uhhhh | ${room.name}`}>
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
