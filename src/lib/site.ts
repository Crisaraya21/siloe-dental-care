// Datos centrales de la clínica. Se usan en el aviso legal, la política de privacidad,
// el pie de página, los botones de WhatsApp y los datos estructurados para Google.
//
// IMPORTANTE: todo lo que diga "PENDIENTE" hay que llenarlo con los datos reales antes de publicar.

export const SITE = {
  name: "Clínica Dental Siloé",
  // PENDIENTE: cambiar por el dominio propio cuando lo tengan (sin diagonal al final).
  url: "https://siloe-dental-care.lovable.app",
  phoneDisplay: "7013 7712",
  phoneIntl: "50670137712",
  email: "clinicadentalsiloe@gmail.com",
  addressLine: "200 oeste y 200 sur del Liceo San Carlos",
  city: "Ciudad Quesada",
  region: "Alajuela",
  country: "Costa Rica",
  instagramUrl: "https://instagram.com/clinicadentalsiloe",
  // Por ahora no se muestran en el sitio. Cuando los tengan, se agregan al aviso legal y a la política de privacidad.
  // legalName: "nombre o razón social del titular",
  // legalId: "cédula física o jurídica",
  // healthPermit: "número de permiso sanitario de funcionamiento (Ministerio de Salud)",
  lastUpdated: "6 de octubre de 2026",
} as const;

// Ubicación exacta de la clínica (Ciudad Quesada). Sale del enlace de Google Maps de la clínica.
export const CLINIC_COORDS = { lat: 10.3391562, lng: -84.4348303 } as const;

// Abre Google Maps con la ruta ya lista hacia la clínica; el punto de salida es la ubicación de la persona.
export const DIRECTIONS_URL =
  "https://www.google.com/maps/dir//Cl%C3%ADnica+Silo%C3%A9,+50+oeste+de+liceo+San+Carlos+y+200+sur,+Provincia+de+Alajuela,+Cd+Quesada,+Barrio+San+Roque,+21001/@10.3391562,-84.4348303,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x8fa06564fbcc10d9:0x43a7729e03db00ad!2m2!1d-84.4348303!2d10.3391562";

// Opción "Otro servicio" del formulario de citas: obliga a describir qué necesita la persona.
export const OTHER_SERVICE_NAME = "Otro servicio";
export const OTHER_SERVICE_MIN_DETAIL = 5;
export const OTHER_SERVICE_DETAIL_ERROR = `Cuéntanos qué servicio necesitas (mínimo ${OTHER_SERVICE_MIN_DETAIL} caracteres).`;

export const FULL_ADDRESS = `${SITE.addressLine}, ${SITE.city}, ${SITE.region}, ${SITE.country}`;

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(message)}`;
}

// Mensaje de WhatsApp para consultar el precio de un servicio. Sin emojis.
export function priceInquiryMessage(serviceName: string) {
  return `Hola, quisiera consultar el precio del servicio de ${serviceName} en ${SITE.name}. Quedo atento a su respuesta, gracias.`;
}

export function priceInquiryLink(serviceName: string) {
  return whatsappLink(priceInquiryMessage(serviceName));
}

// Horario de la clínica: lunes a viernes 8:00 a. m. a 5:30 p. m., sábado 8:00 a. m. a 12:00 p. m., domingo cerrado.
// Las citas duran una hora, así que la última de lunes a viernes es a las 4:00 p. m. (termina a las 5:00 p. m.)
// y la última del sábado es a las 11:00 a. m. (termina a las 12:00 p. m.).
export const BOOKING_HOURS_WEEKDAY = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

export const BOOKING_HOURS_SATURDAY = ["08:00", "09:00", "10:00", "11:00"] as const;

// Horas que se pueden elegir para una fecha (formato AAAA-MM-DD). Domingo o fecha inválida: lista vacía.
export function getBookingHoursForDate(date: string): readonly string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (Number.isNaN(day) || day === 0) return [];
  return day === 6 ? BOOKING_HOURS_SATURDAY : BOOKING_HOURS_WEEKDAY;
}
