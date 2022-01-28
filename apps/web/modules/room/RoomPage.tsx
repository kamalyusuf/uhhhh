import { Group } from "@mantine/core";
import { Layout } from "../../components/Layout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container } from "../../components/Container";
import { RoomChat } from "./chat/RoomChat";
import { RoomPanel } from "./RoomPanel";
import { useSocketQuery } from "../../hooks/useSocketQuery";
import { PageComponent } from "../../types";

export const RoomPage: PageComponent = () => {
  const router = useRouter();
  const _id = router.query.id as string;
  const [mounted, setMounted] = useState(false);
  const { data } = useSocketQuery(
    ["room", _id],
    { _id },
    { e: mounted && !!_id, refetchOnMount: "always" }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
};

RoomPage.authenticate = "yes";
RoomPage.ws = true;
