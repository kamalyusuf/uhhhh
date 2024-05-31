import { Alert } from "../../components/alert";
import { useRoomStore } from "../../store/room";

export const RoomError = () => {
  const errormessage = useRoomStore((state) => state.error_message);

  const deviceerror = errormessage === "already loaded";
  const micerror = errormessage === "Permission denied";
  const devicemissingerror = errormessage === "Requested device not found";

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
