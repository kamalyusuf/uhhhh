import {
  Group,
  Center,
  Loader,
  Button,
  Paper,
  PasswordInput
} from "@mantine/core";
import { Layout } from "../../components/Layout";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Container } from "../../components/Container";
import { RoomChat } from "./chat/RoomChat";
import { RoomPanel } from "./RoomPanel";
import { PageComponent } from "../../types";
import { useQuery } from "react-query";
import { api } from "../../lib/api";
import { Room, ApiError, RoomStatus } from "types";
import { AxiosError } from "axios";
import { ErrorAlert } from "../../components/ErrorAlert";
import { parseApiError } from "../../utils/error";
import { useRoom } from "./useRoom";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../../hooks/useSocket";
import hark from "hark";
import { useMicStore } from "../../store/mic";
import { useMediaQuery } from "@mantine/hooks";
import { request } from "../../lib/request";
import splitbee from "@splitbee/web";
import { useMeStore } from "../../store/me";
import { usePeerStore } from "../../store/peer";

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
    async () => (await api.get(`/rooms/${_id}`)).data,
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
  const me = useMeStore().me;
  const peers = usePeerStore().peers;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (((locked && ok) || !locked) && socketState === "connected") join();
  }, [socketState, ok, locked]);

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
      splitbee.track("join room", {
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

                const { ok: success } = await request({
                  socket,
                  event: "room login",
                  payload: {
                    room_id: room._id,
                    password
                  }
                });

                setOk(success);
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

                <Button type="submit">join</Button>
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
