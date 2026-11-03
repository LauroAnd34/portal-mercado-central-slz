/**
 * Lista acessível dos pontos turísticos (alternativa completa ao mapa):
 * filtros por categoria, busca por nome, ordenação por distância e painel de
 * detalhes com rota passo a passo.
 */
import {
  calcularDistanciaKm,
  estimarTempos,
  formatarDistancia,
  formatarDuracao,
  direcaoCardeal,
  sugerirModo,
  linkComoChegar,
} from './geografia.js';
import { escaparHtml } from '../../nucleo/dom.js';

const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Enriquece cada ponto com distância e tempos a partir do Mercado.
 * `obterRota(id, modo)` (opcional) devolve a rota real pelas ruas; quando
 * existe, a distância e os tempos passam a ser os do caminho de verdade.
 */
export function prepararPontos(pontos, mercado, categorias, obterRota = () => null) {
  return pontos
    .map((ponto) => {
      const emLinhaReta = calcularDistanciaKm(mercado.coordenadas, ponto.coordenadas);
      const aPe = obterRota(ponto.id, 'a-pe');
      const carro = obterRota(ponto.id, 'carro');
      const estimados = estimarTempos(emLinhaReta);
      const distanciaKm = aPe?.distanciaKm ?? emLinhaReta;
      return {
        ...ponto,
        categoriaInfo: categorias[ponto.categoria],
        distanciaKm,
        pelasRuas: Boolean(aPe),
        tempos: {
          aPeMinutos: Math.max(1, Math.round(aPe?.minutos ?? estimados.aPeMinutos)),
          carroMinutos: Math.max(1, Math.round(carro?.minutos ?? estimados.carroMinutos)),
        },
        modoSugerido: sugerirModo(distanciaKm),
        direcao: direcaoCardeal(mercado.coordenadas, ponto.coordenadas),
      };
    })
    .sort((a, b) => a.distanciaKm - b.distanciaKm);
}

/** Filtra por categorias ativas e termo de busca. */
export function filtrarPontos(pontos, { categoriasAtivas, termo = '' }) {
  const alvo = normalizar(termo.trim());
  return pontos.filter(
    (p) =>
      categoriasAtivas.has(p.categoria) &&
      (!alvo || normalizar(`${p.nome} ${p.endereco} ${p.descricao}`).includes(alvo)),
  );
}

export function textoDeResumo(ponto) {
  const modo =
    ponto.modoSugerido === 'a-pe'
      ? `cerca de ${formatarDuracao(ponto.tempos.aPeMinutos)} a pé`
      : `cerca de ${formatarDuracao(ponto.tempos.carroMinutos)} de carro`;
  const pelas = ponto.pelasRuas ? ' pelas ruas' : '';
  return `${formatarDistancia(ponto.distanciaKm)}${pelas} a ${ponto.direcao} do Mercado, ${modo}`;
}

/** HTML de um item da lista. */
export function renderizarItem(ponto, selecionado) {
  return `
    <li class="ponto ${selecionado ? 'ponto--selecionado' : ''}" style="--cor-categoria:${ponto.categoriaInfo.cor}">
      <button type="button" class="ponto__botao" data-ponto="${ponto.id}" aria-pressed="${selecionado}">
        <span class="ponto__marca" aria-hidden="true"></span>
        <span class="ponto__textos">
          <span class="ponto__nome">${escaparHtml(ponto.nome)}</span>
          <span class="ponto__categoria">${escaparHtml(ponto.categoriaInfo.nome)}</span>
          <span class="ponto__distancia">${escaparHtml(textoDeResumo(ponto))}</span>
          ${
            ponto.distanciaDeMimKm !== undefined
              ? `<span class="ponto__de-mim">${formatarDistancia(ponto.distanciaDeMimKm)} de você</span>`
              : ''
          }
        </span>
      </button>
    </li>`;
}

/** HTML do painel de detalhes. */
export function renderizarDetalhes(ponto, mercado, foto = null) {
  const modo = ponto.modoSugerido;
  const figura = foto
    ? `<figure class="detalhes__foto"><img src="${foto.url}" alt="${escaparHtml(foto.lugar)}" width="900" height="600" />
        <figcaption>Foto: ${escaparHtml(foto.autor)} · ${escaparHtml(foto.licenca)}</figcaption></figure>`
    : '';
  return `${figura}
    <div class="detalhes__cabecalho" style="--cor-categoria:${ponto.categoriaInfo.cor}">
      <span class="detalhes__categoria">${escaparHtml(ponto.categoriaInfo.nome)}</span>
      <h3 id="detalhes-titulo" tabindex="-1">${escaparHtml(ponto.nome)}</h3>
      <p class="detalhes__endereco">${escaparHtml(ponto.endereco)}</p>
    </div>
    <p>${escaparHtml(ponto.descricao)}</p>
    <dl class="detalhes__dados">
      <div><dt>Distância do Mercado</dt><dd>${formatarDistancia(ponto.distanciaKm)} ${ponto.pelasRuas ? 'pelo caminho a pé' : 'em linha reta'}, a ${ponto.direcao}</dd></div>
      <div><dt>A pé</dt><dd>${formatarDuracao(ponto.tempos.aPeMinutos)}</dd></div>
      <div><dt>De carro</dt><dd>${formatarDuracao(ponto.tempos.carroMinutos)}</dd></div>
      <div><dt>Acessibilidade do local</dt><dd>Informações em levantamento pela Prefeitura.</dd></div>
    </dl>
    <div class="detalhes__acoes">
      <button type="button" class="botao" data-tracar-rota="a-pe">Rota a pé</button>
      <button type="button" class="botao botao--contorno" data-tracar-rota="carro">Rota de carro</button>
      <button type="button" class="botao botao--texto" data-ouvir-ponto>Ouvir descrição</button>
      <a class="botao botao--texto" href="${linkComoChegar(mercado.coordenadas, ponto.coordenadas, modo)}" target="_blank" rel="noopener">
        Abrir no Google Maps<span class="somente-leitor"> (abre em nova aba)</span>
      </a>
    </div>
    <div class="detalhes__rota" data-area-rota aria-live="polite"></div>`;
}

