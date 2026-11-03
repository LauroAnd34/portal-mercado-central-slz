/**
 * Glossário no texto do livro: a primeira ocorrência de cada termo em um
 * capítulo vira um botão ("toggletip") que mostra a explicação.
 * Padrão acessível: botão com aria-expanded + balão anunciado por role="status".
 */
import { escaparHtml } from '../../nucleo/dom.js';

const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019`\u00b4]/g, "'")
    .toLowerCase();

/**
 * Encontra a primeira ocorrência de cada termo num texto (sem diferenciar
 * acentos/maiúsculas, só palavras inteiras). Função pura — testada.
 * @returns {{termo: string, inicio: number, fim: number}[]} ordenado por posição
 */
export function encontrarTermos(texto, termos) {
  const base = normalizar(texto);
  const letra = /[a-z0-9]/;
  const achados = [];
  for (const termo of termos) {
    const alvo = normalizar(termo);
    let posicao = base.indexOf(alvo);
    while (posicao !== -1) {
      const antes = base[posicao - 1];
      let fim = posicao + alvo.length;
      // aceita o plural simples: "sanitaristas", "ludovicenses"
      if (base[fim] === 's' && !letra.test(base[fim + 1] ?? '')) fim += 1;
      const depois = base[fim];
      if (!(antes && letra.test(antes)) && !(depois && letra.test(depois))) {
        achados.push({ termo, inicio: posicao, fim });
        break;
      }
      posicao = base.indexOf(alvo, posicao + 1);
    }
  }
  // remove sobreposições (fica o que começa antes / o mais longo)
  return achados
    .sort((a, b) => a.inicio - b.inicio || b.fim - a.fim)
    .filter((a, i, lista) => i === 0 || a.inicio >= lista[i - 1].fim);
}

let contador = 0;

/** Marca os termos dentro dos parágrafos e itens do capítulo exibido. */
export function marcarTermos(container, glossario) {
  const pendentes = new Set(Object.keys(glossario));
  const blocos = container.querySelectorAll('p:not(.leitor__tempo), li');
  for (const bloco of blocos) {
    if (!pendentes.size) break;
    const caminhante = document.createTreeWalker(bloco, NodeFilter.SHOW_TEXT);
    const nos = [];
    while (caminhante.nextNode()) nos.push(caminhante.currentNode);
    for (const no of nos) {
      if (no.parentElement.closest('.termo, a, button')) continue;
      const achados = encontrarTermos(no.textContent, [...pendentes]);
      if (!achados.length) continue;
      const fragmento = document.createDocumentFragment();
      let cursor = 0;
      for (const { termo, inicio, fim } of achados) {
        fragmento.append(no.textContent.slice(cursor, inicio));
        const id = `termo-${++contador}`;
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'termo';
        botao.textContent = no.textContent.slice(inicio, fim);
        botao.setAttribute('aria-expanded', 'false');
        botao.setAttribute('aria-describedby', `${id}-dica`);
        botao.dataset.termo = termo;
        const dica = document.createElement('span');
        dica.id = `${id}-dica`;
        dica.className = 'somente-leitor';
        dica.textContent = '(ver significado)';
        fragmento.append(botao, dica);
        cursor = fim;
        pendentes.delete(termo);
      }
      fragmento.append(no.textContent.slice(cursor));
      no.replaceWith(fragmento);
    }
  }
}

/** Liga o balão de explicação e a lista completa do glossário. */
export function iniciarGlossario(leitor, glossario) {
  const balao = document.createElement('div');
  balao.className = 'balao-termo';
  balao.setAttribute('role', 'status');
  balao.hidden = true;
  document.body.append(balao);
  let ativo = null;

  const fechar = () => {
    if (!ativo) return;
    ativo.setAttribute('aria-expanded', 'false');
    balao.hidden = true;
    balao.textContent = '';
    ativo = null;
  };

  const abrir = (botao) => {
    fechar();
    ativo = botao;
    const termo = botao.dataset.termo;
    botao.setAttribute('aria-expanded', 'true');
    balao.innerHTML = `<strong>${escaparHtml(termo)}</strong>: ${escaparHtml(glossario[termo])}`;
    balao.hidden = false;
    const caixa = botao.getBoundingClientRect();
    const largura = Math.min(320, window.innerWidth - 32);
    balao.style.width = `${largura}px`;
    balao.style.left = `${Math.max(16, Math.min(caixa.left + window.scrollX, window.scrollX + window.innerWidth - largura - 16))}px`;
    balao.style.top = `${caixa.bottom + window.scrollY + 8}px`;
  };

  leitor.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.termo');
    if (!botao) return;
    if (ativo === botao) fechar();
    else abrir(botao);
  });
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && ativo) {
      const botao = ativo;
      fechar();
      botao.focus();
    }
  });
  document.addEventListener('click', (evento) => {
    if (ativo && !evento.target.closest('.termo, .balao-termo')) fechar();
  });
  window.addEventListener('resize', fechar);

  const lista = leitor.querySelector('[data-lista-glossario]');
  if (lista) {
    lista.innerHTML = Object.entries(glossario)
      .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
      .map(
        ([termo, definicao]) =>
          `<div><dt>${escaparHtml(termo)}</dt><dd>${escaparHtml(definicao)}</dd></div>`,
      )
      .join('');
  }
  return { fechar };
}
