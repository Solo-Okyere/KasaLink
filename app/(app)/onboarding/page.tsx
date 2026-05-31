import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase-admin";

export default async function OnboardingPage() {
  const { user, profile } = await requireUser();
  const service = createServiceClient();
  const { data } = await service
    .from("user_interests")
    .select("interests(name)")
    .eq("user_id", user.id);

  const selectedInterests = (data ?? []).map((row: any) => row.interests?.name).filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Profile</p>
        <h1 className="mt-2 text-3xl font-bold">Set your vibe</h1>
      </div>
      <ProfileForm profile={profile} selectedInterests={selectedInterests} />
    </div>
  );
}
