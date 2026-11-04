/**
 * "Caminhos que começam no Mercado": cartões com foto real de cada lugar,
 * distância pelas ruas e link para o caminho no mapa. A lista rola para o
 * lado (com o dedo, a roda do mouse ou o teclado).
 */
import { PONTOS_TURISTICOS, CATEGORIAS, MERCADO_CENTRAL } from '../../dados/pontos-turisticos.js';
import { FOTO_DO_PONTO, urlDaFoto, srcsetDaFoto } from '../../dados/fotos.js';
import { rotaGuardadaDoPonto } from '../mapa/rotas-guardadas.js';
import { calcularDistanciaKm, formatarDistancia, formatarDuracao } from '../mapa/geografia.js';
import { escaparHtml } from '../../nucleo/dom.js';

export function montarCaminhos(lista) {
  const itens = PONTOS_TURISTICOS.filter((p) => FOTO_DO_PONTO[p.id])
    .map((p) => {
      const aPe = rotaGuardadaDoPonto(p.id, 'a-pe');
      const carro = rotaGuardadaDoPonto(p.id, 'carro');
      const km =
        aPe?.distanciaKm ?? calcularDistanciaKm(MERCADO_CENTRAL.coordenadas, p.coordenadas);
      const tempo =
        km <= 2.5
          ? `${formatarDuracao(aPe?.minutos ?? km * 13)} a pé`
          : `${formatarDuracao(carro?.minutos ?? km * 3)} de carro`;
      return { ...p, km, tempo };
    })
    .sort((a, b) => a.km - b.km);

  lista.innerHTML = itens
    .map(
      (p) => `
      <li class="caminho">
        <a class="caminho__link" href="./mapa.html#${p.id}">
          <img src="${urlDaFoto(FOTO_DO_PONTO[p.id])}" srcset="${srcsetDaFoto(FOTO_DO_PONTO[p.id])}" sizes="320px" alt="" loading="lazy" width="900" height="600" />
          <span class="caminho__info">
            <span class="caminho__categoria">${escaparHtml(CATEGORIAS[p.categoria].nome)}</span>
            <span class="caminho__nome">${escaparHtml(p.nome)}</span>
            <span class="caminho__distancia">${formatarDistancia(p.km)} · ${p.tempo}</span>
          </span>
        </a>
      </li>`,
    )
    .join('');
}
