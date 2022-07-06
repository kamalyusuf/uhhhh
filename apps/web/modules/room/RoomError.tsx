import { Room } from "types";
import { ErrorAlert } from "../../components/ErrorAlert";
import { Layout } from "../../components/Layout";
import { useRoomStore } from "../../store/room";

export const RoomError = ({ room }: { room?: Room }) => {
  const roomStore = useRoomStore();

  const isDeviceError = roomStore.error_message === "already loaded";
  const isMicError = roomStore.error_message === "Permission denied";

  return (
    <Layout title={`uhhhh | ${room?.name ?? "room"}`}>
      <ErrorAlert
        title="uh-oh"
        message={
          isDeviceError
            ? "please refresh the page"
            : isMicError
            ? "microphone access is denied"
            : "could not join room"
        }
      />
    </Layout>
  );
};
