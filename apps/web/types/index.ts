import type { NextPage } from "next";
import type { ChatMessage, User } from "types";

export type PageComponent<T = {}> = NextPage<T> & {
  authenticate?: "yes" | "not";
};

export interface Message extends ChatMessage {
  color: string;
}

export interface Peer extends User {
  consumers: string[];
}

export type NoObj = Record<string | number | symbol, never>;

export type ExtraQueryKeys = (string | number | boolean)[];
