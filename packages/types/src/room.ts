export interface Room {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  _id: string;
  text: string;
  creator: {
    _id: string;
    display_name: string;
  };
  created_at: string;
}
