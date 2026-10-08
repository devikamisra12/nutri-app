import { z } from "zod";

// Zod Schema for strict runtime validation
export const claimSchema = z.object({
  claim: z.string(),
  source: z.string().nullable(),
});

export const assistantResponseSchema = z.object({
  answer: z.string(),
  claims: z.array(claimSchema),
});

// TypeScript Types
export type Claim = z.infer<typeof claimSchema>;
export type AssistantResponse = z.infer<typeof assistantResponseSchema>;

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  structured_response: string | null; // Stored as stringified JSON
  created_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}
