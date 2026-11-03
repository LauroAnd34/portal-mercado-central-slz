/**
 * Página do mapa: controlador que liga dados, mapa (Leaflet) e lista
 * acessível. O estado da página fica aqui, num único objeto.
 */
import { iniciarPaginaComum } from './comum.js';
import '../estilos/componentes/modulos.css';
import '../estilos/paginas/mapa.css';
import { MERCADO_CENTRAL, CATEGORIAS, PONTOS_TURISTICOS } from '../dados/pontos-turisticos.js';
import { criarMapaInterativo } from '../recursos/mapa/mapa-interativo.js';
import { buscarRota, buscarRotaPorPontos } from '../recursos/mapa/rotas.js';
import { ROTEIROS } from '../dados/roteiros.js';
import { calcularDistanciaKm, estimarTempos } from '../recursos/mapa/geografia.js';
import {
  prepararPontos,
  filtrarPontos,
  renderizarItem,
  renderizarDetalhes,
  renderizarRota,
  textoDeResumo,
  renderizarCartaoRoteiro,
  renderizarDetalhesRoteiro,
} from '../recursos/mapa/guia-de-pontos.js';
import { anunciar } from '../nucleo/anunciador.js';
import { falar, pararFala } from '../nucleo/voz.js';
import { escaparHtml, focarProgramaticamente } from '../nucleo/dom.js';

iniciarPaginaComum();

let pontos = prepararPontos(PONTOS_TURISTICOS, MERCADO_CENTRAL, CATEGORIAS);
const estado = {
  categoriasAtivas: new Set(Object.keys(CATEGORIAS)),
  termo: '',
  selecionadoId: null,
};

const el = {
  mapa: document.querySelector('[data-mapa]'),
  filtros: document.querySelector('[data-filtros]'),
  busca: document.querySelector('[data-busca-pontos]'),
  lista: document.querySelector('[data-lista-pontos]'),
  contagem: document.querySelector('[data-contagem]'),
  detalhes: document.querySelector('[data-detalhes]'),
};

/* ---------- Mapa ---------- */
let mapa = null;
try {
  mapa = criarMapaInterativo(el.mapa, {
    mercado: MERCADO_CENTRAL,
    pontos,
    categorias: CATEGORIAS,
    aoSelecionar: (id) => selecionar(id, { origem: 'mapa' }),
  });
} catch (erro) {
  console.error(erro);
  el.mapa.innerHTML =
    '<p class="mapa__erro">Não foi possível carregar o mapa. Use a lista de pontos — ela tem todas as informações.</p>';
}

/* ---------- Filtros ---------- */
el.filtros.innerHTML = Object.entries(CATEGORIAS)
  .map(
    ([id, categoria]) => `
    <li><button type="button" class="chip" data-categoria="${id}" aria-pressed="true">
      <span class="chip__ponto" style="background:${categoria.cor}" aria-hidden="true"></span>${escaparHtml(categoria.nome)}
    </button></li>`,
  )
  .join('');

el.filtros.addEventListener('click', (evento) => {
  const chip = evento.target.closest('[data-categoria]');
  if (!chip) return;
  const id = chip.dataset.categoria;
  if (estado.categoriasAtivas.has(id)) estado.categoriasAtivas.delete(id);
  else estado.categoriasAtivas.add(id);
  chip.setAttribute('aria-pressed', String(estado.categoriasAtivas.has(id)));
  atualizarLista({ anunciarTotal: true });
});
document.querySelector('[data-filtros-todos]')?.addEventListener('click', () => {
  estado.categoriasAtivas = new Set(Object.keys(CATEGORIAS));
  el.filtros
    .querySelectorAll('[data-categoria]')
    .forEach((c) => c.setAttribute('aria-pressed', 'true'));
  atualizarLista({ anunciarTotal: true });
});

let esperaBusca;
el.busca.addEventListener('input', () => {
  clearTimeout(esperaBusca);
  esperaBusca = setTimeout(() => {
    estado.termo = el.busca.value;
    atualizarLista({ anunciarTotal: true });
  }, 250);
});

/* ---------- Lista ---------- */
function atualizarLista({ anunciarTotal = false } = {}) {
  const visiveis = filtrarPontos(pontos, estado);
  el.lista.innerHTML = visiveis.length
    ? visiveis.map((p) => renderizarItem(p, p.id === estado.selecionadoId)).join('')
    : '<li class="ponto-vazio">Nenhum ponto encontrado com esses filtros.</li>';
  const texto = `${visiveis.length} ${visiveis.length === 1 ? 'ponto encontrado' : 'pontos encontrados'}`;
  el.contagem.textContent = texto;
  if (anunciarTotal) anunciar(texto);
  mapa?.filtrar(visiveis.map((p) => p.id));
}

