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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
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
        <ErrorAlert title="uh-oh" message={parseApiError(error)[0]} />
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

  return (
    <Layout>
      <Container style={{}}>
        <Group style={{ height: "97%" }} align="start">
          <RoomPanel room={room} />
          <RoomChat />
        </Group>
      </Container>
    </Layout>
  );
};

RoomPage.authenticate = "yes";
