import { toast } from "react-toastify";
import { useMicStore } from "../store/mic";

export const micenabled = async (): Promise<boolean> => {
  const micstore = useMicStore.getState();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: micstore.id ? { deviceId: micstore.id } : true
    });

    stream.getTracks().forEach((track) => track.stop());

    return true;
  } catch (e) {
    const error = e as Error;

    if (error.message === "Requested device not found")
      toast.error("no microphone(s) detected");
    else if (error.message === "Permission denied")
      toast.error("microphone access is denied");
    else toast.error(error.message);

    return false;
  }
};
