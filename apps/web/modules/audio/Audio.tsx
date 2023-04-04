import { useEffect, useRef } from "react";
import type { Consumer } from "mediasoup-client/lib/types";

interface Props {
  consumer: Consumer;
  volume: number;
}

export const Audio = ({ consumer, volume }: Props) => {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!consumer || !ref.current) return;

    ref.current.srcObject = new MediaStream([consumer.track]);
    ref.current.volume = volume / 100;
    ref.current.play().catch(console.log);
  }, [consumer, volume]);

  return (
    <>
      <audio ref={ref} autoPlay playsInline controls={false} />
    </>
  );
};
