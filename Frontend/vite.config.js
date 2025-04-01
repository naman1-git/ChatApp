import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  proxy: {
  '/api': {
    target: 'https://chat-app-git-main-naman-adlakhas-projects.vercel.app/api', // Ensure this URL is correct
    changeOrigin: true,
    secure: false, // If the target uses HTTPS and the certificate is invalid
  },
},

  },
});
