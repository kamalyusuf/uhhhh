import type { NextPage } from "next";
import type { Fn } from "types";

export type PageComponent<T = {}> = NextPage<T> & {
  authenticate?: "yes" | "not";
};

export type ExtraQueryKeys = (string | number | boolean)[];

export type State<T extends object> = {
  [K in keyof T as T[K] extends Fn ? never : K]?: T[K];
};
