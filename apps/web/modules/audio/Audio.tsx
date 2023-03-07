import { useEffect, useRef } from "react";
import type { Consumer } from "mediasoup-client/lib/types";

interface Props {
  consumer: Consumer;
}

export const Audio = ({ consumer }: Props) => {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!consumer || !ref.current) return;

    ref.current.srcObject = new MediaStream([consumer.track]);
    ref.current.play().catch(console.log);
  }, [consumer]);

  return (
    <>
      <audio ref={ref} autoPlay playsInline controls={false} />
    </>
  );
};
