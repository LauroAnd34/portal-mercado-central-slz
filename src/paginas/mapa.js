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
import { FOTOS, FOTO_DO_PONTO, urlDaFoto, srcsetDaFoto } from '../dados/fotos.js';
import { rotaGuardadaDoPonto, rotaGuardadaDoRoteiro } from '../recursos/mapa/rotas-guardadas.js';
import { calcularDistanciaKm, estimarTempos, linkComoChegar } from '../recursos/mapa/geografia.js';
import {
  prepararPontos,
  filtrarPontos,
  renderizarItem,
  renderizarDetalhes,
  renderizarRota,
  textoDeResumo,
  renderizarCartaoRoteiro,
  renderizarDetalhesRoteiro,
  renderizarOnibus,
} from '../recursos/mapa/guia-de-pontos.js';
import { ONIBUS } from '../dados/onibus.js';
import { anunciar } from '../nucleo/anunciador.js';
import {
  meioPorId,
  temposPorMeio,
  meioSugerido,
  minutosPorDistancia,
} from '../recursos/mapa/meios-de-transporte.js';
import { falar, pararFala } from '../nucleo/voz.js';
import { escaparHtml, focarProgramaticamente } from '../nucleo/dom.js';

iniciarPaginaComum();

const formatarDistanciaCurta = (km) =>
  km < 1 ? `${Math.round((km * 1000) / 10) * 10} m` : `${km.toFixed(1).replace('.', ',')} km`;