/** HTML da rota passo a passo. */
export function renderizarRota(rota, modo) {
  const titulo = modo === 'a-pe' ? 'Caminho a pé' : 'Caminho de carro';
  const aviso = rota.aproximada
    ? '<p class="detalhes__aviso">Não foi possível calcular a rota pelas ruas agora (sem internet ou serviço indisponível). Mostramos a direção em linha reta.</p>'
    : '';
  const passos = rota.passos?.length
    ? `<ol class="passos">${rota.passos
        .map(
          (p) =>
            `<li>${escaparHtml(p.texto)}${p.distanciaM ? ` <span class="passos__distancia">— ${formatarDistancia(p.distanciaM / 1000)}</span>` : ''}</li>`,
        )
        .join('')}</ol>`
    : '';
  return `
    <h4>${titulo}: ${formatarDistancia(rota.distanciaKm)}, ${formatarDuracao(rota.minutos)}</h4>
    ${aviso}${passos}`;
}

/** Cartão de um roteiro pronto. */
export function renderizarCartaoRoteiro(roteiro, paradas, distanciaKm) {
  const modo = roteiro.modo === 'a-pe' ? 'A pé' : 'De carro ou ônibus';
  return `
    <li class="roteiro" style="--cor-roteiro:${roteiro.cor}">
      <h3 class="roteiro__nome">${escaparHtml(roteiro.nome)}</h3>
      <p class="roteiro__meta">${modo} · ${paradas.length} paradas · cerca de ${formatarDistancia(distanciaKm)}</p>
      <p>${escaparHtml(roteiro.descricao)}</p>
      <p class="roteiro__duracao">Sugestão: ${escaparHtml(roteiro.duracaoSugerida)}</p>
      <button type="button" class="botao" data-roteiro="${roteiro.id}">Ver roteiro no mapa</button>
    </li>`;
}

/** Painel de detalhes de um roteiro: paradas + passo a passo. */
export function renderizarDetalhesRoteiro(roteiro, paradas, rota) {
  const modo = roteiro.modo === 'a-pe' ? 'a pé' : 'de carro';
  const aviso = rota.aproximada
    ? '<p class="detalhes__aviso">Sem conexão com o serviço de rotas: o mapa mostra as paradas ligadas em linha reta.</p>'
    : '';
  const passos = rota.passos?.length
    ? `<details class="detalhes__passo-a-passo">
        <summary>Ver instruções passo a passo (${rota.passos.length})</summary>
        <ol class="passos">${rota.passos
          .map(
            (p) =>
              `<li class="${p.parada ? 'passos__parada' : ''}">${escaparHtml(p.texto)}${
                p.distanciaM
                  ? ` <span class="passos__distancia">— ${formatarDistancia(p.distanciaM / 1000)}</span>`
                  : ''
              }</li>`,
          )
          .join('')}</ol>
      </details>`
    : '';
  return `
    <div class="detalhes__cabecalho" style="--cor-categoria:${roteiro.cor}">
      <span class="detalhes__categoria">Roteiro ${modo}</span>
      <h3 id="detalhes-titulo" tabindex="-1">${escaparHtml(roteiro.nome)}</h3>
      <p class="detalhes__endereco">${formatarDistancia(rota.distanciaKm)} · ${formatarDuracao(rota.minutos)} de deslocamento (sem contar as visitas)</p>
    </div>
    ${aviso}
    <ol class="paradas">
      <li class="paradas__item paradas__item--inicio"><strong>Mercado Central</strong><span>Ponto de partida</span></li>
      ${paradas
        .map(
          (p, i) =>
            `<li class="paradas__item" style="--atraso:${i + 1}"><button type="button" class="paradas__botao" data-ponto="${p.id}">
            <strong>${escaparHtml(p.nome)}</strong><span>${escaparHtml(p.descricao)}</span></button></li>`,
        )
        .join('')}
    </ol>
    ${passos}`;
}
