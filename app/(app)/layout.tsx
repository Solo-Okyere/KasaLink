import Link from "next/link";
import { MessageCircle, ShieldCheck, Sparkles, UserRoundSearch } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions";
import { canAccessAdmin, requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <main className="shell-grid min-h-screen">
      <aside className="border-r bg-white/75 p-4 backdrop-blur">
        <div className="mb-8">
          <Link href="/discover" className="text-xl font-black text-primary">UniVibe</Link>
          <p className="mt-1 text-xs text-muted-foreground">Social matching</p>
        </div>
        <nav className="grid gap-2 text-sm">
          <Link className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted" href="/discover"><UserRoundSearch size={17} /> Discover</Link>
          <Link className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted" href="/matches"><MessageCircle size={17} /> Matches</Link>
          <Link className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted" href="/onboarding"><Sparkles size={17} /> Profile</Link>
          {canAccessAdmin(profile) ? (
            <Link className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted" href="/admin"><ShieldCheck size={17} /> Admin</Link>
          ) : null}
        </nav>
        <form action={signOutAction} className="mt-8">
          <Button variant="outline" className="w-full">Sign out</Button>
        </form>
      </aside>
      <section className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</section>
    </main>
  );
}
