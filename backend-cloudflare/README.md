# DineralFlow Cloudflare Backend

Backend minimo para publicar la API movil de DineralFlow con coste inicial `0 USD/mes` usando Cloudflare Workers Free, D1 Free, Cron Triggers y Resend Free.

## Contrato cubierto

- `GET /health`
- `GET /api/dashboard/snapshot`
- `GET /api/dashboard/history?window=7d|30d|90d`
- `POST /api/mobile/auth/register`
- `POST /api/mobile/auth/login`
- `POST /api/mobile/auth/verify-email`
- `GET /api/mobile/auth/me`
- `POST /api/mobile/auth/logout`
- `GET /api/mobile/entitlements`
- `POST /api/mobile/entitlements/refresh`
- `GET /api/mobile/paywall`
- `POST /api/mobile/webhooks/revenuecat`

## Setup

```bash
cd backend-cloudflare
npm install
npm run test
npm run db:create
```

Copia el `database_id` que devuelve Cloudflare en `wrangler.toml`, sustituyendo `replace-with-cloudflare-d1-database-id`.

```bash
npm run db:migrate:remote
npm run deploy
```

## Secrets

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put REVENUECAT_WEBHOOK_SECRET
```

`JWT_SECRET` queda reservado para firmar tokens si subimos el nivel de seguridad del formato de sesion. En esta primera version los tokens son opacos, aleatorios y se guardan hasheados en D1.

## iOS

Cuando el Worker este desplegado, configura la app con:

```bash
EXPO_PUBLIC_API_BASE_URL=https://dineralflow-api.<your-subdomain>.workers.dev
EXPO_PUBLIC_AUTH_PROVIDER=backend
```

Para desarrollo sin login backend, deja `EXPO_PUBLIC_AUTH_PROVIDER=mock`. Los endpoints de snapshot, history, entitlements anonimos y paywall funcionan igualmente.

## Coste

- Workers Free: `0 USD/mes`, con limites.
- D1 Free: `0 USD/mes`, con limites.
- Resend Free: `0 USD/mes`, con limite diario.
- Primer upgrade recomendado: Workers Paid `5 USD/mes`.
