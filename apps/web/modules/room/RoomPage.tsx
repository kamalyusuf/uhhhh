import { useState, useEffect, useMemo } from "react";
import { Group, Center, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { type Room, type ApiError, RoomStatus } from "types";
import { AxiosError } from "axios";
import hark from "hark";
import { useRoom } from "./useRoom";
import { Layout } from "../../components/Layout";
import { Container } from "../../components/Container";
import { RoomChat } from "./chat/RoomChat";
import { RoomPanel } from "./RoomPanel";
import type { PageComponent } from "../../types";
import { api } from "../../lib/api";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../../hooks/use-socket";
import { useMicStore } from "../../store/mic";
import { useMeStore } from "../../store/me";
import { usePeerStore } from "../../store/peer";
import { analytics } from "../../lib/analytics";
import { RoomLogin } from "./RoomLogin";
import { RoomFetchError } from "./RoomFetchError";
import { RoomJoinError } from "./RoomJoinError";
import { RoomError } from "./RoomError";

// todo: revamp because too messy

export const RoomPage: PageComponent = () => {
  const router = useRouter();
  const _id = router.query.id as string | undefined;
  const [mounted, setMounted] = useState(false);
  const {
    data: room,
    isLoading,
    error
  } = useQuery<Room, AxiosError<ApiError>>(
    ["room", _id],
    async () => (await api.get<Room>(`/rooms/${_id}`)).data,
    {
      enabled: typeof window !== "undefined" && mounted && !!_id,
      refetchOnMount: "always"
    }
  );
  const { join, leave, mute, unmute } = useRoom(room?._id);
  const roomStore = useRoomStore();
  const { state: socketState, socket } = useSocket();
  const { stream } = useMicStore();
  const matches = useMediaQuery("(max-width: 768px)");
  const locked = useMemo(
    () => room?.status === RoomStatus.PROTECTED,
    [room?.status]
  );
  const [ok, setOk] = useState(false);
  const me = useMeStore((state) => state.me);
  const peers = usePeerStore((state) => state.peers);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      mounted &&
      ((locked && ok) || !locked) &&
      socketState === "connected" &&
      room?._id
    )
      join();
  }, [mounted, socketState, ok, locked, room?._id]);

  useEffect(() => {
    if (!stream) return;

    const harker = hark(stream, { threshold: -65, interval: 75 });

    harker.on("speaking", () => {
      socket.emit("active speaker", { speaking: true });
    });

    harker.on("stopped_speaking", () => {
      socket.emit("active speaker", { speaking: false });
    });

    return () => {
      harker.stop();
    };
  }, [stream]);

  useEffect(() => {
    if (roomStore.state === "connected")
      analytics.track("join room", {
        ...room,
        creator: undefined,
        user_display_name: me.display_name,
        room_participants: Object.values(peers)
          .map((peer) => peer.display_name)
          .join(", ")
      });
  }, [roomStore.state]);

  if (!mounted) return null;

  if (mounted && locked && !ok)
    return <RoomLogin room={room} onSuccess={(success) => setOk(success)} />;

  if (isLoading || roomStore.state === "connecting")
    return <Loading room={room} />;

  if (error) return <RoomFetchError room={room} error={error} />;

  if (!room) return <NoRoom />;

  if (socketState === "error") return <RoomJoinError />;

  if (roomStore.state === "error") return <RoomError />;

  if (roomStore.state === "connected")
    return (
      <Layout title={`uhhhh | ${room?.name ?? "room"}`}>
        <Container style={{ width: "100%" }}>
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

function Loading({ room }: { room?: Room }) {
  return (
    <Layout title={`uhhhh | ${room?.name}`}>
      <Container>
        <Group style={{ height: "97%" }} align="start">
          <Center>
            <Loader size="lg" />
          </Center>
        </Group>
      </Container>
    </Layout>
  );
}

function NoRoom({ room }: { room?: Room }) {
  return (
    <Layout title={`uhhhh | ${room?.name ?? "room"}`}>
      <></>
    </Layout>
  );
}
