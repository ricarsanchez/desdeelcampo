# desdeelcampo

Proyecto Next.js para integrar webhook de Instagram y mostrar publicaciones en frontend.

## Variables de entorno

Crea un archivo `.env.local` con:

```bash
INSTAGRAM_VERIFY_TOKEN=tu_token_webhook
INSTAGRAM_ACCESS_TOKEN=tu_token_graph_api
INSTAGRAM_USER_ID=tu_usuario_instagram
```

## Endpoints

- `GET /api/instagram/webhook`: verificación de webhook (`hub.challenge`).
- `POST /api/instagram/webhook`: recepción de eventos de Instagram y revalidación de la portada.
- `GET /api/instagram/posts`: devuelve publicaciones normalizadas para el frontend.

## Desarrollo

```bash
npm install
npm run dev
```
