// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // כל בקשה שמתחילה ב-/api → תועבר אוטומטית ל-http://localhost:3000
      "/api": "http://localhost:3000",
    },
  },
});
