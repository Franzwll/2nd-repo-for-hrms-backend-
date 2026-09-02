import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

// NOTE: Do NOT add TanStackRouterVite here — tanstackStart already includes it
// internally. Adding it twice causes concurrent EPERM rename errors on Windows
// when both instances try to atomically overwrite src/routeTree.gen.ts.
export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    }),
    react(),
  ],
  // Proxy API calls to the Laravel backend so document previews are same-origin.
  // A same-origin <iframe>/<img> lets the browser render PDFs/images inline
  // instead of downloading them (cross-origin PDFs are forced to download).
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
