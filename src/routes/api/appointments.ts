import { createFileRoute } from "@tanstack/react-router";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { escapeHtml, formatDate, getTodayDate } from "@/lib/appointment-utils";
import { getClientKey, isRateLimited, isTooFast } from "@/lib/anti-spam";
import { sendEmail } from "@/lib/mailer";
import { OTHER_SERVICE_DETAIL_ERROR, OTHER_SERVICE_MIN_DETAIL, OTHER_SERVICE_NAME, getBookingHoursForDate } from "@/lib/site";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BODY_CHARS = 20_000;

export const Route = createFileRoute("/api/appointments")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // 1) Freno por persona: demasiados envíos seguidos desde la misma conexión.
          if (isRateLimited(getClientKey(request))) {
            return Response.json(
              { ok: false, error: "Hemos recibido muchas solicitudes desde tu conexión. Espera unos minutos o escríbenos por WhatsApp." },
              { status: 429, headers: { "retry-after": "600" } },
            );
          }

          const rawBody = await request.text();
          if (rawBody.length > MAX_BODY_CHARS) {
            return Response.json({ ok: false, error: "La solicitud es demasiado grande." }, { status: 413 });
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let body: any;
          try {
            body = JSON.parse(rawBody);
            if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("invalid");
          } catch {
            return Response.json({ ok: false, error: "No se pudo leer la solicitud." }, { status: 400 });
          }

          // 2) Campo trampa: solo los programas automáticos lo llenan. Respondemos "ok" sin guardar nada.
          if (String(body.website ?? "").trim() !== "") {
            return Response.json({ ok: true });
          }

          // 3) Tiempo mínimo: enviar el formulario en menos de unos segundos no es humano.
          if (isTooFast(body.startedAt)) {
            return Response.json(
              { ok: false, error: "Espera unos segundos e inténtalo de nuevo." },
              { status: 400 },
            );
          }

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

          // 4) Validación de los datos en el servidor (no basta con validar en el navegador).
          const phoneDigits = phone.replace(/\D/g, "").length;
          const invalid =
            name.length < 2 || name.length > 120 ||
            phoneDigits < 7 || phone.length > 30 ||
            (email !== null && (email.length > 254 || !EMAIL_PATTERN.test(email))) ||
            service.length > 120 ||
            (message !== null && message.length > 2000) ||
            !DATE_PATTERN.test(preferredDate) ||
            preferredDate < getTodayDate() ||
            // Horario real de la clínica: sábado solo en la mañana y domingo cerrado.
            !getBookingHoursForDate(preferredDate).includes(preferredTime);

          // "Otro servicio" exige describir qué necesita la persona (mínimo 5 caracteres).
          if (service === OTHER_SERVICE_NAME && (message === null || message.length < OTHER_SERVICE_MIN_DETAIL)) {
            return Response.json({ ok: false, error: OTHER_SERVICE_DETAIL_ERROR }, { status: 400 });
          }

          if (invalid) {
            return Response.json(
              { ok: false, error: "Revisa los datos de la solicitud e inténtalo de nuevo." },
              { status: 400 },
            );
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
          // Correo que recibe los avisos de nuevas citas. Si no se define NOTIFY_EMAIL, se usa GMAIL_USER.
          const secretaryEmail = process.env["NOTIFY_EMAIL"] || process.env["GMAIL_USER"];
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
