import { useCallback } from "react";
import { ActionIcon } from "@mantine/core";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { useProducerStore } from "../../store/producer";

interface Props {
  mute: () => Promise<void>;
  unmute: () => Promise<void>;
}

export const ToggleMuteButton = ({ mute, unmute }: Props) => {
  const { producer } = useProducerStore();

  const toggle = useCallback(async () => {
    if (producer.paused) {
      await unmute();
    } else {
      await mute();
    }
  }, [producer.paused]);

  return (
    <>
      <ActionIcon
        onClick={toggle}
        variant="filled"
        color={producer.paused ? "red" : "indigo"}
      >
        {producer.paused ? <IoMdMicOff /> : <IoMdMic />}
      </ActionIcon>
    </>
  );
};
