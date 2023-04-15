import type { User } from "./user";

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

export enum RoomVisibility {
  PRIVATE = "private",
  PUBLIC = "public"
}

export enum RoomStatus {
  PROTECTED = "protected",
  UNPROTECTED = "unprotected"
}
