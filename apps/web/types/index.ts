import { NextPage } from "next";
import { ChatMessage, User } from "types";

export type Color =
  | "white"
  | "black"
  | "red"
  | "primary"
  | "dark"
  | "secondary"
  | "indigo"
  | "tertiary";

export type PageComponent<T = {}> = NextPage<T> & {
  authenticate?: "yes" | "not";
  ws?: boolean;
};

export interface Message extends ChatMessage {
  color: string;
}

export interface Peer extends User {
  consumers: string[];
}
