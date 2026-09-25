import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  APPOINTMENT_HOUR_SLOTS,
  buildWhatsAppUrl,
  escapeHtml,
  formatDate,
  getTodayDate,
  isAppointmentClosedDate,
  toHumanDayLabel,
} from "@/lib/appointment-utils";

function page(title: string, bodyHtml: string) {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#24323d"><main style="max-width:680px;margin:48px auto;padding:24px;background:#fff;border-radius:14px;box-shadow:0 6px 18px rgba(15,23,42,0.08)"><div style="background:#0f766e;padding:22px 24px;border-radius:12px 12px 0 0;margin:-24px -24px 20px"><h1 style="margin:0;color:#fff;font-size:28px">${escapeHtml(title)}</h1></div>${bodyHtml}</main></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

async function getAppointmentByToken(token: string) {
  const { data: appointment, error } = await supabaseAdmin
    .from("appointments")
    .select("id,name,phone,service,preferred_date,preferred_time,status,proposed_date,proposed_time")
    .eq("action_token", token)
    .single();

  return { appointment, error };
}

async function getOccupiedTimesForDate(date: string) {
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select("preferred_time,proposed_time")
    .in("status", ["pendiente", "confirmada", "reprogramada_propuesta"])
    .or(`preferred_date.eq.${date},proposed_date.eq.${date}`)
    .limit(1000);

  if (error) {
    return [] as string[];
  }

  const occupied = new Set<string>();
  for (const item of data ?? []) {
    if (item.preferred_time) occupied.add(item.preferred_time);
    if (item.proposed_time) occupied.add(item.proposed_time);
  }

  return [...occupied];
}

export const Route = createFileRoute("/api/appointments/reject")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const selectedDate = url.searchParams.get("date");
        const selectedTime = url.searchParams.get("time");

        if (!token) return page("Enlace inválido", "<p>No se recibió el token de la solicitud.</p>");

        const { appointment, error } = await getAppointmentByToken(token);
        if (error || !appointment) {
          return page("Solicitud no encontrada", "<p>El enlace no es válido o ya no existe.</p>");
        }

        if (appointment.status !== "pendiente") {
          return page(
            "Solicitud ya procesada",
            `<p>Esta solicitud ya está en estado: <strong>${escapeHtml(appointment.status)}</strong>.</p>`,
          );
        }

        if (selectedTime) {
          const proposedDate = selectedDate ?? appointment.preferred_date;
          const proposedTime = selectedTime;

          if (!proposedDate || !proposedTime) {
            return page("Datos incompletos", "<p>Hace falta la fecha o la hora propuesta.</p>");
          }

          const chosenDate = new Date(`${proposedDate}T12:00:00-06:00`);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (Number.isNaN(chosenDate.getTime()) || chosenDate < today) {
            return page("Fecha inválida", "<p>La fecha propuesta no puede estar en el pasado.</p>");
          }

          if (isAppointmentClosedDate(proposedDate)) {
            return page(
              "Día no disponible",
              `<p>La clínica no atiende ese día, por favor elija otra fecha.</p><p><a href="/api/appointments/reject?token=${encodeURIComponent(token)}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Elegir otra fecha</a></p>`,
            );
          }

          const occupiedTimes = await getOccupiedTimesForDate(proposedDate);
          if (occupiedTimes.includes(proposedTime)) {
            return page("Horario ocupado", "<p>Ese horario ya fue tomado por otra cita. Elige otra hora.</p>");
          }

          const { error: updateError } = await supabaseAdmin
            .from("appointments")
            .update({
              status: "reprogramada_propuesta",
              proposed_date: proposedDate,
              proposed_time: proposedTime,
            })
            .eq("id", appointment.id);

          if (updateError) {
            return page("No se pudo guardar la propuesta", "<p>Inténtalo nuevamente en unos minutos.</p>");
          }

          const phoneMessage = `Hola ${appointment.name} 👋
Le saludamos de Clínica Dental Siloé.

Lamentablemente no tenemos disponibilidad para su cita de ${appointment.service} el ${formatDate(appointment.preferred_date)} a las ${appointment.preferred_time}.

Le proponemos:
Fecha: ${formatDate(proposedDate)}
Hora: ${proposedTime}

¿Le funciona este horario? Puede responder por este medio o llamarnos al 7013 7712.

Gracias por su comprensión.`;
          const whatsappUrl = buildWhatsAppUrl(appointment.phone, phoneMessage);

          return page(
            "Propuesta enviada",
            `<div style="padding:8px 0 0"><p>Se guardó la nueva propuesta y se preparó la conversación de WhatsApp.</p><p><a href="${whatsappUrl}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Abrir WhatsApp</a></p><p><a href="${whatsappUrl}" style="color:#0f766e;text-decoration:none">Redirigiendo automáticamente…</a></p><meta http-equiv="refresh" content="0; url=${whatsappUrl}" /></div>`,
          );
        }

        if (selectedDate) {
          const date = new Date(`${selectedDate}T12:00:00-06:00`);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (Number.isNaN(date.getTime()) || date < today) {
            return page("Fecha inválida", "<p>La fecha seleccionada ya no es válida.</p>");
          }

          if (isAppointmentClosedDate(selectedDate)) {
            return page(
              "Día no disponible",
              `<p>La clínica no atiende ese día, por favor elija otra fecha.</p><p><a href="/api/appointments/reject?token=${encodeURIComponent(token)}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Elegir otra fecha</a></p>`,
            );
          }

          const occupied = await getOccupiedTimesForDate(selectedDate);
          const slots = APPOINTMENT_HOUR_SLOTS.filter((hour) => !occupied.includes(hour));

          const selectedDateLabel = escapeHtml(toHumanDayLabel(selectedDate));
          const timeButtons = slots.length
            ? slots
                .map(
                  (hour) =>
                    `<a href="/api/appointments/reject?token=${encodeURIComponent(token)}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(hour)}" style="display:inline-block;padding:12px 14px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;margin:8px 8px 0 0;min-width:110px;text-align:center">${escapeHtml(hour)}</a>`,
                )
                .join("")
            : "<p>No hay horarios disponibles para este día. Elige otro día.</p>";

          return page(
            "¿A qué hora?",
            `<p>Solicitud de <strong>${escapeHtml(appointment.name)}</strong></p><p>Fecha elegida: <strong>${selectedDateLabel}</strong></p><div style="display:flex;flex-wrap:wrap;margin-top:18px">${timeButtons}</div><p style="margin-top:20px"><a href="/api/appointments/reject?token=${encodeURIComponent(token)}" style="color:#8b2635;text-decoration:none;font-weight:bold">← Volver a días disponibles</a></p>`,
          );
        }

        const todayDate = getTodayDate();

        return page(
          "¿Qué día hay disponible?",
          `<p>Selecciona un día disponible para ${escapeHtml(appointment.name)}.</p><form method="get" action="/api/appointments/reject" style="margin-top:18px"><input type="hidden" name="token" value="${escapeHtml(token)}" /><label for="appointment-date" style="display:block;margin-bottom:8px;font-weight:bold">Fecha</label><input id="appointment-date" type="date" name="date" min="${todayDate}" required style="display:block;width:100%;box-sizing:border-box;padding:12px;border:1px solid #dcdcdc;border-radius:8px;font:inherit" /><button type="submit" style="display:inline-block;margin-top:14px;padding:12px 18px;background:#0f766e;color:#fff;border:0;border-radius:8px;font:inherit;font-weight:bold;cursor:pointer">Ver horarios disponibles</button></form>`,
        );
      },
    },
  },
});
