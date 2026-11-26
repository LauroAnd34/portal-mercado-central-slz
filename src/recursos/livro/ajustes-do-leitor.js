/**
 * Ajustes específicos do leitor (independentes da barra geral do site):
 * tema da página, fonte, tamanho, entrelinha, largura e alinhamento.
 * O tema e a fonte do painel de acessibilidade valem no livro até a pessoa
 * escolher outros aqui; a escolha feita no leitor passa a valer só no livro.
 */
import { ler, gravar } from '../../nucleo/armazenamento.js';

const CHAVE = 'leitor-ajustes';
export const AJUSTES_PADRAO = Object.freeze({
  tema: 'claro',
  fonte: 'serifada',
  tamanho: 20,
  entrelinha: 1.8,
  largura: 2,
  alinharEsquerda: true,
  destacarParagrafo: false,
  temaProprio: false, // a pessoa escolheu o tema dentro do leitor
  fontePropria: false, // a pessoa escolheu a fonte dentro do leitor
});

const LARGURAS = { 1: '52ch', 2: '66ch', 3: '82ch' };
const ROTULOS_LARGURA = { 1: 'estreita', 2: 'média', 3: 'larga' };
const FONTES = {
  serifada: "'Merriweather', Georgia, serif",
  'sem-serifa': "'Montserrat', system-ui, sans-serif",
  legivel: "'Atkinson Hyperlegible', system-ui, sans-serif",
  dislexia: "'OpenDyslexic', 'Comic Sans MS', sans-serif",
};

export function carregarAjustes() {
  return { ...AJUSTES_PADRAO, ...(ler(CHAVE, {}) ?? {}) };
}

export function salvarAjustes(ajustes) {
  gravar(CHAVE, ajustes);
}

/** Aplica os ajustes como variáveis CSS no elemento do leitor. */
export function aplicarAjustes(leitor, ajustes) {
  leitor.dataset.temaLeitor = ajustes.tema;
  leitor.toggleAttribute('data-tema-proprio', Boolean(ajustes.temaProprio));
  leitor.toggleAttribute('data-fonte-propria', Boolean(ajustes.fontePropria));
  leitor.classList.toggle('leitor--alinhar-esquerda', ajustes.alinharEsquerda);
  leitor.classList.toggle('leitor--destacar-paragrafo', ajustes.destacarParagrafo);
  leitor.style.setProperty('--leitor-fonte', FONTES[ajustes.fonte] ?? FONTES.serifada);
  leitor.style.setProperty('--leitor-tamanho', `${ajustes.tamanho / 16}rem`);
  leitor.style.setProperty('--leitor-entrelinha', String(ajustes.entrelinha));
  leitor.style.setProperty('--leitor-largura', LARGURAS[ajustes.largura] ?? LARGURAS[2]);
}

/** Liga o formulário de ajustes ao leitor. */
export function iniciarAjustesDoLeitor(leitor) {
  const formulario = leitor.querySelector('[data-formulario-leitor]');
  let ajustes = carregarAjustes();

  const refletir = () => {
    // sem escolha própria, os botões mostram o que está valendo (vindo do painel do site)
    const raiz = document.documentElement.dataset;
    const temaDoSite =
      raiz.contraste === 'alto'
        ? 'contraste'
        : ['escuro', 'sepia'].includes(raiz.tema)
          ? raiz.tema
          : null;
    const fonteDoSite = raiz.fonte === 'legivel' || raiz.fonte === 'dislexia' ? raiz.fonte : null;
    formulario.elements.tema.value = ajustes.temaProprio
      ? ajustes.tema
      : (temaDoSite ?? ajustes.tema);
    formulario.elements.fonte.value = ajustes.fontePropria
      ? ajustes.fonte
      : (fonteDoSite ?? ajustes.fonte);
    formulario.elements.tamanho.value = ajustes.tamanho;
    formulario.elements.entrelinha.value = ajustes.entrelinha;
    formulario.elements.largura.value = ajustes.largura;
    formulario.elements.alinharEsquerda.checked = ajustes.alinharEsquerda;
    formulario.elements.destacarParagrafo.checked = ajustes.destacarParagrafo;
    const saida = (nome) => formulario.querySelector(`[data-saida-leitor="${nome}"]`);
    saida('tamanho').value = `${ajustes.tamanho}px`;
    saida('entrelinha').value = String(ajustes.entrelinha).replace('.', ',');
    saida('largura').value = ROTULOS_LARGURA[ajustes.largura];
    formulario.elements.tamanho.setAttribute('aria-valuetext', `${ajustes.tamanho} pixels`);
    formulario.elements.largura.setAttribute('aria-valuetext', ROTULOS_LARGURA[ajustes.largura]);
  };

  const atualizar = (parcial) => {
    ajustes = { ...ajustes, ...parcial };
    salvarAjustes(ajustes);
    aplicarAjustes(leitor, ajustes);
    refletir();
  };

  formulario.addEventListener('input', (evento) => {
    const { name, type, checked, value } = evento.target;
    if (!name) return;
    const numericos = ['tamanho', 'entrelinha', 'largura'];
    atualizar({
      [name]: type === 'checkbox' ? checked : numericos.includes(name) ? Number(value) : value,
      ...(name === 'tema' && { temaProprio: true }),
      ...(name === 'fonte' && { fontePropria: true }),
    });
  });
  formulario.addEventListener('submit', (evento) => evento.preventDefault());
  leitor
    .querySelector('[data-redefinir-leitor]')
    ?.addEventListener('click', () => atualizar({ ...AJUSTES_PADRAO }));

  aplicarAjustes(leitor, ajustes);
  refletir();
  // mudou algo no painel de acessibilidade do site: atualiza os botões do leitor
  new MutationObserver(refletir).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-tema', 'data-contraste', 'data-fonte'],
  });
}
