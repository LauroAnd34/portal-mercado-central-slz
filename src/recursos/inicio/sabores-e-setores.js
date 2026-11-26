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

/**
 * Lista de sabores: tocar num sabor troca as duas fotos ao lado
 * (botões com aria-pressed; a legenda avisa o leitor de tela).
 */
export function montarSabores(raiz, sabores, { urlDaFoto, srcsetDaFoto, FOTOS } = {}) {
  raiz.innerHTML = sabores
    .map(
      (sabor, i) => `
      <li class="sabor">
        <h3 class="sabor__nome"><button type="button" class="sabor__botao" data-sabor="${i}" aria-pressed="${i === 0}" aria-controls="sabores-fotos">${escaparHtml(sabor.nome)}</button></h3>
        <p>${escaparHtml(sabor.texto)}</p>
      </li>`,
    )
    .join('');
  const caixa = document.getElementById('sabores-fotos');
  if (!caixa || !urlDaFoto) return;
  const imagens = caixa.querySelectorAll('img');
  const legenda = caixa.querySelector('[data-sabores-legenda]');
  const mostrar = (indice) => {
    const sabor = sabores[indice];
    if (!sabor?.fotos) return;
    sabor.fotos.forEach((foto, n) => {
      const img = imagens[n];
      if (!img) return;
      img.srcset = srcsetDaFoto(foto.chave);
      img.src = urlDaFoto(foto.chave);
      img.alt = foto.alt;
    });
    const autores = [...new Set(sabor.fotos.map((f) => FOTOS[f.chave]?.autor).filter(Boolean))];
    legenda.textContent = `${sabor.nome}. Fotos: ${autores.join(' e ')}.`;
    raiz
      .querySelectorAll('[data-sabor]')
      .forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.sabor) === indice)));
  };
  raiz.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-sabor]');
    if (botao) mostrar(Number(botao.dataset.sabor));
  });
  mostrar(0);
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
          'Não achamos esse produto na lista. Pergunte aos feirantes: o Mercado tem muito mais do que cabe aqui.';
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
