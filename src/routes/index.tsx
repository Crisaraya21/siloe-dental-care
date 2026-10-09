import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import {
  ArrowRight, ArrowUp, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3,
  ExternalLink, HeartHandshake, Info, Instagram, LoaderCircle, MapPin, Menu, MessageCircle, Phone,
  Star, X,
} from "lucide-react";
import { ClinicMap } from "@/components/clinic-map";
import { BOOKING_HOURS_WEEKDAY, DIRECTIONS_URL, OTHER_SERVICE_DETAIL_ERROR, OTHER_SERVICE_MIN_DETAIL, OTHER_SERVICE_NAME, SITE, getBookingHoursForDate, priceInquiryLink } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero.jpg";
import logoImage from "@/assets/logo-siloe.png";
import esteticaImage from "@/assets/estetica-dental.jpeg";
import carillasImage from "@/assets/carillas.jpg";
import blanqueamientoImage from "@/assets/blanqueamiento.jpg";
import coronasImage from "@/assets/coronas.jpg";
import especialidadesImage from "@/assets/especialidades.jpg";
import escanerImage from "@/assets/coronas-escaner.jpg";
import protesisImage from "@/assets/protesis.jpg";
import extraccionesImage from "@/assets/extracciones.jpg";
import cirugiaImage from "@/assets/cirugia.jpg";
import limpiezaImage from "@/assets/limpieza.jpg";
import radiografiaTacImage from "@/assets/radiografia-tac.jpeg";
import frenillosImage from "@/assets/frenillos.jpeg";
import instagramPhoto1 from "@/assets/instagram-1.jpeg";
import instagramPhoto2 from "@/assets/instagram-2.jpeg";
import instagramPhoto3 from "@/assets/instagram-3.jpeg";
import instagramPhoto4 from "@/assets/instagram-4.jpeg";
import instagramPhoto5 from "@/assets/instagram-5.jpeg";
import instagramPhoto6 from "@/assets/instagram-6.jpeg";
import fachadaImage from "@/assets/fachada-siloe.jpeg";

// Google y redes sociales piden la dirección completa de la imagen, no solo la ruta.
const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE.url}${path}`);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clínica Dental Siloé | Sonrisas que iluminan" },
      { name: "description", content: "Solicita tu cita dental en Clínica Dental Siloé. Estética, carillas, blanqueamiento, cirugía y atención humana." },
      { property: "og:title", content: "Clínica Dental Siloé" },
      { property: "og:description", content: "Tu sonrisa es la luz de tu historia. Solicita tu cita en línea." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE.url },
      { property: "og:image", content: absoluteUrl(heroImage) },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/` }],
    // Datos estructurados para que Google entienda que es una clínica dental local.
    // No se incluyen estrellas ni calificaciones propias: Google no las acepta como reseñas válidas.
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dentist",
          name: SITE.name,
          url: SITE.url,
          image: absoluteUrl(heroImage),
          email: SITE.email,
          telephone: `+${SITE.phoneIntl.slice(0, 3)} ${SITE.phoneIntl.slice(3, 7)} ${SITE.phoneIntl.slice(7)}`,
          address: {
            "@type": "PostalAddress",
            streetAddress: SITE.addressLine,
            addressLocality: SITE.city,
            addressRegion: SITE.region,
            addressCountry: "CR",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "08:00",
              closes: "17:30",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "08:00",
              closes: "12:00",
            },
          ],
          sameAs: [SITE.instagramUrl],
        }),
      },
    ],
  }),
  component: Home,
});

const SPECIALTIES_SERVICE_NAME = "Especialidades Odontológicas";
const SERVICES = [
  { title: "Estética Dental", image: esteticaImage, desc: "Tratamientos personalizados para armonizar la forma, el color y la proporción de la sonrisa.", fullDesc: "La valoración estética considera la forma, el color y la proporción de los dientes en relación con la sonrisa y los rasgos faciales. Con base en tus necesidades, se define un plan individualizado y los procedimientos más adecuados." },
  { title: "Carillas", image: carillasImage, desc: "Láminas de cerámica diseñadas para modificar la forma, el tamaño o el color dental.", fullDesc: "Las carillas son láminas delgadas, generalmente de cerámica, que se adhieren a la superficie frontal de los dientes. Tras valorar la salud oral y las características de cada pieza, pueden indicarse para corregir cambios de color, forma, tamaño o pequeñas irregularidades." },
  { title: "Blanqueamiento", image: blanqueamientoImage, desc: "Tratamiento profesional para aclarar el tono de los dientes naturales de forma controlada.", fullDesc: "Antes del blanqueamiento se revisan la salud oral, el tono inicial y la sensibilidad dental. La técnica se selecciona según cada caso; el grado de aclaramiento y la respuesta al tratamiento pueden variar entre personas." },
  { title: "Coronas y Puentes", image: coronasImage, desc: "Restauraciones que protegen dientes debilitados y reemplazan piezas ausentes, con garantía de por vida del laboratorio.", fullDesc: "Las coronas recubren y restauran dientes con daño extenso, mientras que los puentes pueden sustituir una o más piezas ausentes apoyándose en dientes o implantes. La valoración determina el diseño, el material y la alternativa indicada para cada caso. Además, tomamos las impresiones con escáner digital, lo que es más cómodo para el paciente y ofrece mayor precisión en el resultado. Nuestras coronas y puentes cuentan con garantía de por vida por parte del laboratorio." },
  { title: "Prótesis Dentales", image: protesisImage, desc: "Alternativas fijas y removibles para sustituir dientes y recuperar función masticatoria.", fullDesc: "Las prótesis parciales o completas, fijas o removibles, se planifican para reemplazar dientes ausentes y favorecer la masticación y el habla. El tipo de prótesis se define según la salud de los tejidos, las piezas restantes y las necesidades de cada paciente." },
  { title: "Extracciones", image: extraccionesImage, desc: "Retiro de piezas dentales cuando su estado o posición requiere extracción.", fullDesc: "El procedimiento comienza con una valoración de la pieza y de los tejidos cercanos; cuando se requiere, se complementa con estudios de imagen. La extracción se realiza con anestesia local y se acompaña de indicaciones para el cuidado y la recuperación." },
  { title: "Cirugía", image: cirugiaImage, desc: "Procedimientos de cirugía oral e implantología planificados según cada caso.", fullDesc: "La atención puede incluir procedimientos de cirugía oral, extracción de cordales e instalación de implantes. Cada plan se establece después de revisar la salud oral y los estudios necesarios, con indicaciones de preparación y seguimiento posterior." },
  { title: "Limpieza Dental", image: limpiezaImage, desc: "Profilaxis profesional para remover placa y cálculo, y apoyar la salud de las encías.", fullDesc: "La limpieza profesional ayuda a retirar placa bacteriana y cálculo de las superficies dentales y del margen de las encías. Según la valoración, puede incluir pulido y recomendaciones de higiene para mantener la salud oral entre consultas." },
  { title: "Radiografía Panorámica y TAC Dental", image: radiografiaTacImage, desc: "Imágenes panorámicas y tomografía 3D para valorar estructuras dentales con mayor detalle.", fullDesc: "La radiografía panorámica ofrece una vista general de los dientes y los maxilares; la tomografía computarizada (TAC o CBCT) produce imágenes tridimensionales de las estructuras indicadas. Estos estudios pueden apoyar la planificación de implantes, cirugías, ortodoncia y otros tratamientos complejos cuando el profesional los considera necesarios." },
  { title: "Ortodoncia (Frenillos)", image: frenillosImage, desc: "Ortodoncia con frenillos para alinear los dientes y corregir alteraciones de la mordida.", fullDesc: "La ortodoncia con frenillos aplica fuerzas controladas para corregir la posición de los dientes y algunas alteraciones de la mordida. El tratamiento incluye valoración, planificación individual y controles periódicos; su duración depende de las necesidades y evolución de cada paciente." },
  { title: "Escáner Digital", image: escanerImage, desc: "Captura imágenes 3D de alta precisión de dientes y encías, sin moldes de pasta ni alginato.", fullDesc: "El escáner digital es un dispositivo que captura imágenes tridimensionales (3D) de alta precisión de los dientes, las encías y el interior de la boca, y reemplaza los molestos moldes tradicionales de pasta o alginato. Nos brinda mayor precisión y comodidad para el paciente." },
  { title: SPECIALTIES_SERVICE_NAME, image: especialidadesImage, desc: "Atención con especialistas en cirugía maxilofacial, endodoncia, periodoncia, prostodoncia y ortodoncia.", fullDesc: "Te ofrecemos nuestros especialistas en:" },
] as const;

