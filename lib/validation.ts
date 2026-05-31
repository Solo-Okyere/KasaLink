import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const profileSchema = z.object({
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  display_name: z.string().min(2).max(60),
  bio: z.string().min(20).max(300),
  photo_url: z.string().url().optional().or(z.literal("")),
  match_intent: z.enum(["friendship", "relationship", "both"]),
  anonymous_before_match: z.boolean().default(true),
  hobbies: z.string().max(200).optional(),
  entertainment: z.string().max(200).optional(),
  interests: z.array(z.string()).min(3).max(10),
  personality_traits: z.array(z.string()).min(2).max(8)
});