el.lista.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-ponto]');
  if (botao) selecionar(botao.dataset.ponto, { origem: 'lista' });
});

/* ---------- Seleção e detalhes ---------- */
function selecionar(id, { origem }) {
  pararFala();
  estado.selecionadoId = id;
  if (id === MERCADO_CENTRAL.id) {
    el.detalhes.innerHTML = `
      <div class="detalhes__cabecalho" style="--cor-categoria:#144670">
        <span class="detalhes__categoria">Ponto de partida</span>
        <h3 id="detalhes-titulo" tabindex="-1">${escaparHtml(MERCADO_CENTRAL.nome)}</h3>
        <p class="detalhes__endereco">${escaparHtml(MERCADO_CENTRAL.endereco)}</p>
      </div>
      <p>${escaparHtml(MERCADO_CENTRAL.descricao)}</p>
      <p>Escolha um destino na lista ou no mapa para ver a distância e o caminho a partir daqui.</p>`;
    mapa?.selecionar(id);
    atualizarLista();
    return;
  }
  const ponto = pontos.find((p) => p.id === id);
  if (!ponto) return;
  el.detalhes.innerHTML = renderizarDetalhes(ponto, MERCADO_CENTRAL);
  el.detalhes.hidden = false;
  mapa?.selecionar(id);
  atualizarLista();
  history.replaceState(null, '', `#${id}`);

  if (origem === 'mapa') {
    // quem clicou no mapa recebe o resumo falado pelo leitor de tela
    anunciar(`${ponto.nome}. ${textoDeResumo(ponto)}.`);
  } else {
    focarProgramaticamente(el.detalhes.querySelector('#detalhes-titulo'));
  }
  if (window.matchMedia('(max-width: 980px)').matches && origem === 'lista') {
    el.detalhes.scrollIntoView({ block: 'start' });
  }
}

el.detalhes.addEventListener('click', async (evento) => {
  const ponto = pontos.find((p) => p.id === estado.selecionadoId);
  if (!ponto) return;

  if (evento.target.closest('[data-ouvir-ponto]')) {
    pararFala();
    falar(`${ponto.nome}. ${ponto.descricao} ${textoDeResumo(ponto)}.`);
    return;
  }

  const botaoRota = evento.target.closest('[data-tracar-rota]');
  if (!botaoRota) return;
  const modo = botaoRota.dataset.tracarRota;
  const area = el.detalhes.querySelector('[data-area-rota]');
  area.innerHTML = '<p class="detalhes__carregando">Calculando o caminho…</p>';
  botaoRota.setAttribute('aria-busy', 'true');

  let rota;
  try {
    rota = await buscarRota(MERCADO_CENTRAL.coordenadas, ponto.coordenadas, modo);
  } catch {
    const distanciaKm = calcularDistanciaKm(MERCADO_CENTRAL.coordenadas, ponto.coordenadas);
    const tempos = estimarTempos(distanciaKm);
    rota = {
      coordenadas: [MERCADO_CENTRAL.coordenadas, ponto.coordenadas],
      distanciaKm,
      minutos: modo === 'a-pe' ? tempos.aPeMinutos : tempos.carroMinutos,
      passos: [],
      aproximada: true,
    };
  }
  botaoRota.removeAttribute('aria-busy');
  if (estado.selecionadoId !== ponto.id) return; // usuário trocou de ponto no meio do caminho
  area.innerHTML = renderizarRota(rota, modo);
  mapa?.desenharRota(rota.coordenadas, ponto.categoriaInfo.cor);
});

/* ---------- Atalhos de vista ---------- */
document
  .querySelector('[data-vista="mercado"]')
  ?.addEventListener('click', () => selecionar(MERCADO_CENTRAL.id, { origem: 'lista' }));
document
  .querySelector('[data-vista="centro"]')
  ?.addEventListener('click', () => mapa?.mostrarCentroHistorico());
document
  .querySelector('[data-vista="ilha"]')
  ?.addEventListener('click', () => mapa?.mostrarIlhaInteira());

/* ---------- Início ---------- */
atualizarLista();
const doEndereco = location.hash.slice(1);
if (doEndereco && pontos.some((p) => p.id === doEndereco))
  selecionar(doEndereco, { origem: 'endereco' });
window.addEventListener('resize', () => mapa?.redimensionar());

