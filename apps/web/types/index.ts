import type { NextPage } from "next";

export type PageComponent<T = {}> = NextPage<T> & {
  authenticate?: "yes" | "not";
};

export type ExtraQueryKeys = (string | number | boolean)[];
