import type { User } from "./user.js";

export interface Room {
  _id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  members_count: number;
  visibility: RoomVisibility;
  creator: User;
  status: RoomStatus;
}

export interface ChatMessage {
  _id: string;
  content: string;
  creator: User;
  created_at: string;
}

export type RoomVisibility = "private" | "public";

export type RoomStatus = "protected" | "unprotected";
