import { NextResponse, type NextRequest } from "next/server";
import { replyModes } from "@/lib/constants";
import { requireActiveUser } from "@/lib/auth";
import { runAiRequest } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const { user } = await requireActiveUser();
  const body = await request.json().catch(() => ({}));
  const mode = replyModes.includes(body.mode) ? body.mode : "friendly";
  const text = await runAiRequest({
    userId: user.id,
    feature: "reply",
    system: "You suggest replies for a campus social app. Never impersonate the user; provide drafts only.",
    prompt: `Suggest three ${mode} replies to this message. Keep them natural, respectful, and under 22 words each: ${body.message ?? ""}`
  });
  return NextResponse.json({ text, mode });
}
