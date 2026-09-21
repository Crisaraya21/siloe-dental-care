# Siloé Smiles

Clínica Dental Siloé (Landing Page)
Misión: Plataforma web de atención dental con agendamiento de citas en línea, información de servicios y contacto directo con especialistas.

Identidad visual
Paleta: Negro carbón #1A1A1A, oro #C5A059, oro claro #E3C68D, oro mate #A6894B, blanco hueso #F9FBFB, blanco, verde WhatsApp #25D366.
Tipografía: Playfair Display (font-serif) para encabezados y títulos; Outfit (font-body) para texto. Tokens en src/index.css (--font-heading, --font-body, --font-display).
Estilo: Minimalista, premium, atelier dental. Bordes sutiles border-[#C5A059]/20, gradientes oro from-[#C5A059] to-[#E3C68D], glows blur-[120px], tarjetas redondeadas rounded-2xl/3xl, secciones alternando fondo oscuro #1A1A1A y claro #F9FBFB.
Estructura (src/pages/Home.jsx)
Orden de secciones, todas dentro de un contenedor bg-[#1A1A1A] min-h-screen:

Navbar (#inicio) — fija, transparente → al hacer scroll bg-[#1A1A1A]/85 backdrop-blur. Logo circular + "CLÍNICA DENTAL SILOÉ". Links: Inicio, Servicios, Solicitar, Reseñas, Preguntas, Ubicación. CTA dorado "Solicitar Cita". Menú móvil colapsable.
Hero — min-h-screen, grilla 2 columnas. Badge "Sonrisas que iluminan", título "Tu sonrisa es la luz de tu historia" (degradado oro), subtítulo, CTAs "Solicitar Cita" / "Nuestros Servicios", stats (+15 años, +5.000 sonrisas, 100% trato humano). Imagen con anillo oro y badge flotante "Atención personalizada".
Services (#servicios) — fondo #F9FBFB. Grid de 8 fichas (imagen IA, icono lucide en badge blanco, título, desc breve, precio "Desde ¢…", botón "Ver ficha"). Servicios: Estética Dental, Carillas, Blanqueamiento, Coronas y Puentes, Prótesis Dentales, Extracciones, Cirugía, Limpieza Dental. Cada ficha abre ServiceModal con fullDesc, precio estimado y CTA "Solicitar este servicio" → #agendar. Nota: "Precios referenciales."
Booking (#agendar) — fondo oscuro. Título "Solicita tu cita / Solicita en tres pasos". Asistente de 3 pasos: ① servicio (8 opciones) ② fecha (min hoy) + hora (slots 09–16h) ③ datos (nombre*, teléfono*, correo, mensaje). Guarda en entidad Appointment (status: pendiente). Pantalla de confirmación al enviar.
FAQ (#faq) — fondo #F9FBFB. Acordeón de 7 preguntas (citas, duración consulta, seguros, blanqueamiento, limpieza, pagos, emergencias). Iconos Plus/Minus en círculo que se llena con degradado oro al abrir.
Reviews (#resenas) — fondo #F9FBFB. Encabezado con promedio + total. Formulario: selector de estrellas (las no marcadas con borde #1A1A1A, las activas rellenas #C5A059), nombre, texto. Lógica condicional: 4–5 estrellas → guarda en Review (posted_to_google: true) y muestra mensaje "¡Gracias!" con botones "Sí, publicar en Google" (abre https://share.google/8UEfzPpLOgH7UgZY9) o "No, gracias". 1–3 estrellas → guarda internamente (posted_to_google: false) y mensaje de feedback. Lista de reseñas oculta tras botón "Ver reseñas (N)" que se expande/colapsa ("Ocultar reseñas").
Location (#ubicacion) — fondo oscuro. Mapa Google embebido (escala de grises) + tarjetas Dirección/Horario (Lun–Vie 9–18, Sáb 9–13, Dom cerrado) + botones "Cómo llegar" y tel:70137712.
InstagramFeed (#instagram) — fondo #F9FBFB. Grid 2×3 de placeholders con degradados oro/oscuro, todos enlazan a @clinicadentalsiloe. CTA dorado al perfil.
Footer — oscuro, 3 columnas (marca, navegación, contacto con teléfono/mapa/Instagram). Copyright dinámico + tagline "Sonrisas que iluminan".
FloatingWhatsApp — botón fijo inferior derecho, verde #25D366 con ping animado, abre wa.me/50670137712 con mensaje prefabricado; tooltip "Chatea con un especialista" en desktop.
Datos (Base44)
Appointment: name, phone, email, service, preferred_date, preferred_time, message, status (pendiente/confirmada/cancelada/completada). RLS por defecto.
Review: name, rating (1–5), text, posted_to_google (bool). RLS: lectura/creación abierta; update/delete solo admin.
Detalles técnicos
Stack React + Tailwind + Vite. Iconos lucide-react. Imágenes IA en media.base44.com. Componente Image de @/components/ui/image para el modal; <img> directo en tarjetas.
Texto estandarizado: "Solicitar Cita" / "Solicita en tres pasos" (no "agendar").
Contacto: WhatsApp 7013 7712, Instagram @clinicadentalsiloe, Google Maps Clínica Siloé.
Publicado en siloe-smile-studio.base44.app. Zona horaria America/Costa_Rica. Pagos disponibles: Stripe (no Wix Payments en CR). la ultima imagen es la de el logo de la pagina,  para los componentes de images usa este codigo y usalas de referencia de aca import React, { useState } from "react";

import { Sparkle, Smile, Sun, Crown, Bone, Scissors, Stethoscope, Wind, Info } from "lucide-react";

import ServiceModal from "./ServiceModal";




const SERVICES = [

  {

    icon: Sparkle,

    title: "Estética Dental",

    image: "https://media.base44.com/images/public/6a9b942b1c9290ab9b897c54/50833bb86_generated_image.png",

    desc: "Diseño de sonrisa y armonía estética integral para resultados naturales.",

    fullDesc: "Combinamos diseño de sonrisa, armonía facial y técnicas de estética dental para realzar la belleza natural de tus dientes. Incluye evaluación digital, fotografía clínica y un plan totalmente personalizado.",

    price: "Desde ¢150.000",

  },

  {

    icon: Smile,

    title: "Carillas",

    image: "https://media.base44.com/images/public/6a9b942b1c9290ab9b897c54/9609626f9_generated_image.png",

    desc: "Láminas de cerámica ultrafinas que renuevan forma y color dental.",

    fullDesc: "Carillas de cerámica de alta translucidez que se adhieren a la cara frontal del diente, corrigiendo forma, tamaño, color y leves desalineaciones. Resultados naturales y duraderos.",

    price: "Desde ¢350.000 / pieza",

  },

  {

    icon: Sun,

    title: "Blanqueamiento",

    image: "https://media.base44.com/images/public/6a9b942b1c9290ab9b897c54/70b1cd181_generated_image.png",

    desc: "Aclara varios tonos tu sonrisa en una sola sesión, seguro e indoloro.",

    fullDesc: "Tratamiento profesional que aclara el color de tus dientes varios tonos en una sesión, con gel de alta concentración y luz LED. Indoloro y con resultados visibles de inmediato.",

    price: "Desde ¢120.000",

  },

  {

    icon: Crown,

    title: "Coronas y Puentes",

    image: "https://media.base44.com/images/public/6a9b942b1c9290ab9b897c54/9d3fcbc70_generated_image.png",

    desc: "Restauraciones de cerámica que devuelven forma y función a piezas dañadas.",

    fullDesc: "Coronas y puentes de cerámica metal-free que restauran dientes dañados o ausentes, devolviendo forma, función y estética. Materiales de alta resistencia y apariencia natural.",

    price: "Desde ¢280.000 / pieza",

  },

  {

    icon: Bone,

    title: "Prótesis Dentales",

    image: "https://media.base44.com/images/public/6a9b942b1c9290ab9b897c54/e7c82b668_generated_image.png",

    desc: "Prótesis fijas y removibles que recuperan tu mordida y tu sonrisa.",

    fullDesc: "Soluciones protésicas fijas y removibles para reponer dientes perdidos: prótesis totales, parciales e implanto-soportadas. Diseñadas para comodidad, función y estética.",

    price: "Desde ¢450.000",

  },

  {

    icon: Scissors,

    title: "Extracciones",

    image: "https://media.base44.com/images/public/6a9b942b1c9290ab9b897c54/aca176ae1_generated_image.png",

    desc: "Extracciones sencillas y complejas con técnica mínimamente invasiva.",

    fullDesc: "Extracción de piezas dentales con técnicas mínimamente invasivas y anestesia local. Incluye evaluación previa y recomendaciones de cuidado postoperatorio.",

    price: "Desde ¢45.000",

  },

  {

    icon: Stethoscope,

    title: "Cirugía",

    image: "https://media.base44.com/images/public/6a9b942b1c9290ab9b897c54/69f28170c_generated_image.png",

    desc: "Cirugía oral e implantología con tecnología de vanguardia.",

    fullDesc: "Cirugía oral e implantología: colocación de implantes, extracciones complejas de cordales y cirugía de tejidos. Protocolos estériles y tecnología de vanguardia.",

    price: "Desde ¢350.000",

  },

  {

    icon: Wind,

    title: "Limpieza Dental",

    image: "https://media.base44.com/images/public/6a9b942b1c9290ab9b897c54/41220d49c_generated_image.png",

    desc: "Profilaxis profunda para encías sanas y una sonrisa fresca.",

    fullDesc: "Profilaxis dental profesional que elimina sarro, manchas y placa. Incluye pulido y aplicación de flúor para mantener encías sanas y prevenir caries.",

    price: "Desde ¢35.000",

  },

];




export default function Services() {

  const [active, setActive] = useState(null);




  return (

    <section id="servicios" className="bg-[#F9FBFB] py-24 sm:py-32">

      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <div className="text-center max-w-2xl mx-auto mb-16">

          <p className="text-[#A6894B] text-xs tracking-[0.3em] uppercase mb-4">Nuestros Servicios</p>

          <h2 className="font-serif text-[#1A1A1A] text-4xl sm:text-5xl leading-tight">

            Un atelier dental al servicio de tu bienestar

          </h2>

          <p className="text-[#1A1A1A]/60 mt-5 text-lg">

            Cada tratamiento se diseña a la medida de tus necesidades, con materiales premium y un enfoque humano.

          </p>

        </div>




        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {SERVICES.map((s) => {

            const Icon = s.icon;

            return (

              <div

                key={s.title}

                className="group bg-white rounded-2xl overflow-hidden border border-[#1A1A1A]/5 hover:border-[#C5A059]/40 hover:shadow-[0_20px_60px_-20px_rgba(197,160,89,0.3)] transition-all duration-500 flex flex-col"

              >

                <div className="relative h-40 overflow-hidden">

                  <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center">

                    <Icon size={20} className="text-[#C5A059]" />

                  </div>

                </div>

                <div className="p-6 flex flex-col flex-1">

                  <h3 className="font-serif text-[#1A1A1A] text-lg mb-2">{s.title}</h3>

                  <p className="text-[#1A1A1A]/60 text-sm leading-relaxed flex-1">{s.desc}</p>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#1A1A1A]/5">

                    <span className="text-[#C5A059] font-semibold text-sm">{s.price}</span>

                    <button

                      onClick={() => setActive(s)}

                      className="inline-flex items-center gap-1 text-[#1A1A1A] text-sm font-medium hover:text-[#C5A059] transition-colors"

                    >

                      <Info size={15} /> Ver ficha

                    </button>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      </div>

      <ServiceModal service={active} onClose={() => setActive(null)} />

    </section>

  );

}  usa el mismo de letra y usa de referencia las imagenes que te envie

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://siloe-dental-care.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a4bae988-5c65-4b3a-9969-7b0edd1a8c0a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