let pontos = prepararPontos(PONTOS_TURISTICOS, MERCADO_CENTRAL, CATEGORIAS, rotaGuardadaDoPonto);
const estado = {
  categoriasAtivas: new Set(Object.keys(CATEGORIAS)),
  termo: '',
  selecionadoId: null,
  minhaPosicao: null, // [lat, lon] — só existe se a pessoa permitir
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
// passar o mouse ou o foco num item da lista realça o marcador no mapa
const realcar = (evento) =>
  mapa?.destacar(evento.target.closest?.('[data-ponto]')?.dataset.ponto ?? null);
el.lista.addEventListener('pointerover', realcar);
el.lista.addEventListener('focusin', realcar);
el.lista.addEventListener('pointerleave', () => mapa?.destacar(null));
el.lista.addEventListener('focusout', () => mapa?.destacar(null));

/* barra do painel: copiar link e fechar */
const BARRA_DETALHES = `<button type="button" class="botao-icone detalhes__fechar" data-fechar-detalhes aria-label="Fechar detalhes">
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
  </button>`;
const TEXTO_INICIAL = el.detalhes.innerHTML;
// no celular, só o corpo da gaveta rola: o X fica sempre no mesmo lugar
const gaveta = (html) => `${BARRA_DETALHES}<div class="detalhes__corpo">${html}</div>`;
// celular: o botão de acessibilidade sobe para não cobrir a gaveta de detalhes
function afastarBotaoAcessibilidade() {
  requestAnimationFrame(() => {
    const gaveta = getComputedStyle(el.detalhes).position === 'fixed';
    const aberta = gaveta && !el.detalhes.classList.contains('detalhes--vazio');
    // com a gaveta aberta, a página fica parada: só o mapa e a gaveta se mexem
    document.documentElement.classList.toggle('com-gaveta-mapa', aberta);
    if (aberta) {
      const altura = window.innerHeight - el.detalhes.getBoundingClientRect().top;
      document.body.style.setProperty('--reserva-base', `${Math.round(altura + 48)}px`);
    } else document.body.style.removeProperty('--reserva-base');
    window.dispatchEvent(new Event('resize'));
  });
}
function fecharDetalhes() {
  pararFala();
  pararPasseio();
  estado.roteiro = null;
  const anterior = estado.selecionadoId;
  estado.selecionadoId = null;
  el.detalhes.innerHTML = TEXTO_INICIAL;
  el.detalhes.classList.add('detalhes--vazio');
  afastarBotaoAcessibilidade();
  mapa?.selecionar(null, { mover: false });
  mapa?.limparRoteiro();
  history.replaceState(null, '', location.pathname + location.search);
  atualizarLista();
  (
    el.lista.querySelector(`[data-ponto="${anterior}"]`) ?? el.detalhes.querySelector('h3')
  )?.focus?.();
}

/* ---------- Seleção e detalhes ---------- */
function selecionar(id, { origem }) {
  pararFala();
  estado.selecionadoId = id;
  if (id === MERCADO_CENTRAL.id) {
    el.detalhes.innerHTML = gaveta(`
      <div class="detalhes__cabecalho" style="--cor-categoria:#144670">
        <span class="detalhes__categoria">Ponto de partida</span>
        <h3 id="detalhes-titulo" tabindex="-1">${escaparHtml(MERCADO_CENTRAL.nome)}</h3>
        <p class="detalhes__endereco">${escaparHtml(MERCADO_CENTRAL.endereco)}</p>
      </div>
      <p>${escaparHtml(MERCADO_CENTRAL.descricao)}</p>`);
    el.detalhes.classList.remove('detalhes--vazio');
    afastarBotaoAcessibilidade();
    mapa?.selecionar(id);
    atualizarLista();
    return;
  }
  const ponto = pontos.find((p) => p.id === id);
  if (!ponto) return;
  const chaveFoto = FOTO_DO_PONTO[ponto.id];
  const foto = chaveFoto
    ? { ...FOTOS[chaveFoto], url: urlDaFoto(chaveFoto), srcset: srcsetDaFoto(chaveFoto) }
    : null;
  const deMim = estado.minhaPosicao
    ? {
        coordenadas: estado.minhaPosicao,
        distanciaKm: calcularDistanciaKm(estado.minhaPosicao, ponto.coordenadas),
      }
    : null;
  if (!deMim && estado.origemRota === 'mim') estado.origemRota = 'mercado';
  if (deMim && origem !== 'endereco' && !estado.origemEscolhida) estado.origemRota = 'mim';
  const doMercado = estado.origemRota !== 'mim';
  const kmPe = doMercado ? ponto.distanciaKm : deMim.distanciaKm * 1.3;
  const kmCarro = doMercado ? ponto.distanciaCarroKm : deMim.distanciaKm * 1.3;
  if (!estado.meioEscolhido) estado.meio = meioSugerido(kmPe);
  const tempos = temposPorMeio(kmPe, kmCarro);
  el.detalhes.innerHTML = gaveta(
    renderizarDetalhes(ponto, MERCADO_CENTRAL, foto, deMim, {
      origem: estado.origemRota,
      meio: estado.meio,
      tempos,
    }),
  );
  el.detalhes.classList.remove('detalhes--vazio');
  el.detalhes.hidden = false;
  afastarBotaoAcessibilidade();
  mapa?.selecionar(id);
  atualizarLista();
  history.replaceState(null, '', `#${id}`);

  // já mostra o caminho (saindo de onde a pessoa está, se a localização estiver ligada)
  tracarRota(ponto);

  if (origem === 'mapa') {
    // quem clicou no mapa recebe o resumo falado pelo leitor de tela
    anunciar(`${ponto.nome}. ${textoDeResumo(ponto)}.`);
  } else {
    focarProgramaticamente(el.detalhes.querySelector('#detalhes-titulo'));
  }
  // celular: o mapa ocupa a tela e os detalhes sobem de baixo, por cima dele
  if (window.matchMedia('(max-width: 980px)').matches) {
    document
      .querySelector('.explorar__palco')
      ?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}

el.detalhes.addEventListener('click', async (evento) => {
  if (evento.target.closest('[data-fechar-detalhes]')) {
    fecharDetalhes();
    return;
  }
  const ponto = pontos.find((p) => p.id === estado.selecionadoId);
  if (!ponto) return;

  const copiar = evento.target.closest('[data-copiar-link]');
  if (copiar) {
    const link = `${location.origin}${location.pathname}#${ponto.id}`;
    if (navigator.share) {
      navigator.share({ title: ponto.nome, url: link }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      copiar.textContent = 'Link copiado!';
      anunciar('Link copiado.');
    } catch {
      copiar.textContent = 'Não foi possível copiar';
    }
    setTimeout(() => (copiar.textContent = 'Compartilhar'), 2500);
    return;
  }

  if (evento.target.closest('[data-ouvir-ponto]')) {
    pararFala();
    falar(`${ponto.nome}. ${ponto.descricao} ${textoDeResumo(ponto)}.`);
    return;
  }

  const botaoOrigem = evento.target.closest('[data-origem]');
  const botaoMeio = evento.target.closest('[data-meio]');
  if (botaoOrigem) {
    estado.origemRota = botaoOrigem.dataset.origem;
    estado.origemEscolhida = true;
    selecionar(ponto.id, { origem: 'troca' });
    el.detalhes.querySelector(`[data-origem="${estado.origemRota}"]`)?.focus();
    return;
  }
  if (botaoMeio) {
    estado.meio = botaoMeio.dataset.meio;
    estado.meioEscolhido = true;
    el.detalhes
      .querySelectorAll('[data-meio]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b === botaoMeio)));
    tracarRota(ponto);
  }
});

/**
 * Desenha o caminho até o ponto com o meio e a origem escolhidos.
 * Rotas a partir do Mercado já vêm calculadas (instantâneas, funcionam sem internet).
 */
async function tracarRota(ponto) {
  const meio = meioPorId(estado.meio);
  const deMim = estado.origemRota === 'mim' && estado.minhaPosicao;
  const origem = deMim ? estado.minhaPosicao : MERCADO_CENTRAL.coordenadas;
  const distanciaReta = calcularDistanciaKm(origem, ponto.coordenadas);
  const area = el.detalhes.querySelector('[data-area-rota]');
  if (!area) return;
  if (!meio.servico) {
    // ônibus: linhas e paradas perto do Mercado
    const linkOnibus = linkComoChegar(origem, ponto.coordenadas, 'transit');
    area.innerHTML = renderizarOnibus(ONIBUS, linkOnibus);
    const link = el.detalhes.querySelector('[data-link-google]');
    if (link) link.href = linkOnibus;
    mapa?.desenharRota(
      [ONIBUS.parada.coordenadas, MERCADO_CENTRAL.coordenadas],
      '#8a5a00',
      'Parada de ônibus',
    );
    return;
  }
  area.innerHTML = '<p class="detalhes__carregando">Calculando o caminho…</p>';

  let rota = null;
  if (!deMim) {
    const guardada = rotaGuardadaDoPonto(ponto.id, meio.rotaGuardada);
    if (guardada) rota = { ...guardada };
  }
  if (!rota)
    try {
      rota = await buscarRota(origem, ponto.coordenadas, meio.servico);
    } catch {
      rota = {
        coordenadas: [origem, ponto.coordenadas],
        distanciaKm: distanciaReta * 1.3,
        passos: [],
        aproximada: true,
      };
    }
  // tempo pela distância das ruas, com a velocidade média real de cada meio em São Luís
  rota.minutos = minutosPorDistancia(meio.id, rota.distanciaKm);

  if (estado.selecionadoId !== ponto.id) return; // a pessoa trocou de lugar no meio do cálculo
  area.innerHTML = renderizarRota(rota, meio.id, { deMim: Boolean(deMim) });
  const tempo = el.detalhes.querySelector(`[data-tempo-meio="${meio.id}"]`);
  if (tempo) tempo.textContent = `${rota.minutos} min`;
  const link = el.detalhes.querySelector('[data-link-google]');
  if (link) link.href = linkComoChegar(origem, ponto.coordenadas, meio.google);
  const minutos =
    rota.minutos < 60
      ? `${rota.minutos} min`
      : `${Math.floor(rota.minutos / 60)} h ${rota.minutos % 60} min`;
  mapa?.desenharRota(
    rota.coordenadas,
    deMim ? '#1a73e8' : ponto.categoriaInfo.cor,
    `${formatarDistanciaCurta(rota.distanciaKm)} · ${minutos} ${meio.nome.toLowerCase()}`,
  );
}

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

/* filtros abertos no computador, recolhidos no celular (menos coisa na tela) */
const filtrosRecolhiveis = document.querySelector('[data-filtros-recolhiveis]');
if (filtrosRecolhiveis && window.matchMedia('(min-width: 981px)').matches)
  filtrosRecolhiveis.open = true;

/* ---------- Início ---------- */
atualizarLista();
const doEndereco = location.hash.slice(1);
if (doEndereco && (doEndereco === MERCADO_CENTRAL.id || pontos.some((p) => p.id === doEndereco)))
  selecionar(doEndereco, { origem: 'endereco' });
window.addEventListener('resize', () => mapa?.redimensionar());
// link com #ponto aberto com a página já carregada (ex.: vindo de outro link da página)
window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (
    id &&
    id !== estado.selecionadoId &&
    (id === MERCADO_CENTRAL.id || pontos.some((p) => p.id === id))
  )
    selecionar(id, { origem: 'endereco' });
});

/* ---------- Perto de mim (geolocalização opcional) ---------- */
const botaoPerto = document.querySelector('[data-perto-de-mim]');
const notaLocalizacao = document.querySelector('[data-nota-localizacao]');
if (!('geolocation' in navigator)) botaoPerto.hidden = true;
let vigiaPosicao = null;
function receberPosicao({ coords }, primeiraVez) {
  estado.minhaPosicao = [coords.latitude, coords.longitude];
  mapa?.mostrarMinhaPosicao(estado.minhaPosicao, {
    precisaoM: coords.accuracy,
    mover: primeiraVez,
  });
  if (!primeiraVez) return;
  botaoPerto.removeAttribute('aria-busy');
  pontos = pontos
    .map((p) => ({
      ...p,
      distanciaDeMimKm: calcularDistanciaKm(estado.minhaPosicao, p.coordenadas),
    }))
    .sort((a, b) => a.distanciaDeMimKm - b.distanciaDeMimKm);
  const maisPerto = pontos[0];
  notaLocalizacao.textContent = 'Você é o ponto azul. Escolha um lugar para ver o caminho até ele.';
  mostrarPertoDeVoce();
  el.lista.setAttribute('aria-label', 'Pontos ordenados do mais perto ao mais longe de você');
  botaoPerto.setAttribute('aria-pressed', 'true');
  botaoPerto.querySelector('[data-texto-perto]')?.replaceChildren('Ver onde estou no mapa');
  atualizarLista();
  // se um ponto está aberto, mostra também a distância e a rota a partir da pessoa
  if (estado.selecionadoId && estado.selecionadoId !== MERCADO_CENTRAL.id)
    selecionar(estado.selecionadoId, { origem: 'mapa' });
  anunciar(`Sua localização aparece no mapa. O ponto mais perto é ${maisPerto.nome}.`);
}

/* lugares mais perto da pessoa, em botões compactos */
const caixaPerto = document.querySelector('[data-perto-de-voce]');
const listaPerto = document.querySelector('[data-lista-perto]');
const formatarCurta = (km) =>
  km < 1 ? `${Math.round((km * 1000) / 10) * 10} m` : `${km.toFixed(1).replace('.', ',')} km`;
function mostrarPertoDeVoce() {
  if (!caixaPerto || !estado.minhaPosicao) return;
  const maisPerto = [...pontos].sort((a, b) => a.distanciaDeMimKm - b.distanciaDeMimKm).slice(0, 5);
  listaPerto.innerHTML = maisPerto
    .map(
      (p) =>
        `<li><button type="button" class="perto-de-voce__item" data-ponto-perto="${p.id}" style="--cor-categoria:${p.categoriaInfo.cor}"><span>${escaparHtml(p.nome.replace(/ \(.*\)$/, ''))}</span><strong>${formatarCurta(p.distanciaDeMimKm)}</strong></button></li>`,
    )
    .join('');
  caixaPerto.hidden = false;
}
listaPerto?.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-ponto-perto]');
  if (botao) selecionar(botao.dataset.pontoPerto, { origem: 'perto' });
});

