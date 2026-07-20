create table if not exists public.site_config (
  id int primary key default 1,
  whatsapp_number text,
  instagram text,
  facebook text,
  email text,
  address text,
  quienes_somos_title text,
  quienes_somos_content text,
  updated_at timestamptz default now(),
  check (id = 1)
);

alter table public.site_config enable row level security;

drop policy if exists "site_config_public_read" on public.site_config;
create policy "site_config_public_read"
  on public.site_config
  for select
  using (true);

insert into public.site_config (id)
values (1)
on conflict (id) do nothing;
