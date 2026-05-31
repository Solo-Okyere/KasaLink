import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./supabase-server";
import type { Profile } from "./database.types";

export async function getCurrentUserProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single<Profile>();

  return { user, profile };
}

export async function requireUser() {
  const context = await getCurrentUserProfile();
  if (!context.user) redirect("/login");
  return context;
}

export function isConfiguredAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(email && adminEmails.includes(email.toLowerCase()));
}

export function canAccessAdmin(profile?: Profile | null) {
  return profile?.role === "admin" || isConfiguredAdmin(profile?.email);
}

export async function requireActiveUser() {
  const context = await requireUser();
  if (!context.profile) {
    redirect("/onboarding");
  }
  if (context.profile.approval_status === "suspended") {
    redirect("/pending");
  }
  return context as typeof context & { profile: Profile };
}

export async function requireAdmin() {
  const context = await requireActiveUser();
  if (!canAccessAdmin(context.profile)) {
    redirect("/discover");
  }
  return context;
}
