import { describe, it, expect } from 'vitest';
import {
  prepararPontos,
  filtrarPontos,
  renderizarItem,
} from '../src/recursos/mapa/guia-de-pontos.js';
import { MERCADO_CENTRAL, PONTOS_TURISTICOS, CATEGORIAS } from '../src/dados/pontos-turisticos.js';

const pontos = prepararPontos(PONTOS_TURISTICOS, MERCADO_CENTRAL, CATEGORIAS);

describe('guia de pontos', () => {
  it('ordena do mais perto para o mais longe do Mercado', () => {
    for (let i = 1; i < pontos.length; i++) {
      expect(pontos[i].distanciaKm).toBeGreaterThanOrEqual(pontos[i - 1].distanciaKm);
    }
  });
  it('filtra por categoria e por texto (sem acento)', () => {
    const praias = filtrarPontos(pontos, { categoriasAtivas: new Set(['praias']) });
    expect(praias.every((p) => p.categoria === 'praias')).toBe(true);
    const busca = filtrarPontos(pontos, {
      categoriasAtivas: new Set(Object.keys(CATEGORIAS)),
      termo: 'palacio',
    });
    expect(busca.map((p) => p.id)).toContain('palacio-dos-leoes');
  });
  it('escapa HTML ao renderizar', () => {
    const html = renderizarItem({ ...pontos[0], nome: '<script>x</script>' }, false);
    expect(html).not.toContain('<script>');
  });
});
