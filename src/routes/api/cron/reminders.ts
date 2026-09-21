import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { sendEmail } from "@/lib/mailer";

function parseAppointmentTimestampCR(
  preferredDate: string,
  preferredTime: string,
): number | null {
  const trimmedDate = preferredDate.trim();
  let trimmedTime = preferredTime.trim();

  let isPM = false;
  let isAM = false;
  if (/pm$/i.test(trimmedTime)) {
    isPM = true;
    trimmedTime = trimmedTime.replace(/pm$/i, "").trim();
  } else if (/am$/i.test(trimmedTime)) {
    isAM = true;
    trimmedTime = trimmedTime.replace(/am$/i, "").trim();
  }

  const parts = trimmedTime.split(":");
  const firstPart = parts[0];
  if (!firstPart) return null;

  let hours = parseInt(firstPart, 10);
  if (isNaN(hours)) return null;
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  const minutes = parts[1] ? parts[1].padStart(2, "0") : "00";
  const seconds = parts[2] ? parts[2].padStart(2, "0") : "00";
  const timePart = `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;

  // Zona horaria de Costa Rica es UTC-6 (sin horario de verano)
  const isoString = `${trimmedDate}T${timePart}-06:00`;
  const timestamp = Date.parse(isoString);
  return isNaN(timestamp) ? null : timestamp;
}

export const Route = createFileRoute("/api/cron/reminders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // 1. Validar autenticación de la petición cron
        const authResponse = await authenticateCronRequest(request);
        if (authResponse) {
          return authResponse;
        }

        try {
          // Cargar el cliente de administración de Supabase (service role)
          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          // 2. Consultar citas candidatas (status confirmada y sin recordatorio enviado)
          const { data: appointments, error: queryError } = await supabaseAdmin
            .from("appointments")
            .select("*")
            .eq("status", "confirmada")
            .eq("reminder_sent", false);

          if (queryError) {
            console.error("Error consultando citas para recordatorio:", queryError);
            return Response.json(
              { ok: false, error: queryError.message },
              { status: 500 },
            );
          }

          // 3. Filtrar citas que caen entre ahora y ahora + 24 horas (hora de Costa Rica)
          const now = Date.now();
          const in24Hours = now + 24 * 60 * 60 * 1000;

          const candidates = (appointments ?? []).filter((appointment) => {
            if (!appointment.preferred_date || !appointment.preferred_time) {
              return false;
            }

            const appointmentTimestamp = parseAppointmentTimestampCR(
              appointment.preferred_date,
              appointment.preferred_time,
            );

            return (
              appointmentTimestamp !== null &&
              appointmentTimestamp >= now &&
              appointmentTimestamp <= in24Hours
            );
          });

          let enviados = 0;

          // 4. Enviar correo por cada cita y marcar reminder_sent = true si es exitoso
          for (const appointment of candidates) {
            if (!appointment.email) {
              continue;
            }

            const html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f766e; margin-top: 0;">Recordatorio de Cita</h2>
                <p>Estimado(a) <strong>${appointment.name}</strong>,</p>
                <p>Le recordamos que tiene una cita programada en <strong>Clínica Dental Siloé</strong>:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 6px 0;"><strong>Servicio:</strong> ${appointment.service}</p>
                  <p style="margin: 6px 0;"><strong>Fecha:</strong> ${appointment.preferred_date}</p>
                  <p style="margin: 6px 0;"><strong>Hora:</strong> ${appointment.preferred_time}</p>
                </div>
                <p>Si necesita reprogramar su cita o tiene alguna consulta, por favor contáctenos con anticipación.</p>
                <p style="color: #64748b; font-size: 14px; margin-top: 25px;">Saludos cordiales,<br/>Equipo de Clínica Dental Siloé</p>
              </div>
            `;

            try {
              await sendEmail(
                appointment.email,
                "Recordatorio de tu cita - Clínica Dental Siloé",
                html,
              );

              const { error: updateError } = await supabaseAdmin
                .from("appointments")
                .update({ reminder_sent: true })
                .eq("id", appointment.id);

              if (updateError) {
                console.error(
                  `Error actualizando reminder_sent para la cita ${appointment.id}:`,
                  updateError,
                );
              } else {
                enviados++;
              }
            } catch (err) {
              console.error(
                `Error enviando recordatorio a ${appointment.email}:`,
                err,
              );
            }
          }

          // 5. Devolver resultado
          return Response.json({ ok: true, enviados });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error en la ruta cron de recordatorios:", error);
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
