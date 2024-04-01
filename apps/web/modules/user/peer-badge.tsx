import { Badge, Stack, Modal, Slider, Text } from "@mantine/core";
import type { User } from "types";
import { c } from "../../utils/constants";
import { Audio } from "../audio/_audio";
import { useConsumerStore } from "../../store/consumer";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { Icon } from "../../components/_icon";
import { useDisclosure } from "@mantine/hooks";

export const PeerBadge = ({
  peer,
  speaker,
  me
}: {
  peer: User;
  speaker: boolean;
  me: boolean;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const { consumers, setvolume } = useConsumerStore((state) => ({
    consumers: state.consumers,
    setvolume: state.setvolume
  }));

  const consumer = consumers[peer._id]?.consumer;
  const paused = consumers[peer._id]?.paused;
  const volume = consumers[peer._id]?.volume;

  return (
    <>
      <Badge
        variant="dot"
        p={15}
        size="lg"
        color={me ? "red" : "indigo"}
        style={{
          boxShadow: speaker
            ? `0px 0px 6px 3px ${me ? c.colors.red : c.colors.indigo}`
            : "",
          pointerEvents: me ? "none" : undefined
        }}
        rightSection={
          paused ? (
            <Icon color="red">
              <AiOutlineAudioMuted size={15} />
            </Icon>
          ) : undefined
        }
        className="cursor-pointer"
        onClick={() => !me && open()}
      >
        {me ? "you" : peer.display_name}
      </Badge>

      {me ? null : <Audio consumer={consumer!} volume={volume ?? 100} />}

      <Modal opened={opened} onClose={close} title={peer.display_name}>
        <Stack>
          <Stack gap={0}>
            <Text c="dark" fw="bold">
              volume
            </Text>
            <Slider
              value={volume}
              onChange={(value) => !me && setvolume(peer._id, value)}
            />
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};
