import { useState, useEffect, useMemo } from "react";
import {
  Group,
  Center,
  Loader,
  Button,
  Paper,
  PasswordInput
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { Room, ApiError, RoomStatus } from "types";
import { AxiosError } from "axios";
import hark from "hark";
import { useRoom } from "./useRoom";
import { Layout } from "../../components/Layout";
import { Container } from "../../components/Container";
import { RoomChat } from "./chat/RoomChat";
import { RoomPanel } from "./RoomPanel";
import { PageComponent } from "../../types";
import { api } from "../../lib/api";
import { ErrorAlert } from "../../components/ErrorAlert";
import { parseApiError } from "../../utils/error";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../../hooks/useSocket";
import { useMicStore } from "../../store/mic";
import { request } from "../../utils/request";
import { useMeStore } from "../../store/me";
import { usePeerStore } from "../../store/peer";
import { analytics } from "../../lib/analytics";

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
  const [password, setPassword] = useState("");
  const me = useMeStore((state) => state.me);
  const peers = usePeerStore((state) => state.peers);
  const [oking, setOking] = useState(false);

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

  if (mounted && locked && !ok) {
    return (
      <Layout title={`uhhhh | ${room?.name}`}>
        <Container>
          <Paper p={"xl"} shadow={"sm"} radius="md" style={{ width: 350 }}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                setOking(true);

                try {
                  const { ok: success } = await request({
                    socket,
                    event: "room login",
                    payload: {
                      room_id: room._id,
                      password
                    }
                  });

                  setOk(success);
                } catch (e) {
                } finally {
                  setOking(false);
                }
              }}
            >
              <Group direction="column" grow>
                <PasswordInput
                  label="password"
                  placeholder="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />

                <Button type="submit" disabled={oking} loading={oking}>
                  join
                </Button>
              </Group>
            </form>
          </Paper>
        </Container>
      </Layout>
    );
  }

  if (isLoading || roomStore.state === "connecting")
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

  if (error)
    return (
      <Layout title={`uhhhh | ${room?.name ?? "room"}`}>
        <ErrorAlert
          title="uh-oh! failed to fetch room"
          message={parseApiError(error)[0]}
        />
      </Layout>
    );

  if (!room)
    return (
      <Layout title={`uhhhh | ${room?.name ?? "room"}`}>
        <></>
      </Layout>
    );

  if (socketState === "error")
    return (
      <Layout title={`uhhhh | ${room?.name ?? "room"}`}>
        <ErrorAlert
          title="uh-oh! failed to establish websocket connection"
          message="could not join room"
        />
      </Layout>
    );

  if (roomStore.state === "error") {
    const isDeviceError = roomStore.error_message === "already loaded";
    const isMicError = roomStore.error_message === "Permission denied";

    return (
      <Layout title={`uhhhh | ${room?.name ?? "room"}`}>
        <ErrorAlert
          title="uh-oh"
          message={
            isDeviceError
              ? "please refresh the page"
              : isMicError
              ? "microphone access is denied"
              : "could not join room"
          }
        />
      </Layout>
    );
  }

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
