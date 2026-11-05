import { minutosPorDistancia } from '../src/recursos/mapa/meios-de-transporte.js';
import { describe, it, expect } from 'vitest';
import {
  calcularDistanciaKm,
  estimarTempos,
  formatarDistancia,
  formatarDuracao,
  direcaoCardeal,
  sugerirModo,
  linkComoChegar,
} from '../src/recursos/mapa/geografia.js';
import { MERCADO_CENTRAL, PONTOS_TURISTICOS, CATEGORIAS } from '../src/dados/pontos-turisticos.js';

describe('geografia', () => {
  it('calcula a distância Mercado → Rua Portugal (~0,85 km)', () => {
    const rua = PONTOS_TURISTICOS.find((p) => p.id === 'rua-portugal');
    expect(calcularDistanciaKm(MERCADO_CENTRAL.coordenadas, rua.coordenadas)).toBeCloseTo(0.85, 1);
  });
  it('distância de um ponto para ele mesmo é zero', () => {
    expect(calcularDistanciaKm([-2.5, -44.3], [-2.5, -44.3])).toBe(0);
  });
  it('estima tempos a pé e de carro (mínimo 1 min; carro inclui sair e estacionar)', () => {
    expect(estimarTempos(0)).toEqual({ aPeMinutos: 1, carroMinutos: 2 });
    const { aPeMinutos, carroMinutos } = estimarTempos(4.5);
    expect(aPeMinutos).toBe(76);
    expect(carroMinutos).toBeLessThan(aPeMinutos);
  });
  it('tempo de carro parecido com o do Google Maps em viagem longa', () => {
    // ~32 km pelas ruas até São José de Ribamar: Google Maps ≈ 1h05–1h10
    const minutos = minutosPorDistancia('carro', 32);
    expect(minutos).toBeGreaterThanOrEqual(60);
    expect(minutos).toBeLessThanOrEqual(75);
  });
  it('sugere ir a pé apenas em distâncias curtas', () => {
    expect(sugerirModo(1)).toBe('a-pe');
    expect(sugerirModo(10)).toBe('carro');
  });
  it('formata distâncias e durações em português', () => {
    expect(formatarDistancia(0.234)).toBe('230 m');
    expect(formatarDistancia(12.34)).toBe('12,3 km');
    expect(formatarDuracao(45)).toBe('45 min');
    expect(formatarDuracao(60)).toBe('1 h');
    expect(formatarDuracao(95)).toBe('1 h 35 min');
  });
  it('dá a direção cardeal', () => {
    expect(direcaoCardeal([0, 0], [1, 0])).toBe('norte');
    expect(direcaoCardeal([0, 0], [0, -1])).toBe('oeste');
    expect(direcaoCardeal([0, 0], [-1, 1])).toBe('sudeste');
  });
  it('monta o link do Google Maps saindo do Mercado', () => {
    const link = linkComoChegar([-2.5, -44.3], [-2.4, -44.2], 'a-pe');
    expect(link).toContain('origin=-2.5%2C-44.3');
    expect(link).toContain('travelmode=walking');
  });
});

describe('dados dos pontos turísticos', () => {
  it('têm ids únicos e categorias válidas', () => {
    const ids = PONTOS_TURISTICOS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const ponto of PONTOS_TURISTICOS) expect(CATEGORIAS).toHaveProperty(ponto.categoria);
  });
  it('estão todos na região da Ilha de São Luís', () => {
    for (const {
      coordenadas: [lat, lon],
      nome,
    } of PONTOS_TURISTICOS) {
      expect(lat, nome).toBeGreaterThan(-2.7);
      expect(lat, nome).toBeLessThan(-2.35);
      expect(lon, nome).toBeGreaterThan(-44.45);
      expect(lon, nome).toBeLessThan(-43.95);
    }
  });
});
