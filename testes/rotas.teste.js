import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { traduzirInstrucao, buscarRota } from '../src/recursos/mapa/rotas.js';

const passo = (type, modifier, name = '', extra = {}) => ({
  maneuver: { type, modifier, ...extra },
  name,
});

describe('instruções de rota em português', () => {
  it('traduz manobras comuns', () => {
    expect(traduzirInstrucao(passo('depart', undefined, 'Rua de São João'))).toBe(
      'Saia do Mercado Central pela Rua de São João',
    );
    expect(traduzirInstrucao(passo('turn', 'right', 'Rua da Estrela'))).toBe(
      'Vire à direita na Rua da Estrela',
    );
    expect(traduzirInstrucao(passo('turn', 'slight left', 'Avenida Beira-Mar'))).toBe(
      'Vire levemente à esquerda na Avenida Beira-Mar',
    );
    expect(traduzirInstrucao(passo('arrive'))).toBe('Você chegou ao destino');
    expect(
      traduzirInstrucao(passo('roundabout', undefined, 'Avenida Litorânea', { exit: 2 })),
    ).toBe('Na rotatória, pegue a 2ª saída pela Avenida Litorânea');
  });
  it('usa o artigo masculino para largo e beco', () => {
    expect(traduzirInstrucao(passo('turn', 'left', 'Largo do Carmo'))).toBe(
      'Vire à esquerda no Largo do Carmo',
    );
    expect(traduzirInstrucao(passo('continue', 'straight', 'Beco da Pacotilha'))).toBe(
      'Continue em frente pelo Beco da Pacotilha',
    );
  });
});

describe('buscarRota', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('converte a resposta do OSRM (rota real Mercado → Rua Portugal)', async () => {
    const dados = JSON.parse(
      readFileSync(resolve(process.cwd(), 'testes/fixture-rota.json'), 'utf8'),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => dados })),
    );
    const rota = await buscarRota([-2.5345, -44.3011], [-2.5292, -44.3066], 'a-pe');
    expect(rota.aproximada).toBe(false);
    expect(rota.distanciaKm).toBeGreaterThan(0.8);
    expect(rota.coordenadas[0]).toHaveLength(2);
    expect(rota.passos[0].texto).toMatch(/^Saia do Mercado Central/);
    expect(rota.passos.at(-1).texto).toBe('Você chegou ao destino');
  });
  it('lança erro quando o serviço falha (o mapa usa linha reta)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503 })),
    );
    await expect(buscarRota([0, 0], [1, 1], 'carro')).rejects.toThrow('503');
  });
});

describe('buscarRotaPorPontos', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('monta a URL com todas as paradas e nomeia as chegadas', async () => {
    const passo = (type) => ({ maneuver: { type }, name: 'Rua X', distance: 10 });
    const dados = {
      routes: [
        {
          distance: 2000,
          duration: 1500,
          geometry: {
            coordinates: [
              [-44.3, -2.5],
              [-44.31, -2.51],
            ],
          },
          legs: [
            { steps: [passo('depart'), passo('arrive')] },
            { steps: [passo('depart'), passo('arrive')] },
          ],
        },
      ],
    };
    const falso = vi.fn(async () => ({ ok: true, json: async () => dados }));
    vi.stubGlobal('fetch', falso);
    const { buscarRotaPorPontos } = await import('../src/recursos/mapa/rotas.js');
    const rota = await buscarRotaPorPontos(
      [
        [-2.5, -44.3],
        [-2.51, -44.31],
        [-2.52, -44.32],
      ],
      'a-pe',
      {
        nomesDasParadas: ['Teatro', 'Catedral'],
      },
    );
    expect(falso.mock.calls[0][0]).toContain('-44.3,-2.5;-44.31,-2.51;-44.32,-2.52');
    expect(rota.passos.map((p) => p.texto)).toEqual([
      'Saia do Mercado Central pela Rua X',
      'Chegada: Teatro',
      'Você chegou: Catedral',
    ]);
  });
});
