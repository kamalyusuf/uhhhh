import { Badge } from "@mantine/core";
import { User } from "types";
import { Audio } from "../audio/Audio";

export const PeerBadge = ({ peer }: { peer: User }) => {
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
      >
        {peer.display_name}
      </Badge>
      <Audio peer={peer} />
    </>
  );
};
