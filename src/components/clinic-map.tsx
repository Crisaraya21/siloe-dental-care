/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLINIC_COORDS, DIRECTIONS_URL, SITE } from "@/lib/site";

// Mapa propio de la clínica: mapa oscuro con detalles dorados y un diente que "llega" a la ubicación.
// La librería del mapa (Leaflet) se carga desde unpkg con verificación de integridad (SRI),
// así no hace falta instalar nada con npm.
const LEAFLET_VERSION = "1.9.4";
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS_SRI = "sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH";
const LEAFLET_CSS_SRI = "sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H";

// Calles de OpenStreetMap (no pide llave). El color oscuro y dorado se logra con filtros en styles.css.
const TILES_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILES_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

const TOOTH_PATH =
  "M32 11c-3.2-2.4-7.2-4.2-12-3.6C13.2 8.3 9 13.6 9.4 21c.3 5.4 2.6 8.6 3.4 14 .9 6 1.6 15.4 4.6 22.4 1.2 2.8 3 4.6 5 4.4 2.6-.3 3.6-3.6 4.5-8.6.7-4 1.7-9.2 5.1-9.2s4.4 5.2 5.1 9.2c.9 5 1.9 8.3 4.5 8.6 2 .2 3.8-1.6 5-4.4 3-7 3.7-16.4 4.6-22.4.8-5.4 3.1-8.6 3.4-14 .4-7.4-3.8-12.7-10.6-13.6-4.8-.6-8.8 1.2-12 3.6z";
const TOOTH_SHINE = "M18.5 16c1.6-2.4 4.2-3.2 6.6-2.6";

function toothSvg(gradientId: string, className: string) {
  return `<svg class="${className}" viewBox="0 0 64 72" aria-hidden="true" focusable="false"><defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#eadfc8"/></linearGradient></defs><path d="${TOOTH_PATH}" fill="url(#${gradientId})" stroke="#c9a45c" stroke-width="2.2" stroke-linejoin="round"/><path d="${TOOTH_SHINE}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9"/></svg>`;
}

const MARKER_HTML = `<div class="tooth-pin"><span class="tooth-ring"></span><span class="tooth-ring tooth-ring-2"></span><span class="tooth-shadow"></span>${toothSvg("siloeToothMarker", "tooth-body")}</div>`;

const POPUP_HTML = `<div class="siloe-popup-body"><strong>${SITE.name}</strong><span>${SITE.city}, ${SITE.country}</span><a href="${DIRECTIONS_URL}" target="_blank" rel="noopener noreferrer">C&oacute;mo llegar</a></div>`;

let leafletPromise: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L && w.L.map) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = LEAFLET_CSS;
      css.integrity = LEAFLET_CSS_SRI;
      css.crossOrigin = "anonymous";
      document.head.appendChild(css);
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.integrity = LEAFLET_JS_SRI;
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => (w.L && w.L.map ? resolve(w.L) : reject(new Error("Leaflet no disponible")));
    script.onerror = () => {
      leafletPromise = null;
      script.remove();
      reject(new Error("No se pudo cargar el mapa"));
    };
    document.head.appendChild(script);
  });

  return leafletPromise;
}

export function ClinicMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const host = mapRef.current;
    if (!host) return;

    let cancelled = false;
    let map: any = null;
    let observer: IntersectionObserver | null = null;
    const timers: number[] = [];

    loadLeaflet()
      .then((L) => {
        if (cancelled) return;

        map = L.map(host, {
          center: [CLINIC_COORDS.lat, CLINIC_COORDS.lng],
          zoom: 16,
          minZoom: 12,
          maxZoom: 19,
          zoomControl: false,
          scrollWheelZoom: false,
          // En el celular un dedo mueve la página, no el mapa. Se acerca con pellizco o con los botones.
          dragging: !L.Browser.mobile,
        });

        map.attributionControl.setPrefix(false);
        L.tileLayer(TILES_URL, {
          attribution: TILES_ATTRIBUTION,
          maxZoom: 19,
        }).addTo(map);
        L.control.zoom({ position: "bottomright", zoomInTitle: "Acercar", zoomOutTitle: "Alejar" }).addTo(map);

        const icon = L.divIcon({
          className: "siloe-tooth-marker",
          html: MARKER_HTML,
          iconSize: [84, 96],
          iconAnchor: [42, 84],
          popupAnchor: [0, -80],
        });

        const marker = L.marker([CLINIC_COORDS.lat, CLINIC_COORDS.lng], {
          icon,
          title: SITE.name,
        }).addTo(map);
        marker.bindPopup(POPUP_HTML, {
          closeButton: false,
          autoPan: false,
          maxWidth: 240,
          className: "siloe-popup",
        });

        const arrive = (openPopup: boolean) => {
          const pin = marker.getElement()?.querySelector(".tooth-pin") as HTMLElement | null;
          if (!pin) return;
          pin.classList.remove("is-arriving");
          void pin.offsetWidth; // reinicia la animación
          pin.classList.add("is-arriving");
          if (openPopup) timers.push(window.setTimeout(() => marker.openPopup(), 1700));
        };

        marker.on("click", () => arrive(false));
        setStatus("ready");

        if (typeof IntersectionObserver === "undefined") {
          arrive(true);
          return;
        }
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              arrive(true);
              observer?.disconnect();
            }
          },
          { threshold: 0.45 },
        );
        observer.observe(host);
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      if (map) map.remove();
    };
  }, []);

  return (
    <div className="siloe-map relative isolate h-[360px] w-full overflow-hidden rounded-xl border border-primary/20 bg-ink sm:h-[420px] lg:h-full lg:min-h-[468px]">
      <div
        ref={mapRef}
        role="region"
        aria-label={`Mapa con la ubicación de ${SITE.name}`}
        className="absolute inset-0 z-0"
      />

      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-ink/85 px-4 py-2 font-[system-ui,sans-serif] text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ivory/90 backdrop-blur-md transition-colors hover:bg-primary hover:text-ink sm:left-4 sm:top-4"
      >
        <Navigation size={14} aria-hidden="true" /> Cómo llegar
      </a>

      {status !== "ready" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-ink px-6 text-center font-[system-ui,sans-serif]">
          <span
            aria-hidden="true"
            className={status === "loading" ? "block size-16 animate-pulse" : "block size-16"}
            dangerouslySetInnerHTML={{ __html: toothSvg("siloeToothFallback", "size-full") }}
          />
          {status === "loading" ? (
            <p className="text-sm text-ivory/70">Cargando mapa…</p>
          ) : (
            <>
              <p className="max-w-xs text-sm leading-6 text-ivory/75">
                No pudimos cargar el mapa en este momento. Puedes ver la ruta directamente en Google Maps.
              </p>
              <Button variant="gold" className="rounded-full" asChild>
                <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
                  <Navigation /> Cómo llegar
                </a>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
