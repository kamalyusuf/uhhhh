import { useState } from "react";
import { ActionIcon } from "@mantine/core";
import { IoMdMic, IoMdMicOff } from "react-icons/io";

export const ToggleMuteButton = () => {
  const [muted, setMuted] = useState(false);

  const toggle = () => setMuted((muted) => !muted);

  return (
    <ActionIcon
      onClick={toggle}
      variant="filled"
      color={muted ? "red" : "indigo"}
    >
      {muted ? <IoMdMicOff /> : <IoMdMic />}
    </ActionIcon>
  );
};
