import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { COOKIE_EVENTS, readConsent, useCookieConsent, writeConsent } from "@/lib/cookie-consent";

export function CookieBanner() {
  const consent = useCookieConsent();
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(COOKIE_EVENTS.open, open);
    return () => window.removeEventListener(COOKIE_EVENTS.open, open);
  }, []);

  // consent === undefined: aún no se leyó la elección guardada, no mostramos nada.
  const visible = reopened || consent === null;
  if (!visible) return null;

  const choose = (value: "accepted" | "rejected") => {
    writeConsent(value);
    setReopened(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-text"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-primary/30 bg-ink/95 p-5 font-[system-ui,sans-serif] text-ivory shadow-2xl backdrop-blur-xl sm:bottom-5 sm:p-6"
    >
      <h2 id="cookie-banner-title" className="text-base font-semibold text-primary">
        Usamos cookies
      </h2>
      <p id="cookie-banner-text" className="mt-2 text-sm leading-6 text-ivory/80">
        Usamos almacenamiento técnico para que la página funcione. Con tu permiso también cargamos
        contenido de terceros, como el mapa de Google, que puede colocar sus propias cookies. Puedes
        cambiar tu decisión cuando quieras. Más información en la{" "}
        <Link to="/politica-de-cookies" className="text-primary underline underline-offset-4">
          política de cookies
        </Link>{" "}
        y en la{" "}
        <Link to="/politica-de-privacidad" className="text-primary underline underline-offset-4">
          política de privacidad
        </Link>
        .
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="goldOutline"
          className="w-full rounded-full text-ivory sm:w-auto"
          onClick={() => choose("rejected")}
        >
          Solo las necesarias
        </Button>
        <Button
          type="button"
          variant="gold"
          className="w-full rounded-full bg-none bg-primary sm:w-auto"
          onClick={() => choose("accepted")}
        >
          Aceptar todas
        </Button>
      </div>
      {reopened && readConsent() && (
        <p className="mt-3 text-xs text-ivory/60">
          Tu elección actual es: {readConsent() === "accepted" ? "aceptar todas" : "solo las necesarias"}.
        </p>
      )}
    </div>
  );
}
