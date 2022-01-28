import { Modal } from "@mantine/core";
import { Heading } from "../../components/Heading";
import { CreateRoomForm } from "./CreateRoomForm";

interface Props {
  opened: boolean;
  setOpened: (value: boolean) => void;
}

export const CreateRoomModal = ({ opened, setOpened }: Props) => {
  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Heading title="create a room" color="dark" order={3} />}
        size="sm"
        overlayOpacity={0.95}
      >
        <CreateRoomForm onCancel={() => setOpened(false)} />
      </Modal>
    </>
  );
};
