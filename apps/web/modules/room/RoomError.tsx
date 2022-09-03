import type { Room } from "types";
import { Alert } from "../../components/Alert";
import { Layout } from "../../components/Layout";
import { useRoomStore } from "../../store/room";

export const RoomError = ({ room }: { room?: Room }) => {
  const roomStore = useRoomStore();

  const isDeviceError = roomStore.error_message === "already loaded";
  const isMicError = roomStore.error_message === "Permission denied";
  const isDeviceMissingError =
    roomStore.error_message === "Requested device not found";

  return (
    <Layout title={`uhhhh | ${room?.name ?? "room"}`}>
      <Alert
        type="error"
        message={
          isDeviceError
            ? "please refresh the page"
            : isMicError
            ? "microphone access is denied"
            : isDeviceMissingError
            ? "no microphone(s) detected"
            : "could not join room"
        }
      />
    </Layout>
  );
};
