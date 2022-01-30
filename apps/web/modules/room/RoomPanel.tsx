import { Group, Text, Divider, Button, ScrollArea } from "@mantine/core";
import { Heading } from "../../components/Heading";
import { ToggleMuteButton } from "../audio/ToggleMuteButton";
import { c } from "../../lib/constants";
import { PeerBadge } from "../user/PeerBadge";
import React from "react";
import { useRouter } from "next/router";
import { Room } from "types";
import { usePeerStore } from "../../store/peer";

interface Props {
  room: Room;
}

export const RoomPanel = ({ room }: Props) => {
  const router = useRouter();
  const { peers } = usePeerStore();

  return (
    <Group style={{ flex: 1 }}>
      <Group direction="column" spacing={0}>
        <Heading title={room.name} order={3} />
        <Text color="indigo" size="xs">
          {room.description}
        </Text>
      </Group>

      <Divider variant="solid" color="indigo" style={{ width: "100%" }} />

      <Group position="apart" style={{ width: "100%" }}>
        <ToggleMuteButton />
        <Button
          size="xs"
          radius="xl"
          variant="outline"
          color="red"
          sx={(theme) => ({
            "&:hover": {
              backgroundColor: theme.colors.dark[8]
            }
          })}
          onClick={() => router.push("/rooms")}
        >
          leave
        </Button>
      </Group>

      <Divider variant="solid" color="indigo" style={{ width: "100%" }} />

      <ScrollArea
        style={{
          height: 500,
          width: "100%"
        }}
        styles={{ thumb: { backgroundColor: c.colors.indigo } }}
        type="auto"
        offsetScrollbars
      >
        <Group
          spacing={12}
          grow
          style={{
            paddingTop: 5,
            paddingBottom: 5
          }}
        >
          {Object.values(peers)
            .filter(Boolean)
            .map((peer) => (
              <PeerBadge key={peer._id} peer={peer} />
            ))}
        </Group>
      </ScrollArea>
    </Group>
  );
};
