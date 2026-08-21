-- Etapa 1: extender el modelo de publicidad sin romper registros existentes.
-- Se ejecuta manualmente en Supabase antes de desplegar los cambios de la app.

alter table public.publicidad
  add column if not exists activo boolean not null default true,
  add column if not exists titulo text,
  add column if not exists orden integer not null default 0,
  add column if not exists slot text not null default 'sidebar',
  add column if not exists es_video boolean not null default false,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists file_size integer,
  add column if not exists updated_at timestamptz not null default now();

-- Permitir publicidades sin link destino.
alter table public.publicidad alter column destino drop not null;

-- Normalizar registros existentes con valores seguros.
update public.publicidad
set
  activo = true,
  titulo = coalesce(titulo, file_name),
  orden = coalesce(orden, 0),
  slot = coalesce(slot, 'sidebar'),
  es_video = case when type = 'video' then true else false end,
  updated_at = coalesce(updated_at, created_at, now());

-- Asegurar que el slot solo contenga valores conocidos (opcional, descomentar si se desea).
-- alter table public.publicidad add constraint publicidad_slot_check
--   check (slot in ('sidebar', 'horizontal', 'hero', 'footer'));
