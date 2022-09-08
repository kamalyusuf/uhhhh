import { type Duration, intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";

export const useTimeElapsed = (start: string) => {
  const [duration, setDuration] = useState<Duration>();

  const update = (start: string) => {
    if (!start) return;

    setDuration(
      intervalToDuration({
        start: new Date(start),
        end: new Date()
      })
    );
  };

  useEffect(() => {
    update(start);

    const timer = setInterval(() => update(start), 1000);

    return () => clearInterval(timer);
  }, [start]);

  const days = duration?.days ? `${duration.days} day(s)` : "";

  return {
    duration,
    elapsed: `${days} ${duration?.hours || "00"}:${duration?.minutes || "00"}:${
      duration?.seconds || "00"
    }`
  };
};
