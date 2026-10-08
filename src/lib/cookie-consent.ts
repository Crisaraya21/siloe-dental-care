import { useEffect, useState } from "react";

const KEY = "siloe-cookie-consent";
const CHANGE_EVENT = "siloe:consent-change";
const OPEN_EVENT = "siloe:open-cookie-settings";

export type CookieConsent = "accepted" | "rejected" | null;

export function readConsent(): CookieConsent {
  try {
    const value = localStorage.getItem(KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: Exclude<CookieConsent, null>) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Si el navegador bloquea el almacenamiento, la elección solo vale para esta visita.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export const COOKIE_EVENTS = { change: CHANGE_EVENT, open: OPEN_EVENT } as const;

// undefined = todavía no se ha leído (evita parpadeos durante el renderizado del servidor).
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | undefined>(undefined);

  useEffect(() => {
    const sync = () => setConsent(readConsent());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return consent;
}
