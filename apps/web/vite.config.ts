import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

/**
 * Vite configuration for the web app.
 *
 * Tailwind v4 is wired through its Vite plugin; there is no `tailwind.config.js`
 * — v4 is configured in CSS (see `src/style.css`).
 */
export default defineConfig({
  plugins: [vue(), tailwindcss()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // The root `.env` is outside this app's directory. Pinning `@` to `./src`
      // above stops Vite from inheriting it as an implicit env prefix.
    },
  },

  // One `.env` for the whole workspace, kept at the repository root.
  envDir: fileURLToPath(new URL("../../", import.meta.url)),

  server: {
    port: 5173,
    // Same-origin calls to the deployed API in production, proxied to the local
    // API in development — so the web app never needs the API's origin baked in
    // while developing.
    proxy: {
      "/health": "http://localhost:3001",
      "/api": "http://localhost:3001",
    },
  },
});