type Service = (typeof SERVICES)[number];

// Especialidades odontológicas: una sola tarjeta en Servicios; el detalle lista las 5 y el formulario pregunta "¿Cuál especialista?".
const SPECIALTIES = [
  { title: "Cirugía Maxilofacial", desc: "Cirugías de cordales, implantes, bichectomía, hilos tensores faciales, entre otros." },
  { title: "Endodoncia", desc: "Tratamiento de nervio y cirugía apical." },
  { title: "Periodoncia", desc: "Tratamiento de las encías, limpieza profunda con raspado y cirugía periodontal." },
  { title: "Prostodoncia", desc: "Rehabilitación de casos con prótesis, coronas, puentes o carillas dentales." },
  { title: "Ortodoncia", desc: "Ortodoncia interceptiva en niños, para guiar el crecimiento de los huesos y de las piezas dentales, y frenillos en cómodas cuotas." },
] as const;
type Review = { id: string; name: string; rating: number; text: string | null; created_at: string };
const GOOGLE_PLACE_ID = "ChIJ2RDM-2RloI8RrQDbA55yp0M";
const GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
const REVIEW_PENDING_KEY = "siloe-google-review-pending";
const REVIEW_REMINDER_SHOWN_KEY = "siloe-google-review-reminder-shown";
const REQUEST_TIMEOUT_MS = 30000;
const REVIEW_COOLDOWN_KEY = "siloe-review-last-sent";
const REVIEW_COOLDOWN_MS = 60_000;
const NAV_ITEMS = [
  ["Inicio", "#inicio"],
  ["Servicios", "#servicios"],
  ["Reseñas", "#resenas"],
  ["Preguntas", "#faq"],
  ["Ubicación", "#ubicacion"],
] as const;
const CLINIC_SCHEDULE = {
  timeZone: "America/Costa_Rica",
  opensAtMinutes: 8 * 60,
  // Hora de cierre por día, empezando en domingo (0 = cerrado):
  // lunes a viernes 5:30 pm, sábado 12:00 md.
  closesAtMinutesByDay: [0, 17 * 60 + 30, 17 * 60 + 30, 17 * 60 + 30, 17 * 60 + 30, 17 * 60 + 30, 12 * 60],
} as const;
const FAQS = [
  ["¿Cómo solicito mi primera cita?", "La primera cita la puedes solicitar llamando al 2460 7923, escribiendo a nuestro WhatsApp 7013 7712 o por medio de nuestra página web."],
  ["¿Cuánto dura una primera consulta?", "La primera consulta tiene una duración aproximada de 30 minutos. Iniciamos con la apertura del expediente para conocer más datos generales y de salud del paciente, continuamos con una revisión general y finalizamos con un plan de tratamiento para el paciente."],
  ["¿Aceptan seguros dentales?", "Sí, aceptamos seguros dentales."],
  ["¿Cada cuánto debo ir a una limpieza dental?", "En un paciente sano se recomienda una limpieza dental cada 6 meses. Sin embargo, este tiempo puede variar si presentas gingivitis o enfermedad periodontal."],
  ["¿Qué métodos de pago aceptan?", "Aceptamos pagos en efectivo, SINPE, transferencia o tarjeta de crédito."],
  ["¿Tienen financiamiento?", "Sí, contamos con financiamiento por parte de la clínica para la mayoría de nuestros tratamientos. Además, tenemos convenio con Club Bienestar de Coopelesca, con el que podrás financiar tu tratamiento y pagarlo mensualmente en tu recibo de electricidad."],
] as const;
const inputClass = "h-12 border-primary/20 bg-background px-4 focus-visible:ring-primary";

function formatClinicTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const period = hour >= 12 ? "pm" : "am";
  return `${hour % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${period}`;
}

function getClinicStatus(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_SCHEDULE.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(getPart("weekday"));
  const currentMinutes = Number(getPart("hour")) * 60 + Number(getPart("minute"));
  const closesAtMinutes = CLINIC_SCHEDULE.closesAtMinutesByDay[weekday] ?? 0;
  const isOpenDay = closesAtMinutes > 0;

  if (isOpenDay && currentMinutes >= CLINIC_SCHEDULE.opensAtMinutes && currentMinutes < closesAtMinutes) {
    return { isOpen: true, message: `Abierto hoy hasta las ${formatClinicTime(closesAtMinutes)}` };
  }

  if (isOpenDay && currentMinutes < CLINIC_SCHEDULE.opensAtMinutes) {
    return { isOpen: false, message: `Cerrado ahora · Abrimos hoy a las ${formatClinicTime(CLINIC_SCHEDULE.opensAtMinutes)}` };
  }

  const nextOpenDay = weekday === 6 ? "el lunes" : "mañana";
  return { isOpen: false, message: `Cerrado ahora · Abrimos ${nextOpenDay} a las ${formatClinicTime(CLINIC_SCHEDULE.opensAtMinutes)}` };
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(element);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView] as const;
}

