-- Etapa 6D: restringir escrituras públicas y explicitar las lecturas necesarias.

-- La publicidad se escribe exclusivamente desde el servidor con service role.
drop policy if exists "publicidad_public_insert" on public.publicidad;
drop policy if exists "publicidad_public_update" on public.publicidad;
drop policy if exists "publicidad_public_delete" on public.publicidad;

-- La portada necesita seguir leyendo las publicidades públicamente.
drop policy if exists "publicidad_public_read" on public.publicidad;
create policy "publicidad_public_read"
  on public.publicidad
  for select
  to anon, authenticated
  using (true);

-- Las publicaciones de Instagram continúan siendo visibles en la portada.
drop policy if exists "instagram_posts_public_read" on public.instagram_posts;
create policy "instagram_posts_public_read"
  on public.instagram_posts
  for select
  to anon, authenticated
  using (true);

-- La configuración pública del sitio continúa disponible para la portada.
drop policy if exists "site_config_public_read" on public.site_config;
create policy "site_config_public_read"
  on public.site_config
  for select
  to anon, authenticated
  using (true);

-- El estado interno de sincronización queda disponible solo para el servidor.
drop policy if exists "instagram_sync_status_public_read"
  on public.instagram_sync_status;
