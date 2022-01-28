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

export const RoomPage: PageComponent = () => {
  const router = useRouter();
  const _id = router.query.id as string | undefined;
  const [mounted, setMounted] = useState(false);
  const { data: room, isLoading } = useQuery<Room, AxiosError<ApiError>>(
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

  if (!mounted) return null;

  return (
    <Layout>
      <Container style={{}}>
        <Group style={{ height: "97%" }} align="start">
          {isLoading ? (
            <Center>
              <Loader size="lg" />
            </Center>
          ) : (
            <>
              <RoomPanel room={room} />
              <RoomChat />
            </>
          )}
        </Group>
      </Container>
    </Layout>
  );
};

RoomPage.authenticate = "yes";
RoomPage.ws = true;
