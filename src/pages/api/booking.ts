import type { APIRoute } from 'astro';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getEnv = (key: keyof ImportMetaEnv) => import.meta.env[key];

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();

    const honeypot = String(form.get('company') ?? '').trim();
    if (honeypot) {
      return new Response(null, { status: 204 });
    }

    const payload = {
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
    const resendApiKey = getEnv('RESEND_API_KEY');
    const bookingEmailFrom = getEnv('BOOKING_EMAIL_FROM');
    const bookingEmailTo = getEnv('BOOKING_EMAIL_TO');
    const whatsappToken = getEnv('WHATSAPP_TOKEN');
    const whatsappPhoneId = getEnv('WHATSAPP_PHONE_NUMBER_ID');
    const whatsappTo = getEnv('WHATSAPP_TO');

    if (!sheetId || !serviceEmail || !privateKeyRaw) {
      return new Response('Missing Google Sheets configuration', { status: 500 });
    }

    if (!whatsappToken || !whatsappPhoneId || !whatsappTo) {
      return new Response('Missing WhatsApp configuration', { status: 500 });
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

    const safeGuardian = escapeHtml(payload.guardianName);
    const safePatient = escapeHtml(payload.patientName);
    const safeAge = escapeHtml(payload.patientAge);
    const safeEmail = escapeHtml(payload.email);
    const safePhone = escapeHtml(payload.phone);
    const safeSessionType = escapeHtml(payload.sessionType);
    const safeMessage = escapeHtml(payload.message || 'Sin mensaje');

    const hasEmailConfig = Boolean(resendApiKey && bookingEmailFrom && bookingEmailTo);
    if (hasEmailConfig) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: bookingEmailFrom,
          to: [bookingEmailTo],
          reply_to: payload.email,
          subject: `Nueva solicitud de cita - ${payload.patientName}`,
          html: `
            <h2>Nueva solicitud de cita</h2>
            <p><strong>Acudiente:</strong> ${safeGuardian}</p>
            <p><strong>Paciente:</strong> ${safePatient}</p>
            <p><strong>Edad:</strong> ${safeAge}</p>
            <p><strong>Correo:</strong> ${safeEmail}</p>
            <p><strong>Telefono:</strong> ${safePhone}</p>
            <p><strong>Modalidad:</strong> ${safeSessionType}</p>
            <p><strong>Mensaje:</strong> ${safeMessage}</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const details = await emailResponse.text();
        console.error('Resend API error', details);
        return new Response('Email delivery failed', { status: 502 });
      }
    } else {
      console.info('Booking email skipped: RESEND_API_KEY or sender/recipient not configured');
    }

    const whatsappText = [
      'Nueva solicitud de cita',
      `Acudiente: ${payload.guardianName}`,
      `Paciente: ${payload.patientName}`,
      `Edad: ${payload.patientAge}`,
      `Correo: ${payload.email}`,
      `Telefono: ${payload.phone}`,
      `Modalidad: ${payload.sessionType}`,
      `Mensaje: ${payload.message || 'Sin mensaje'}`,
    ].join('\n');

    const whatsappResponse = await fetch(`https://graph.facebook.com/v19.0/${whatsappPhoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: whatsappTo,
        type: 'text',
        text: { body: whatsappText },
      }),
    });

    if (!whatsappResponse.ok) {
      const details = await whatsappResponse.text();
      console.error('WhatsApp API error', details);
      return new Response('WhatsApp delivery failed', { status: 502 });
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
