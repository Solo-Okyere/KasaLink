export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ApprovalStatus = "pending_approval" | "approved" | "rejected" | "suspended";
export type MatchIntent = "friendship" | "relationship" | "both";

export type Profile = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  photo_url: string | null;
  email: string;
  approval_status: ApprovalStatus;
  role: "user" | "admin";
  match_intent: MatchIntent | null;
  anonymous_before_match: boolean;
  hobbies: string | null;
  entertainment: string | null;
  personality_traits: string[];
  created_at: string;
  updated_at: string;
};

export type Interest = {
  id: string;
  name: string;
};

export type Match = {
  id: string;
  user_a: string;
  user_b: string;
  compatibility_score: number;
  created_at: string;
};

export type Chat = {
  id: string;
  match_id: string;
  user_a: string;
  user_b: string;
  created_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  is_edited: boolean;
  deleted_at: string | null;
  expires_at: string;
  created_at: string;
};
