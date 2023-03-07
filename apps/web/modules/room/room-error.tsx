import { Alert } from "../../components/alert";
import { useRoomStore } from "../../store/room";

export const RoomError = () => {
  const roomstore = useRoomStore();

  const deviceerror = roomstore.error_message === "already loaded";
  const micerror = roomstore.error_message === "Permission denied";
  const devicemissingerror =
    roomstore.error_message === "Requested device not found";

  return (
    <Alert
      type="error"
      message={
        deviceerror
          ? "please refresh the page"
          : micerror
          ? "microphone access is denied"
          : devicemissingerror
          ? "no microphone(s) detected"
          : "could not join room. try refreshing the page"
      }
      wrap
    />
  );
};
