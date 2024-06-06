import { Alert } from "../../components/alert";
import { useRoomStore } from "../../store/room";

export const RoomError = () => {
  const error = useRoomStore((state) => state.error);

  const deviceerror = error === "already loaded";
  const micerror = error === "Permission denied";
  const devicemissingerror = error === "Requested device not found";

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
              : error ?? "could not join room"
      }
      wrap
    />
  );
};
