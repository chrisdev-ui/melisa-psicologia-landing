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
- `PUBLIC_WHATSAPP_NUMBER`
- `PUBLIC_WHATSAPP_MESSAGE`
- `PUBLIC_WHATSAPP_LINK` (opcional, override manual)
- `PUBLIC_CONTACT_PHONE`
- `PUBLIC_CONTACT_EMAIL`
- `PUBLIC_OFFICE_ADDRESS`
- `PUBLIC_CONTACT_HOURS`
- `PUBLIC_INSTAGRAM_URL`
- `PUBLIC_LINKEDIN_URL`
- `PUBLIC_FACEBOOK_URL`

### Privadas (solo servidor)

- Google Sheets: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB`, `GOOGLE_SHEET_BOOKING_TAB`
- SendGrid: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`, `BOOKING_EMAIL_TO`

## CI/CD (GitHub + Vercel)

### CI en GitHub Actions

Workflow incluido en `/Users/christiantorres/Developer/Proyectos/Psychologist Landing Page/.github/workflows/ci.yml`:

- Corre en `push` y `pull_request` a `main`
- Ejecuta: `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`

### CD recomendado: Vercel con Git Integration

Para evitar deploys duplicados y errores por webhooks, este proyecto usa **CI en GitHub** y **CD nativo en Vercel**.

1. En Vercel: `Add New -> Project`.
2. Importa el repo `chrisdev-ui/melisa-psicologia-landing`.
3. Framework Preset: `Astro`.
4. Build command: `pnpm build`.
5. Install command: `pnpm install --frozen-lockfile`.
6. Output dir: `dist` (si Vercel lo solicita explícitamente).
7. En `Environment Variables`, carga todas las variables de `.env.example`.
8. Guarda y despliega.

Con esto:
- `main` -> producción automática
- `pull_request` -> preview deployments automáticos

## Integraciones del formulario

Endpoint: `/api/booking`

- Guarda en Google Spreadsheet
- Envía correo con SendGrid (si su configuración existe)
- Los CTA usan enlace `wa.me` con mensaje plantilla para primer contacto
