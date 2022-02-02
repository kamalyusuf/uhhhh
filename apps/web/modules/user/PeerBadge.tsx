import { Badge } from "@mantine/core";
import { User } from "types";
import { c } from "../../lib/constants";
import { Audio } from "../audio/Audio";
import { useConsumerStore } from "../../store/consumer";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { Icon } from "../../components/Icon";

export const PeerBadge = ({
  peer,
  speaker,
  me
}: {
  peer: User;
  speaker: boolean;
  me: boolean;
}) => {
  const { consumers } = useConsumerStore();
  const consumer = consumers[peer._id]?.consumer;

  return (
    <>
      <Badge
        variant="dot"
        size="md"
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
          consumer?.paused ? (
            <Icon color="red">
              <AiOutlineAudioMuted size={15} />
            </Icon>
          ) : undefined
        }
      >
        {me ? "you" : peer.display_name}
      </Badge>
      {!me && <Audio consumer={consumer} />}
    </>
  );
};
