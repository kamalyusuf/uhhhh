import { ActionIcon } from "@mantine/core";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { useProducerStore } from "../../store/producer";

interface Props {
  toggle: () => Promise<void>;
}

export const ToggleMuteButton = ({ toggle }: Props) => {
  const producer = useProducerStore((state) => state.producer);

  return (
    <>
      <ActionIcon
        onClick={toggle}
        variant="filled"
        color={producer?.paused ? "red" : "indigo"}
      >
        {producer?.paused ? <IoMdMicOff /> : <IoMdMic />}
      </ActionIcon>
    </>
  );
};
