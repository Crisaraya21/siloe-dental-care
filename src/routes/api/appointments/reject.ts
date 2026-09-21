import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function html(content: string) {
  return new Response(`<main style="font-family:Arial;max-width:620px;margin:40px auto;padding:24px">${content}</main>`, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export const Route = createFileRoute("/api/appointments/reject")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token");
        if (!token) return html("<h1>Enlace inválido</h1>");
        const { data: appointment } = await supabaseAdmin.from("appointments").select("name,preferred_date,preferred_time,status").eq("action_token", token).single();
        if (!appointment) return html("<h1>Solicitud no encontrada</h1>");
        if (appointment.status !== "pendiente") return html(`<h1>Solicitud ya procesada</h1><p>Estado actual: ${appointment.status}</p>`);
        return html(`<h1>Proponer otro horario</h1><p>Solicitud de ${appointment.name}</p><form method="post"><input type="hidden" name="token" value="${token}"><label>Nueva fecha<br><input type="date" name="proposedDate" required></label><br><br><label>Nueva hora<br><input type="time" name="proposedTime" required></label><br><br><button type="submit">Guardar propuesta</button></form>`);
      },
      POST: async ({ request }) => {
        const form = await request.formData();
        const token = String(form.get("token") ?? "");
        const proposedDate = String(form.get("proposedDate") ?? "");
        const proposedTime = String(form.get("proposedTime") ?? "");
        if (!token || !proposedDate || !proposedTime) return html("<h1>Datos incompletos</h1>");

        const { data: appointment } = await supabaseAdmin.from("appointments").select("id,name,phone").eq("action_token", token).single();
        if (!appointment) return html("<h1>Solicitud no encontrada</h1>");
        const { error } = await supabaseAdmin.from("appointments").update({ status: "reprogramada_propuesta", proposed_date: proposedDate, proposed_time: proposedTime }).eq("id", appointment.id);
        if (error) return html("<h1>No se pudo guardar la propuesta</h1>");

        const whatsapp = `https://wa.me/${appointment.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${appointment.name}, le proponemos reprogramar su cita para el ${proposedDate} a las ${proposedTime}. ¿Le funciona ese horario? Clínica Dental Siloé.`)}`;
        return html(`<h1>Propuesta guardada</h1><p><a href="${whatsapp}">Abrir WhatsApp para enviar la propuesta</a></p>`);
      },
    },
  },
});
