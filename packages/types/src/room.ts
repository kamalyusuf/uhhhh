import { User } from "./user";

export interface Room {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  members_count: number;
}

export interface ChatMessage {
  _id: string;
  content: string;
  creator: User;
  created_at: string;
}
