import { Group } from "@mantine/core";
import { useRef, useState, memo } from "react";
import type { Room } from "types";
import { type RecordState, RecordActions } from "./RecordActions";

interface Props {
  room: Room;
}

export const Record = memo(({ room }: Props) => {
  const [state, setState] = useState<RecordState>("idle");
  const blobs = useRef<Blob[]>([]);
  const recorder = useRef<MediaRecorder>(null);
  const stream = useRef<MediaStream>(null);

  const record = async () => {
    const s = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    const track = s.getAudioTracks()[0];

    stream.current = new MediaStream([track]);

    recorder.current = new MediaRecorder(stream.current);

    recorder.current.start();

    recorder.current.addEventListener("start", (event) => {});

    recorder.current.addEventListener("dataavailable", (blob) => {
      if (blob.data && blob.data.size > 0) blobs.current.push(blob.data);
    });

    recorder.current.addEventListener("stop", (event) => {
      const today = new Date();
      const date = today.toISOString().split("T")[0];
      const time = today.toTimeString().split(" ")[0];
      const when = `${date}-${time}`;

      const blob = new Blob(blobs.current, { type: "video/webm" });

      const url = window.URL.createObjectURL(blob);

      const filename = `${room.name}-${when}.webm`;

      const a = document.createElement("a");

      a.style.display = "none";
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);

      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    });

    setState("recording");
  };

  return (
    <Group>
      <RecordActions
        state={state}
        actions={{
          start: record,

          stop: () => {
            if (recorder.current) {
              recorder.current.stop();
              recorder.current = null;
            }

            if (stream.current) {
              stream.current.getTracks().forEach((track) => track.stop());
              stream.current = null;
            }

            setState("idle");
          },

          pause: () => {
            if (recorder.current && state === "recording") {
              recorder.current.pause();

              setState("paused");
            }
          },

          play: () => {
            if (recorder.current && state === "paused") {
              recorder.current.resume();

              setState("recording");
            }
          }
        }}
      />
    </Group>
  );
});
