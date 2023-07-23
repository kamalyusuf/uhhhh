import {
  Group,
  Text,
  Divider,
  Button,
  ScrollArea,
  Notification,
  Space,
  Stack,
  Title,
  ActionIcon,
  Modal
} from "@mantine/core";
import { ToggleMuteButton } from "../audio/toggle-mute-button";
import { c } from "../../utils/constants";
import { PeerBadge } from "../user/peer-badge";
import { useRouter } from "next/router";
import type { Room } from "types";
import { usePeerStore } from "../../store/peer";
import { useUserStore } from "../../store/user";
import { useRoomStore } from "../../store/room";
import { useClipboard, useDisclosure, useHotkeys } from "@mantine/hooks";
import { AiOutlineShareAlt } from "react-icons/ai";
import { IoExitOutline } from "react-icons/io5";
import { useRoomTimeElapsed } from "./use-room-time-elapsed";
import { useCallback } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { KeyboardShortcut } from "../../components/keyboard-shortcut";

interface Props {
  room: Room;
  actions: {
    leave: () => Promise<void>;
    togglemute: () => Promise<void>;
  };
}

export const RoomPanel = ({ room, actions }: Props) => {
  const router = useRouter();
  const peers = usePeerStore((state) => state.peers);
  const user = useUserStore((state) => state.user);
  const clipboard = useClipboard({ timeout: 1500 });
  const elapsed = useRoomTimeElapsed();
  const [opened, { open, close }] = useDisclosure(false);
  const roomstore = useRoomStore((state) => ({
    state: state.state,
    warn_message: state.warn_message,
    set: state.set,
    active_speakers: state.active_speakers
  }));

  const leaving = roomstore.state === "disconnecting";

  useHotkeys([
    [
      "l",
      async () => {
        await actions.leave();

        router.replace("/rooms");
      }
    ],
    ["s", () => clipboard.copy(window.location)]
  ]);

  const leave = useCallback(async () => {
    await actions.leave();

    router.replace("/rooms");
  }, [actions.leave]);

  if (!user) return null;

  return (
    <>
      <Group style={{ flex: 1 }}>
        <Stack spacing={0} style={{ width: "100%" }}>
          {roomstore.warn_message ? (
            <Notification
              color="yellow"
              sx={{ width: "100%" }}
              onClose={() => roomstore.set({ warn_message: "" })}
            >
              {roomstore.warn_message}
            </Notification>
          ) : null}

          <Group position="right">
            <ActionIcon color="indigo" variant="transparent" onClick={open}>
              <IconInfoCircle />
            </ActionIcon>
          </Group>

          <Space h="md" />

          <Group position="apart">
            <Stack spacing={0}>
              <Title order={3}>{room.name}</Title>
              {room.description ? (
                <Text color="indigo" size="xs">
                  {room.description}
                </Text>
              ) : null}
            </Stack>

            <Text color="white" size="sm" italic>
              {elapsed}
            </Text>
          </Group>
        </Stack>

        <Divider variant="solid" color="indigo" style={{ width: "100%" }} />

        <Group position="apart" style={{ width: "100%" }}>
          <ToggleMuteButton toggle={actions.togglemute} />
          <Group spacing={20}>
            <Button
              size="xs"
              radius="xl"
              variant="subtle"
              color="indigo"
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
              variant="subtle"
              color="red"
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
            style={{
              paddingTop: 5,
              paddingBottom: 5
            }}
          >
            <PeerBadge
              peer={user}
              speaker={roomstore.active_speakers[user._id]}
              me={true}
            />

            {Object.values(peers)
              .filter(Boolean)
              .map((peer) => (
                <PeerBadge
                  key={peer._id}
                  peer={peer}
                  speaker={roomstore.active_speakers[peer._id]}
                  me={false}
                />
              ))}
          </Group>
        </ScrollArea>
      </Group>

      <Modal opened={opened} onClose={close} title="keyboard shortcuts">
        <Stack spacing={7}>
          <KeyboardShortcut shortcut="m" label="mute" />
          <KeyboardShortcut shortcut="s" label="share" />
          <KeyboardShortcut shortcut="l" label="leave" />
          <KeyboardShortcut shortcut="c" label="chat" />
        </Stack>
      </Modal>
    </>
  );
};
