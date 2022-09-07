import { useState } from "react";
import { Layout } from "../../components/Layout";
import { Box, Group, Divider, Space, ActionIcon } from "@mantine/core";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { MdOutlineAdd } from "react-icons/md";
import { CreateRoomModal } from "./CreateRoomModal";
import { Rooms } from "./Rooms";
import type { PageComponent } from "../../types";
import { useMounted } from "../../hooks/use-mounted";
import { Testing } from "../../components/Testing";

export const RoomsPage: PageComponent = () => {
  const [opened, setOpened] = useState(false);
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <>
      <Layout title="rooms">
        <Box sx={{ width: "100%" }}>
          <Container>
            <Group position="apart">
              <Heading title="rooms" />
              <ActionIcon
                variant="filled"
                color="indigo"
                radius="xl"
                size="md"
                onClick={() => setOpened(true)}
              >
                <MdOutlineAdd />
              </ActionIcon>
            </Group>
            <Space h="sm" />
            <Divider variant="solid" color="indigo" />
            <Space h="sm" />
            <Rooms />
            <Testing />
          </Container>
        </Box>

        <CreateRoomModal
          opened={opened}
          setOpened={(value) => setOpened(value)}
        />
      </Layout>
    </>
  );
};

RoomsPage.authenticate = "yes";
