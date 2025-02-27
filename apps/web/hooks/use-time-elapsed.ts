import { type Duration, intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";

export const useTimeElapsed = (start: string) => {
  const [duration, setduration] = useState<Duration>();

  useEffect(() => {
    const update = (start: string) => {
      if (!start) return;

      setduration(
        intervalToDuration({
          start: new Date(start),
          end: new Date()
        })
      );
    };

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
