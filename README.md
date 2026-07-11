# Desde el Campo

![Desde el Campo](docs/screenshot-home.png)

Plataforma web para la gestión integral de un emprendimiento ganadero. Permite publicar lotes de hacienda, administrar noticias y publicidad, y sincronizar contenido desde Instagram de forma automática.

## Sitio en producción

[https://www.desdeelcampo.com](https://www.desdeelcampo.com)

---

## Características principales

- **Publicación y administración de lotes ganaderos** — Alta, edición y baja de lotes con imagen, categoría, cantidad, peso, precio, localidad y teléfono de contacto.
- **Gestión de noticias** — Creación, edición y eliminación de artículos con título, contenido, fecha e imagen opcional.
- **Gestión de publicidad** — Carga de banners y videos promocionales con enlace de destino.
- **Panel administrativo protegido** — Login por contraseña con cookie de sesión y middleware que restringe el acceso.
- **Integración con Instagram Graph API** — Recepción de publicaciones vía webhook en tiempo real y sincronización programada.
- **Sincronización automática diaria** — Vercel Cron ejecuta la sincronización cada medianoche UTC (`0 0 * * *`).
- **Sincronización manual** — Botón en el panel de administración para forzar la sincronización al instante.
- **Almacenamiento en Supabase** — Las publicaciones de Instagram se persisten en tablas PostgreSQL con Row Level Security.
- **Monitoreo del estado de Instagram** — Conexión, última sincronización, total de publicaciones, publicación más reciente y vigencia del token.
- **Gestión automática de imágenes** — Todas las imágenes subidas (lotes, noticias, banners, logo) se guardan en `public/uploads/`.

---

## Tecnologías utilizadas

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- [Vercel](https://vercel.com/) (hosting + cron jobs)
- [Facebook / Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) (iconos)

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | Token de acceso de Facebook Graph API |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | ID de la cuenta de negocio de Instagram |
| `INSTAGRAM_APP_SECRET` | App Secret de la aplicación de Meta (para verificar firma del webhook) |
| `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` | Token de verificación para la suscripción del webhook |
| `SUPABASE_URL` | URL del proyecto en Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key de Supabase |
| `ADMIN_PASSWORD` | Contraseña para acceder al panel administrativo |
| `OPENWEATHERMAP_API_KEY` | API Key para el widget del clima (opcional, tiene fallback) |

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/ricarsanchez/desdeelcampo.git
cd desdeelcampo

# Instalar dependencias
npm install

# Crear archivo .env.local con las variables de entorno necesarias
# (ver sección anterior)

# Ejecutar en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con Webpack |
| `npm run build` | Compila la aplicación para producción |
| `npm start` | Inicia el servidor en modo producción |
| `npm run lint` | Ejecuta ESLint |

---

## Despliegue

El proyecto está preparado para desplegarse en Vercel. Las variables de entorno deben configurarse en el dashboard de Vercel.

El archivo `vercel.json` define un cron job que ejecuta `GET /api/instagram/sync` cada medianoche UTC para mantener las publicaciones actualizadas automáticamente.

---

## Estructura del proyecto

```
.
├── app/                        # App Router de Next.js
│   ├── admin/                  # Panel administrativo
│   │   ├── login/              # Página de login
│   │   └── noticias/           # Gestión de noticias
│   ├── api/                    # API Routes
│   │   ├── _utils/             # Utilidades compartidas (Supabase, webhook, uploads, store)
│   │   ├── auth/               # Login y logout
│   │   ├── banners/            # CRUD de publicidad
│   │   ├── instagram/          # Webhook, sync, status y events
│   │   ├── logo/               # Logo y nombre del sitio
│   │   ├── lotes/              # CRUD de lotes
│   │   ├── market-prices/      # Cotizaciones del dólar
│   │   ├── news/               # CRUD de noticias
│   │   └── weather/            # Pronóstico del clima
│   ├── globals.css             # Estilos globales (Tailwind)
│   ├── layout.tsx              # Layout raíz
│   └── page.tsx                # Página principal
├── components/                 # Componentes React
│   └── admin/                  # Componentes del panel administrativo
├── lib/                        # Lógica compartida (auth, store, tipos)
├── hooks/                      # Hooks de React
├── public/
│   └── uploads/                # Imágenes subidas por el usuario
├── supabase/
│   └── migrations/             # Migraciones de base de datos
├── data/                       # Datos locales (store.json)
├── proxy.ts                    # Middleware de autenticación
├── vercel.json                 # Configuración de Vercel (cron jobs)
├── next.config.ts              # Configuración de Next.js
├── tailwind.config.ts          # Tema de Tailwind CSS
└── package.json
```

---

## Arquitectura

```
Instagram ──Webhook──> POST /api/instagram/webhook ──> Supabase (instagram_posts)
     │
     └──Graph API──> GET /api/instagram/sync ──> Supabase (instagram_posts + sync_status)
                         │                              │
                    [Vercel Cron]                  GET /api/instagram/webhook/events
                    [Manual]                            │
                                                        v
                                                  Frontend (InstagramWebhookEventsList)

Admin ──> POST /api/lotes     ──> data/store.json
Admin ──> POST /api/news      ──> data/store.json
Admin ──> POST /api/banners   ──> data/store.json
```

- **Webhook**: Meta envía eventos en tiempo real al crearse o actualizarse publicaciones de Instagram.
- **Sync**: La Graph API de Facebook se consulta bajo demanda o por cron para obtener los medios recientes.
- **Supabase**: Almacena las publicaciones (`instagram_posts`) y el estado de la última sincronización (`instagram_sync_status`).
- **API**: Los endpoints exponen los datos al frontend.
- **Frontend**: La página principal muestra las publicaciones de Instagram mediante el componente `InstagramWebhookEventsList`. El panel de administración permite gestionar lotes, noticias, publicidad y monitorear la integración.

---

## Estado del proyecto

Versión actual: **v1.0.0**

## Roadmap

- [ ] Renovación automática del token de Instagram.
- [ ] Notificación cuando el token esté próximo a vencer.
- [ ] Estadísticas de publicaciones de Instagram.
- [ ] Historial de sincronizaciones.
- [ ] Copias de seguridad automáticas.
