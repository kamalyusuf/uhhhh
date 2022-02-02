import { Badge } from "@mantine/core";
import { User } from "types";
import { c } from "../../lib/constants";
import { Audio } from "../audio/Audio";

export const PeerBadge = ({
  peer,
  speaker,
  me
}: {
  peer: User;
  speaker: boolean;
  me: boolean;
}) => {
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
      >
        {me ? "you" : peer.display_name}
      </Badge>
      {!me && <Audio peer={peer} />}
    </>
  );
};
