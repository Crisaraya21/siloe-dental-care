import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
];

for (const name of required) {
  if (!process.env[name]) throw new Error(`Falta el secret ${name}`);
}

function parseAppointmentTimestamp(date, time) {
  let normalizedTime = time.trim();
  const isPM = /pm$/i.test(normalizedTime);
  const isAM = /am$/i.test(normalizedTime);
  normalizedTime = normalizedTime.replace(/\s*(am|pm)$/i, "").trim();

  const parts = normalizedTime.split(":");
  let hours = Number.parseInt(parts[0], 10);
  if (Number.isNaN(hours)) return null;
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  const minutes = parts[1]?.padStart(2, "0") ?? "00";
  const seconds = parts[2]?.padStart(2, "0") ?? "00";
  const timestamp = Date.parse(
    `${date.trim()}T${String(hours).padStart(2, "0")}:${minutes}:${seconds}-06:00`,
  );
  return Number.isNaN(timestamp) ? null : timestamp;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ],
  );
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const { data: appointments, error } = await supabase
  .from("appointments")
  .select("*")
  .eq("status", "confirmada")
  .eq("reminder_sent", false);

if (error) throw error;

const now = Date.now();
const in24Hours = now + 24 * 60 * 60 * 1000;
let sent = 0;

for (const appointment of appointments ?? []) {
  const timestamp = parseAppointmentTimestamp(
    appointment.preferred_date,
    appointment.preferred_time,
  );
  if (!appointment.email || timestamp === null || timestamp < now || timestamp > in24Hours) {
    continue;
  }

  const name = escapeHtml(appointment.name);
  const service = escapeHtml(appointment.service);
  const appointmentDate = new Date(timestamp);
  const date = new Intl.DateTimeFormat("es-CR", {
    dateStyle: "full",
    timeZone: "America/Costa_Rica",
  }).format(appointmentDate);
  const time = new Intl.DateTimeFormat("es-CR", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Costa_Rica",
  }).format(appointmentDate);
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: appointment.email,
    subject: "Recordatorio de cita | Clínica Dental Siloé",
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#24323d;background:#ffffff;border:1px solid #dbe4e8">
      <div style="padding:24px 28px;background:#0f766e;color:#ffffff"><h1 style="margin:0;font-size:24px">Clínica Dental Siloé</h1><p style="margin:8px 0 0;font-size:14px">Recordatorio de cita</p></div>
      <div style="padding:28px"><p>Estimado(a) <strong>${name}</strong>:</p><p>Le recordamos los detalles de su próxima cita:</p>
      <div style="margin:22px 0;padding:18px;background:#f3f7f8;border-left:4px solid #0f766e"><p style="margin:5px 0"><strong>Servicio:</strong> ${service}</p><p style="margin:5px 0"><strong>Fecha:</strong> ${date}</p><p style="margin:5px 0"><strong>Hora:</strong> ${time}</p></div>
      <p>Le agradecemos presentarse con algunos minutos de anticipación. Si necesita realizar algún cambio, comuníquese con nosotros antes de su cita.</p>
      <p style="margin-top:28px">Atentamente,<br><strong>Equipo de Clínica Dental Siloé</strong><br>Tel. 7013 7712</p></div>
      <div style="padding:16px 28px;background:#f8fafb;color:#64748b;font-size:12px">Este correo es un recordatorio automático de su cita. Por favor, no responda a este mensaje.</div>
    </div>`,
  });

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ reminder_sent: true })
    .eq("id", appointment.id);
  if (updateError) throw updateError;
  sent += 1;
}

console.log(JSON.stringify({ ok: true, enviados: sent }));