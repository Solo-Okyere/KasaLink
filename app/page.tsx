import Link from "next/link";
import { LanguageMenu } from "@/components/language-menu";
import { Sparkles } from "@/components/icons";

const profileCards = [
  { name: "Belle", age: 19, img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=420&q=80", left: "-5%", top: "20%", rotate: "-18deg" },
  { name: "Mary", age: 18, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=420&q=80", left: "15%", top: "19%", rotate: "13deg" },
  { name: "Irene", age: 22, img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=420&q=80", left: "35%", top: "-2%", rotate: "16deg" },
  { name: "Lauren", age: 23, img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=420&q=80", left: "55%", top: "5%", rotate: "-15deg" },
  { name: "Justin", age: 23, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=420&q=80", left: "72%", top: "18%", rotate: "14deg" },
  { name: "Dalia", age: 23, img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=420&q=80", left: "88%", top: "18%", rotate: "-15deg" },
  { name: "Kojo", age: 21, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=420&q=80", left: "4%", top: "66%", rotate: "15deg" },
  { name: "Mina", age: 20, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=420&q=80", left: "28%", top: "63%", rotate: "-12deg" },
  { name: "Theo", age: 24, img: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=420&q=80", left: "62%", top: "64%", rotate: "12deg" },
  { name: "Naa", age: 22, img: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=420&q=80", left: "82%", top: "63%", rotate: "-13deg" }
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d0e10] text-white">
      <section className="relative min-h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-black">
          {profileCards.map((card) => (
            <div
              key={`${card.name}-${card.left}`}
              className="absolute h-[29rem] w-64 overflow-hidden rounded-[2.3rem] border-[12px] border-[#101114] bg-zinc-900 shadow-2xl shadow-black/80"
              style={{ left: card.left, top: card.top, transform: `rotate(${card.rotate})` }}
            >
              <div className="relative h-full w-full">
                <img src={card.img} alt="" className="h-full w-full object-cover" />
                <div className="absolute left-0 right-0 top-0 h-8 bg-[#101114]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent p-4 pt-28">
                  <p className="text-xl font-black text-white">
                    {card.name} <span className="text-sm font-bold">{card.age}</span>
                  </p>
                  <div className="mt-4 flex items-center justify-between rounded-full bg-white/85 px-4 py-2 text-xs font-black text-zinc-700">
                    <span className="text-yellow-500">Undo</span>
                    <span className="text-rose-500">No</span>
                    <span className="text-sky-500">Star</span>
                    <span className="text-emerald-500">Like</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute inset-0 bg-black/58" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/40" />
        </div>

        <header className="relative z-10 flex items-center justify-between px-6 py-7 lg:px-9">
          <Link href="/" className="flex items-center gap-2 text-4xl font-black tracking-normal">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-orange-400">
              <Sparkles size={22} />
            </span>
            UniVibe
          </Link>

          <div className="flex items-center gap-7">
            <LanguageMenu />
            <Link href="/login" className="rounded-full bg-white px-10 py-4 text-2xl font-black text-zinc-900 shadow-xl">
              Log in
            </Link>
          </div>
        </header>

        <div className="relative z-10 flex min-h-[58vh] flex-col items-center justify-center px-6 text-center">
          <h1 className="text-6xl font-black leading-none tracking-normal sm:text-8xl lg:text-[8.5rem]">
            Swipe Right
          </h1>
          <Link
            href="/signup"
            className="mt-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-9 py-4 text-2xl font-black text-white shadow-2xl shadow-black/30"
          >
            Create account
          </Link>
        </div>
      </section>

      <section className="relative z-20 bg-[#101113] px-6 py-7">
        <div className="mx-auto grid max-w-5xl gap-5 text-zinc-300 lg:grid-cols-[1fr_auto] lg:items-center">
          <p className="max-w-4xl text-lg font-semibold leading-7">
            We value your privacy. UniVibe uses essential tools to keep your account secure, improve matching, and support AI-powered conversation features. You can update your choices any time in settings.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="rounded-full border border-zinc-600 px-7 py-3 text-xl font-black text-white">
              I accept
            </button>
            <button type="button" className="rounded-full border border-zinc-600 px-7 py-3 text-xl font-black text-white">
              I decline
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
