/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;
  readonly GOOGLE_PRIVATE_KEY?: string;
  readonly GOOGLE_SHEET_ID?: string;
  readonly GOOGLE_SHEET_TAB?: string;
  readonly GOOGLE_SHEET_BOOKING_TAB?: string;

  readonly SENDGRID_API_KEY?: string;
  readonly SENDGRID_FROM_EMAIL?: string;
  readonly SENDGRID_FROM_NAME?: string;
  readonly BOOKING_EMAIL_TO?: string;

  readonly PUBLIC_SITE_NAME?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_OG_IMAGE?: string;
  readonly PUBLIC_WHATSAPP_NUMBER?: string;
  readonly PUBLIC_WHATSAPP_MESSAGE?: string;
  readonly PUBLIC_WHATSAPP_LINK?: string;
  readonly PUBLIC_OFFICE_ADDRESS?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_CONTACT_PHONE?: string;
  readonly PUBLIC_CONTACT_HOURS?: string;
  readonly PUBLIC_FACEBOOK_URL?: string;
  readonly PUBLIC_LINKEDIN_URL?: string;
  readonly PUBLIC_INSTAGRAM_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
