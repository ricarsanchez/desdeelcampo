alter table public.site_config
  add column if not exists whatsapp_message text;

comment on column public.site_config.whatsapp_message is
  'Mensaje predeterminado para los enlaces públicos de WhatsApp';
