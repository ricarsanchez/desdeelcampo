-- Tabla para registrar el estado de sincronización de Instagram
create table if not exists public.instagram_sync_status (
  id int primary key default 1,
  last_synced_at timestamptz,
  updated_at timestamptz default now(),
  check (id = 1)
);

alter table public.instagram_sync_status enable row level security;

drop policy if exists "instagram_sync_status_public_read" on public.instagram_sync_status;
create policy "instagram_sync_status_public_read"
  on public.instagram_sync_status
  for select
  using (true);

-- Insertar fila inicial si no existe
insert into public.instagram_sync_status (id, last_synced_at)
values (1, null)
on conflict (id) do nothing;
