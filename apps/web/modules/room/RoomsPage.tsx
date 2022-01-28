import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Box, Group, Divider, Space, ActionIcon } from "@mantine/core";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { MdOutlineAdd } from "react-icons/md";
import { CreateRoomModal } from "./CreateRoomModal";
import { Rooms } from "./Rooms";
import { withAuth } from "../../hocs/auth";

export const RoomsPage = withAuth(() => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {}, []);

  return (
    <Layout>
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
        </Container>
      </Box>
      {opened && (
        <CreateRoomModal
          opened={opened}
          setOpened={(value) => setOpened(value)}
        />
      )}
    </Layout>
  );
});

RoomsPage.ws = true;
