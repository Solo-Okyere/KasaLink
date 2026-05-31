import { NextResponse, type NextRequest } from "next/server";
import { requireActiveUser } from "@/lib/auth";
import { runAiRequest } from "@/lib/ai";
import { createServiceClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const { user, profile } = await requireActiveUser();
  const body = await request.json().catch(() => ({}));
  const otherUserId = String(body.user_id ?? "");
  const service = createServiceClient();
  const { data: other } = otherUserId
    ? await service.from("profiles").select("bio, match_intent, hobbies, entertainment, personality_traits").eq("user_id", otherUserId).single()
    : { data: null };

  const text = await runAiRequest({
    userId: user.id,
    feature: "opener",
    system: "You create gentle conversation starters for a social matching app. Keep it low-pressure and specific.",
    prompt: `Create five opening message ideas. My profile: ${profile.bio}. Their profile: ${other?.bio ?? body.profile ?? ""}. Their traits: ${(other?.personality_traits ?? []).join(", ")}.`
  });
  return NextResponse.json({ text });
}
