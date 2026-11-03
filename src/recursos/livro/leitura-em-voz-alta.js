/**
 * Leitura em voz alta do capítulo, parágrafo por parágrafo, com destaque
 * visual do trecho lido e rolagem automática. Clique duplo em um parágrafo
 * começa a leitura a partir dele.
 */
import {
  falar,
  pararFala,
  pausarFala,
  retomarFala,
  vozDisponivel,
  aguardarVozes,
} from '../../nucleo/voz.js';
import { anunciar } from '../../nucleo/anunciador.js';
import { ler, gravar } from '../../nucleo/armazenamento.js';

const SELETOR_TRECHOS = 'h2, h3, p, li, figure .figura-livro__descricao p';

export function criarLeituraEmVozAlta({ leitor, obterContainerTexto, aoTerminarCapitulo }) {
  const controle = leitor.querySelector('[data-controle-voz]');
  const botaoTocar = controle.querySelector('[data-voz="tocar"]');
  const rotulo = controle.querySelector('[data-voz-rotulo]');
  const seletorVelocidade = controle.querySelector('[data-voz-velocidade]');
  const seletorVoz = controle.querySelector('[data-voz-escolha]');

  /** @type {'parado'|'falando'|'pausado'} */
  let estado = 'parado';
  let indice = 0;
  let trechos = [];
  let geracao = 0; // invalida callbacks de falas canceladas

  if (!vozDisponivel()) {
    controle.querySelectorAll('button, select').forEach((el) => (el.disabled = true));
    controle.querySelector('[data-voz-indisponivel]').hidden = false;
    return { tocarOuPausar() {}, parar() {}, aoTrocarCapitulo() {}, iniciarDoComeco() {} };
  }

  seletorVelocidade.value = String(ler('voz-velocidade', 1));
  aguardarVozes().then((vozes) => {
    if (vozes.length < 2) return;
    seletorVoz.innerHTML = '';
    vozes.forEach((voz) => seletorVoz.add(new Option(`${voz.name} (${voz.lang})`, voz.name)));
    seletorVoz.value = ler('voz-nome', vozes[0].name);
    controle.querySelector('[data-campo-vozes]').hidden = false;
  });

  const coletarTrechos = () =>
    [...obterContainerTexto().querySelectorAll(SELETOR_TRECHOS)].filter((el) =>
      el.textContent.trim(),
    );

  const marcar = (elemento) => {
    obterContainerTexto()
      .querySelectorAll('.lendo-agora')
      .forEach((el) => el.classList.remove('lendo-agora'));
    if (!elemento) return;
    elemento.classList.add('lendo-agora');
    const reduzido = document.documentElement.dataset.movimento === 'reduzido';
    elemento.scrollIntoView({ block: 'center', behavior: reduzido ? 'auto' : 'smooth' });
  };

  const atualizarBotao = () => {
    leitor.dataset.estadoVoz = estado;
    const textos = { parado: 'Ouvir capítulo', falando: 'Pausar', pausado: 'Continuar' };
    rotulo.textContent = textos[estado];
    botaoTocar.setAttribute(
      'aria-label',
      textos[estado] === 'Pausar' ? 'Pausar leitura' : textos[estado],
    );
  };

  const lerTrecho = () => {
    const minhaGeracao = ++geracao;
    const elemento = trechos[indice];
    if (!elemento) {
      estado = 'parado';
      marcar(null);
      atualizarBotao();
      aoTerminarCapitulo?.();
      return;
    }
    marcar(elemento);
    falar(elemento.textContent, {
      velocidade: Number(seletorVelocidade.value),
      vozNome: seletorVoz.value || undefined,
      aoTerminar: () => {
        if (minhaGeracao !== geracao || estado !== 'falando') return;
        indice += 1;
        lerTrecho();
      },
      aoErro: (evento) => {
        if (evento.error === 'interrupted' || evento.error === 'canceled') return;
        estado = 'parado';
        atualizarBotao();
        anunciar('Não foi possível continuar a leitura em voz alta.');
      },
    });
  };

  const iniciarEm = (novoIndice) => {
    pararFala();
    trechos = coletarTrechos();
    indice = Math.max(0, Math.min(novoIndice, trechos.length - 1));
    estado = 'falando';
    atualizarBotao();
    lerTrecho();
  };

  const api = {
    tocarOuPausar() {
      if (estado === 'falando') {
        pausarFala();
        estado = 'pausado';
      } else if (estado === 'pausado') {
        retomarFala();
        estado = 'falando';
      } else {
        iniciarEm(indice);
        return;
      }
      atualizarBotao();
    },
    parar() {
      geracao += 1;
      pararFala();
      estado = 'parado';
      indice = 0;
      marcar(null);
      atualizarBotao();
    },
    pular(passo) {
      if (estado === 'parado') return;
      iniciarEm(indice + passo);
    },
    iniciarDoComeco() {
      iniciarEm(0);
    },
    /** Chamado pelo leitor ao trocar de capítulo. */
    aoTrocarCapitulo({ continuarLendo = false } = {}) {
      geracao += 1;
      pararFala();
      indice = 0;
      if (continuarLendo) iniciarEm(0);
      else {
        estado = 'parado';
        atualizarBotao();
      }
    },
  };

  botaoTocar.addEventListener('click', () => api.tocarOuPausar());
  controle.querySelector('[data-voz="parar"]').addEventListener('click', () => api.parar());
  controle.querySelector('[data-voz="anterior"]').addEventListener('click', () => api.pular(-1));
  controle.querySelector('[data-voz="proximo"]').addEventListener('click', () => api.pular(1));
  seletorVelocidade.addEventListener('change', () => {
    gravar('voz-velocidade', Number(seletorVelocidade.value));
    if (estado === 'falando') iniciarEm(indice); // aplica a nova velocidade
  });
  seletorVoz.addEventListener('change', () => {
    gravar('voz-nome', seletorVoz.value);
    if (estado === 'falando') iniciarEm(indice);
  });

  // duplo clique em um parágrafo: começa a ler dali
  leitor.addEventListener('dblclick', (evento) => {
    const alvo = evento.target.closest(SELETOR_TRECHOS);
    if (!alvo || !obterContainerTexto().contains(alvo)) return;
    trechos = coletarTrechos();
    iniciarEm(trechos.indexOf(alvo));
  });

  window.addEventListener('pagehide', () => pararFala());
  atualizarBotao();
  return api;
}
