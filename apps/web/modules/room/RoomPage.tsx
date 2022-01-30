import { Group, Center, Loader } from "@mantine/core";
import { Layout } from "../../components/Layout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container } from "../../components/Container";
import { RoomChat } from "./chat/RoomChat";
import { RoomPanel } from "./RoomPanel";
import { PageComponent } from "../../types";
import { useQuery } from "react-query";
import { api } from "../../lib/api";
import { isServer } from "../../utils/is-server";
import { Room, ApiError } from "types";
import { AxiosError } from "axios";
import { ErrorAlert } from "../../components/ErrorAlert";
import { parseApiError } from "../../utils/error";
import { useRoom } from "./useRoom";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../../hooks/useSocket";
import hark from "hark";
import { useMicStore } from "../../store/mic";

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
      enabled: !isServer() && mounted && !!_id,
      refetchOnMount: "always"
    }
  );
  const { join } = useRoom(room?._id);
  const { state } = useRoomStore();
  const { state: socketState, socket } = useSocket();
  const { stream } = useMicStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && room && socketState === "connected") {
      join();
    }
  }, [mounted, room, socketState]);

  useEffect(() => {
    if (!stream) return;

    const harker = hark(stream, { threshold: -65, interval: 75 });

    harker.on("speaking", () => {
      socket.emit("active speaker", { value: true });
    });

    harker.on("stopped_speaking", () => {
      socket.emit("active speaker", { value: false });
    });

    return () => {
      harker.stop();
    };
  }, [stream]);

  if (!mounted) {
    return null;
  }

  if (isLoading || state === "connecting") {
    return (
      <Layout>
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

  if (error) {
    return (
      <Layout>
        <ErrorAlert
          title="uh-oh! failed to fetch room"
          message={parseApiError(error)[0]}
        />
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <></>
      </Layout>
    );
  }

  if (socketState === "error") {
    return (
      <Layout>
        <ErrorAlert
          title="uh-oh! failed to establish websocket connection"
          message="could not join room"
        />
      </Layout>
    );
  }

  if (state === "error") {
    return (
      <Layout>
        <ErrorAlert title="uh-oh" message="could not join room" />
      </Layout>
    );
  }

  if (state === "connected") {
    return (
      <Layout>
        <Container style={{ width: "100%" }}>
          <Group style={{ height: "97%" }} align="start">
            <RoomPanel room={room} />
            <RoomChat />
          </Group>
        </Container>
      </Layout>
    );
  }

  return null;
};

RoomPage.authenticate = "yes";
