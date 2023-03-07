import { Modal, Title } from "@mantine/core";
import { CreateRoomForm } from "./create-room-form";

interface Props {
  opened: boolean;
  setopened: (value: boolean) => void;
}

export const CreateRoomModal = ({ opened, setopened }: Props) => {
  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setopened(false)}
        title={
          <Title order={3} color="dark">
            create a room
          </Title>
        }
        size="sm"
      >
        <CreateRoomForm oncancel={() => setopened(false)} />
      </Modal>
    </>
  );
};
