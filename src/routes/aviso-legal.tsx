import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { FULL_ADDRESS, SITE } from "@/lib/site";

export const Route = createFileRoute("/aviso-legal")({
  head: () => ({
    meta: [
      // Páginas legales: se pueden leer desde el pie de página, pero no deben salir en Google.
      { name: "robots", content: "noindex, follow" },
      { title: `Aviso legal | ${SITE.name}` },
      {
        name: "description",
        content: `Aviso legal de ${SITE.name}: datos de contacto, condiciones de uso, derecho de admisión, propiedad intelectual y legislación aplicable.`,
      },
      { property: "og:title", content: `Aviso legal | ${SITE.name}` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/aviso-legal` }],
  }),
  component: AvisoLegal,
});

function AvisoLegal() {
  return (
    <LegalLayout
      title="Aviso legal"
      intro={`Estas son las condiciones que aplican cuando visitas y usas el sitio web de ${SITE.name}. Al navegar por él aceptas lo que se explica aquí.`}
    >
      <LegalSection title="1. Datos de la clínica">
        <ul>
          <li>Nombre comercial: {SITE.name}</li>
          <li>Dirección: {FULL_ADDRESS}</li>
          <li>Teléfono y WhatsApp: {SITE.phoneDisplay}</li>
          <li>Correo de contacto: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Objeto del sitio">
        <p>
          Este sitio presenta los servicios de {SITE.name}, permite solicitar una cita y facilita el
          contacto con la clínica. Navegar por el sitio es gratuito y no te obliga a contratar ningún servicio.
        </p>
      </LegalSection>

      <LegalSection title="3. Carácter informativo del contenido">
        <ul>
          <li>
            La información de este sitio es de carácter general y no sustituye la valoración, el
            diagnóstico ni el consejo de un profesional en odontología. Cada tratamiento se indica
            únicamente después de una valoración clínica personalizada.
          </li>
          <li>
            Los resultados de los tratamientos pueden variar de una persona a otra. Las fotografías
            y los textos son ilustrativos y no constituyen una garantía de resultado.
          </li>
          <li>
            Enviar el formulario de solicitud no confirma una cita. La cita queda confirmada solo
            cuando la clínica te lo comunica de forma expresa.
          </li>
          <li>
            Los precios no se publican en el sitio porque dependen de la valoración de cada caso. Puedes
            consultarlos por WhatsApp o en la clínica.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Derecho de admisión">
        <p>
          {SITE.name} se reserva el derecho de admisión. Este derecho se ejerce de forma razonable y
          proporcionada, por causas objetivas como conductas agresivas, irrespetuosas o que pongan en
          riesgo la seguridad de las personas, del personal o de las instalaciones.
        </p>
        <p>
          El derecho de admisión nunca se aplicará de manera discriminatoria por motivos de raza,
          sexo, edad, religión, nacionalidad, discapacidad, orientación sexual, condición
          socioeconómica u otra condición protegida por la ley, y se entiende sin perjuicio de las
          obligaciones legales de atención de urgencias.
        </p>
      </LegalSection>

      <LegalSection title="5. Uso adecuado del sitio">
        <p>Al usar este sitio te comprometes a:</p>
        <ul>
          <li>Proporcionar datos verdaderos cuando completes un formulario.</li>
          <li>No enviar solicitudes falsas, repetidas o automatizadas, ni intentar sobrecargar o vulnerar el sitio.</li>
          <li>No publicar contenido ofensivo, falso, ilegal o que vulnere derechos de terceros.</li>
          <li>No usar el sitio para enviar publicidad no solicitada.</li>
        </ul>
        <p>
          La clínica puede bloquear envíos que parezcan abusivos y retirar cualquier contenido que
          incumpla estas condiciones.
        </p>
      </LegalSection>

      <LegalSection title="6. Opiniones y reseñas">
        <p>
          Las opiniones que dejes en el sitio expresan únicamente tu punto de vista como paciente.
          {" "}{SITE.name} puede retirar comentarios que contengan insultos, datos personales de terceros,
          contenido ilegal o publicidad. También puedes publicar tu opinión directamente en Google; esa
          publicación se rige por las condiciones de Google.
        </p>
      </LegalSection>

      <LegalSection title="7. Propiedad intelectual">
        <p>
          Los textos, el diseño, el logotipo, las fotografías y demás elementos de este sitio pertenecen
          a {SITE.name} o se usan con autorización de sus titulares, y están protegidos por la Ley de
          Derechos de Autor y Derechos Conexos de Costa Rica. No se permite copiarlos, reproducirlos ni
          distribuirlos con fines comerciales sin autorización previa y por escrito.
        </p>
      </LegalSection>

      <LegalSection title="8. Enlaces y servicios de terceros">
        <p>
          El sitio contiene enlaces o contenido de terceros, como Google Maps, Google (reseñas),
          Instagram y WhatsApp. {SITE.name} no controla esos servicios ni es responsable de su contenido
          o de sus políticas de privacidad; te recomendamos revisarlas cuando los uses.
        </p>
      </LegalSection>

      <LegalSection title="9. Responsabilidad">
        <p>
          Hacemos lo posible por mantener el sitio disponible y la información actualizada, pero no
          garantizamos que esté libre de errores o interrupciones. {SITE.name} no será responsable por
          daños derivados del uso del sitio o de decisiones tomadas únicamente con base en su
          información general, en la medida en que la ley lo permita.
        </p>
      </LegalSection>

      <LegalSection title="10. Datos personales y cookies">
        <p>
          El tratamiento de tus datos personales se explica en la{" "}
          <Link to="/politica-de-privacidad">política de privacidad</Link> y el uso de cookies en la{" "}
          <Link to="/politica-de-cookies">política de cookies</Link>.
        </p>
      </LegalSection>

      <LegalSection title="11. Legislación aplicable y jurisdicción">
        <p>
          Este aviso se rige por las leyes de la República de Costa Rica. Para cualquier controversia
          serán competentes los tribunales de Costa Rica, sin perjuicio de los derechos que la Ley de
          Promoción de la Competencia y Defensa Efectiva del Consumidor otorga a las personas
          consumidoras.
        </p>
      </LegalSection>

      <LegalSection title="12. Cambios en este aviso">
        <p>
          Podemos actualizar este aviso cuando sea necesario. La versión vigente es la que aparece
          publicada en esta página, con su fecha de actualización.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
