import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { parciaisHtml } from './ferramentas/plugin-vite-parciais.js';
import { modoOffline } from './ferramentas/plugin-vite-offline.js';
import { sitemap } from './ferramentas/plugin-vite-sitemap.js';

const raiz = import.meta.dirname;

/**
 * Configuração Vite — site multipágina (MPA).
 * Cada página HTML é uma entrada própria; cabeçalho, rodapé e barra de
 * acessibilidade são compartilhados via parciais (<!-- @include ... -->).
 */
export default defineConfig({
  base: './',
  publicDir: 'publico',
  plugins: [
    parciaisHtml({ pasta: resolve(raiz, 'src/parciais') }),
    modoOffline({
      pastaPublica: resolve(raiz, 'publico'),
      modelo: resolve(raiz, 'ferramentas/modelo-sw.js'),
    }),
    sitemap({ paginas: ['', 'livro.html', 'mapa.html'] }),
  ],
  build: {
    outDir: 'site-pronto',
    target: 'es2020',
    rollupOptions: {
      input: {
        inicio: resolve(raiz, 'index.html'),
        livro: resolve(raiz, 'livro.html'),
        mapa: resolve(raiz, 'mapa.html'),
        naoEncontrada: resolve(raiz, '404.html'),
        placas: resolve(raiz, 'placas.html'),
      },
    },
  },
  server: { port: 5173, host: true },
  test: { environment: 'jsdom', include: ['testes/**/*.teste.js'] },
});
