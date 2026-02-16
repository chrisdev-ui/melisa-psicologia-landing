import type { APIRoute } from 'astro';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type BookingPayload = {
  guardianName: string;
  patientName: string;
  patientAge: string;
  email: string;
  phone: string;
  sessionType: string;
  message: string;
};

const getEnv = (key: keyof ImportMetaEnv) => import.meta.env[key];

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const buildBookingText = (payload: BookingPayload) =>
  [
    'Nueva solicitud de cita',
    `Acudiente: ${payload.guardianName}`,
    `Paciente: ${payload.patientName}`,
    `Edad: ${payload.patientAge}`,
    `Correo: ${payload.email}`,
    `Teléfono: ${payload.phone}`,
    `Modalidad: ${payload.sessionType}`,
    `Mensaje: ${payload.message || 'Sin mensaje'}`,
  ].join('\n');

const buildBookingHtml = (payload: BookingPayload, siteName: string) => {
  const safeGuardian = escapeHtml(payload.guardianName);
  const safePatient = escapeHtml(payload.patientName);
  const safeAge = escapeHtml(payload.patientAge);
  const safeEmail = escapeHtml(payload.email);
  const safePhone = escapeHtml(payload.phone);
  const safeSessionType = escapeHtml(payload.sessionType);
  const safeMessage = escapeHtml(payload.message || 'Sin mensaje');
  const safeSiteName = escapeHtml(siteName);

  return `
  <div style="margin:0;padding:0;background:#f7f8fb;font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#29323a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;background:#f7f8fb;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:22px;overflow:hidden;border:1px solid #f0edf5;">
            <tr>
              <td style="padding:24px 28px;background:linear-gradient(90deg,#FF8A7A 0%,#E8A4C9 100%);color:#ffffff;">
                <p style="margin:0;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;">Nueva solicitud</p>
                <h1 style="margin:8px 0 0;font-size:26px;line-height:1.25;font-weight:700;">Solicitud de cita recibida</h1>
                <p style="margin:8px 0 0;font-size:14px;line-height:1.5;opacity:.95;">${safeSiteName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 10px;">
                  <tr><td style="font-size:13px;color:#8c95a3;width:180px;">Acudiente</td><td style="font-size:15px;font-weight:700;color:#2f3640;">${safeGuardian}</td></tr>
                  <tr><td style="font-size:13px;color:#8c95a3;">Paciente</td><td style="font-size:15px;font-weight:700;color:#2f3640;">${safePatient}</td></tr>
                  <tr><td style="font-size:13px;color:#8c95a3;">Edad</td><td style="font-size:15px;font-weight:700;color:#2f3640;">${safeAge}</td></tr>
                  <tr><td style="font-size:13px;color:#8c95a3;">Correo</td><td style="font-size:15px;font-weight:700;color:#2f3640;">${safeEmail}</td></tr>
                  <tr><td style="font-size:13px;color:#8c95a3;">Teléfono</td><td style="font-size:15px;font-weight:700;color:#2f3640;">${safePhone}</td></tr>
                  <tr><td style="font-size:13px;color:#8c95a3;">Modalidad</td><td style="font-size:15px;font-weight:700;color:#2f3640;">${safeSessionType}</td></tr>
                </table>

                <div style="margin-top:16px;padding:16px;border-radius:14px;background:#faf9f6;border:1px solid #efe8df;">
                  <p style="margin:0 0 8px;font-size:13px;color:#8c95a3;">Mensaje de la familia</p>
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#2f3640;">${safeMessage}</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();

    const honeypot = String(form.get('company') ?? '').trim();
    if (honeypot) {
      return new Response(null, { status: 204 });
    }

    const payload: BookingPayload = {
      guardianName: String(form.get('guardian_name') ?? '').trim(),
      patientName: String(form.get('patient_name') ?? '').trim(),
      patientAge: String(form.get('patient_age') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim(),
      sessionType: String(form.get('session_type') ?? '').trim(),
      message: String(form.get('message') ?? '').trim(),
    };

    if (
      !payload.guardianName ||
      !payload.patientName ||
      !payload.patientAge ||
      !payload.email ||
      !payload.phone ||
      !payload.sessionType
    ) {
      return new Response('Missing required fields', { status: 400 });
    }

    if (!emailRegex.test(payload.email)) {
      return new Response('Invalid email', { status: 400 });
    }

    const sheetId = getEnv('GOOGLE_SHEET_ID');
    const serviceEmail = getEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const privateKeyRaw = getEnv('GOOGLE_PRIVATE_KEY');

    const sendgridApiKey = getEnv('SENDGRID_API_KEY');
    const sendgridFromEmail = getEnv('SENDGRID_FROM_EMAIL');
    const sendgridFromName = getEnv('SENDGRID_FROM_NAME') ?? 'Dra. Melissa Mejía Hernández';
    const bookingEmailTo = getEnv('BOOKING_EMAIL_TO');

    if (!sheetId || !serviceEmail || !privateKeyRaw) {
      return new Response('Missing Google Sheets configuration', { status: 500 });
    }

    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

    const auth = new JWT({
      email: serviceEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    const bookingTabName = getEnv('GOOGLE_SHEET_BOOKING_TAB') ?? getEnv('GOOGLE_SHEET_TAB');
    const sheet = bookingTabName ? doc.sheetsByTitle[bookingTabName] : doc.sheetsByIndex[0];

    if (!sheet) {
      return new Response('Sheet tab not found', { status: 500 });
    }

    await sheet.addRow({
      Fecha: new Date().toISOString(),
      Acudiente: payload.guardianName,
      Paciente: payload.patientName,
      Edad: payload.patientAge,
      Correo: payload.email,
      Telefono: payload.phone,
      Modalidad: payload.sessionType,
      Mensaje: payload.message,
    });

    const hasSendgridConfig = Boolean(sendgridApiKey && sendgridFromEmail && bookingEmailTo);
    if (hasSendgridConfig) {
      const siteName = getEnv('PUBLIC_SITE_NAME') ?? 'Dra. Melissa Mejía Hernández';
      const subject = `Nueva solicitud de cita - ${payload.patientName}`;
      const textBody = buildBookingText(payload);
      const htmlBody = buildBookingHtml(payload, siteName);

      const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: bookingEmailTo }],
              subject,
            },
          ],
          from: {
            email: sendgridFromEmail,
            name: sendgridFromName,
          },
          reply_to: {
            email: payload.email,
            name: payload.guardianName,
          },
          content: [
            { type: 'text/plain', value: textBody },
            { type: 'text/html', value: htmlBody },
          ],
        }),
      });

      if (!emailResponse.ok) {
        const details = await emailResponse.text();
        console.error('SendGrid API error', details);
        return new Response('Email delivery failed', { status: 502 });
      }
    } else {
      console.info('Booking email skipped: SendGrid not fully configured');
    }

    const acceptsJson = request.headers.get('accept')?.includes('application/json');
    if (acceptsJson) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(null, {
      status: 303,
      headers: { Location: '/gracias' },
    });
  } catch (error) {
    console.error('Booking form error', error);
    return new Response('Server error', { status: 500 });
  }
};
