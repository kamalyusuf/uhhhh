import {
  Group,
  Text,
  Divider,
  Button,
  ScrollArea,
  Notification,
  Space
} from "@mantine/core";
import { Heading } from "../../components/Heading";
import { ToggleMuteButton } from "../audio/ToggleMuteButton";
import { c } from "../../lib/constants";
import { PeerBadge } from "../user/PeerBadge";
import React from "react";
import { useRouter } from "next/router";
import { Room } from "types";
import { usePeerStore } from "../../store/peer";
import { useMeStore } from "../../store/me";
import { useRoomStore } from "../../store/room";

interface Props {
  room: Room;
  actions: {
    leave: () => Promise<void>;
    mute: () => Promise<void>;
    unmute: () => Promise<void>;
  };
}

export const RoomPanel = ({ room, actions }: Props) => {
  const router = useRouter();
  const peerStore = usePeerStore();
  const { me } = useMeStore();
  const roomStore = useRoomStore();

  const leaving = roomStore.state === "disconnecting";

  const leave = async () => {
    roomStore.setState("disconnecting");

    await actions.leave();

    router.replace("/rooms");
  };

  return (
    <Group style={{ flex: 1 }}>
      <Group direction="column" spacing={0} style={{ width: "100%" }}>
        {roomStore.warn_message && roomStore.show_warning && (
          <Notification
            color="yellow"
            sx={{ width: "100%" }}
            onClose={() =>
              roomStore.set({ show_warning: false, warn_message: "" })
            }
          >
            {roomStore.warn_message}
          </Notification>
        )}

        <Space h="md" />

        <Heading title={room.name} order={3} />
        <Text color="indigo" size="xs">
          {room.description}
        </Text>
      </Group>

      <Divider variant="solid" color="indigo" style={{ width: "100%" }} />

      <Group position="apart" style={{ width: "100%" }}>
        <ToggleMuteButton mute={actions.mute} unmute={actions.unmute} />
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
          onClick={leave}
          disabled={leaving}
          loading={leaving}
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
          spacing={25}
          grow
          style={{
            paddingTop: 5,
            paddingBottom: 5
          }}
        >
          <PeerBadge
            peer={me}
            speaker={roomStore.active_speakers[me._id]}
            me={true}
          />
          {Object.values(peerStore.peers)
            .filter(Boolean)
            .map((peer) => (
              <PeerBadge
                key={peer._id}
                peer={peer}
                speaker={roomStore.active_speakers[peer._id]}
                me={false}
              />
            ))}
        </Group>
      </ScrollArea>
    </Group>
  );
};
