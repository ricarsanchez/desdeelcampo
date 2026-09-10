export const DEFAULT_WHATSAPP_MESSAGE =
  "Hola, me comunico desde Desde el Campo.";

export function getWhatsAppMessage(message?: string | null): string {
  return message?.trim() || DEFAULT_WHATSAPP_MESSAGE;
}

export function buildWhatsAppUrl(phone: string, message?: string | null): string {
  const cleanedPhone = phone.replace(/\D/g, "");

  if (!cleanedPhone) {
    return "#contacto";
  }

  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(
    getWhatsAppMessage(message),
  )}`;
}
