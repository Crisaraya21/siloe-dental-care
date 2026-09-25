export const APPOINTMENT_CLOSED_DAYS = [0];
export const APPOINTMENT_HOUR_SLOTS = Array.from({ length: 10 }, (_, index) => {
  const hour = 8 + index;
  return `${String(hour).padStart(2, "0")}:00`;
});

export function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Costa_Rica",
  }).format(new Date(`${date}T12:00:00-06:00`));
}

export function normalizePhoneNumber(input: string) {
  const digits = String(input ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("506")) {
    return digits;
  }

  if (digits.length === 8) {
    return `506${digits}`;
  }

  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = normalizePhoneNumber(phone);
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function getTodayDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Costa_Rica" });
}

export function isAppointmentClosedDate(date: string) {
  const dayOfWeek = new Date(`${date}T12:00:00-06:00`).getDay();
  return APPOINTMENT_CLOSED_DAYS.includes(dayOfWeek);
}

export function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Costa_Rica",
  }).format(new Date(`${date}T12:00:00-06:00`));
}

export function getNextClinicDates(daysToShow = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  let cursor = new Date(today);

  while (dates.length < daysToShow) {
    const date = new Date(cursor);
    const iso = date.toLocaleDateString("en-CA", { timeZone: "America/Costa_Rica" });
    const dayOfWeek = date.getDay();

    if (!APPOINTMENT_CLOSED_DAYS.includes(dayOfWeek)) {
      dates.push(iso);
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function toHumanDayLabel(date: string) {
  const formatted = new Intl.DateTimeFormat("es-CR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "America/Costa_Rica",
  }).format(new Date(`${date}T12:00:00-06:00`));

  return formatted.replace(".", "").replace(/\s+/g, " ").trim();
}
