import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://finley.fish",
  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
});
