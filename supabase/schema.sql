create extension if not exists "pgcrypto";

create type approval_status as enum ('pending_approval', 'approved', 'rejected', 'suspended');
create type user_role as enum ('user', 'admin');
create type match_intent as enum ('friendship', 'relationship', 'both');
create type swipe_direction as enum ('like', 'pass');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  photo_url text,
  email text not null,
  approval_status approval_status not null default 'approved',
  role user_role not null default 'user',
  match_intent match_intent,
  anonymous_before_match boolean not null default true,
  hobbies text,
  entertainment text,
  personality_traits text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.user_interests (
  user_id uuid references public.profiles(user_id) on delete cascade,
  interest_id uuid references public.interests(id) on delete cascade,
  primary key (user_id, interest_id)
);

create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid references public.profiles(user_id) on delete cascade not null,
  swiped_id uuid references public.profiles(user_id) on delete cascade not null,
  direction swipe_direction not null,
  created_at timestamptz not null default now(),
  unique (swiper_id, swiped_id),
  check (swiper_id <> swiped_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references public.profiles(user_id) on delete cascade not null,
  user_b uuid references public.profiles(user_id) on delete cascade not null,
  compatibility_score integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade not null unique,
  user_a uuid references public.profiles(user_id) on delete cascade not null,
  user_b uuid references public.profiles(user_id) on delete cascade not null,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id uuid references public.profiles(user_id) on delete cascade not null,
  content text,
  image_url text,
  is_edited boolean not null default false,
  deleted_at timestamptz,
  expires_at timestamptz not null default now() + interval '24 hours',
  created_at timestamptz not null default now(),
  check (content is not null or image_url is not null)
);

create table public.saved_messages (
  message_id uuid references public.messages(id) on delete cascade,
  user_id uuid references public.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(user_id) on delete cascade not null,
  reported_id uuid references public.profiles(user_id) on delete cascade not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.blocks (
  blocker_id uuid references public.profiles(user_id) on delete cascade,
  blocked_id uuid references public.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(user_id) on delete set null,
  target_user_id uuid references public.profiles(user_id) on delete cascade,
  action text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.ai_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  feature text not null,
  prompt_summary text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin' and approval_status <> 'suspended'
  );
$$;

create or replace function public.is_chat_member(chat_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.chats
    where id = chat_uuid and auth.uid() in (user_a, user_b)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (
    new.id,
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.role() = 'service_role' then
    return new;
  end if;

  new.role = old.role;
  new.approval_status = old.approval_status;
  new.email = old.email;
  return new;
end;
$$;

create trigger prevent_profile_privilege_escalation
before update on public.profiles
for each row execute procedure public.prevent_profile_privilege_escalation();

alter table public.profiles enable row level security;
alter table public.interests enable row level security;
alter table public.user_interests enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.saved_messages enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.admin_actions enable row level security;
alter table public.ai_activity_logs enable row level security;

create policy "profiles visible to active users" on public.profiles
for select using (auth.uid() = user_id or public.is_admin() or approval_status <> 'suspended');
create policy "users update own profile" on public.profiles
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins update profiles" on public.profiles
for update using (public.is_admin()) with check (public.is_admin());

create policy "interests readable" on public.interests for select using (true);
create policy "own interests readable" on public.user_interests for select using (auth.uid() = user_id or public.is_admin());
create policy "own interests writable" on public.user_interests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own swipes readable" on public.swipes for select using (auth.uid() = swiper_id);
create policy "own swipes writable" on public.swipes for insert with check (auth.uid() = swiper_id);

create policy "matches for members" on public.matches for select using (auth.uid() in (user_a, user_b) or public.is_admin());
create policy "chats for members" on public.chats for select using (auth.uid() in (user_a, user_b) or public.is_admin());

create policy "messages for chat members" on public.messages
for select using (public.is_chat_member(chat_id));
create policy "chat members send messages" on public.messages
for insert with check (auth.uid() = sender_id and public.is_chat_member(chat_id));
create policy "senders edit messages" on public.messages
for update using (auth.uid() = sender_id) with check (auth.uid() = sender_id);

create policy "saved messages for owner" on public.saved_messages
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users create reports" on public.reports
for insert with check (auth.uid() = reporter_id);
create policy "admins manage reports" on public.reports
for all using (public.is_admin()) with check (public.is_admin());

create policy "users manage own blocks" on public.blocks
for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

create policy "admins see actions" on public.admin_actions for select using (public.is_admin());
create policy "admins write actions" on public.admin_actions for insert with check (public.is_admin());

create policy "own ai logs" on public.ai_activity_logs for select using (auth.uid() = user_id or public.is_admin());
create policy "own ai log inserts" on public.ai_activity_logs for insert with check (auth.uid() = user_id);

insert into public.interests (name) values
('Music'), ('Gaming'), ('Coding'), ('Reading'), ('Sports'), ('Movies'), ('Art'), ('Traveling'),
('Fashion'), ('Food'), ('Faith'), ('Entrepreneurship'), ('Anime'), ('Fitness'), ('Volunteering')
on conflict (name) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true),
       ('chat-images', 'chat-images', true)
on conflict (id) do nothing;

create policy "users upload profile photos" on storage.objects
for insert with check (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users update profile photos" on storage.objects
for update using (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users delete profile photos" on storage.objects
for delete using (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "profile photos public read" on storage.objects
for select using (bucket_id = 'profile-photos');

create policy "chat members upload chat images" on storage.objects
for insert with check (bucket_id = 'chat-images' and auth.role() = 'authenticated');

create policy "chat images authenticated read" on storage.objects
for select using (bucket_id = 'chat-images' and auth.role() = 'authenticated');

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