function localizar() {
  if (!('geolocation' in navigator)) return;
  if (estado.minhaPosicao) {
    mapa?.centralizarEmMim();
    return;
  }
  botaoPerto.setAttribute('aria-busy', 'true');
  notaLocalizacao.textContent = 'Procurando sua localização…';
  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      receberPosicao(posicao, true);
      // continua acompanhando enquanto a pessoa anda (só move o ponto azul)
      vigiaPosicao ??= navigator.geolocation.watchPosition(
        (nova) => receberPosicao(nova, false),
        () => {},
        { enableHighAccuracy: true, maximumAge: 15000 },
      );
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
}
botaoPerto?.addEventListener('click', localizar);
if ('geolocation' in navigator) mapa?.adicionarBotaoLocalizar(localizar);

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
      rotaGuardadaDoRoteiro(roteiro.id)?.distanciaKm ?? distanciaEmLinha(coordenadas) * 1.3,
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
    el.detalhes.innerHTML = gaveta(
      `<h3 id="detalhes-titulo" tabindex="-1">${escaparHtml(roteiro.nome)}</h3><p class="detalhes__carregando">Calculando o caminho…</p>`,
    );
    el.detalhes.classList.remove('detalhes--vazio');
    afastarBotaoAcessibilidade();
    document.querySelector('.explorar__mapa')?.scrollIntoView({ block: 'start' });
    botao.setAttribute('aria-busy', 'true');

    let rota = rotaGuardadaDoRoteiro(
      roteiro.id,
      paradas.map((p) => p.nome),
    );
    if (!rota)
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
    rota.minutos = minutosPorDistancia(
      roteiro.modo === 'a-pe' ? 'a-pe' : 'carro',
      rota.distanciaKm,
    );
    estado.roteiro = { roteiro, paradas, ouvidas: new Set(), proxima: 0 };
    pararPasseio();
    el.detalhes.innerHTML = gaveta(renderizarDetalhesRoteiro(roteiro, paradas, rota));
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

