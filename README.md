# Melisa Psicología Landing (Astro)

Landing page en Astro para psicología infantil y adolescente.

## Requisitos

- Node.js 20+
- pnpm 10+

## Desarrollo local

```bash
cp .env.example .env
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev`: servidor local
- `pnpm check`: validación Astro + TypeScript
- `pnpm build`: build de producción
- `pnpm preview`: probar build local

## Variables de entorno

Toma como base `/Users/christiantorres/Developer/Proyectos/Psychologist Landing Page/.env.example`.

### Públicas (`PUBLIC_*`)
Se exponen en frontend (no poner secretos):

- `PUBLIC_SITE_NAME`
- `PUBLIC_SITE_URL`
- `PUBLIC_OG_IMAGE`
- `PUBLIC_WHATSAPP_LINK`
- `PUBLIC_CONTACT_PHONE`
- `PUBLIC_CONTACT_EMAIL`
- `PUBLIC_OFFICE_ADDRESS`
- `PUBLIC_CONTACT_HOURS`
- `PUBLIC_INSTAGRAM_URL`
- `PUBLIC_LINKEDIN_URL`
- `PUBLIC_FACEBOOK_URL`

### Privadas (solo servidor)

- Google Sheets: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB`, `GOOGLE_SHEET_BOOKING_TAB`
- Resend: `RESEND_API_KEY`, `BOOKING_EMAIL_FROM`, `BOOKING_EMAIL_TO`
- WhatsApp Cloud API: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TO`

## CI/CD (GitHub Actions)

Workflows incluidos en `.github/workflows`:

1. `ci.yml`
- Corre en `push` y `pull_request` a `main`.
- Ejecuta: instalación, `pnpm check`, `pnpm build`.

2. `deploy-preview.yml`
- Corre en PRs.
- Dispara deploy preview vía webhook si existe `PREVIEW_DEPLOY_WEBHOOK_URL`.

3. `deploy-production.yml`
- Corre en push a `main` y manual (`workflow_dispatch`).
- Valida build y dispara deploy de producción vía `DEPLOY_WEBHOOK_URL`.

### Secrets de GitHub requeridos

- `DEPLOY_WEBHOOK_URL` (obligatorio para deploy de producción)
- `PREVIEW_DEPLOY_WEBHOOK_URL` (opcional, recomendado para preview por PR)

## Integraciones del formulario

Endpoint: `/api/booking`

- Guarda en Google Spreadsheet
- Envía notificación por WhatsApp Cloud API
- Envía correo por Resend solo si su configuración existe
