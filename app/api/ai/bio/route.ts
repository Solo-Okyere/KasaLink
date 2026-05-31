import { NextResponse, type NextRequest } from "next/server";
import { requireActiveUser } from "@/lib/auth";
import { runAiRequest } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const { user, profile } = await requireActiveUser();
  const body = await request.json().catch(() => ({}));
  const text = await runAiRequest({
    userId: user.id,
    feature: "bio",
    system: "You improve short campus social profile bios. Keep the user's voice, stay warm, concise, and safe.",
    prompt: `Rewrite this UniVibe bio in 45 words or less. Intent: ${profile.match_intent}. Traits: ${(profile.personality_traits ?? []).join(", ")}. Draft: ${body.bio ?? profile.bio ?? ""}`
  });
  return NextResponse.json({ text });
}
