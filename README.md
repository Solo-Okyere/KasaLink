# UniVibe

UniVibe is a web-first social and matching MVP for users who want low-pressure, meaningful connections. It combines interest-based discovery, optional pre-match anonymity, realtime chat, disappearing messages, moderation, and AI-assisted conversation support.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS with shadcn-style primitives
- Supabase Auth, Postgres, Realtime, Storage, and RLS
- OpenAI Responses API for assistive writing

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Fill in Supabase and OpenAI values.
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Start the app with `npm run dev`.

## First Admin

Admin access can be granted either by setting `ADMIN_EMAILS` in `.env.local` or by promoting a profile manually in Supabase:

```sql
update public.profiles
set role = 'admin', approval_status = 'approved'
where email = 'your-email@example.com';
```

## MVP Notes

- Users sign up with personal email and can access the app after email authentication.
- Approved users can discover, match, chat, save messages, and report users.
- Chat messages are hidden after 24 hours unless saved by the current user.
- AI endpoints return fallback suggestions when `OPENAI_API_KEY` is missing.
