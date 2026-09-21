import { createFileRoute } from "@tanstack/react-router";
import { sendEmail } from "@/lib/mailer";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function page(title: string, message: string) {
  return new Response(`<main style="font-family:Arial;max-width:620px;margin:60px auto;padding:24px"><h1>${title}</h1><p>${message}</p></main>`, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export const Route = createFileRoute("/api/appointments/accept")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token");
        if (!token) return page("Enlace inválido", "No se recibió el token de la solicitud.");

        const { data: appointment, error } = await supabaseAdmin
          .from("appointments")
          .select("id,name,email,phone,service,preferred_date,preferred_time,status")
          .eq("action_token", token)
          .single();
        if (error || !appointment) return page("Solicitud no encontrada", "El enlace no es válido o ya no existe.");
        if (appointment.status !== "pendiente") return page("Solicitud ya procesada", `Esta solicitud ya está en estado: ${appointment.status}.`);

        const { error: updateError } = await supabaseAdmin.from("appointments").update({ status: "confirmada" }).eq("id", appointment.id);
        if (updateError) return page("No se pudo confirmar", "Inténtalo nuevamente.");

        if (appointment.email) {
          await sendEmail(appointment.email, "Cita confirmada | Clínica Dental Siloé", `<p>Estimado(a) ${appointment.name}:</p><p>Su cita ha sido confirmada. Nos comunicaremos por WhatsApp para coordinar los detalles.</p><p>Atentamente,<br>Clínica Dental Siloé</p>`);
        }
        const whatsapp = `https://wa.me/${appointment.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${appointment.name}, confirmamos su cita de ${appointment.service} para el ${appointment.preferred_date} a las ${appointment.preferred_time}. Clínica Dental Siloé.`)}`;
        return page("Cita confirmada", `<p>La cita quedó confirmada correctamente.</p><p><a href="${whatsapp}">Abrir WhatsApp para avisar al paciente</a></p>`);
      },
    },
  },
});