function revealClass(isVisible: boolean) {
  return `motion-safe:transition-[transform,opacity] motion-safe:duration-200 motion-safe:ease-out ${isVisible ? "translate-y-0 opacity-100" : "motion-safe:translate-y-3 motion-safe:opacity-0"} motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none`;
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [navIndicator, setNavIndicator] = useState({ x: 0, scale: 0, opacity: 0 });
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [clinicStatus, setClinicStatus] = useState({ isOpen: false, message: "" });
  const desktopNavRef = useRef<HTMLElement>(null);
  const [heroRef, heroInView] = useInView<HTMLElement>();
  const [heroImageRef, heroImageInView] = useInView<HTMLImageElement>();
  const heroParallaxRef = useRef<HTMLDivElement>(null);
  const [servicesRef, servicesInView] = useInView<HTMLElement>();
  useEffect(() => {
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const top = window.scrollY;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(top > 24);
        setShowBackToTop(top > 600);
        setScrollProgress(scrollable > 0 ? top / scrollable : 0);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  useEffect(() => {
    const targets = NAV_ITEMS.map(([, href]) => ({
      id: href.slice(1),
      element: href === "#inicio" ? document.querySelector(".hero-section") : document.querySelector(href),
    })).filter((target): target is { id: string; element: Element } => target.element !== null);
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = targets.find((item) => item.element === entry.target);
        if (target) ratios.set(target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      const visible = [...ratios.entries()].filter(([, ratio]) => ratio > 0).sort((a, b) => b[1] - a[1])[0];
      if (visible) setActiveSection(visible[0]);
    }, { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.15, 0.35] });
    targets.forEach(({ element }) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const updateIndicator = () => {
      const nav = desktopNavRef.current;
      const activeLink = nav?.querySelector<HTMLAnchorElement>(`[data-nav-id="${activeSection}"]`);
      if (!nav || !activeLink) return;
      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      if (!navRect.width) return;
      setNavIndicator({ x: linkRect.left - navRect.left, scale: linkRect.width / navRect.width, opacity: 1 });
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeSection]);
  useEffect(() => { const updateStatus = () => setClinicStatus(getClinicStatus()); updateStatus(); const interval = window.setInterval(updateStatus, 60_000); return () => window.clearInterval(interval); }, []);
  useEffect(() => {
    const section = heroRef.current;
    const image = heroParallaxRef.current;
    if (!section || !image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const updateParallax = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const bounds = section.getBoundingClientRect();
        const progress = (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height);
        const offset = (Math.min(1, Math.max(0, progress)) - 0.5) * -22;
        image.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    updateParallax();
    return () => {
      window.removeEventListener("scroll", updateParallax);
      window.removeEventListener("resize", updateParallax);
      window.cancelAnimationFrame(frame);
      image.style.transform = "";
    };
  }, [heroRef]);
  const go = (id: string) => { setMenuOpen(false); document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }); };
  return <main id="inicio" className="min-h-screen overflow-x-clip bg-ink text-foreground">
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"><span className="block h-full origin-left bg-primary motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out motion-reduce:transition-none" style={{ transform: `scaleX(${scrollProgress})` }} /></div>
    <header className={`fixed inset-x-0 top-0 z-40 ${scrolled || menuOpen ? "border-b border-primary/20 bg-ink/90 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className={`mx-auto flex ${scrolled || menuOpen ? "h-16" : "h-20"} max-w-7xl items-center justify-between px-5 sm:px-8`}>
        <a href="#inicio" className="flex items-center gap-3 font-[system-ui,sans-serif]" aria-label="Clínica Dental Siloé">
          <img src={logoImage} alt="Logo Clínica Dental Siloé" className={`size-12 rounded-full border border-primary/50 object-cover transition-transform duration-200 ease-out ${scrolled ? "scale-90" : "scale-100"} motion-reduce:transition-none`} />
          <div className="text-sm font-semibold leading-tight text-primary sm:text-base"><span className="block">CLÍNICA DENTAL</span><span className="block tracking-[0.1em] text-ivory">SILOÉ</span></div>
        </a>
        <nav ref={desktopNavRef} className="relative hidden items-center gap-8 font-[system-ui,sans-serif] lg:flex">{NAV_ITEMS.map(([label, href]) => <a key={href} href={href} data-nav-id={href.slice(1)} aria-current={activeSection === href.slice(1) ? "location" : undefined} className={`text-sm transition-colors hover:text-primary ${activeSection === href.slice(1) ? "text-ivory" : "text-ivory/75"}`}>{label}</a>)}<span aria-hidden="true" className="pointer-events-none absolute -bottom-2 left-0 h-0.5 w-full origin-left bg-primary motion-safe:transition-[transform,opacity] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none" style={{ transform: `translateX(${navIndicator.x}px) scaleX(${navIndicator.scale})`, opacity: navIndicator.opacity }} /></nav>
        <Button variant="gold" size="lg" className="hidden rounded-full bg-none bg-primary px-6 font-[system-ui,sans-serif] shadow-sm shadow-black/15 hover:bg-gold-light hover:brightness-100 lg:inline-flex" onClick={() => go("#agendar")}>Solicitar Cita</Button>
        <Button variant="ghost" size="icon" className="text-ivory lg:hidden" aria-label="Abrir menú" onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X /> : <Menu />}</Button>
      </div>
      {menuOpen && <nav className="border-t border-primary/15 bg-ink px-5 py-5 font-[system-ui,sans-serif] lg:hidden">{NAV_ITEMS.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={activeSection === href.slice(1) ? "location" : undefined} className={`block border-b border-ivory/10 py-3 ${activeSection === href.slice(1) ? "text-primary" : "text-ivory"}`}>{label}</a>)}</nav>}
    </header>

    <section ref={heroRef} data-nav-section="inicio" className="hero-section relative isolate flex min-h-screen items-center overflow-hidden bg-ink px-5 pb-16 pt-28 sm:px-8">
      <div ref={heroParallaxRef} aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
        <img ref={heroImageRef} src={heroImage} width={1200} height={1400} alt="" className={`absolute inset-0 h-full w-full object-cover object-[68%_38%] motion-safe:transition-[transform,opacity] motion-safe:duration-200 motion-safe:ease-out ${heroImageInView ? "scale-100 opacity-100" : "motion-safe:scale-105 motion-safe:opacity-0"} motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none`} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink/65 via-ink/15 to-ink/90" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-ink/95 via-ink/80 to-ink/15 sm:to-transparent" />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center lg:grid-cols-2">
      <div className="relative z-10">
        <h1 className={`${revealClass(heroInView)} max-w-2xl text-4xl font-semibold leading-[1.08] text-ivory sm:text-6xl lg:text-7xl`} style={{ transitionDelay: "0ms" }}>Tu sonrisa es <span className="block text-primary">la luz de tu historia</span></h1>
        {clinicStatus.message && <p role="status" aria-live="polite" className={`${revealClass(heroInView)} mt-4 flex items-center gap-2 font-[system-ui,sans-serif] text-sm text-ivory/65`} style={{ transitionDelay: "70ms" }}><span aria-hidden="true" className={`size-2 rounded-full ${clinicStatus.isOpen ? "bg-emerald-400" : "bg-primary/70"}`} />{clinicStatus.message}</p>}
        <div className={`${revealClass(heroInView)} mt-8 flex flex-wrap gap-3 font-[system-ui,sans-serif]`} style={{ transitionDelay: "140ms" }}><Button variant="gold" size="lg" className="h-12 rounded-full bg-none bg-primary px-6 shadow-sm shadow-black/15 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:bg-gold-light hover:brightness-100 hover:shadow-md motion-reduce:transition-none motion-reduce:transform-none" onClick={() => go("#agendar")}><CalendarDays /> Solicitar Cita</Button><Button variant="goldOutline" size="lg" className="h-12 rounded-full border-ivory/25 px-6 text-ivory shadow-sm shadow-black/10 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:bg-ivory/5 hover:shadow-md motion-reduce:transition-none motion-reduce:transform-none" onClick={() => go("#servicios")}>Nuestros Servicios</Button></div>
        <div className={`${revealClass(heroInView)} mt-10 grid max-w-xl grid-cols-3 gap-4 font-[system-ui,sans-serif]`} style={{ transitionDelay: "210ms" }}>{[["+13", "Años de experiencia"], ["+5.000", "Sonrisas transformadas"], ["100%", "Trato humano"]].map(([n, l]) => <div key={n}><strong className="text-xl font-semibold text-primary sm:text-2xl">{n}</strong><span className="mt-1 block text-[0.7rem] leading-4 text-ivory/55">{l}</span></div>)}</div>
      </div>
      </div>
    </section>

    <section ref={servicesRef} id="servicios" className="bg-ivory py-24 sm:py-28"><SectionTitle eyebrow="Nuestros servicios" title="Tecnología y experiencia al servicio de tu bienestar" subtitle="Cada tratamiento se diseña a la medida de tus necesidades, con materiales premium y un enfoque humano." />
      <div className="mx-auto mt-14 grid max-w-7xl gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">{SERVICES.map((s, index) => <article key={s.title} style={{ transitionDelay: `${servicesInView ? index * 60 : 0}ms` }} className={`group flex overflow-hidden rounded-2xl border border-ink/5 bg-background shadow-sm transition-transform duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-gold motion-reduce:transform-none motion-reduce:transition-none ${revealClass(servicesInView)}`}><div className="flex w-full flex-col"><div className="relative h-44 overflow-hidden"><img src={s.image} alt={s.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" /></div><div className="flex flex-1 flex-col p-6"><h3 className="text-xl text-ink">{s.title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-ink/60">{s.desc}</p><div className="mt-5 flex justify-end border-t border-ink/10 pt-4"><Button variant="ghost" size="sm" className="px-2 text-ink hover:text-primary" onClick={() => setActiveService(s)}><Info /> Ver ficha</Button></div></div></div></article>)}</div>
    </section>

    <Booking />
    <Faq />
    <Reviews />
    <Location />
    <InstagramFeed />
    <Footer />
    <a href="https://wa.me/50670137712?text=Hola%2C%20quisiera%20solicitar%20una%20cita%20en%20Cl%C3%ADnica%20Dental%20Silo%C3%A9." target="_blank" rel="noreferrer" aria-label="Chatea con un especialista por WhatsApp" className="group fixed bottom-5 right-5 z-40"><span className="animate-soft-ping absolute inset-0 rounded-full bg-whatsapp/50" /><span className="relative grid size-14 place-items-center rounded-full bg-whatsapp text-primary-foreground shadow-whatsapp"><span className="relative grid size-7 place-items-center"><MessageCircle size={27} strokeWidth={2.2} /><Phone size={11} className="absolute fill-current" strokeWidth={2.2} /></span></span><span className="absolute bottom-2 right-16 hidden whitespace-nowrap rounded-md bg-ink px-3 py-2 font-[system-ui,sans-serif] text-xs text-ivory shadow-lg group-hover:block lg:block lg:opacity-0 lg:transition lg:group-hover:opacity-100">Chatea con un especialista</span></a>
    <Button type="button" variant="gold" size="icon" aria-label="Volver arriba" tabIndex={showBackToTop ? 0 : -1} aria-hidden={!showBackToTop} onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} className={`fixed bottom-24 right-5 z-40 rounded-full bg-none bg-primary shadow-sm shadow-black/15 transition-[transform,opacity] duration-200 ease-out hover:bg-gold-light motion-reduce:transition-none ${showBackToTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>
      <ArrowUp />
    </Button>
    <Dialog open={Boolean(activeService)} onOpenChange={open => !open && setActiveService(null)}><DialogContent className="max-h-[90svh] overflow-y-auto rounded-2xl border-primary/25 p-0 sm:max-w-2xl">{activeService && <><img src={activeService.image} alt={activeService.title} className="h-48 w-full object-cover sm:h-64" /><div className="p-5 sm:p-9"><DialogTitle className="pr-6 font-heading text-2xl leading-tight text-ink sm:text-3xl">{activeService.title}</DialogTitle><DialogDescription className="mt-4 text-base leading-7 text-ink/65">{activeService.fullDesc}</DialogDescription>{activeService.title === SPECIALTIES_SERVICE_NAME && <ul className="mt-5 space-y-4">{SPECIALTIES.map(sp => <li key={sp.title} className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><div><p className="font-heading text-lg text-ink">{sp.title}</p><p className="mt-1 text-sm leading-6 text-ink/65">{sp.desc}</p></div><Button variant="goldOutline" size="sm" className="w-full shrink-0 rounded-full text-gold-muted sm:w-auto" asChild><a href={priceInquiryLink(`Especialista en ${sp.title}`)} target="_blank" rel="noopener noreferrer" aria-label={`Consultar el precio de especialista en ${sp.title} por WhatsApp (se abre en una pestaña nueva)`}><MessageCircle /> Consultar precio</a></Button></li>)}</ul>}<div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button variant="gold" size="lg" className="w-full rounded-full sm:flex-1" onClick={() => { setActiveService(null); setTimeout(() => go("#agendar"), 150); }}>Solicitar este servicio <ArrowRight /></Button>{activeService.title !== SPECIALTIES_SERVICE_NAME && <Button variant="goldOutline" size="lg" className="w-full rounded-full text-gold-muted sm:flex-1" asChild><a href={priceInquiryLink(activeService.title)} target="_blank" rel="noopener noreferrer" aria-label={`Consultar el precio de ${activeService.title} por WhatsApp (se abre en una pestaña nueva)`}><MessageCircle /> Consultar precio</a></Button>}</div></div></>}</DialogContent></Dialog>
  </main>;
}

function SectionTitle({ eyebrow, title, subtitle, dark = false }: { eyebrow: string; title: string; subtitle: string; dark?: boolean }) { return <div className="mx-auto max-w-3xl px-5 text-center"><p className="section-eyebrow">{eyebrow}</p><h2 className={`mt-4 text-4xl leading-tight sm:text-5xl ${dark ? "text-ivory" : "text-ink"}`}>{title}</h2><p className={`mx-auto mt-5 max-w-2xl text-lg leading-7 ${dark ? "text-ivory/60" : "text-ink/60"}`}>{subtitle}</p></div>; }

function Booking() {
  const [step, setStep] = useState(1), [service, setService] = useState(""), [specialty, setSpecialty] = useState(""), [choosingSpecialty, setChoosingSpecialty] = useState(false), [date, setDate] = useState(""), [time, setTime] = useState(""), [sent, setSent] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState("");
  const [fields, setFields] = useState({ name: "", phone: "", email: "" });
  const [touched, setTouched] = useState({ name: false, phone: false, email: false });
  // Descripción de la cita. Es obligatoria (mínimo 5 caracteres) cuando se elige "Otro servicio".
  const [detail, setDetail] = useState(""), [detailTouched, setDetailTouched] = useState(false);
  const needsDetail = service === OTHER_SERVICE_NAME;
  // Si eligió "Especialidades Odontológicas", se guarda también la especialidad: "Especialidades Odontológicas: Endodoncia".
  const serviceToSend = service === SPECIALTIES_SERVICE_NAME && specialty ? `${service}: ${specialty}` : service;
  const detailInvalid = needsDetail && detail.trim().length < OTHER_SERVICE_MIN_DETAIL;
  const showDetailError = detailInvalid && (detailTouched || detail.length > 0);
  // Momento en que la persona llegó al paso de datos; sirve para detectar envíos automáticos demasiado rápidos.
  const formStartedAt = useRef(0);
  const today =new Intl.DateTimeFormat("en-CA", { timeZone: "America/Costa_Rica", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const fieldStatus = (key: keyof typeof fields) => {
    const value = fields[key].trim();
    const shouldValidate = touched[key] || value.length > 0;
    if (!shouldValidate) return { state: "idle" as const, message: "" };
    if (key === "email" && !value) return { state: "idle" as const, message: "" };
    if (key === "name" && value.length < 2) return { state: "invalid" as const, message: "Escribe al menos 2 caracteres." };
    if (key === "phone" && (value.replace(/\D/g, "").length < 7 || value.length > 30)) return { state: "invalid" as const, message: "Escribe un teléfono válido." };
    if (key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { state: "invalid" as const, message: "Revisa el formato del correo." };
    return { state: "valid" as const, message: "" };
  };
  function updateField(key: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }
  // Las horas disponibles cambian según el día: sábado solo en la mañana y domingo cerrado.
  const hoursForDate = date ? getBookingHoursForDate(date) : BOOKING_HOURS_WEEKDAY;
  const dateIsClosed = Boolean(date) && hoursForDate.length === 0;
  function changeDate(value: string) {
    setDate(value);
    if (time && !getBookingHoursForDate(value).includes(time)) setTime("");
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const formName = String(form.get("name") ?? "").trim();
    const formPhone = String(form.get("phone") ?? "").trim();
    const formEmail = String(form.get("email") ?? "").trim();
    const nameValid = formName.length >= 2 && formName.length <= 120;
    const phoneValid = formPhone.replace(/\D/g, "").length >= 7 && formPhone.length <= 30;
    const emailValid = !formEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail);
    setTouched({ name: true, phone: true, email: true });
    setDetailTouched(true);
    if (!nameValid || !phoneValid || !emailValid || detailInvalid) {
      setError(detailInvalid && nameValid && phoneValid && emailValid ? OTHER_SERVICE_DETAIL_ERROR : "Revisa los campos marcados antes de continuar.");
      return;
    }
    if (loading) return;
    setLoading(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          service: serviceToSend,
          preferredDate: date,
          preferredTime: time,
          message: detail,
          website: form.get("website_url"),
          startedAt: formStartedAt.current,
        }),
      });
      if (!response.ok) {
        let serverMessage = "";
        try {
          const data = await response.json();
          serverMessage = typeof data?.error === "string" ? data.error : "";
        } catch {
          // Si la respuesta no es JSON usamos el mensaje general.
        }
        setError(serverMessage || "No pudimos enviar la solicitud. Inténtalo de nuevo o contáctanos por WhatsApp.");
        return;
      }
      setSent(true);
    } catch {
      setError(
        controller.signal.aborted
          ? "La solicitud está tardando demasiado. Revisa tu conexión e inténtalo de nuevo, o contáctanos por WhatsApp."
          : "No pudimos enviar la solicitud. Inténtalo de nuevo o contáctanos por WhatsApp.",
      );
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }
  return <section id="agendar" className="bg-ink py-24 sm:py-28"><SectionTitle dark eyebrow="Solicita tu cita" title="Solicita en tres pasos" subtitle="Selecciona el servicio, elige fecha y hora, y déjanos tus datos. Te contactaremos para confirmar." /><div className="mx-auto mt-14 max-w-4xl px-5 sm:px-8"><div className="rounded-2xl border border-primary/25 bg-ivory/5 p-6 sm:p-10">
    {sent ? <div role="status" aria-live="polite" className="py-12 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-ink"><Check size={30} /></span><h3 className="mt-6 text-3xl text-ivory">Solicitud recibida</h3><p className="mx-auto mt-3 max-w-md text-ivory/60">Gracias. Te contactaremos pronto para confirmar el día y la hora de tu cita.</p><Button variant="goldOutline" className="mt-7 rounded-full" onClick={() => { setSent(false); setStep(1); setService(""); setDate(""); setTime(""); setDetail(""); setDetailTouched(false); formStartedAt.current = 0; }}>Solicitar otra cita</Button></div> : <>
      <div className="mx-auto mb-10 flex max-w-xs items-center">{[1, 2, 3].map((n, i) => <div key={n} className="contents"><span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${step >= n ? "bg-primary text-ink" : "bg-ivory/10 text-ivory/40"}`}>{n}</span>{i < 2 && <span className={`h-px flex-1 ${step > n ? "bg-primary" : "bg-ivory/10"}`} />}</div>)}</div>
      {step === 1 && choosingSpecialty && <div><h3 className="mb-7 text-center text-2xl text-ivory">¿Cuál especialista?</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{SPECIALTIES.map(sp => <Button key={sp.title} variant="ghost" className={`h-auto min-h-14 justify-start whitespace-normal border px-5 py-3 text-left text-ivory ${specialty === sp.title ? "border-primary bg-primary/15 text-primary" : "border-ivory/15 hover:border-primary/50 hover:bg-ivory/5"}`} aria-pressed={specialty === sp.title} onClick={() => { setSpecialty(sp.title); setChoosingSpecialty(false); setStep(2); }}>{specialty === sp.title && <Check />}{sp.title}</Button>)}</div><div className="mt-8 flex justify-start"><Button variant="ghost" className="text-ivory" onClick={() => setChoosingSpecialty(false)}><ChevronLeft /> Atrás</Button></div></div>}
      {step === 1 && !choosingSpecialty && <div><h3 className="mb-7 text-center text-2xl text-ivory">¿Qué servicio necesitas?</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{SERVICES.map(s => <Button key={s.title} variant="ghost" className={`h-auto min-h-14 justify-start whitespace-normal border px-5 py-3 text-left text-ivory ${service === s.title ? "border-primary bg-primary/15 text-primary" : "border-ivory/15 hover:border-primary/50 hover:bg-ivory/5"}`} onClick={() => setService(s.title)}>{service === s.title && <Check />}{s.title}</Button>)}<Button variant="ghost" className={`h-auto min-h-14 justify-start whitespace-normal border border-dashed px-5 py-3 text-left text-ivory ${service === OTHER_SERVICE_NAME ? "border-primary bg-primary/15 text-primary" : "border-ivory/25 hover:border-primary/50 hover:bg-ivory/5"}`} aria-pressed={service === OTHER_SERVICE_NAME} onClick={() => setService(OTHER_SERVICE_NAME)}>{service === OTHER_SERVICE_NAME && <Check />}{OTHER_SERVICE_NAME}</Button></div><div className="mt-8 flex justify-end"><Button variant="gold" size="lg" disabled={!service} onClick={() => { if (service === SPECIALTIES_SERVICE_NAME) setChoosingSpecialty(true); else setStep(2); }}>Continuar <ChevronRight /></Button></div></div>}
      {step === 2 && <div><h3 className="mb-7 text-center text-2xl text-ivory">Elige fecha y hora</h3><div className="mx-auto grid max-w-xl gap-5 sm:grid-cols-2"><label className="text-sm text-ivory/70">Fecha<Input type="date" min={today} value={date} onChange={e => changeDate(e.target.value)} aria-invalid={dateIsClosed} className="mt-2 h-12 border-ivory/20 bg-ivory/5 text-ivory [color-scheme:dark]" /></label><label className="text-sm text-ivory/70">Hora<select value={time} onChange={e => setTime(e.target.value)} disabled={dateIsClosed} className="mt-2 h-12 w-full rounded-md border border-ivory/20 bg-ink px-4 text-ivory outline-none focus:border-primary disabled:opacity-50"><option value="">Seleccionar</option>{hoursForDate.map(h => <option key={h}>{h}</option>)}</select></label></div>{dateIsClosed && <p role="alert" className="mx-auto mt-4 max-w-xl text-sm text-destructive">Los domingos la clínica está cerrada. Elige otro día.</p>}{date && !dateIsClosed && !time && <p className="mx-auto mt-4 max-w-xl text-xs text-ivory/55">{new Date(`${date}T12:00:00Z`).getUTCDay() === 6 ? "Los sábados atendemos de 8:00 a. m. a 12:00 p. m." : "De lunes a viernes atendemos de 8:00 a. m. a 5:30 p. m."}</p>}<div className="mt-8 flex justify-between"><Button variant="ghost" className="text-ivory" onClick={() => setStep(1)}><ChevronLeft /> Atrás</Button><Button variant="gold" size="lg" disabled={!date || !time} onClick={() => { if (!formStartedAt.current) formStartedAt.current = Date.now(); setStep(3); }}>Continuar <ChevronRight /></Button></div></div>}
      {step === 3 && <form onSubmit={submit} aria-busy={loading} className="relative"><h3 className="mb-7 text-center text-2xl text-ivory">Cuéntanos cómo contactarte</h3><fieldset disabled={loading} className="m-0 min-w-0 border-0 p-0"><Honeypot name="website_url" /><div className="grid gap-4 sm:grid-cols-2">
        <BookingField id="booking-name" name="name" label="Nombre completo *" required value={fields.name} status={fieldStatus("name")} onValueChange={(value) => updateField("name", value)} onBlur={() => setTouched((current) => ({ ...current, name: true }))} />
        <BookingField id="booking-phone" name="phone" label="Teléfono *" required value={fields.phone} status={fieldStatus("phone")} onValueChange={(value) => updateField("phone", value)} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} />
        <BookingField id="booking-email" name="email" label="Correo electrónico" type="email" value={fields.email} status={fieldStatus("email")} onValueChange={(value) => updateField("email", value)} onBlur={() => setTouched((current) => ({ ...current, email: true }))} className="sm:col-span-2" />
        <div className="sm:col-span-2">
          <Textarea id="booking-message" name="message" value={detail} maxLength={2000} onChange={(event) => setDetail(event.target.value)} onBlur={() => setDetailTouched(true)} aria-required={needsDetail} aria-invalid={showDetailError} aria-describedby={needsDetail ? "booking-message-help" : undefined} placeholder={needsDetail ? "Cuéntanos qué servicio necesitas *" : "Mensaje o detalle adicional"} className={`min-h-28 bg-ivory/5 p-4 text-ivory placeholder:text-ivory/40 ${showDetailError ? "border-destructive" : "border-ivory/20"}`} />
          {needsDetail && <p id="booking-message-help" className={`mt-2 text-xs ${showDetailError ? "text-destructive" : "text-ivory/55"}`}>{showDetailError ? OTHER_SERVICE_DETAIL_ERROR : "Describe qué necesitas para que podamos prepararnos para tu cita."}</p>}
        </div>
      </div></fieldset>
      {loading && <div role="status" aria-live="polite" className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-4"><div className="flex items-center gap-3 text-sm text-ivory"><LoaderCircle className="size-5 shrink-0 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" /><span>Enviando tu solicitud. Puede tardar unos segundos, por favor no cierres la página.</span></div><div className="loading-bar mt-4" aria-hidden="true" /></div>}
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button type="button" variant="ghost" className="text-ivory" disabled={loading} onClick={() => setStep(2)}><ChevronLeft /> Atrás</Button><Button type="submit" variant="gold" size="lg" disabled={loading} aria-disabled={loading}>{loading ? <><LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Enviando…</> : <>Enviar solicitud <ArrowRight /></>}</Button></div></form>}
    </>}
  </div></div></section>;
}

// Campo trampa: las personas no lo ven, pero los programas que llenan formularios sí lo llenan.
function Honeypot({ name, value, onChange }: { name: string; value?: string; onChange?: (value: string) => void }) {
  return <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
    <label>No llenes este campo
      <input type="text" name={name} tabIndex={-1} autoComplete="off" {...(onChange ? { value: value ?? "", onChange: (event) => onChange(event.target.value) } : {})} />
    </label>
  </div>;
}

function BookingField({ id, name, label, type = "text", required = false, value, status, onValueChange, onBlur, className = "" }: { id: string; name: string; label: string; type?: "text" | "email"; required?: boolean; value: string; status: { state: "idle" | "valid" | "invalid"; message: string }; onValueChange: (value: string) => void; onBlur: () => void; className?: string }) {
  const feedbackId = `${id}-feedback`;
  return <div className={className}>
    <Input id={id} name={name} type={type} required={required} value={value} placeholder={label} aria-label={label} aria-invalid={status.state === "invalid"} aria-describedby={status.message ? feedbackId : undefined} onChange={(event) => onValueChange(event.target.value)} onBlur={onBlur} className="h-12 border-ivory/20 bg-ivory/5 px-4 text-ivory placeholder:text-ivory/40" />
    {status.message && <p id={feedbackId} aria-live="polite" className="mt-1 text-xs text-destructive">{status.message}</p>}
  </div>;
}

function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const [faqRef, faqInView] = useInView<HTMLElement>();

  return (
    <section ref={faqRef} id="faq" className="bg-ivory py-24 sm:py-28">
      <SectionTitle eyebrow="Preguntas frecuentes" title="Resolvemos tus dudas" subtitle="Aquí encontrarás respuestas a las consultas más comunes. ¿No encuentras lo que buscas? Escríbenos." />
      <div className="mx-auto mt-14 max-w-4xl space-y-3 px-5 sm:px-8">
        {FAQS.map(([question, answer], index) => {
          const isOpen = open === index;
          const panelId = `faq-panel-${index}`;
          return (
            <div key={question} style={{ transitionDelay: faqInView ? `${index * 45}ms` : "0ms" }} className={`overflow-hidden rounded-2xl border border-ink/10 bg-background ${revealClass(faqInView)}`}>
              <Button variant="ghost" className="h-auto w-full justify-between whitespace-normal p-6 text-left hover:bg-transparent" onClick={() => setOpen(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={panelId}>
                <span className="font-heading text-lg text-ink sm:text-xl">{question}</span>
                <span className={`ml-4 grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-200 ease-out ${isOpen ? "bg-primary/15 text-primary" : "bg-ink/5 text-ink"}`}>
                  <ChevronDown className={`transition-transform duration-200 ease-out motion-reduce:transition-none ${isOpen ? "rotate-180" : "rotate-0"}`} />
                </span>
              </Button>
              <div id={panelId} aria-hidden={!isOpen} className={`overflow-hidden transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${isOpen ? "translate-y-0 opacity-100" : "pointer-events-none h-0 translate-y-1 opacity-0"}`}>
                <p className="px-6 pb-6 pr-20 leading-7 text-ink/60">{answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Reviews() {
  const [rating, setRating] = useState(0);
  const [ratingPreview, setRatingPreview] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewList, setShowReviewList] = useState(false);
  const [newReviewIds, setNewReviewIds] = useState<Set<string>>(() => new Set());
  const [showReminder, setShowReminder] = useState(false);
  const [showLocalForm, setShowLocalForm] = useState(false);
  const [localSubmitted, setLocalSubmitted] = useState(false);
  const [reviewDraft, setReviewDraft] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [error, setError] = useState("");
  const [honey, setHoney] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const savingReviewRef = useRef(false);
  const reviewSavedRef = useRef(false);
  const ratingTimerRef = useRef<number | null>(null);
  const [summaryRef, summaryInView] = useInView<HTMLDivElement>();
  const [animatedAverage, setAnimatedAverage] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await supabase
          .from("reviews")
          .select("id,name,rating,text,created_at")
          .order("created_at", { ascending: false });
        setReviews(data ?? []);
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    })();

    try {
      if (
        localStorage.getItem(REVIEW_PENDING_KEY) &&
        !localStorage.getItem(REVIEW_REMINDER_SHOWN_KEY)
      ) {
        setShowReminder(true);
        localStorage.setItem(REVIEW_REMINDER_SHOWN_KEY, "true");
      }
    } catch {
      // The review flow still works when browser storage is unavailable.
    }

    return () => {
      if (ratingTimerRef.current !== null) window.clearTimeout(ratingTimerRef.current);
    };
  }, []);

  function selectRating(value: number) {
    if (ratingTimerRef.current !== null) window.clearTimeout(ratingTimerRef.current);
    setRatingPreview(value);
    reviewSavedRef.current = false;
    setShowLocalForm(false);
    setLocalSubmitted(false);
    setShowReminder(false);
    setError("");
    const confirmRating = () => {
      setRating(value);
      setRatingPreview(0);
      ratingTimerRef.current = null;
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      confirmRating();
    } else {
      ratingTimerRef.current = window.setTimeout(confirmRating, 250);
    }
    try {
      localStorage.setItem(REVIEW_PENDING_KEY, String(value));
    } catch {
      // The Google review flow does not depend on browser storage.
    }
  }

  function markGoogleReviewShared() {
    setShowReminder(false);
    try {
      localStorage.removeItem(REVIEW_PENDING_KEY);
    } catch {
      // Sharing still opens Google when browser storage is unavailable.
    }
  }

  function addReviewToList(review: Review) {
    setReviews((current) =>
      [review, ...current].sort(
        (first, second) => Date.parse(second.created_at) - Date.parse(first.created_at),
      ),
    );
    setNewReviewIds((current) => new Set(current).add(review.id));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setNewReviewIds((current) => {
          const next = new Set(current);
          next.delete(review.id);
          return next;
        });
      });
    });
  }

  async function saveReviewOnce(nameValue: string, textValue: string) {
    if (reviewSavedRef.current) return true;
    if (savingReviewRef.current) return false;
    // Campo trampa lleno: es un programa automático. Fingimos que todo salió bien y no guardamos nada.
    if (honey) {
      reviewSavedRef.current = true;
      return true;
    }
    // Freno anti-spam: una opinión por minuto desde el mismo navegador.
    try {
      const last = Number(localStorage.getItem(REVIEW_COOLDOWN_KEY) ?? 0);
      if (last && Date.now() - last < REVIEW_COOLDOWN_MS) {
        setError("Ya enviaste una opinión hace un momento. Espera un minuto e inténtalo de nuevo.");
        return false;
      }
    } catch {
      // Sin almacenamiento disponible no hay freno local; el servidor sigue aplicando sus reglas.
    }

    savingReviewRef.current = true;
    setSavingReview(true);
    const trimmedName = nameValue.trim();
    const name = trimmedName.length >= 2 ? trimmedName.slice(0, 120) : "Paciente";
    const trimmedText = textValue.trim();
    const text = trimmedText.length >= 3 ? trimmedText.slice(0, 2000) : null;
    setError(
      trimmedText.length > 0 && trimmedText.length < 3
        ? "La opinión necesita al menos 3 caracteres; guardaremos solo tu calificación."
        : "",
    );

    try {
      const { data, error: dbError } = await supabase
        .from("reviews")
        .insert({ rating, name, text })
        .select("id,name,rating,text,created_at")
        .single();
      if (dbError) throw dbError;
      if (!data) throw new Error("No se recibió la reseña guardada.");

      reviewSavedRef.current = true;
      try {
        localStorage.setItem(REVIEW_COOLDOWN_KEY, String(Date.now()));
      } catch {
        // No pasa nada si el navegador no deja guardar el freno.
      }
      addReviewToList(data);
      return true;
    } catch {
      setError("No pudimos guardar tu reseña. Puedes continuar y compartirla en Google.");
      return false;
    } finally {
      savingReviewRef.current = false;
      setSavingReview(false);
    }
  }

  async function publishAndShare(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    markGoogleReviewShared();

    const reviewText = reviewDraft.trim();
    const reviewWindow = window.open("about:blank", "_blank");
    if (reviewWindow) reviewWindow.opener = null;

    await saveReviewOnce(reviewerName, reviewText);

    if (reviewText) {
      try {
        await navigator.clipboard.writeText(reviewText);
        setCopyNotice("Texto copiado, solo pégalo en Google");
      } catch {
        setCopyNotice("No pudimos copiar el texto; puedes copiarlo manualmente en Google.");
      }
      window.setTimeout(() => setCopyNotice(""), 5000);
    }

    if (reviewWindow) {
      reviewWindow.location.href = GOOGLE_REVIEW_URL;
    } else {
      window.open(GOOGLE_REVIEW_URL, "_blank", "noopener,noreferrer");
    }
  }

  async function submitLocalReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const text = String(form.get("text") ?? "");
    const saved = await saveReviewOnce(name, text);
    if (!saved) return;
    setLocalSubmitted(true);
    setShowLocalForm(false);
  }

  const localAverage = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  useEffect(() => {
    if (!summaryInView || reviews.length === 0) {
      setAnimatedAverage(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimatedAverage(localAverage);
      return;
    }

    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 240, 1);
      setAnimatedAverage(localAverage * (1 - (1 - progress) ** 3));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [localAverage, reviews.length, summaryInView]);
  const socialProof = reviews.length > 0
    ? `${animatedAverage.toFixed(1)} ★ · ${reviews.length} reseñas de pacientes`
    : null;

  return (
    <section id="resenas" className="bg-ivory py-24 sm:py-28">
      <SectionTitle
        eyebrow="Experiencias reales"
        title="Reseñas de nuestros pacientes"
        subtitle="Nos ayudas muchísimo cuando compartes tu experiencia en Google; toma menos de un minuto."
      />
      <div ref={summaryRef} className="mx-auto mt-7 flex min-h-10 justify-center">
        {reviewsLoading ? (
          <div aria-hidden="true" className="h-10 w-56 rounded-full bg-ink/5" />
        ) : socialProof && (
          <div className="flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-background px-5 py-2 text-center text-sm text-ink">
            <Star size={16} className="fill-primary text-primary" aria-hidden="true" />
            <span>{socialProof}</span>
          </div>
        )}
      </div>

      <div className="mx-auto mt-10 max-w-2xl px-5 sm:px-8">
        {showReminder && (
          <div role="status" className="mb-5 flex flex-col items-start justify-between gap-3 rounded-xl border border-primary/25 bg-background px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm leading-6 text-ink/70">Tu opinión puede ayudar a otras personas a conocernos.</p>
            <Button variant="gold" size="sm" asChild>
              <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" onClick={markGoogleReviewShared}>
                Compartir en Google <ExternalLink />
              </a>
            </Button>
          </div>
        )}

        <div className="rounded-2xl border border-primary/25 bg-background p-6 shadow-gold sm:p-10">
          <p role="status" aria-live="polite" className="min-h-5 text-center text-sm text-gold-muted">{copyNotice}</p>

          {localSubmitted ? (
            <div className="py-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-ink"><HeartHandshake /></span>
              <h3 className="mt-5 text-2xl text-ink">Gracias por contárnoslo.</h3>
              <p className="mx-auto mt-3 max-w-md text-ink/60">Leemos cada mensaje y nos ayuda mucho a seguir mejorando.</p>
            </div>
          ) : showLocalForm ? (
            <form onSubmit={submitLocalReview}>
              <h3 className="text-center text-2xl text-ink">Cuéntanos directamente</h3>
              <p className="mt-2 text-center text-sm leading-6 text-ink/55">Este mensaje se comparte únicamente con la clínica.</p>
              <div className="mt-6 space-y-4">
                <Honeypot name="website_url" value={honey} onChange={setHoney} />
                <Input name="name" maxLength={120} placeholder="Tu nombre (opcional)" className={inputClass} />
                <Textarea name="text" maxLength={2000} placeholder="Tu mensaje (opcional)" className="min-h-28 border-primary/20 bg-background p-4 focus-visible:ring-primary" />
              </div>
              {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button type="submit" variant="gold" size="lg" className="w-full rounded-full" disabled={savingReview}>{savingReview ? "Guardando…" : "Enviar mensaje"}</Button>
                <Button type="button" variant="goldOutline" className="w-full rounded-full" disabled={savingReview} onClick={() => setShowLocalForm(false)}>Volver a compartir en Google</Button>
              </div>
            </form>
          ) : rating ? (
            <div className="py-4 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-ink"><HeartHandshake /></span>
              <h3 className="mt-5 text-2xl text-ink">{rating >= 4 ? "¡Gracias por tu confianza!" : "Gracias por contarnos."}</h3>
              <p className="mx-auto mt-3 max-w-md leading-6 text-ink/60">
                {rating >= 4
                  ? "Compartir tu experiencia en Google nos ayuda muchísimo a que más personas encuentren la clínica."
                  : "Sentimos que tu experiencia no haya sido ideal. Queremos escucharte y seguir mejorando."}
              </p>
              <label htmlFor="google-review-name" className="mt-6 block text-left text-sm font-medium text-ink">Nombre (opcional)</label>
              <Input id="google-review-name" value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} maxLength={120} placeholder="Tu nombre" className="mt-2 border-primary/20 bg-background focus-visible:ring-primary" />
              <label htmlFor="google-review-draft" className="mt-4 block text-left text-sm font-medium text-ink">Escribe tu opinión (opcional)</label>
              <Textarea id="google-review-draft" value={reviewDraft} onChange={(event) => setReviewDraft(event.target.value)} maxLength={2000} className="mt-2 min-h-28 border-primary/20 bg-background p-4 focus-visible:ring-primary" />
              <Honeypot name="website_url" value={honey} onChange={setHoney} />
              {error && <p role="alert" className="mt-3 text-left text-sm text-destructive">{error}</p>}
              <Button type="button" variant="gold" size="lg" className="mt-5 h-14 w-full rounded-full text-base" disabled={savingReview} onClick={(event) => void publishAndShare(event)}>
                {savingReview ? "Guardando…" : <>Publicar y compartir en Google <ExternalLink /></>}
              </Button>
              {rating <= 3 && (
                <Button variant="ghost" className="mt-3 w-full text-ink/70" onClick={() => { setShowLocalForm(true); setError(""); }}>
                  Prefiero contarlo directamente a la clínica
                </Button>
              )}
            </div>
          ) : (
            <div className="py-4 text-center">
              <h3 className="text-2xl text-ink">¿Cómo fue tu experiencia?</h3>
              <div className="my-6 flex justify-center gap-1 sm:gap-2" role="group" aria-label="Califica tu experiencia de una a cinco estrellas" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button key={value} type="button" variant="ghost" size="icon" aria-pressed={rating === value || ratingPreview === value} aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`} onMouseEnter={() => setHover(value)} onClick={() => selectRating(value)} className="size-10 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary sm:size-12">
                    <Star size={32} strokeWidth={1.7} style={{ transitionDelay: ratingPreview ? `${(value - 1) * 24}ms` : "0ms" }} className={`transition-transform duration-150 ease-out motion-reduce:transition-none ${value <= (hover || ratingPreview || rating) ? "scale-105 fill-primary text-primary" : "scale-100 text-ink/35"}`} />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {reviewsLoading ? (
          <div aria-label="Cargando reseñas" className="mt-8 grid gap-4 sm:grid-cols-2">
            {[0, 1, 2].map((item) => (
              <article key={item} aria-hidden="true" className="min-h-32 rounded-xl border border-ink/10 bg-background p-5">
                <div className="h-4 w-28 rounded bg-ink/10" />
                <div className="mt-4 h-3 w-24 rounded bg-ink/10" />
                <div className="mt-4 h-3 w-4/5 rounded bg-ink/5" />
                <div className="mt-2 h-3 w-2/5 rounded bg-ink/5" />
              </article>
            ))}
          </div>
        ) : reviews.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-center font-[system-ui,sans-serif]">
              <Button
                type="button"
                variant="goldOutline"
                className="rounded-full px-6"
                aria-expanded={showReviewList}
                aria-controls="lista-resenas"
                onClick={() => setShowReviewList((open) => !open)}
              >
                {showReviewList ? "Ocultar reseñas" : `Ver reseñas (${reviews.length})`}
                <ChevronDown className={`transition-transform duration-200 ease-out motion-reduce:transition-none ${showReviewList ? "rotate-180" : "rotate-0"}`} />
              </Button>
            </div>
            {showReviewList && (
          <div id="lista-resenas" className="mt-6 grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className={`rounded-xl border border-ink/10 bg-background p-5 text-left transition-[transform,opacity] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none ${newReviewIds.has(review.id) ? "translate-y-3 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100" : "translate-y-0 opacity-100"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{review.name}</p>
                  <div className="flex shrink-0 gap-0.5" role="img" aria-label={`Calificación: ${review.rating} de 5 estrellas`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={15} className={star <= review.rating ? "fill-primary text-primary" : "text-ink/20"} aria-hidden="true" />
                    ))}
                  </div>
                </div>
                {review.text && <p className="mt-3 leading-6 text-ink/65">“{review.text}”</p>}
                <time className="mt-3 block text-xs text-ink/45" dateTime={review.created_at}>{new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(new Date(review.created_at))}</time>
              </article>
            ))}
          </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Location() {
  const sectionRef = useRef<HTMLElement>(null);
  const facadeRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = facadeRef.current;
    if (!section || !image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const updateParallax = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const bounds = section.getBoundingClientRect();
        const progress = (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height);
        const offset = (Math.min(1, Math.max(0, progress)) - 0.5) * -28;
        image.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    updateParallax();

    return () => {
      window.removeEventListener("scroll", updateParallax);
      window.removeEventListener("resize", updateParallax);
      window.cancelAnimationFrame(frame);
      image.style.transform = "";
    };
  }, []);

  return <section ref={sectionRef} id="ubicacion" className="relative isolate overflow-hidden bg-ink">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20 h-36 bg-gradient-to-b from-ink/85 via-ink/45 to-transparent" />
    <div className="relative h-[74svh] min-h-[620px] max-h-[920px] w-full overflow-hidden sm:aspect-[16/10] sm:h-auto sm:max-h-[900px]">
      <img ref={facadeRef} src={fachadaImage} loading="lazy" width={1600} height={1600} alt="Fachada de Clínica Dental Siloé" className="absolute inset-0 h-full w-full scale-[1.06] object-cover object-[center_58%] sm:object-[center_15%] lg:object-[center_22%] xl:object-[center_28%] 2xl:object-[center_38%] min-[1800px]:object-[center_42%]" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/15 to-ink/90" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-start px-5 pb-36 pt-20 sm:px-8 sm:pb-44 sm:pt-32">
        <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:text-sm sm:tracking-[0.24em]"><span className="h-px w-7 shrink-0 bg-primary sm:w-9" />Clínica Dental · Ciudad Quesada</p>
          <h2 className="mt-5 max-w-3xl text-4xl leading-tight text-ivory sm:text-6xl lg:text-7xl">Te esperamos en <span className="gold-text">Siloé.</span></h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ivory/80 sm:mt-4 sm:max-w-3xl sm:text-base">Un espacio cálido para cuidar tu sonrisa. Encuentra nuestra ubicación y planea tu visita.</p>
        </div>
      </div>
    </div>

    <div className="relative z-10 mx-auto -mt-24 max-w-7xl px-5 pb-28 sm:px-8 sm:pb-36">
      <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-5 motion-safe:duration-700 grid overflow-hidden rounded-2xl border border-primary/40 bg-ink/75 shadow-gold backdrop-blur-2xl lg:grid-cols-[0.82fr_1.18fr]">
        <div className="flex flex-col p-6 sm:p-9 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Planifica tu visita</p>
          <h3 className="mt-3 font-heading text-3xl leading-tight text-ivory sm:text-4xl">Nos encontrarás <span className="gold-text">fácilmente.</span></h3>
          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary"><MapPin size={20} /></span>
              <div><p className="text-sm font-semibold text-ivory">Dirección</p><p className="mt-1 text-sm leading-6 text-ivory/70">50 oeste del Liceo San Carlos y 200 sur,<br className="hidden sm:block" /> Ciudad Quesada</p></div>
            </div>
            <div className="flex gap-4 border-t border-primary/15 pt-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary"><Clock3 size={20} /></span>
              <div><p className="text-sm font-semibold text-ivory">Horario</p><p className="mt-1 text-sm leading-6 text-ivory/70">Lunes a viernes: 8:00 a. m.–5:30 p. m.<br />Sábado: 8:00 a. m.–12:00 p. m.<br />Domingo: cerrado</p></div>
            </div>
            <div className="flex gap-4 border-t border-primary/15 pt-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary"><Phone size={20} /></span>
              <div><p className="text-sm font-semibold text-ivory">Citas por llamada</p><p className="mt-1 select-none text-sm leading-6 text-ivory/70">2460 7923</p></div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="gold" size="lg" className="sm:flex-1" asChild><a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer"><MapPin /> Cómo llegar</a></Button>
            <Button variant="goldOutline" size="lg" className="text-ivory sm:flex-1" asChild><a href="tel:+50624607923"><Phone /> 2460 7923</a></Button>
          </div>
        </div>
        <div className="relative min-h-[320px] border-t border-primary/25 p-3 sm:p-4 lg:min-h-[500px] lg:border-l lg:border-t-0">
          <ClinicMap />
        </div>
      </div>
    </div>
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-b from-transparent via-ink/70 to-ivory" />
  </section>;
}

function InstagramFeed() {
  const profileUrl = "https://instagram.com/clinicadentalsiloe";
  const firstPostUrl = "https://www.instagram.com/p/DTQXMrPkXIG/?stkn=d2NhM2N3bGd2Nmk5";
  const secondPostUrl = "https://www.instagram.com/p/DP62MAKkYfj/?stkn=aWo0ejA0NmkxM2h4";
  const thirdPostUrl = "https://www.instagram.com/p/DPv-5Z4ALdb/?stkn=MWNmNmpyMHNkNXc4Nw==";
  const fourthPostUrl = "https://www.instagram.com/p/DOcDCNtk77S/?stkn=MW9kN3IybHU5cnU0Mg==";
  const fifthPostUrl = "https://www.instagram.com/p/DFD3O2HskAt/?stkn=MWpvcGd3MnYzdTNoeg==";
  const sixthPostUrl = "https://www.instagram.com/p/DXhTZp3DhKP/?stkn=MWIyanN2dHAydnZkOA==";
  const labels = ["Transformaciones", "Resultados", "Clínica", "Consejos", "Sonrisas", "Bienestar"];

  return <section id="instagram" className="bg-ivory py-24 sm:py-28">
    <SectionTitle eyebrow="Síguenos" title="Nuestro Instagram" subtitle="Descubre transformaciones, consejos y la vida en la clínica." />
    <div className="mt-8 text-center">
      <Button variant="gold" className="rounded-full" asChild>
        <a href={profileUrl} target="_blank" rel="noreferrer"><Instagram /> @clinicadentalsiloe</a>
      </Button>
    </div>
    <div className="mx-auto mt-12 grid max-w-7xl grid-cols-2 gap-3 px-5 sm:px-8 lg:grid-cols-3">
      {labels.map((label, index) => (
        <a
          key={label}
          href={index === 0 ? firstPostUrl : index === 1 ? secondPostUrl : index === 2 ? thirdPostUrl : index === 3 ? fourthPostUrl : index === 4 ? fifthPostUrl : index === 5 ? sixthPostUrl : profileUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={index === 0 ? "Ver publicación de frenillos en Instagram" : index === 1 ? "Ver publicación de radiografía panorámica en Instagram" : index === 2 ? "Ver foto del equipo de Clínica Dental Siloé en Instagram" : index === 3 ? "Ver publicación de blanqueamiento LED en Instagram" : index === 4 ? "Ver publicación de alineadores invisibles en Instagram" : index === 5 ? "Ver consejo de cuidado de la sonrisa en Instagram" : `Ver ${label.toLowerCase()} en Instagram`}
          className={`group relative aspect-square overflow-hidden rounded-2xl ${index % 3 === 1 ? "bg-gradient-to-br from-gold-light to-primary" : "bg-gradient-to-br from-ink to-gold-muted"}`}
        >
          {index === 0 ? (
            <img src={instagramPhoto1} alt="Plan de frenillos completo de Clínica Dental Siloé" loading="lazy" width={720} height={720} className="absolute inset-0 size-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" />
          ) : index === 1 ? (
            <img src={instagramPhoto2} alt="Publicación de radiografía panorámica de Clínica Dental Siloé" loading="lazy" width={720} height={720} className="absolute inset-0 size-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" />
          ) : index === 2 ? (
            <img src={instagramPhoto3} alt="Equipo de Clínica Dental Siloé en la recepción" loading="lazy" width={720} height={720} className="absolute inset-0 size-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" />
          ) : index === 3 ? (
            <img src={instagramPhoto4} alt="Publicación de blanqueamiento dental LED de Clínica Dental Siloé" loading="lazy" width={720} height={720} className="absolute inset-0 size-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" />
          ) : index === 4 ? (
            <img src={instagramPhoto5} alt="Publicación de alineadores invisibles de Clínica Dental Siloé" loading="lazy" width={720} height={720} className="absolute inset-0 size-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" />
          ) : index === 5 ? (
            <img src={instagramPhoto6} alt="Consejo sobre el cuidado diario de la sonrisa de Clínica Dental Siloé" loading="lazy" width={720} height={720} className="absolute inset-0 size-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-ink/15 transition-opacity duration-200 ease-out group-hover:bg-ink/5 motion-reduce:transition-none">
              <div className="text-center text-ivory">
                <Instagram className="mx-auto" size={30} />
                <span className="mt-3 block font-heading text-lg">{label}</span>
              </div>
            </div>
          )}
        </a>
      ))}
    </div>
  </section>;
}

function Footer() { return <footer className="border-t border-primary/20 bg-ink px-5 py-14 text-ivory sm:px-8"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3"><div><div className="flex items-center gap-3"><img src={logoImage} alt="Logo de Clínica Dental Siloé" className="size-14 rounded-full object-cover" /><h3 className="text-xl text-primary">Clínica Dental Siloé</h3></div><p className="mt-4 max-w-xs text-sm leading-6 text-ivory/55">Atención dental con precisión, calidez y una estética natural.</p></div><div><h3 className="text-lg">Navegación</h3><div className="mt-4 grid grid-cols-2 gap-3 text-sm text-ivory/55">{[["Servicios", "#servicios"], ["Solicitar", "#agendar"], ["Reseñas", "#resenas"], ["Preguntas", "#faq"]].map(([l, h]) => <a key={h} href={h} className="hover:text-primary">{l}</a>)}</div></div><div><h3 className="text-lg">Contacto</h3><div className="mt-4 space-y-3 text-sm text-ivory/55"><a href="tel:70137712" className="flex items-center gap-2 hover:text-primary"><Phone size={16} /> 7013 7712</a><span className="flex select-none items-center gap-2"><Phone size={16} /> 2460 7923</span><a href="#ubicacion" className="flex items-center gap-2 hover:text-primary"><MapPin size={16} /> Clínica Dental Siloé</a><a href="https://instagram.com/clinicadentalsiloe" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary"><Instagram size={16} /> @clinicadentalsiloe</a></div></div></div><div className="mx-auto mt-12 max-w-7xl border-t border-ivory/10 pt-6 font-[system-ui,sans-serif] text-xs text-ivory/60"><nav aria-label="Información legal" className="flex flex-wrap gap-x-6 gap-y-3"><Link to="/aviso-legal" className="hover:text-primary">Aviso legal</Link><Link to="/politica-de-privacidad" className="hover:text-primary">Política de privacidad</Link><Link to="/politica-de-cookies" className="hover:text-primary">Política de cookies</Link></nav><p className="mt-5 leading-5">{SITE.name} se reserva el derecho de admisión. La información de este sitio es de carácter general y no sustituye la valoración de un profesional; los resultados pueden variar de una persona a otra. Enviar una solicitud no confirma la cita.</p><div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</span><span>Sonrisas que iluminan</span></div></div></footer> }