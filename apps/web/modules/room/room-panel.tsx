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
  const roomstate = useRoomStore((state) => state.state);
  const warning = useRoomStore((state) => state.warn_message);
  const activespeakers = useRoomStore((state) => state.active_speakers);
  const setroomstore = useRoomStore((state) => state.set);

  const leaving = roomstate === "disconnecting";

  useHotkeys([
    [
      "l",
      async () => {
        await actions.leave();

        await router.replace("/rooms");
      }
    ],
    ["s", () => clipboard.copy(window.location)]
  ]);

  const leave = useCallback(async () => {
    await actions.leave();

    await router.replace("/rooms");
  }, [actions.leave]);

  if (!user) return null;

  return (
    <>
      <Group style={{ flex: 1 }}>
        <Stack gap={0} style={{ width: "100%" }}>
          {!!warning && (
            <>
              <Notification
                color="yellow"
                style={{ width: "100%" }}
                onClose={() => setroomstore({ warn_message: "" })}
              >
                {warning}
              </Notification>
              <Space h="md" />
            </>
          )}

          <Group justify="right">
            <ActionIcon color="indigo" variant="transparent" onClick={open}>
              <IconInfoCircle />
            </ActionIcon>
          </Group>

          <Space h="md" />

          <Group justify="space-between">
            <Stack gap={0}>
              <Title order={3}>{room.name}</Title>
              {room.description ? (
                <Text c="indigo" size="xs">
                  {room.description}
                </Text>
              ) : null}
            </Stack>

            <Text c="white" size="sm" fs="italic">
              {elapsed}
            </Text>
          </Group>
        </Stack>

        <Divider variant="solid" color="indigo" style={{ width: "100%" }} />

        <Group justify="space-between" style={{ width: "100%" }}>
          <ToggleMuteButton toggle={actions.togglemute} />
          <Group gap={20}>
            <Button
              size="xs"
              radius="xl"
              variant="subtle"
              color="indigo"
              leftSection={<AiOutlineShareAlt />}
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
              leftSection={<IoExitOutline />}
            >
              leave
            </Button>
          </Group>
        </Group>

        <Divider variant="solid" color="indigo" style={{ width: "100%" }} />

        <ScrollArea
          style={{
            width: "100%"
          }}
          styles={{ thumb: { backgroundColor: "var(--color-primary)" } }}
          type="auto"
          offsetScrollbars
        >
          <Group
            gap={25}
            style={{
              paddingTop: 5,
              paddingBottom: 5
            }}
          >
            <PeerBadge
              peer={user}
              speaker={Boolean(activespeakers[user._id])}
              me={true}
            />

            {Object.values(peers).map((peer) => (
              <PeerBadge
                key={peer._id}
                peer={peer}
                speaker={Boolean(activespeakers[peer._id])}
                me={false}
              />
            ))}
          </Group>
        </ScrollArea>
      </Group>

      <Modal opened={opened} onClose={close} title="keyboard shortcuts">
        <Stack gap={7}>
          <KeyboardShortcut shortcut="m" label="mute" />
          <KeyboardShortcut shortcut="s" label="share" />
          <KeyboardShortcut shortcut="l" label="leave" />
          <KeyboardShortcut shortcut="c" label="chat" />
        </Stack>
      </Modal>
    </>
  );
};
