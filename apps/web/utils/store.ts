import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { StateCreator } from "zustand";

type Initializer<T> = StateCreator<T, [["zustand/devtools", never]]>;

export type Set<T> = Parameters<Initializer<Omit<T, "set">>>[0];

export const createstore = <T extends object>(
  name: string,
  initializer: Initializer<T>,
  options?: { persist?: boolean }
) => {
  if (options?.persist)
    return create<T>()(devtools(persist(initializer, { name }), { name }));

  return create<T>()(devtools(initializer, { name }));
};
