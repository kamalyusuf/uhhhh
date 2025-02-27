import { useRef } from "react";
import { shallow } from "zustand/vanilla/shallow";

export const useShallow = <S, U>(
  selector: (state: S) => U
): ((state: S) => U) => {
  const prev = useRef<U>();

  return (state) => {
    const next = selector(state);

    return shallow(prev.current, next)
      ? (prev.current as U)
      : (prev.current = next);
  };
};
