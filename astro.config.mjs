import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://finley.fish",
  build: {
    // the pond is the whole page, so there is nothing to gain from splitting css
    inlineStylesheets: "always",
  },
});
