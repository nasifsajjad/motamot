-- ==========================================
-- Motamot database schema
-- Run in Supabase SQL editor or via migrations
-- ==========================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ========== USERS ==========
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email        text,
  provider     text default 'email',
  avatar_url   text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);
alter table public.users enable row level security;

create policy "Users are viewable by everyone" on public.users
  for select using (true);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- ========== POSTS ==========
create table if not exists public.posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  body             text not null,
  excerpt          text not null default '',
  language         text not null check (language in ('en', 'bn')) default 'en',
  author_id        uuid not null references public.users(id) on delete cascade,
  type             text not null check (type in ('problem', 'sharing')) default 'sharing',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  published        boolean not null default true,
  net_votes        integer not null default 0,
  upvotes_count    integer not null default 0,
  downvotes_count  integer not null default 0
);
create index if not exists posts_slug_idx on public.posts(slug);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_net_votes_idx on public.posts(net_votes desc);
create index if not exists posts_published_idx on public.posts(published);

alter table public.posts enable row level security;

create policy "Published posts visible to everyone" on public.posts
  for select using (published = true);

create policy "Authors can view own posts" on public.posts
  for select using (auth.uid() = author_id);

create policy "Authenticated users can insert posts" on public.posts
  for insert with check (auth.uid() = author_id);

create policy "Authors can update own posts" on public.posts
  for update using (auth.uid() = author_id);

-- ========== TRANSLATIONS ==========
create table if not exists public.translations (
  id                   uuid primary key default gen_random_uuid(),
  post_id              uuid references public.posts(id) on delete cascade,
  comment_id           uuid,
  language             text not null check (language in ('en', 'bn')),
  text                 text not null,
  translator_user_id   uuid references public.users(id) on delete set null,
  created_at           timestamptz not null default now()
);
create index if not exists translations_post_idx on public.translations(post_id, language);

alter table public.translations enable row level security;

create policy "Translations viewable by everyone" on public.translations
  for select using (true);

create policy "Authenticated users can insert translations" on public.translations
  for insert with check (auth.uid() is not null);

-- ========== COMMENTS ==========
create table if not exists public.comments (
  id                 uuid primary key default gen_random_uuid(),
  post_id            uuid not null references public.posts(id) on delete cascade,
  parent_comment_id  uuid references public.comments(id) on delete cascade,
  author_id          uuid not null references public.users(id) on delete cascade,
  body               text not null,
  language           text not null check (language in ('en', 'bn')) default 'en',
  created_at         timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments(post_id, created_at);

alter table public.comments enable row level security;

create policy "Comments viewable by everyone" on public.comments
  for select using (true);

create policy "Authenticated users can insert comments" on public.comments
  for insert with check (auth.uid() = author_id);

-- ========== VOTES ==========
create table if not exists public.votes (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid references public.posts(id) on delete cascade,
  comment_id   uuid references public.comments(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  vote         smallint not null check (vote in (1, -1)),
  created_at   timestamptz not null default now(),
  unique (post_id, user_id),
  unique (comment_id, user_id)
);
create index if not exists votes_post_user_idx on public.votes(post_id, user_id);

alter table public.votes enable row level security;

create policy "Users can view own votes" on public.votes
  for select using (auth.uid() = user_id);

create policy "Authenticated users can insert votes" on public.votes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own votes" on public.votes
  for update using (auth.uid() = user_id);

create policy "Users can delete own votes" on public.votes
  for delete using (auth.uid() = user_id);

-- ========== REPORTS ==========
create table if not exists public.reports (
  id                  uuid primary key default gen_random_uuid(),
  target_type         text not null check (target_type in ('post', 'comment')),
  target_id           uuid not null,
  reporter_user_id    uuid not null references public.users(id) on delete cascade,
  reason              text not null,
  resolved            boolean not null default false,
  created_at          timestamptz not null default now()
);
create index if not exists reports_created_at_idx on public.reports(created_at desc);

alter table public.reports enable row level security;

create policy "Admins can view reports" on public.reports
  for select using (
    exists (
      select 1 from public.users where id = auth.uid() and is_admin = true
    )
  );

create policy "Authenticated users can insert reports" on public.reports
  for insert with check (auth.uid() = reporter_user_id);

-- ========== UPDATED AT TRIGGER ==========
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();

-- ========== ADMIN POLICY FOR POSTS ==========
create policy "Admins can do anything to posts" on public.posts
  using (
    exists (
      select 1 from public.users where id = auth.uid() and is_admin = true
    )
  );
