-- Ejecutar en Supabase → SQL Editor
-- Tabla usada por el webhook de Instagram y la API /api/instagram/webhook/events

create table if not exists public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  media_id text not null unique,
  caption text,
  media_url text,
  permalink text,
  created_at timestamptz not null default now()
);

create index if not exists instagram_posts_created_at_idx
  on public.instagram_posts (created_at desc);

alter table public.instagram_posts enable row level security;

-- Lectura pública para la web
drop policy if exists "instagram_posts_public_read" on public.instagram_posts;
create policy "instagram_posts_public_read"
  on public.instagram_posts
  for select
  using (true);

-- El webhook escribe con SUPABASE_SERVICE_ROLE_KEY (bypass RLS).
-- No se definen políticas de INSERT/UPDATE para evitar escrituras con anon key.
