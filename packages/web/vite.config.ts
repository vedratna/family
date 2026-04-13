import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // amazon-cognito-identity-js references Node's `global`; shim to `globalThis` for the browser
    global: "globalThis",
  },
  server: {
    port: 5173,
  },
});
