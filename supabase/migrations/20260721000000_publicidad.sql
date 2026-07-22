create table if not exists public.publicidad (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('banner', 'video')),
  file_name text not null,
  file_url text not null,
  destino text not null,
  content_type text,
  created_at timestamptz default now()
);

alter table public.publicidad enable row level security;

drop policy if exists "publicidad_public_read" on public.publicidad;
create policy "publicidad_public_read"
  on public.publicidad
  for select
  using (true);

drop policy if exists "publicidad_public_insert" on public.publicidad;
create policy "publicidad_public_insert"
  on public.publicidad
  for insert
  with check (true);

drop policy if exists "publicidad_public_update" on public.publicidad;
create policy "publicidad_public_update"
  on public.publicidad
  for update
  using (true);

drop policy if exists "publicidad_public_delete" on public.publicidad;
create policy "publicidad_public_delete"
  on public.publicidad
  for delete
  using (true);
