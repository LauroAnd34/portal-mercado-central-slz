/**
 * Monta as seções "Setores do Mercado" (sanfona com <details> nativo —
 * acessível sem JavaScript extra) e "Sabores do Mercado".
 */
import { escaparHtml } from '../../nucleo/dom.js';

export function montarSetores(raiz, setores) {
  raiz.innerHTML = setores
    .map(
      (setor, i) => `
      <details class="setor" ${i === 0 ? 'open' : ''}>
        <summary>${escaparHtml(setor.nome)}</summary>
        <p>${escaparHtml(setor.texto)}</p>
      </details>`,
    )
    .join('');
}

export function montarSabores(raiz, sabores) {
  raiz.innerHTML = sabores
    .map(
      (sabor) => `
      <li class="sabor">
        <h3 class="sabor__nome">${escaparHtml(sabor.nome)}</h3>
        <p>${escaparHtml(sabor.texto)}</p>
      </li>`,
    )
    .join('');
}

const normalizar = (t) =>
  t
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** Busca "Onde encontro?": diz em que setor fica o produto e abre esse setor na lista. */
export function iniciarOndeEncontro(campo, resposta, setoresRaiz, produtosPorSetor) {
  let espera;
  campo.addEventListener('input', () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      const termo = normalizar(campo.value);
      if (termo.length < 2) {
        resposta.textContent = '';
        return;
      }
      const achados = Object.entries(produtosPorSetor)
        .map(([setor, produtos]) => [setor, produtos.filter((p) => normalizar(p).includes(termo))])
        .filter(([, produtos]) => produtos.length);
      if (!achados.length) {
        resposta.textContent =
          'Não achamos esse produto na lista. Pergunte aos feirantes — o Mercado tem muito mais do que cabe aqui.';
        return;
      }
      resposta.textContent = achados
        .map(([setor, produtos]) => `${produtos.join(', ')}: setor ${setor}.`)
        .join(' ');
      // abre o primeiro setor encontrado
      setoresRaiz.querySelectorAll('.setor').forEach((d) => {
        const nome = d.querySelector('summary').textContent.trim();
        if (nome === achados[0][0]) d.open = true;
      });
    }, 250);
  });
}
