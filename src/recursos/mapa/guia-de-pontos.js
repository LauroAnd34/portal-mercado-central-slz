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
import { MEIOS } from './meios-de-transporte.js';

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

/** HTML do painel de detalhes: o lugar e o "Como chegar" (origem + meio de transporte). */
export function renderizarDetalhes(ponto, mercado, foto = null, deMim = null, comoChegar = {}) {
  const { origem = 'mercado', meio = 'a-pe', tempos = {} } = comoChegar;
  const figura = foto
    ? `<figure class="detalhes__foto"><img src="${foto.url}"${foto.srcset ? ` srcset="${foto.srcset}" sizes="380px"` : ''} alt="${escaparHtml(foto.lugar)}" width="900" height="600" />
        <figcaption>Foto: ${escaparHtml(foto.autor)} · ${escaparHtml(foto.licenca)}</figcaption></figure>`
    : '';
  const distancias = [
    deMim ? `<strong>${formatarDistancia(deMim.distanciaKm)} de você</strong>` : '',
    `${formatarDistancia(ponto.distanciaKm)} do Mercado`,
  ]
    .filter(Boolean)
    .join(' · ');
  const origens = deMim
    ? `<div class="segmentos segmentos--origem" role="group" aria-label="Saindo de">
        <button type="button" class="segmento" data-origem="mim" aria-pressed="${origem === 'mim'}">De onde estou</button>
        <button type="button" class="segmento" data-origem="mercado" aria-pressed="${origem === 'mercado'}">Do Mercado</button>
      </div>`
    : '';
  const meios = MEIOS.map(
    (m) => `<button type="button" class="meio" data-meio="${m.id}" aria-pressed="${m.id === meio}">
        ${m.icone}<span class="meio__nome">${m.nome}</span><span class="meio__tempo" data-tempo-meio="${m.id}">${tempos[m.id] ? formatarDuracao(tempos[m.id]) : '…'}</span>
      </button>`,
  ).join('');
  const meioAtual = MEIOS.find((m) => m.id === meio) ?? MEIOS[0];
  const linkGoogle = linkComoChegar(
    origem === 'mim' && deMim ? deMim.coordenadas : mercado.coordenadas,
    ponto.coordenadas,
    meioAtual.google,
  );
  return `
    <div class="detalhes__cabecalho" style="--cor-categoria:${ponto.categoriaInfo.cor}">
      <span class="detalhes__categoria">${escaparHtml(ponto.categoriaInfo.nome)}</span>
      <h3 id="detalhes-titulo" tabindex="-1">${escaparHtml(ponto.nome)}</h3>
      <p class="detalhes__endereco">${distancias}</p>
    </div>
    <section class="como-chegar" aria-labelledby="como-chegar-titulo">
      <h4 id="como-chegar-titulo" class="como-chegar__titulo">Como chegar</h4>
      ${origens}
      <div class="meios" role="group" aria-label="Meio de transporte">${meios}</div>
      <div class="detalhes__rota" data-area-rota aria-live="polite"></div>
    </section>
    ${figura}
    <p>${escaparHtml(ponto.descricao)}</p>
    <div class="detalhes__mais">
      <button type="button" class="botao botao--texto botao--pequeno" data-ouvir-ponto>Ouvir</button>
      <button type="button" class="botao botao--texto botao--pequeno" data-copiar-link>Compartilhar</button>
      <a class="botao botao--texto botao--pequeno" data-link-google href="${linkGoogle}" target="_blank" rel="noopener">Abrir no Google Maps<span class="somente-leitor"> (abre em nova aba)</span></a>
    </div>`;
}

/** HTML da rota: resumo + passo a passo recolhido. */
export function renderizarRota(rota, meio, { deMim = false } = {}) {
  const nome = (MEIOS.find((m) => m.id === meio)?.nome ?? 'A pé').toLowerCase();
  const aviso = rota.aproximada
    ? '<p class="detalhes__aviso">Sem conexão com o serviço de rotas: o mapa mostra a direção em linha reta e o tempo é estimado.</p>'
    : '';
  const passos = rota.passos?.length
    ? `<details class="detalhes__passo-a-passo"><summary>Ver o caminho passo a passo</summary><ol class="passos">${rota.passos
        .map(
          (p) =>
            `<li>${escaparHtml(p.texto)}${p.distanciaM ? ` <span class="passos__distancia">— ${formatarDistancia(p.distanciaM / 1000)}</span>` : ''}</li>`,
        )
        .join('')}</ol></details>`
    : '';
  return `
    <p class="detalhes__resumo-rota"><strong>${formatarDuracao(rota.minutos)}</strong> ${nome} · ${formatarDistancia(rota.distanciaKm)} ${deMim ? 'saindo de onde você está' : 'saindo do Mercado'}</p>
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
    <div class="passeio-audio">
      <button type="button" class="botao botao--de-mim" data-passeio-audio aria-pressed="false">Começar passeio em áudio</button>
      <button type="button" class="botao botao--contorno" data-proxima-parada>Ouvir a próxima parada</button>
      <p class="passeio-audio__nota" data-passeio-status>Com a localização ligada, o celular conta a história de cada lugar quando você chegar perto. Use fones de ouvido na rua.</p>
    </div>
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
