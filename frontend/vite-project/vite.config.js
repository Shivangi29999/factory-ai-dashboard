// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Use different backend URL for Docker vs local development
const apiTarget = process.env.DOCKER
  ? "http://backend:8000"
  : "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});
