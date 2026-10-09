import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { FULL_ADDRESS, SITE } from "@/lib/site";

export const Route = createFileRoute("/politica-de-privacidad")({
  head: () => ({
    meta: [
      // Páginas legales: se pueden leer desde el pie de página, pero no deben salir en Google.
      { name: "robots", content: "noindex, follow" },
      { title: `Política de privacidad | ${SITE.name}` },
      {
        name: "description",
        content: `Cómo ${SITE.name} recopila, usa y protege tus datos personales, y cómo puedes ejercer tus derechos según la Ley 8968 de Costa Rica.`,
      },
      { property: "og:title", content: `Política de privacidad | ${SITE.name}` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/politica-de-privacidad` }],
  }),
  component: PoliticaPrivacidad,
});

function PoliticaPrivacidad() {
  return (
    <LegalLayout
      title="Política de privacidad"
      intro={`En ${SITE.name} cuidamos tus datos. Aquí te explicamos qué información recopilamos en este sitio, para qué la usamos, con quién se comparte y cómo puedes ejercer tus derechos.`}
    >
      <LegalSection title="1. Responsable del tratamiento">
        <ul>
          <li>Responsable: {SITE.name}</li>
          <li>Dirección: {FULL_ADDRESS}</li>
          <li>Teléfono: {SITE.phoneDisplay}</li>
          <li>Correo para temas de privacidad: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Qué datos recopilamos">
        <ul>
          <li>
            <strong>Solicitud de cita:</strong> nombre, teléfono, correo electrónico (opcional), servicio
            de interés, fecha y hora preferidas y el mensaje que decidas escribir.
          </li>
          <li>
            <strong>Opiniones y mensajes a la clínica:</strong> tu calificación, tu nombre (opcional) y el
            texto que escribas.
          </li>
          <li>
            <strong>WhatsApp:</strong> si usas los botones de WhatsApp, la conversación ocurre en esa
            aplicación y se rige también por sus condiciones. Nosotros recibimos el número y los mensajes
            que nos envíes.
          </li>
          <li>
            <strong>Datos técnicos:</strong> información básica de la visita, como dirección IP, tipo de
            navegador y páginas consultadas, que el servicio de alojamiento registra por seguridad y
            funcionamiento.
          </li>
        </ul>
        <p>
          Te pedimos que <strong>no escribas datos clínicos detallados</strong> (diagnósticos, historial
          médico, medicamentos) en los formularios del sitio. Esa información se recoge de forma segura en la
          valoración presencial.
        </p>
      </LegalSection>

      <LegalSection title="3. Para qué usamos tus datos">
        <ul>
          <li>Gestionar tu solicitud de cita, contactarte para confirmarla, reprogramarla o cancelarla.</li>
          <li>Enviarte confirmaciones y recordatorios de tu cita por el medio de contacto que indicaste.</li>
          <li>Responder tus consultas, incluidas las de precios y servicios.</li>
          <li>Publicar y gestionar opiniones de pacientes en este sitio, cuando tú decides dejarlas.</li>
          <li>Proteger el sitio contra spam, abusos y usos fraudulentos.</li>
          <li>Cumplir obligaciones legales aplicables a la clínica.</li>
        </ul>
        <p>No usamos tus datos para enviarte publicidad si no lo has aceptado de forma expresa y no los vendemos a terceros.</p>
      </LegalSection>

      <LegalSection title="4. Consentimiento y datos de salud">
        <p>
          Tratamos los datos que nos entregas con tu consentimiento, que otorgas al enviar el formulario o
          escribirnos. La información sobre tu salud es un dato sensible según la Ley 8968; si decides
          incluirla en un mensaje, lo haremos únicamente para atender tu consulta y con el cuidado
          reforzado que exige la ley. Puedes retirar tu consentimiento en cualquier momento, sin efecto
          retroactivo.
        </p>
      </LegalSection>

      <LegalSection title="5. Con quién compartimos los datos">
        <p>
          Solo compartimos datos con proveedores que nos ayudan a operar el sitio y que los tratan
          siguiendo nuestras instrucciones:
        </p>
        <ul>
          <li>Servicios de alojamiento y base de datos donde se guardan las solicitudes y opiniones.</li>
          <li>Servicio de correo electrónico para enviar las notificaciones de las citas.</li>
          <li>Proveedores del mapa de ubicación (OpenStreetMap), de la librería que lo muestra (unpkg) y de las fuentes tipográficas (Google). Al cargar estos elementos reciben tu dirección IP.</li>
          <li>WhatsApp, Instagram y Google (reseñas), solo cuando tú eliges usar esos enlaces.</li>
        </ul>
        <p>También podremos entregar datos a autoridades cuando una ley o una orden judicial lo exijan.</p>
      </LegalSection>

      <LegalSection title="6. Transferencias fuera de Costa Rica">
        <p>
          Algunos de estos proveedores pueden almacenar o procesar datos en servidores ubicados fuera de
          Costa Rica. Elegimos proveedores que aplican medidas de seguridad adecuadas para proteger tu
          información.
        </p>
      </LegalSection>

      <LegalSection title="7. Cuánto tiempo conservamos los datos">
        <p>
          Conservamos los datos de las solicitudes de cita mientras sean necesarios para atenderte y para
          cumplir obligaciones legales. Las opiniones publicadas se conservan hasta que pidas retirarlas.
          Cuando ya no sean necesarios, los eliminamos o los anonimizamos.
        </p>
      </LegalSection>

      <LegalSection title="8. Tus derechos">
        <p>
          De acuerdo con la Ley 8968, Ley de Protección de la Persona frente al Tratamiento de sus Datos
          Personales, tienes derecho a:
        </p>
        <ul>
          <li>Saber qué datos tuyos tenemos y cómo los usamos (acceso).</li>
          <li>Corregir datos incorrectos o incompletos (rectificación).</li>
          <li>Pedir que eliminemos tus datos cuando proceda (supresión).</li>
          <li>Retirar tu consentimiento cuando quieras.</li>
        </ul>
        <p>
          Para ejercer estos derechos escríbenos a <a href={`mailto:${SITE.email}`}>{SITE.email}</a> o llámanos al{" "}
          {SITE.phoneDisplay}, indicando tu nombre y el derecho que deseas ejercer. Si consideras que no
          atendimos tu solicitud de forma adecuada, puedes presentar un reclamo ante la Agencia de
          Protección de Datos de los Habitantes (PRODHAB).
        </p>
      </LegalSection>

      <LegalSection title="9. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra pérdida,
          acceso no autorizado o uso indebido, entre ellas conexiones cifradas, acceso restringido a la
          información y controles contra el envío automatizado de formularios. Ningún sistema es
          totalmente infalible, pero trabajamos para mantener tu información segura.
        </p>
      </LegalSection>

      <LegalSection title="10. Menores de edad">
        <p>
          Si la persona que va a recibir la atención es menor de edad, la solicitud debe hacerla su madre,
          padre o representante legal, quien es responsable de dar el consentimiento para el tratamiento de
          los datos.
        </p>
      </LegalSection>

      <LegalSection title="11. Cookies">
        <p>
          Explicamos qué almacenamiento usa este sitio en la{" "}
          <Link to="/politica-de-cookies">política de cookies</Link>. También puedes ver el{" "}
          <Link to="/aviso-legal">aviso legal</Link> del sitio.
        </p>
      </LegalSection>

      <LegalSection title="12. Cambios en esta política">
        <p>
          Podemos modificar esta política para reflejar cambios en el sitio o en la ley. Publicaremos la
          versión vigente en esta página con su fecha de actualización.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
