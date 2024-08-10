import type { Direction } from "types";

export interface AppData {
  peer_id: string;
  direction: Direction;
  [key: string]: unknown;
}
