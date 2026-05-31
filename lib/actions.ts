"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "./supabase-admin";
import { createServerSupabaseClient } from "./supabase-server";
import { profileSchema, signInSchema, signUpSchema } from "./validation";
import type { Profile } from "./database.types";
import { requireAdmin } from "./auth";

function formValues(formData: FormData, key: string) {
  return formData.getAll(key).map(String).filter(Boolean);
}

export async function signUpAction(_: { error?: string }, formData: FormData) {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid signup details" };

  try {
    const service = createServiceClient();
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true
    });

    if (createError) {
      if (createError.message.toLowerCase().includes("already")) {
        return { error: "An account already exists for this email. Please log in instead." };
      }
      return { error: createError.message };
    }

    if (created.user) {
      await service.from("profiles").upsert({
        user_id: created.user.id,
        email: parsed.data.email,
        approval_status: "approved",
        role: "user"
      }, { onConflict: "user_id" });
    }

    const supabase = await createServerSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password
    });
    if (signInError) {
      return { error: "Account created, but automatic login failed. Please log in with the same email and password." };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create account" };
  }

  redirect("/onboarding");
}

export async function signInAction(_: { error?: string }, formData: FormData) {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid login details" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username,bio")
      .eq("user_id", user.id)
      .single();

    if (!profile?.username || !profile?.bio) {
      redirect("/onboarding");
    }
  }

  redirect("/discover");
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveProfileAction(_: { error?: string }, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = profileSchema.safeParse({
    username: formData.get("username"),
    display_name: formData.get("display_name"),
    bio: formData.get("bio"),
    photo_url: formData.get("photo_url") ?? "",
    match_intent: formData.get("match_intent"),
    anonymous_before_match: formData.get("anonymous_before_match") === "on",
    hobbies: formData.get("hobbies"),
    entertainment: formData.get("entertainment"),
    interests: formValues(formData, "interests"),
    personality_traits: formValues(formData, "personality_traits")
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid profile details" };

  const { interests, ...profile } = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .upsert({
      user_id: user.id,
      email: user.email ?? "",
      approval_status: "approved",
      role: "user",
      ...profile,
      photo_url: profile.photo_url || null,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });

  if (error) return { error: error.message };

  const service = createServiceClient();
  await service.from("interests").upsert(interests.map((name) => ({ name })), { onConflict: "name" });
  const { data: rows } = await service.from("interests").select("id,name").in("name", interests);
  await service.from("user_interests").delete().eq("user_id", user.id);
  if (rows?.length) {
    await service.from("user_interests").insert(rows.map((interest) => ({ user_id: user.id, interest_id: interest.id })));
  }

  revalidatePath("/discover");
  redirect("/discover");
}

async function compatibilityScore(currentUserId: string, candidateId: string) {
  const service = createServiceClient();
  const [{ data: profiles }, { data: interests }] = await Promise.all([
    service.from("profiles").select("user_id, match_intent, personality_traits").in("user_id", [currentUserId, candidateId]),
    service
      .from("user_interests")
      .select("user_id, interests(name)")
      .in("user_id", [currentUserId, candidateId])
  ]);

  const mine = profiles?.find((profile) => profile.user_id === currentUserId) as Pick<Profile, "match_intent" | "personality_traits"> | undefined;
  const theirs = profiles?.find((profile) => profile.user_id === candidateId) as Pick<Profile, "match_intent" | "personality_traits"> | undefined;
  const myInterests = new Set((interests ?? []).filter((row) => row.user_id === currentUserId).map((row: any) => row.interests?.name));
  const theirInterests = new Set((interests ?? []).filter((row) => row.user_id === candidateId).map((row: any) => row.interests?.name));
  const sharedInterests = [...myInterests].filter((name) => theirInterests.has(name)).length;
  const sharedTraits = (mine?.personality_traits ?? []).filter((trait) => (theirs?.personality_traits ?? []).includes(trait)).length;
  const intentMatch = mine?.match_intent === "both" || theirs?.match_intent === "both" || mine?.match_intent === theirs?.match_intent;
  return Math.min(100, sharedInterests * 18 + sharedTraits * 8 + (intentMatch ? 25 : 0));
}

export async function swipeAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const swipedId = String(formData.get("swiped_id"));
  const direction = String(formData.get("direction"));
  if (!swipedId || !["like", "pass"].includes(direction)) return;

  await supabase.from("swipes").upsert({
    swiper_id: user.id,
    swiped_id: swipedId,
    direction
  }, { onConflict: "swiper_id,swiped_id" });

  if (direction === "like") {
    const service = createServiceClient();
    const { data: reciprocal } = await service
      .from("swipes")
      .select("id")
      .eq("swiper_id", swipedId)
      .eq("swiped_id", user.id)
      .eq("direction", "like")
      .maybeSingle();

    if (reciprocal) {
      const [userA, userB] = [user.id, swipedId].sort();
      const score = await compatibilityScore(user.id, swipedId);
      const { data: match } = await service
        .from("matches")
        .upsert({ user_a: userA, user_b: userB, compatibility_score: score }, { onConflict: "user_a,user_b" })
        .select("id,user_a,user_b")
        .single();
      if (match) {
        await service.from("chats").upsert({
          match_id: match.id,
          user_a: match.user_a,
          user_b: match.user_b
        }, { onConflict: "match_id" });
      }
    }
  }

  revalidatePath("/discover");
}

export async function sendMessageAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const chatId = String(formData.get("chat_id"));
  const content = String(formData.get("content") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  if (!content && !imageUrl) return;

  await supabase.from("messages").insert({
    chat_id: chatId,
    sender_id: user.id,
    content: content || null,
    image_url: imageUrl || null
  });
  revalidatePath(`/chat/${chatId}`);
}

export async function deleteMessageAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("message_id"));
  const chatId = String(formData.get("chat_id"));
  await supabase.from("messages").update({ deleted_at: new Date().toISOString(), content: null, image_url: null }).eq("id", id);
  revalidatePath(`/chat/${chatId}`);
}

