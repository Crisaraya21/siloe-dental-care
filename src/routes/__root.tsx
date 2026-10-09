import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Home, MessageCircle, CalendarDays } from "lucide-react";

import appCss from "../styles.css?url";
import logoImage from "@/assets/logo-siloe.png";
import { SITE, whatsappLink } from "@/lib/site";

function NotFoundComponent() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-16 text-ivory">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--primary)_22%,transparent),_transparent_60%)]"
      />
      <div className="w-full max-w-lg text-center">
        <img
          src={logoImage}
          alt={`Logo de ${SITE.name}`}
          width={72}
          height={72}
          className="mx-auto size-[72px] rounded-full border border-primary/50 object-cover"
        />
        <p className="mt-8 text-7xl font-semibold leading-none text-primary sm:text-8xl">404</p>
        <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">Esta página no existe</h1>
        <p className="mx-auto mt-4 max-w-md font-[system-ui,sans-serif] text-base leading-7 text-ivory/70">
          Puede que el enlace esté mal escrito o que la página haya cambiado de lugar. Tu sonrisa
          sigue siendo nuestra prioridad: vuelve al inicio o escríbenos y te ayudamos.
        </p>
        <div className="mt-8 flex flex-col gap-3 font-[system-ui,sans-serif] sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-gold-light"
          >
            <Home size={16} /> Volver al inicio
          </Link>
          <a
            href="/#agendar"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/50 px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-primary/10"
          >
            <CalendarDays size={16} /> Solicitar cita
          </a>
          <a
            href={whatsappLink(`Hola, quisiera información sobre ${SITE.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory/20 px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-ivory/5"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5 text-ivory">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">Esta página no cargó</h1>
        <p className="mt-3 font-[system-ui,sans-serif] text-sm leading-6 text-ivory/70">
          Algo salió mal de nuestro lado. Puedes intentar de nuevo o volver al inicio.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 font-[system-ui,sans-serif] sm:flex-row">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-gold-light"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-primary/50 px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-primary/10"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Clínica Dental Siloé" },
      { name: "description", content: "Atención dental premium y humana en Costa Rica." },
      { name: "author", content: "Clínica Dental Siloé" },
      { name: "theme-color", content: "#1f1f1f" },
      { name: "format-detection", content: "telephone=yes" },
      { property: "og:title", content: "Clínica Dental Siloé" },
      { property: "og:description", content: "Sonrisas que iluminan. Atención dental premium y humana." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_CR" },
      { property: "og:site_name", content: "Clínica Dental Siloé" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon-48.png", type: "image/png", sizes: "48x48" },
      { rel: "icon", href: "/favicon.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
