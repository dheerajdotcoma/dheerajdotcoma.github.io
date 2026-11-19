/**
 * Build-time renderer: fills the `<!--app:*-->` placeholders in index.html with HTML generated
 * from src/data/*.js via src/render/templates.js. The result is a complete static page that is
 * fully readable without JavaScript; client JS only enhances it.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TEMPLATES = path.resolve('src/render/templates.js');

export default function prerender() {
  let server = null;
  return {
    name: 'portfolio-prerender',
    configureServer(s) {
      server = s;
    },
    async transformIndexHtml(html) {
      const mod = server
        ? await server.ssrLoadModule(TEMPLATES) // dev: fresh module graph on every request
        : await import(pathToFileURL(TEMPLATES).href + '?t=' + Date.now());
      const parts = await mod.renderAll();
      return html.replace(/<!--app:(\w+)-->/g, (m, key) => {
        if (!(key in parts)) throw new Error(`prerender: no renderer for placeholder ${m}`);
        return parts[key];
      });
    },
    handleHotUpdate({ file, server: s }) {
      const f = file.split(path.sep).join('/');
      if (f.includes('/src/data/') || f.includes('/src/render/') || f.includes('/src/components/demo')) {
        s.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
