const DEFAULT_WHATSAPP_NUMBER = '573000000000';
const DEFAULT_WHATSAPP_MESSAGE =
  'Hola, me gustaría agendar una cita de valoración para psicología infantil o adolescente.';

export const getWhatsAppLink = () => {
  const message = (import.meta.env.PUBLIC_WHATSAPP_MESSAGE ?? DEFAULT_WHATSAPP_MESSAGE).trim();
  const fallbackLink = import.meta.env.PUBLIC_WHATSAPP_LINK?.trim();

  if (fallbackLink) {
    if (!message || /(?:\?|&)text=/.test(fallbackLink)) {
      return fallbackLink;
    }

    const separator = fallbackLink.includes('?') ? '&' : '?';
    return `${fallbackLink}${separator}text=${encodeURIComponent(message)}`;
  }

  const rawNumber = import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER;
  const number = rawNumber.replace(/\D/g, '');

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};
