import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const saveConfigPlugin = () => ({
  name: 'save-config-plugin',
  configureServer(server: any) {
    server.middlewares.use('/api/save-config', (req: any, res: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const configPath = path.resolve(__dirname, 'src/config/layoutConfig.json');
            fs.writeFileSync(configPath, body);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } catch (error: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
        });
      } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  base: './', // Necessário para funcionar corretamente no GitHub Pages
  plugins: [
    react(),
    tailwindcss(),
    saveConfigPlugin()
  ],
})
