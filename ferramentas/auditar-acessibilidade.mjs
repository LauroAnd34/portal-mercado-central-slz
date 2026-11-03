/**
 * Auditoria automática de acessibilidade (axe-core) em todas as páginas e
 * nos três esquemas de cor. Uso: npm run construir && npm run visualizar
 * (em outro terminal) e depois: node ferramentas/auditar-acessibilidade.mjs
 * Requer: npm i -D playwright @axe-core/playwright && npx playwright install chromium
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const BASE = process.env.ENDERECO ?? 'http://localhost:4173/';
const PAGINAS = ['index.html', 'livro.html', 'mapa.html', 'acessibilidade.html', '404.html'];
const ESQUEMAS = { padrao: {}, escuro: { cores: 'escuro' }, alto: { cores: 'alto' } };

const navegador = await chromium.launch();
let totalProblemas = 0;
for (const [nomeEsquema, prefs] of Object.entries(ESQUEMAS)) {
  const contexto = await navegador.newContext();
  await contexto.addInitScript((p) => {
    localStorage.setItem('slz-mercado:preferencias', JSON.stringify(p));
  }, prefs);
  const pagina = await contexto.newPage();
  for (const caminho of PAGINAS) {
    await pagina.goto(BASE + caminho, { waitUntil: 'networkidle' });
    await pagina.waitForTimeout(800);
    const { violations } = await new AxeBuilder({ page: pagina })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .exclude('.leaflet-tile-pane') // imagens de fundo do mapa (de terceiros)
      // marcadores podem se sobrepor no zoom afastado; a WCAG 2.5.8 admite isso
      // porque a lista de pontos oferece um controle equivalente e grande o bastante
      .exclude('.leaflet-marker-pane')

      .exclude('#vlibras-access-wrapper')
      .exclude('#vlibras-app-root')
      .exclude('[vw]') // widget VLibras do Governo Federal (código de terceiros)
      .analyze();
    totalProblemas += violations.length;
    console.log(
      `\n[${nomeEsquema}] ${caminho}: ${violations.length ? violations.length + ' problema(s)' : 'OK'}`,
    );
    for (const v of violations) {
      console.log(`  - ${v.id} (${v.impact}): ${v.help}`);
      v.nodes
        .slice(0, 3)
        .forEach((n) =>
          console.log(`      ${n.target.join(' ')} — ${n.failureSummary?.split('\n')[1] ?? ''}`),
        );
    }
  }
  await contexto.close();
}
await navegador.close();
process.exit(totalProblemas ? 1 : 0);
