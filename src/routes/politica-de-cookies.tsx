import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/politica-de-cookies")({
  head: () => ({
    meta: [
      { title: `Política de cookies | ${SITE.name}` },
      {
        name: "description",
        content: `Qué cookies y almacenamiento usa el sitio de ${SITE.name}, para qué sirven y cómo puedes controlarlas.`,
      },
      { property: "og:title", content: `Política de cookies | ${SITE.name}` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/politica-de-cookies` }],
  }),
  component: PoliticaCookies,
});

const ROWS = [
  {
    name: "siloe-google-review-pending / siloe-google-review-reminder-shown",
    owner: "Propia",
    type: "Funcional",
    purpose: "Recuerdan que empezaste a calificar tu experiencia para mostrarte un aviso una sola vez.",
    duration: "Hasta que la borres",
  },
  {
    name: "sb-*",
    owner: "Servicio de base de datos",
    type: "Necesaria",
    purpose: "Almacenamiento técnico que usa el servicio donde se guardan las solicitudes y opiniones.",
    duration: "Sesión o hasta que la borres",
  },
  {
    name: "Google Maps",
    owner: "Google (tercero)",
    type: "De terceros",
    purpose: "Muestra el mapa de la clínica. Al cargarlo, Google puede colocar sus propias cookies según su política.",
    duration: "Según Google",
  },
] as const;

function PoliticaCookies() {
  return (
    <LegalLayout
      title="Política de cookies"
      intro={`Aquí te explicamos qué cookies y almacenamiento usa el sitio de ${SITE.name}, para qué sirven y cómo puedes controlarlos.`}
    >
      <LegalSection title="1. Qué son las cookies">
        <p>
          Las cookies son pequeños archivos que un sitio guarda en tu navegador. Funcionan de forma
          parecida al almacenamiento local del navegador, que también usamos. Sirven para que el sitio
          funcione, recuerde tus decisiones y, en algunos casos, para cargar contenido de otros servicios.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué usamos en este sitio">
        <ul className="!list-none !pl-0">
          {ROWS.map((row) => (
            <li key={row.name} className="rounded-xl border border-ink/10 bg-background p-4">
              <p className="font-[system-ui,sans-serif] text-sm font-semibold text-ink break-words">{row.name}</p>
              <p className="mt-1 font-[system-ui,sans-serif] text-xs text-ink/60">
                {row.type} · {row.owner} · {row.duration}
              </p>
              <p className="mt-2 text-sm leading-6">{row.purpose}</p>
            </li>
          ))}
        </ul>
        <p>
          No usamos cookies de publicidad ni de seguimiento entre sitios. Las fuentes tipográficas se
          cargan desde Google Fonts, que puede recibir tu dirección IP al entregarlas, aunque no coloca
          cookies de seguimiento para ello.
        </p>
      </LegalSection>

      <LegalSection title="3. Cómo controlar las cookies">
        <p>
          Puedes borrar o bloquear las cookies desde la configuración de tu navegador en cualquier
          momento. Si bloqueas las necesarias, algunas partes del sitio podrían no funcionar bien.
        </p>
      </LegalSection>

      <LegalSection title="4. Más información">
        <p>
          Consulta la <Link to="/politica-de-privacidad">política de privacidad</Link> para saber cómo
          tratamos tus datos personales y el <Link to="/aviso-legal">aviso legal</Link> para conocer las
          condiciones de uso del sitio.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
