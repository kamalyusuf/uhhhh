import { Badge } from "@mantine/core";
import { User } from "types";
import { c } from "../../lib/constants";
import { Audio } from "../audio/Audio";

export const PeerBadge = ({
  peer,
  audio = true,
  speaker
}: {
  peer: User;
  audio?: boolean;
  speaker: boolean;
}) => {
  return (
    <>
      <Badge
        variant="dot"
        size="md"
        styles={{
          inner: {
            color: "white"
          }
        }}
        style={{
          boxShadow: speaker ? `0px 0px 6px 3px ${c.colors.indigo}` : ""
        }}
      >
        {peer.display_name}
      </Badge>
      {audio && <Audio peer={peer} />}
    </>
  );
};