/* ---------- Perto de mim (geolocalização opcional) ---------- */
const botaoPerto = document.querySelector('[data-perto-de-mim]');
const notaLocalizacao = document.querySelector('[data-nota-localizacao]');
if (!('geolocation' in navigator)) botaoPerto.hidden = true;
botaoPerto?.addEventListener('click', () => {
  botaoPerto.setAttribute('aria-busy', 'true');
  notaLocalizacao.textContent = 'Procurando sua localização…';
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      botaoPerto.removeAttribute('aria-busy');
      const minhaPosicao = [coords.latitude, coords.longitude];
      pontos = pontos
        .map((p) => ({ ...p, distanciaDeMimKm: calcularDistanciaKm(minhaPosicao, p.coordenadas) }))
        .sort((a, b) => a.distanciaDeMimKm - b.distanciaDeMimKm);
      const maisPerto = pontos[0];
      notaLocalizacao.textContent = `Lista ordenada pela sua distância. Mais perto: ${maisPerto.nome}.`;
      el.lista.setAttribute('aria-label', 'Pontos ordenados do mais perto ao mais longe de você');
      botaoPerto.setAttribute('aria-pressed', 'true');
      mapa?.mostrarMinhaPosicao(minhaPosicao);
      atualizarLista();
      anunciar(`Lista ordenada pela sua distância. O ponto mais perto é ${maisPerto.nome}.`);
    },
    (erro) => {
      botaoPerto.removeAttribute('aria-busy');
      const motivos = {
        1: 'Você não permitiu o acesso à localização. Tudo bem: a lista continua ordenada pela distância do Mercado.',
        2: 'Não foi possível descobrir sua localização agora.',
        3: 'A localização demorou demais para responder. Tente de novo.',
      };
      notaLocalizacao.textContent = motivos[erro.code] ?? motivos[2];
      anunciar(notaLocalizacao.textContent);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
  );
});

/* ---------- Roteiros prontos ---------- */
const listaRoteiros = document.querySelector('[data-roteiros]');
const pontoPorId = (id) => pontos.find((p) => p.id === id);
const paradasDo = (roteiro) => roteiro.paradas.map(pontoPorId).filter(Boolean);
const distanciaEmLinha = (coordenadas) =>
  coordenadas.slice(1).reduce((total, c, i) => total + calcularDistanciaKm(coordenadas[i], c), 0);

if (listaRoteiros) {
  listaRoteiros.innerHTML = ROTEIROS.map((roteiro) => {
    const coordenadas = [
      MERCADO_CENTRAL.coordenadas,
      ...paradasDo(roteiro).map((p) => p.coordenadas),
    ];
    return renderizarCartaoRoteiro(
      roteiro,
      paradasDo(roteiro),
      distanciaEmLinha(coordenadas) * 1.3,
    );
  }).join('');

  listaRoteiros.addEventListener('click', async (evento) => {
    const botao = evento.target.closest('[data-roteiro]');
    if (!botao) return;
    const roteiro = ROTEIROS.find((r) => r.id === botao.dataset.roteiro);
    const paradas = paradasDo(roteiro);
    const coordenadas = [MERCADO_CENTRAL.coordenadas, ...paradas.map((p) => p.coordenadas)];
    estado.selecionadoId = null;
    atualizarLista();
    el.detalhes.innerHTML = `<h3 id="detalhes-titulo" tabindex="-1">${escaparHtml(roteiro.nome)}</h3><p class="detalhes__carregando">Calculando o caminho…</p>`;
    document.querySelector('.explorar__mapa')?.scrollIntoView({ block: 'start' });
    botao.setAttribute('aria-busy', 'true');

    let rota;
    try {
      rota = await buscarRotaPorPontos(coordenadas, roteiro.modo, {
        nomesDasParadas: paradas.map((p) => p.nome),
      });
    } catch {
      const distanciaKm = distanciaEmLinha(coordenadas);
      const tempos = estimarTempos(distanciaKm);
      rota = {
        coordenadas,
        distanciaKm: distanciaKm * 1.3,
        minutos: roteiro.modo === 'a-pe' ? tempos.aPeMinutos : tempos.carroMinutos,
        passos: [],
        aproximada: true,
      };
    }
    botao.removeAttribute('aria-busy');
    el.detalhes.innerHTML = renderizarDetalhesRoteiro(roteiro, paradas, rota);
    mapa?.mostrarRoteiro({ paradas, coordenadas: rota.coordenadas, cor: roteiro.cor });
    focarProgramaticamente(el.detalhes.querySelector('#detalhes-titulo'));
    anunciar(`Roteiro ${roteiro.nome}: ${paradas.length} paradas.`);
  });
}

// botões de parada dentro do roteiro levam aos detalhes daquele ponto
el.detalhes.addEventListener('click', (evento) => {
  const parada = evento.target.closest('.paradas__botao[data-ponto]');
  if (parada) selecionar(parada.dataset.ponto, { origem: 'lista' });
});
