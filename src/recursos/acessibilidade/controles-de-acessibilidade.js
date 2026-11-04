/**
 * Liga a barra superior e o painel de acessibilidade à loja de preferências.
 * A interface nunca guarda estado próprio: ela só reflete `preferencias`.
 */
import { preferencias, aplicarNoDocumento } from '../../nucleo/preferencias.js';
import { anunciar } from '../../nucleo/anunciador.js';
import { selecionar, selecionarTodos } from '../../nucleo/dom.js';

const MENSAGENS = {
  escala: (e) => `Tamanho do texto: ${Math.round(e.escala * 100)}%`,
  cores: (e) =>
    ({ padrao: 'Cores padrão', escuro: 'Modo escuro ativado', alto: 'Alto contraste ativado' })[
      e.cores
    ],
  fonte: (e) =>
    ({
      padrao: 'Fonte padrão',
      legivel: 'Fonte de alta legibilidade',
      dislexia: 'Fonte para dislexia',
    })[e.fonte],
  espacamento: (e) => `Espaçamento ampliado ${e.espacamento ? 'ativado' : 'desativado'}`,
  links: (e) => `Destaque de links ${e.links ? 'ativado' : 'desativado'}`,
  regua: (e) => `Régua de leitura ${e.regua ? 'ativada' : 'desativada'}`,
  movimento: (e) => `Animações ${e.movimento ? 'pausadas' : 'liberadas'}`,
  cursor: (e) => `Cursor grande ${e.cursor ? 'ativado' : 'desativado'}`,
  leitorSelecao: (e) =>
    e.leitorSelecao ? 'Selecione um texto para ouvi-lo' : 'Leitura de seleção desativada',
  vlibras: (e) => (e.vlibras ? 'Tradutor VLibras ativado' : 'Tradutor VLibras desativado'),
};

/** Sincroniza todos os controles (barra + painel) com o estado atual. */
function refletirEstado(estado) {
  selecionarTodos('[data-acao="contraste"]').forEach((botao) =>
    botao.setAttribute('aria-pressed', String(estado.cores === 'alto')),
  );
  const formulario = selecionar('[data-formulario-acessibilidade]');
  if (!formulario) return;
  formulario.elements.cores.value = estado.cores;
  formulario.elements.fonte.value = estado.fonte;
  for (const nome of [
    'espacamento',
    'links',
    'regua',
    'movimento',
    'cursor',
    'leitorSelecao',
    'vlibras',
  ]) {
    formulario.elements[nome].checked = estado[nome];
  }
  const saida = selecionar('[data-saida="escala"]', formulario);
  if (saida) saida.value = `${Math.round(estado.escala * 100)}%`;
}

function tratarAcao(acao) {
  const estado = preferencias.obter();
  const acoes = {
    contraste: () => preferencias.definir({ cores: estado.cores === 'alto' ? 'padrao' : 'alto' }),
    'fonte-maior': () => preferencias.aumentarFonte(),
    'fonte-menor': () => preferencias.diminuirFonte(),
    'fonte-padrao': () => preferencias.definir({ escala: 1 }),
    redefinir: () => {
      preferencias.redefinir();
      anunciar('Preferências restauradas para o padrão');
    },
  };
  acoes[acao]?.();
}

export function iniciarControlesDeAcessibilidade() {
  aplicarNoDocumento(preferencias.obter());
  refletirEstado(preferencias.obter());

  preferencias.assinar((estado, mudancas) => {
    aplicarNoDocumento(estado);
    refletirEstado(estado);
    if (mudancas.length === 1) anunciar(MENSAGENS[mudancas[0]]?.(estado) ?? '');
  });

  // botões com data-acao (barra superior e painel)
  document.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao]');
    if (botao) tratarAcao(botao.dataset.acao);
  });

  // painel (dialog nativo)
  const painel = selecionar('#painel-acessibilidade');
  let gatilho = null;
  const abrirPainel = (origem) => {
    const ativo = document.activeElement;
    // aberto pelo atalho Alt+5 sem nada focado: devolve o foco ao botão do topo
    gatilho =
      origem ?? (ativo && ativo !== document.body ? ativo : selecionar('[data-botao-flutuante]'));
    painel?.showModal();
  };
  selecionarTodos('[data-abre-painel-acessibilidade]').forEach((botao) =>
    botao.addEventListener('click', () => abrirPainel(botao)),
  );
  selecionar('[data-fecha-painel]')?.addEventListener('click', () => painel.close());
  painel?.addEventListener('click', (evento) => {
    if (evento.target === painel) painel.close(); // clique no fundo escurecido
  });
  painel?.addEventListener('close', () => gatilho?.focus()); // devolve o foco (WCAG 2.4.3)

  const formulario = selecionar('[data-formulario-acessibilidade]');
  formulario?.addEventListener('change', (evento) => {
    if (evento.target.closest('[data-posicao-botao]')) return; // tratado em botao-flutuante.js
    const { name, type, checked, value } = evento.target;
    preferencias.definir({ [name]: type === 'checkbox' ? checked : value });
  });
  formulario?.addEventListener('submit', (evento) => evento.preventDefault());

  return { abrirPainel };
}
