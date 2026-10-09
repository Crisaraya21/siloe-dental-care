// Configuración de Vite para publicar la página en Netlify.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  // Mismo puerto de antes (8080) y visible en la red local, para probar desde el celular.
  server: { host: true, port: 8080, strictPort: false },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      // Usa src/server.ts como entrada del servidor (envuelve los errores de renderizado con una página amable).
      server: { entry: "server" },
    }),
    viteReact(),
    tailwindcss(),
    // El complemento de Netlify solo se usa al compilar para publicar. En desarrollo no hace falta
    // y pide herramientas extra (Deno) que pueden dar error.
    ...(command === "build" ? [netlify()] : []),
  ],
}));
