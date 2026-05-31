import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <section className="grid w-full gap-8 lg:grid-cols-[1fr_26rem] lg:items-center">
          <div className="max-w-2xl">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest text-primary">
              UniVibe
            </Link>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Meet campus people with less pressure and better context.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Verified students, shared interests, optional anonymity, realtime chat, and AI help when the first message feels harder than it should.
            </p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
