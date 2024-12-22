import glsl from 'vite-plugin-glsl';
import { viteSingleFile } from "vite-plugin-singlefile"
import { createHtmlPlugin } from 'vite-plugin-html'
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [glsl({ compress: true }), viteSingleFile(), createHtmlPlugin({ minify: true })],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000,
  }
});