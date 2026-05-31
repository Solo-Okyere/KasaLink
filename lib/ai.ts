import { createServiceClient } from "./supabase-admin";

type AiRequest = {
  userId: string;
  feature: "bio" | "reply" | "opener";
  system: string;
  prompt: string;
};

export async function runAiRequest({ userId, feature, system, prompt }: AiRequest) {
  const service = createServiceClient();
  await service.from("ai_activity_logs").insert({
    user_id: userId,
    feature,
    prompt_summary: prompt.slice(0, 240)
  });

  if (!process.env.OPENAI_API_KEY) {
    return fallbackText(feature);
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      max_output_tokens: 220
    })
  });

  if (!response.ok) {
    return fallbackText(feature);
  }

  const data = await response.json();
  const text = data.output_text;
  if (typeof text === "string" && text.trim()) return text.trim();

  const nested = data.output?.[0]?.content?.[0]?.text;
  return typeof nested === "string" && nested.trim() ? nested.trim() : fallbackText(feature);
}

function fallbackText(feature: AiRequest["feature"]) {
  if (feature === "bio") return "I’m into meaningful conversations, shared interests, and meeting people at a comfortable pace.";
  if (feature === "opener") return "You both seem to have similar interests. Ask what got them into one of those interests recently.";
  return "That sounds interesting. Tell me more about what made you think of that.";
}
