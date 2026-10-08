// Ayudas contra spam para los formularios. No necesitan cuentas externas.
// Nota: el contador vive en la memoria del servidor; si el hosting reinicia el servidor se vacía.
// Es un freno razonable para uso normal; para ataques fuertes conviene sumar Cloudflare Turnstile.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_TRACKED_KEYS = 5000;

const hits = new Map<string, number[]>();

export function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    request.headers.get("cf-connecting-ip") ||
    forwarded ||
    request.headers.get("x-real-ip") ||
    "desconocido"
  );
}

export function isRateLimited(key: string, now = Date.now()) {
  if (hits.size > MAX_TRACKED_KEYS) {
    for (const [storedKey, times] of hits) {
      if (times.every((time) => now - time > WINDOW_MS)) hits.delete(storedKey);
    }
  }

  const recent = (hits.get(key) ?? []).filter((time) => now - time <= WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

// Una persona real tarda más de unos segundos en llegar al paso de datos y enviarlos.
export const MIN_FILL_MS = 2000;

export function isTooFast(startedAt: unknown, now = Date.now()) {
  const started = Number(startedAt);
  if (!Number.isFinite(started) || started <= 0) return true;
  if (started > now + 60_000) return true;
  return now - started < MIN_FILL_MS;
}
