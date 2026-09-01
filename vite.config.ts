import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [path.resolve(__dirname, "."), path.resolve(__dirname, "src"), path.resolve(__dirname, "shared")],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    // In development the API is proxied so the browser sees one origin. That
    // keeps cookies first-party and takes CORS out of the local setup entirely.
    // Deployed builds talk to the API directly via VITE_API_BASE_URL.
    proxy: {
      "/api": { target: process.env.VITE_DEV_API_TARGET || "http://127.0.0.1:8000", changeOrigin: true },
      "/media": { target: process.env.VITE_DEV_API_TARGET || "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
  build: {
    outDir: "dist/spa",
    // Split the vendor bundle so a first paint does not wait on everything.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query", "axios"],
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
