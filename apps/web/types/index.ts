import { NextPage } from "next";
import { ChatMessage } from "types";

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
  ws?: boolean;
};

export interface Message extends ChatMessage {
  color: string;
}