export async function editMessageAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("message_id"));
  const chatId = String(formData.get("chat_id"));
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;
  await supabase.from("messages").update({ content, is_edited: true }).eq("id", id);
  revalidatePath(`/chat/${chatId}`);
}

export async function saveMessageAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const messageId = String(formData.get("message_id"));
  const chatId = String(formData.get("chat_id"));
  await supabase.from("saved_messages").upsert({ message_id: messageId, user_id: user.id }, { onConflict: "message_id,user_id" });
  revalidatePath(`/chat/${chatId}`);
}

export async function reportUserAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const reportedId = String(formData.get("reported_id"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reportedId || !reason) return;
  await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: reportedId,
    reason
  });
  revalidatePath("/matches");
}

export async function adminProfileAction(formData: FormData) {
  const { user } = await requireAdmin();

  const target = String(formData.get("target_user_id"));
  const status = String(formData.get("approval_status"));
  if (!["pending_approval", "approved", "rejected", "suspended"].includes(status)) return;
  const service = createServiceClient();
  await service.from("profiles").update({ approval_status: status }).eq("user_id", target);
  await service.from("admin_actions").insert({
    admin_id: user.id,
    target_user_id: target,
    action: `set_status:${status}`,
    notes: String(formData.get("notes") ?? "")
  });
  revalidatePath("/admin");
}

export async function updateReportStatusAction(formData: FormData) {
  await requireAdmin();
  const reportId = String(formData.get("report_id"));
  const status = String(formData.get("status"));
  if (!["open", "reviewing", "resolved", "dismissed"].includes(status)) return;
  const service = createServiceClient();
  await service.from("reports").update({ status }).eq("id", reportId);
  revalidatePath("/admin");
}
