import { Group } from "@mantine/core";
import { Layout } from "../../components/Layout";
import React from "react";
import { useRouter } from "next/router";
import { Container } from "../../components/Container";
import { RoomChat } from "./chat/RoomChat";
import { RoomPanel } from "./RoomPanel";
import { useSocketQuery } from "../../hooks/useSocketQuery";
import { withAuth } from "../../hocs/auth";

export const RoomPage = withAuth(() => {
  const router = useRouter();
  const _id = router.query.id as string;
  const { data } = useSocketQuery(
    ["room", _id],
    { _id },
    { e: router.isReady, refetchOnMount: "always" }
  );

  return (
    <Layout>
      <Container style={{}}>
        <Group style={{ height: "97%" }} align="start">
          <RoomPanel />
          <RoomChat />
        </Group>
      </Container>
    </Layout>
  );
});

RoomPage.ws = true;
