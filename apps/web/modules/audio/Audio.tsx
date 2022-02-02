import { useEffect, useRef } from "react";
import { Consumer } from "mediasoup-client/lib/types";

interface Props {
  consumer: Consumer;
}

export const Audio = ({ consumer }: Props) => {
  const ref = useRef<HTMLAudioElement | null>();

  useEffect(() => {
    if (!consumer) return;

    ref.current.srcObject = new MediaStream([consumer.track]);
    ref.current.play().catch(console.log);
  }, [consumer]);

  return (
    <>
      <audio ref={ref} autoPlay playsInline controls={false} />
    </>
  );
};