/* ---------- Passeio em áudio (roteiros) ---------- */
const RAIO_DE_CHEGADA_M = 60;
let vigiaPasseio = null;

function narrar(parada, prefixo = '') {
  pararFala();
  falar(`${prefixo}${parada.nome}. ${parada.descricao}`);
}

function pararPasseio() {
  if (vigiaPasseio !== null) navigator.geolocation.clearWatch(vigiaPasseio);
  vigiaPasseio = null;
  const botao = el.detalhes.querySelector('[data-passeio-audio]');
  if (botao) {
    botao.setAttribute('aria-pressed', 'false');
    botao.textContent = 'Começar passeio em áudio';
  }
}

el.detalhes.addEventListener('click', (evento) => {
  const r = estado.roteiro;
  if (!r) return;
  const status = el.detalhes.querySelector('[data-passeio-status]');

  if (evento.target.closest('[data-proxima-parada]')) {
    const parada = r.paradas[r.proxima % r.paradas.length];
    r.proxima += 1;
    narrar(parada, `Parada ${r.paradas.indexOf(parada) + 1}: `);
    return;
  }
  const botao = evento.target.closest('[data-passeio-audio]');
  if (!botao) return;
  if (vigiaPasseio !== null) {
    pararPasseio();
    pararFala();
    status.textContent = 'Passeio em áudio parado.';
    anunciar(status.textContent);
    return;
  }
  if (!('geolocation' in navigator)) {
    status.textContent = 'Este aparelho não informa a localização. Use “Ouvir a próxima parada”.';
    return;
  }
  botao.setAttribute('aria-pressed', 'true');
  botao.textContent = 'Parar passeio em áudio';
  status.textContent =
    'Passeio ligado. Vá até a primeira parada; a narração começa quando você chegar perto.';
  anunciar(status.textContent);
  falar(`Passeio ${r.roteiro.nome} começou. Primeira parada: ${r.paradas[0].nome}.`);
  vigiaPasseio = navigator.geolocation.watchPosition(
    ({ coords }) => {
      const aqui = [coords.latitude, coords.longitude];
      estado.minhaPosicao = aqui;
      mapa?.mostrarMinhaPosicao(aqui, { precisaoM: coords.accuracy, mover: false });
      const perto = r.paradas.find(
        (p) =>
          !r.ouvidas.has(p.id) &&
          calcularDistanciaKm(aqui, p.coordenadas) * 1000 < RAIO_DE_CHEGADA_M,
      );
      if (!perto) return;
      r.ouvidas.add(perto.id);
      r.proxima = r.paradas.indexOf(perto) + 1;
      status.textContent = `Você chegou a ${perto.nome}.`;
      narrar(perto, 'Você chegou a ');
      if (r.ouvidas.size === r.paradas.length) {
        status.textContent = 'Você completou o roteiro. Obrigado pela visita!';
        pararPasseio();
      }
    },
    () => {
      status.textContent = 'Não foi possível usar a localização. Use “Ouvir a próxima parada”.';
      pararPasseio();
    },
    { enableHighAccuracy: true, maximumAge: 10000 },
  );
});
