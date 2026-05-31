"use client";

import { useState } from "react";

const languages = ["English", "French", "Twi"];

export function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("Language");

  return (
    <div className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-2xl font-black"
        aria-expanded={open}
      >
        {language}
      </button>
      {open ? (
        <div className="absolute right-0 mt-3 w-44 overflow-hidden rounded-lg border border-white/20 bg-zinc-950/95 p-2 shadow-2xl">
          {languages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setLanguage(item);
                setOpen(false);
              }}
              className="block w-full rounded-md px-3 py-2 text-left text-sm font-bold text-white hover:bg-white/10"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
