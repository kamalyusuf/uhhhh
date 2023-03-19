import { Badge } from "@mantine/core";
import type { User } from "types";
import { c } from "../../utils/constants";
import { Audio } from "../audio/audio";
import { useConsumerStore } from "../../store/consumer";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { Icon } from "../../components/icon";

export const PeerBadge = ({
  peer,
  speaker,
  me
}: {
  peer: User;
  speaker: boolean;
  me: boolean;
}) => {
  const consumers = useConsumerStore((state) => state.consumers);
  const consumer = consumers[peer._id]?.consumer;
  const paused = consumers[peer._id]?.paused;

  return (
    <>
      <Badge
        variant="dot"
        p={15}
        size="lg"
        color={me ? "red" : "indigo"}
        styles={{
          inner: {
            color: "white"
          }
        }}
        style={{
          boxShadow: speaker
            ? `0px 0px 6px 3px ${me ? c.colors.red : c.colors.indigo}`
            : ""
        }}
        rightSection={
          paused ? (
            <Icon color="red">
              <AiOutlineAudioMuted size={15} />
            </Icon>
          ) : undefined
        }
      >
        {me ? "you" : peer.display_name}
      </Badge>

      {me ? null : <Audio consumer={consumer} />}
    </>
  );
};
