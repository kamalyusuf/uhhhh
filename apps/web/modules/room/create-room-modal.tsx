import { Modal, Text } from "@mantine/core";
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
          <Text fz={22} fw="bold" c="dark">
            create a room
          </Text>
        }
        size="sm"
      >
        <CreateRoomForm oncancel={() => setopened(false)} />
      </Modal>
    </>
  );
};
