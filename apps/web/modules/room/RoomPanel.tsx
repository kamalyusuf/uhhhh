import {
  Group,
  Text,
  Divider,
  Button,
  ScrollArea,
  Notification,
  Space,
  Stack
} from "@mantine/core";
import { Heading } from "../../components/Heading";
import { ToggleMuteButton } from "../audio/ToggleMuteButton";
import { c } from "../../utils/constants";
import { PeerBadge } from "../user/PeerBadge";
import { useRouter } from "next/router";
import type { Room } from "types";
import { usePeerStore } from "../../store/peer";
import { useMeStore } from "../../store/me";
import { useRoomStore } from "../../store/room";
import { useClipboard } from "@mantine/hooks";
import { AiOutlineShareAlt } from "react-icons/ai";
import { IoExitOutline } from "react-icons/io5";
import { Record } from "./Record";

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
  const clipboard = useClipboard({ timeout: 1500 });

  const leaving = roomStore.state === "disconnecting";

  const leave = async () => {
    roomStore.setState("disconnecting");

    await actions.leave();

    router.replace("/rooms");
  };

  return (
    <Group style={{ flex: 1 }}>
      <Stack spacing={0} style={{ width: "100%" }}>
        {roomStore.warn_message && (
          <Notification
            color="yellow"
            sx={{ width: "100%" }}
            onClose={() => roomStore.set({ warn_message: "" })}
          >
            {roomStore.warn_message}
          </Notification>
        )}

        <Space h="md" />

        <Heading title={room.name} order={3} />
        <Text color="indigo" size="xs">
          {room.description}
        </Text>
      </Stack>

      <Divider variant="solid" color="indigo" style={{ width: "100%" }} />

      <Group position="apart" style={{ width: "100%" }}>
        <ToggleMuteButton mute={actions.mute} unmute={actions.unmute} />
        <Group spacing={20}>
          <Record room={room} />
          <Button
            size="xs"
            radius="xl"
            variant="outline"
            color="indigo"
            sx={(theme) => ({
              "&:hover": {
                backgroundColor: theme.colors.dark[8]
              }
            })}
            leftIcon={<AiOutlineShareAlt />}
            onClick={() => {
              clipboard.copy(window.location);
            }}
          >
            {clipboard.copied ? "copied" : "share"}
          </Button>

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
            leftIcon={<IoExitOutline />}
          >
            leave
          </Button>
        </Group>
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
