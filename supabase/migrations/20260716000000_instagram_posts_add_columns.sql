alter table public.instagram_posts
  add column if not exists media_type text;

comment on column public.instagram_posts.media_type is 'Tipo de medio de Instagram: IMAGE, VIDEO, CAROUSEL_ALBUM';
