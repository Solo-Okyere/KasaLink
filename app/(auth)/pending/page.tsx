import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function PendingPage() {
  const { profile } = await getCurrentUserProfile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account suspended</CardTitle>
        <CardDescription>
          This account cannot access UniVibe right now.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-4 text-sm">
          <p>Status: <span className="font-semibold">{profile?.approval_status ?? "unavailable"}</span></p>
          <p className="mt-1 text-muted-foreground">{profile?.email}</p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">Return to login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
