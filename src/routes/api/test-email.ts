import { createFileRoute } from "@tanstack/react-router";
import { sendEmail } from "@/lib/mailer";

export const Route = createFileRoute("/api/test-email")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const to = process.env["TEST_EMAIL_TO"];

          if (!to) {
            return Response.json(
              {
                ok: false,
                error: "La variable de entorno TEST_EMAIL_TO no está configurada en .env",
              },
              { status: 400 },
            );
          }

          await sendEmail(
            to,
            "Prueba Siloé",
            "<p>Este es un correo de prueba enviado desde el sistema de Clínica Dental Siloé.</p>",
          );

          return Response.json({ ok: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error enviando correo de prueba:", error);
          return Response.json(
            {
              ok: false,
              error: message,
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
