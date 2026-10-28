import { defineConfig, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

// NOTE: Do NOT add TanStackRouterVite here — tanstackStart already includes it
// internally. Adding it twice causes concurrent EPERM rename errors on Windows
// when both instances try to atomically overwrite src/routeTree.gen.ts.
const apiProxyTarget = "http://127.0.0.1:8000/";

const apiProxy: Record<string, ProxyOptions> = {
  "/api": {
    target: apiProxyTarget,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on("proxyReq", (proxyReq) => {
        proxyReq.removeHeader("expect");
      });
    },
  },
};

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
    host: "0.0.0.0",
    allowedHosts: [
      "hrms1.oxfordsuitesmakati.io",
      "testhrms1.oxfordsuitesmakati.io",
      "localhost",
    ],
    proxy: apiProxy,
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: [
      "hrms1.oxfordsuitesmakati.io",
      "testhrms1.oxfordsuitesmakati.io",
    ],
    proxy: apiProxy,
  },
});
