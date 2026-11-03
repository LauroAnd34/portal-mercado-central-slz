/**
 * Gera sitemap.xml e robots.txt na construção, usando o endereço público
 * definido em VITE_ENDERECO_SITE (arquivo .env).
 */
export function sitemap({ paginas }) {
  let endereco = '';
  return {
    name: 'sitemap',
    apply: 'build',
    configResolved(config) {
      endereco = config.env.VITE_ENDERECO_SITE ?? '';
    },
    generateBundle() {
      const hoje = new Date().toISOString().slice(0, 10);
      const urls = paginas
        .map((pagina) => `  <url><loc>${endereco}${pagina}</loc><lastmod>${hoje}</lastmod></url>`)
        .join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${endereco}sitemap.xml\n`,
      });
    },
  };
}
