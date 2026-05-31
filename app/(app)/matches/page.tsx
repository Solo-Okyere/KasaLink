import Link from "next/link";
import { MessageCircle, ShieldAlert } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { reportUserAction } from "@/lib/actions";
import { requireActiveUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase-admin";
import { initials } from "@/lib/utils";

export default async function MatchesPage() {
  const { user } = await requireActiveUser();
  const service = createServiceClient();
  const { data: chats } = await service
    .from("chats")
    .select("id, created_at, user_a, user_b, matches(compatibility_score)")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const otherIds = (chats ?? []).map((chat) => (chat.user_a === user.id ? chat.user_b : chat.user_a));
  const { data: profiles } = otherIds.length
    ? await service.from("profiles").select("*").in("user_id", otherIds)
    : { data: [] };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Matches</p>
        <h1 className="mt-2 text-3xl font-bold">People who chose you back</h1>
      </div>
      <div className="grid gap-4">
        {(chats ?? []).map((chat: any) => {
          const otherId = chat.user_a === user.id ? chat.user_b : chat.user_a;
          const profile = profiles?.find((item: any) => item.user_id === otherId);
          return (
            <Card key={chat.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary font-bold text-secondary-foreground">
                    {initials(profile?.display_name ?? profile?.username)}
                  </div>
                  <div>
                    <h2 className="font-semibold">{profile?.display_name ?? profile?.username ?? "Campus match"}</h2>
                    <p className="text-sm text-muted-foreground">{profile?.match_intent ?? "both"}</p>
                    <Badge className="mt-2">Compatibility {chat.matches?.compatibility_score ?? 0}%</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:w-72">
                  <Button asChild>
                    <Link href={`/chat/${chat.id}`}><MessageCircle size={18} /> Open chat</Link>
                  </Button>
                  <form action={reportUserAction} className="flex gap-2">
                    <input type="hidden" name="reported_id" value={otherId} />
                    <Input name="reason" placeholder="Report reason" />
                    <Button variant="outline" size="icon" title="Report user"><ShieldAlert size={18} /></Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!chats?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>No matches yet</CardTitle>
              <CardDescription>Keep discovering. Mutual likes will appear here automatically.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
