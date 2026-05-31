import { NextResponse, type NextRequest } from "next/server";
import { requireActiveUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(_: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  const { user } = await requireActiveUser();
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("saved_messages")
    .upsert({ message_id: messageId, user_id: user.id }, { onConflict: "message_id,user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
