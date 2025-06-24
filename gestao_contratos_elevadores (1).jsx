// 1. Gerar o manifest.json
// Coloque este arquivo em /public/manifest.json
/*
{
  "name": "Gestão de Contratos de Elevadores",
  "short_name": "Contratos",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1f2937",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
*/

// 2. Adicionar no <head> do index.html
/*
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1f2937" />
*/

// 3. Instalar e configurar o Vite Plugin (vite.config.js ou .ts):
/*
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Gestão de Contratos de Elevadores',
        short_name: 'Contratos',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1f2937',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
*/
