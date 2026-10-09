import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import logoImage from "@/assets/logo-siloe.png";
import { SITE } from "@/lib/site";

export function LegalLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-ink/10 bg-ink">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3 font-[system-ui,sans-serif]" aria-label={`Ir al inicio de ${SITE.name}`}>
            <img
              src={logoImage}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full border border-primary/50 object-cover"
            />
            <span className="text-sm font-semibold leading-tight text-primary">
              CLÍNICA DENTAL <span className="block tracking-[0.1em] text-ivory">SILOÉ</span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 font-[system-ui,sans-serif] text-sm text-ivory transition-colors hover:bg-primary/10"
          >
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="section-eyebrow">Información legal</p>
        <h1 className="mt-3 text-3xl leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-ink/70 sm:text-lg">{intro}</p>
        <p className="mt-2 font-[system-ui,sans-serif] text-xs text-ink/50">
          Última actualización: {SITE.lastUpdated}
        </p>
        <div className="legal-content mt-10">{children}</div>
      </main>

      <footer className="border-t border-ink/10 bg-ink px-5 py-8 font-[system-ui,sans-serif] text-xs text-ivory/70 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <nav aria-label="Información legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/aviso-legal" className="hover:text-primary">Aviso legal</Link>
            <Link to="/politica-de-privacidad" className="hover:text-primary">Política de privacidad</Link>
            <Link to="/politica-de-cookies" className="hover:text-primary">Política de cookies</Link>
          </nav>
          <p>
            {SITE.name} se reserva el derecho de admisión. © {new Date().getFullYear()} {SITE.name}. Todos
            los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-2xl leading-snug sm:text-3xl">{title}</h2>
      <div className="mt-3 space-y-4 text-base leading-7 text-ink/75 [&_a]:text-gold-muted [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </section>
  );
}

export function Pending({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-primary/25 px-1.5 py-0.5 font-[system-ui,sans-serif] text-sm text-ink">
      {children}
    </mark>
  );
}
