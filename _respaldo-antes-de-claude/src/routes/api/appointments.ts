import { createFileRoute } from "@tanstack/react-router";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { escapeHtml, formatDate } from "@/lib/appointment-utils";
import { sendEmail } from "@/lib/mailer";



export const Route = createFileRoute("/api/appointments")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const name = String(body.name ?? "").trim();
          const phone = String(body.phone ?? "").trim();
          const email = String(body.email ?? "").trim() || null;
          const service = String(body.service ?? "").trim();
          const preferredDate = String(body.preferredDate ?? "").trim();
          const preferredTime = String(body.preferredTime ?? "").trim();
          const message = String(body.message ?? "").trim() || null;

          if (!name || !phone || !service || !preferredDate || !preferredTime) {
            return Response.json({ ok: false, error: "Faltan datos obligatorios." }, { status: 400 });
          }

          const { data: existingAppointment } = await supabaseAdmin
            .from("appointments")
            .select("id")
            .eq("preferred_date", preferredDate)
            .eq("preferred_time", preferredTime)
            .in("status", ["pendiente", "confirmada", "reprogramada_propuesta"])
            .maybeSingle();

          if (existingAppointment) {
            return Response.json(
              { ok: false, error: "Ese horario ya no está disponible. Elige otra fecha u hora." },
              { status: 409 },
            );
          }

          const { data: appointment, error } = await supabaseAdmin
            .from("appointments")
            .insert({
              name,
              phone,
              email,
              service,
              preferred_date: preferredDate,
              preferred_time: preferredTime,
              message,
              action_token: randomUUID(),
            })
            .select("id, action_token")
            .single();

          if (error || !appointment) {
            console.error("Error guardando solicitud:", error);
            return Response.json({ ok: false, error: "No se pudo guardar la solicitud." }, { status: 500 });
          }

          const safeName = escapeHtml(name);
          const safePhone = escapeHtml(phone);
          const safeEmail = escapeHtml(email ?? "No indicado");
          const safeService = escapeHtml(service);
          const safeDate = escapeHtml(formatDate(preferredDate));
          const safeTime = escapeHtml(preferredTime);
          const safeMessage = escapeHtml(message ?? "Sin mensaje adicional");
          const secretaryEmail = process.env["GMAIL_USER"];
          const appUrl = process.env["PUBLIC_APP_URL"] || "http://localhost:3000";
          const acceptUrl = `${appUrl}/api/appointments/accept?token=${appointment.action_token}`;
          const rejectUrl = `${appUrl}/api/appointments/reject?token=${appointment.action_token}`;

          if (email) {
            await sendEmail(
              email,
              "Solicitud recibida | Clínica Dental Siloé",
              `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#24323d;border:1px solid #dbe4e8"><div style="padding:24px 28px;background:#0f766e;color:#fff"><h1 style="margin:0;font-size:24px">Clínica Dental Siloé</h1></div><div style="padding:28px"><p>Estimado(a) <strong>${safeName}</strong>:</p><p>Hemos recibido correctamente su solicitud de cita. Nuestro equipo revisará la disponibilidad y se pondrá en contacto para confirmar la atención.</p><div style="padding:18px;background:#f3f7f8;border-left:4px solid #0f766e"><p><strong>Servicio:</strong> ${safeService}</p><p><strong>Fecha solicitada:</strong> ${safeDate}</p><p><strong>Hora solicitada:</strong> ${safeTime}</p></div><p>Esta comunicación confirma la recepción de la solicitud, no la cita definitiva.</p><p>Atentamente,<br><strong>Equipo de Clínica Dental Siloé</strong><br>Tel. 7013 7712</p></div></div>`,
            );
          }

          if (secretaryEmail) {
            await sendEmail(
              secretaryEmail,
              `Nueva solicitud de cita | ${name}`,
              `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#24323d"><h2 style="color:#0f766e">Nueva solicitud de cita</h2><p>Se recibió una nueva solicitud pendiente de confirmación.</p><table style="border-collapse:collapse;width:100%"><tr><td><strong>Nombre</strong></td><td>${safeName}</td></tr><tr><td><strong>Teléfono</strong></td><td>${safePhone}</td></tr><tr><td><strong>Correo</strong></td><td>${safeEmail}</td></tr><tr><td><strong>Servicio</strong></td><td>${safeService}</td></tr><tr><td><strong>Fecha</strong></td><td>${safeDate}</td></tr><tr><td><strong>Hora</strong></td><td>${safeTime}</td></tr><tr><td><strong>Mensaje</strong></td><td>${safeMessage}</td></tr></table><p style="margin-top:24px"><a href="${acceptUrl}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#fff;text-decoration:none">Aceptar cita</a> <a href="${rejectUrl}" style="display:inline-block;padding:12px 18px;background:#8b2635;color:#fff;text-decoration:none">Proponer otro horario</a></p></div>`,
            );
          }

          return Response.json({ ok: true, id: appointment.id });
        } catch (error) {
          console.error("Error procesando solicitud de cita:", error);
          return Response.json({ ok: false, error: "No se pudo procesar la solicitud." }, { status: 500 });
        }
      },
    },
  },
});
