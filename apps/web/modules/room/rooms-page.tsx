import { useState } from "react";
import { Layout } from "../../components/layout";
import { Box, Group, Divider, Space, ActionIcon, Title } from "@mantine/core";
import { Container } from "../../components/container";
import { MdOutlineAdd } from "react-icons/md";
import { CreateRoomModal } from "./create-room-modal";
import { Rooms } from "./rooms";
import { useMounted } from "@mantine/hooks";
import type { PageComponent } from "../../types";

export const RoomsPage: PageComponent = () => {
  const [opened, setopened] = useState(false);
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <>
      <Layout title="rooms">
        <Box style={{ width: "100%" }}>
          <Container>
            <Group justify="space-between">
              <Title>rooms</Title>
              <ActionIcon
                variant="filled"
                color="indigo"
                radius="xl"
                size="md"
                onClick={() => setopened(true)}
              >
                <MdOutlineAdd />
              </ActionIcon>
            </Group>
            <Space h="sm" />
            <Divider variant="solid" color="indigo" />
            <Space h="sm" />
            <Rooms />
          </Container>
        </Box>

        <CreateRoomModal
          opened={opened}
          setopened={(value) => setopened(value)}
        />
      </Layout>
    </>
  );
};

RoomsPage.authenticate = "yes";
