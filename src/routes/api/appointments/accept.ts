import { createFileRoute } from "@tanstack/react-router";
import { escapeHtml, formatDate, buildWhatsAppUrl } from "@/lib/appointment-utils";
import { sendEmail } from "@/lib/mailer";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function page(title: string, bodyHtml: string) {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#24323d"><main style="max-width:680px;margin:48px auto;padding:24px;background:#fff;border-radius:14px;box-shadow:0 6px 18px rgba(15,23,42,0.08)"><div style="background:#0f766e;padding:22px 24px;border-radius:12px 12px 0 0;margin:-24px -24px 20px"><h1 style="margin:0;color:#fff;font-size:28px">${escapeHtml(title)}</h1></div>${bodyHtml}</main></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/appointments/accept")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token");
        if (!token) return page("Enlace inválido", "<p>No se recibió el token de la solicitud.</p>");

        const { data: appointment, error } = await supabaseAdmin
          .from("appointments")
          .select("id,name,email,phone,service,preferred_date,preferred_time,status")
          .eq("action_token", token)
          .single();

        if (error || !appointment) {
          return page("Solicitud no encontrada", "<p>El enlace no es válido o ya no existe.</p>");
        }

        if (appointment.status !== "pendiente") {
          return page(
            "Solicitud ya procesada",
            `<p>Esta solicitud ya está en estado: <strong>${escapeHtml(appointment.status)}</strong>.</p><p>Si necesitas revisar otra, vuelve a la lista de citas.</p>`,
          );
        }

        const { error: updateError } = await supabaseAdmin
          .from("appointments")
          .update({ status: "confirmada" })
          .eq("id", appointment.id);

        if (updateError) {
          return page("No se pudo confirmar", "<p>Inténtalo nuevamente en unos minutos.</p>");
        }

        const customerName = escapeHtml(appointment.name);
        const service = escapeHtml(appointment.service);
        const preferredDateText = escapeHtml(formatDate(appointment.preferred_date));
        const preferredTimeText = escapeHtml(appointment.preferred_time);
        const clinicPhone = "7013 7712";

        if (appointment.email) {
          const emailHtml = `
            <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;background:#ffffff;color:#24323d;border:1px solid #dbe4e8;">
              <div style="padding:24px 28px;background:#0f766e;color:#fff;">
                <h1 style="margin:0;font-size:24px">Clínica Dental Siloé</h1>
              </div>
              <div style="padding:28px;">
                <p>Estimado(a) <strong>${customerName}</strong>:</p>
                <p>Su cita ha sido <strong>CONFIRMADA</strong>.</p>
                <div style="padding:18px;background:#f3f7f8;border-left:4px solid #0f766e;line-height:1.7;">
                  <p><strong>Servicio:</strong> ${service}</p>
                  <p><strong>Fecha:</strong> ${preferredDateText}</p>
                  <p><strong>Hora:</strong> ${preferredTimeText}</p>
                </div>
                <p>Si necesita cambiar o cancelar su cita, comuníquese al <strong>${clinicPhone}</strong>.</p>
                <p>Atentamente,<br><strong>Equipo de Clínica Dental Siloé</strong></p>
              </div>
            </div>
          `;

          await sendEmail(
            appointment.email,
            "Cita confirmada | Clínica Dental Siloé",
            emailHtml,
          );
        }

        const whatsappMessage = `Hola ${appointment.name}, le informamos que su cita de ${appointment.service} el ${appointment.preferred_date} a las ${appointment.preferred_time} ha sido confirmada. Si necesita cambiar o cancelar su cita, comuníquese al 7013 7712. Clínica Dental Siloé.`;
        const whatsappUrl = buildWhatsAppUrl(appointment.phone, whatsappMessage);
        const emailStatus = appointment.email
          ? `<p>Se envió la confirmación al correo: <strong>${escapeHtml(appointment.email)}</strong>.</p>`
          : "<p>No había correo registrado para este paciente, pero puede avisarle por WhatsApp.</p>";

        return page(
          "Cita confirmada",
          `<div style="padding:8px 0 0">
            ${emailStatus}
            <p>Su cita quedó confirmada correctamente.</p>
            <p><a href="${whatsappUrl}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Abrir WhatsApp</a></p>
          </div>`,
        );
      },
    },
  },
});
