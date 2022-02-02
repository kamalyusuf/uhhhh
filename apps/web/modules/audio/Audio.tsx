import { useEffect, useRef } from "react";
import { User } from "types";
import { useConsumerStore } from "../../store/consumer";

interface Props {
  peer: User;
}

export const Audio = ({ peer }: Props) => {
  const ref = useRef<HTMLAudioElement | null>();
  const { consumers } = useConsumerStore();
  const c = consumers[peer._id];
  const consumer = c?.consumer;

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
