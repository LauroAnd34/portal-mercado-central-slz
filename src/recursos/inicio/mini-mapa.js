/**
 * Desenho decorativo da página inicial: o Mercado no centro e linhas até os
 * pontos turísticos, nas posições geográficas reais (projeção simples).
 */
export function desenharMiniMapa(svg, { mercado, pontos, categorias }) {
  const largura = 400;
  const altura = 300;
  const margem = 24;
  const todos = [mercado, ...pontos];
  const lats = todos.map((p) => p.coordenadas[0]);
  const lons = todos.map((p) => p.coordenadas[1]);
  const [minLat, maxLat, minLon, maxLon] = [
    Math.min(...lats),
    Math.max(...lats),
    Math.min(...lons),
    Math.max(...lons),
  ];
  const escala = Math.min(
    (largura - margem * 2) / (maxLon - minLon),
    (altura - margem * 2) / (maxLat - minLat),
  );
  const projetar = ([lat, lon]) => [
    margem + (lon - minLon) * escala + (largura - margem * 2 - (maxLon - minLon) * escala) / 2,
    margem + (maxLat - lat) * escala + (altura - margem * 2 - (maxLat - minLat) * escala) / 2,
  ];
  const [cx, cy] = projetar(mercado.coordenadas);
  svg.setAttribute('viewBox', `0 0 ${largura} ${altura}`);
  svg.innerHTML = `
    ${pontos
      .map((p, i) => {
        const [x, y] = projetar(p.coordenadas);
        const cor = categorias[p.categoria].cor;
        return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${cor}" stroke-width="2" stroke-dasharray="4 4" class="mini-mapa__linha" style="animation-delay:${i * 60}ms"/>
          <circle cx="${x}" cy="${y}" r="5" fill="${cor}" stroke="#fff" stroke-width="2" class="mini-mapa__ponto" style="animation-delay:${i * 60}ms"/>`;
      })
      .join('')}
    <circle cx="${cx}" cy="${cy}" r="18" fill="#bbd050" opacity=".35" class="mini-mapa__pulso"/>
    <circle cx="${cx}" cy="${cy}" r="10" fill="#bbd050" stroke="#144670" stroke-width="3"/>`;
}
