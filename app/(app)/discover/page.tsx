import Image from "next/image";
import { Heart, MessageCircle, Sparkles, UserRoundSearch, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { swipeAction } from "@/lib/actions";
import { requireActiveUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase-admin";
import { initials } from "@/lib/utils";
import type { Profile } from "@/lib/database.types";

type Candidate = Profile & { interests?: { name: string }[] };

export default async function DiscoverPage() {
  const { user, profile } = await requireActiveUser();
  if (!profile.username || !profile.bio) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h1 className="text-2xl font-bold">Finish your profile first</h1>
            <p className="text-muted-foreground">Add your interests and intro so UniVibe can make better matches.</p>
            <Button asChild><a href="/onboarding">Complete profile</a></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const service = createServiceClient();
  const { data: swipes } = await service.from("swipes").select("swiped_id").eq("swiper_id", user.id);
  const excluded = [user.id, ...(swipes ?? []).map((swipe) => swipe.swiped_id)];
  const { data: candidates } = await service
    .from("profiles")
    .select("*")
    .neq("approval_status", "suspended")
    .not("user_id", "in", `(${excluded.join(",")})`)
    .limit(12);

  const candidate = (candidates?.[0] ?? null) as Candidate | null;
  const { data: interestRows } = candidate
    ? await service.from("user_interests").select("interests(name)").eq("user_id", candidate.user_id)
    : { data: [] };
  const interestNames = (interestRows ?? []).map((row: any) => row.interests?.name).filter(Boolean);
  const hidden = false;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Discover</p>
        <h1 className="mt-2 text-3xl font-bold">Swipe with context</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Profiles prioritize interests, intent, and personality before pressure.</p>
        {candidate ? (
          <Card className="mt-6 overflow-hidden">
            <div className="relative h-80 bg-muted">
              {candidate.photo_url && !hidden ? (
                <Image src={candidate.photo_url} alt="" fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-100 via-rose-100 to-amber-100 text-6xl font-black text-primary">
                  {initials(candidate.display_name ?? candidate.username)}
                </div>
              )}
            </div>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="text-2xl font-bold">{candidate.display_name}</h2>
                <p className="text-sm text-muted-foreground">{candidate.match_intent}</p>
              </div>
              <p className="leading-7">{candidate.bio}</p>
              <div className="flex flex-wrap gap-2">
                {interestNames.map((interest) => <Badge key={interest}>{interest}</Badge>)}
                {candidate.personality_traits?.map((trait) => <Badge key={trait} className="bg-accent">{trait}</Badge>)}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <form action={swipeAction}>
                  <input type="hidden" name="swiped_id" value={candidate.user_id} />
                  <input type="hidden" name="direction" value="pass" />
                  <Button variant="outline" className="w-full"><X size={18} /> Pass</Button>
                </form>
                <form action={swipeAction}>
                  <input type="hidden" name="swiped_id" value={candidate.user_id} />
                  <input type="hidden" name="direction" value="like" />
                  <Button className="w-full"><Heart size={18} /> Like</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <UserRoundSearch size={26} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">No profiles to discover yet</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Discovery needs at least one other active user with a completed profile. Create another test account, ask someone else to join, or add demo users in Supabase.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a href="/onboarding"><Sparkles size={18} /> Review my profile</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/signup">Create test account</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
      <aside className="rounded-lg border bg-white/80 p-5">
        <MessageCircle className="text-primary" />
        <h2 className="mt-4 font-semibold">AI help is available in chats</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Once you match, UniVibe can suggest openers and replies without sending messages for you.
        </p>
      </aside>
    </div>
  );
}
