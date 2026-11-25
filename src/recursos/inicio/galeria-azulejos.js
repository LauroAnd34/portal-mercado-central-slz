/**
 * Galeria "A cidade dos azulejos": fotos reais (Wikimedia Commons) que abrem
 * ampliadas numa janela (dialog nativo: prende o foco e fecha com Esc).
 */
import { FOTOS, GALERIA_AZULEJOS, urlDaFoto, srcsetDaFoto } from '../../dados/fotos.js';
import { escaparHtml } from '../../nucleo/dom.js';
import { ativarZoomDeImagem } from '../../nucleo/zoom-de-imagem.js';
import { anunciar } from '../../nucleo/anunciador.js';

export function montarGaleriaDeAzulejos() {
  const lista = document.querySelector('[data-galeria-azulejos]');
  const janela = document.querySelector('[data-visualizador]');
  if (!lista || !janela) return;

  lista.innerHTML = GALERIA_AZULEJOS.filter((chave) => FOTOS[chave])
    .map((chave) => {
      const foto = FOTOS[chave];
      return `<li>
        <button type="button" class="azulejaria__item" data-chave="${chave}" aria-haspopup="dialog">
          <img src="${urlDaFoto(chave)}" srcset="${srcsetDaFoto(chave)}" sizes="(max-width: 860px) 50vw, 300px" alt="" loading="lazy" decoding="async" width="${foto.largura}" height="${foto.altura}" />
          <span class="azulejaria__nome">${escaparHtml(foto.lugar)}<span class="somente-leitor">: ampliar foto</span></span>
        </button>
      </li>`;
    })
    .join('');

  const imagem = janela.querySelector('[data-visualizador-foto]');
  const titulo = janela.querySelector('[data-visualizador-titulo]');
  const credito = janela.querySelector('[data-visualizador-credito]');
  const contador = janela.querySelector('[data-visualizador-contador]');
  const setas = janela.querySelectorAll('[data-foto-anterior], [data-foto-proxima]');
  const chaves = GALERIA_AZULEJOS.filter((chave) => FOTOS[chave]);
  let atual = -1; // posição na galeria (-1 = foto avulsa, sem setas)

  const mostrarFoto = (indice) => {
    atual = (indice + chaves.length) % chaves.length;
    const chave = chaves[atual];
    const foto = FOTOS[chave];
    zoom.restaurar();
    imagem.srcset = srcsetDaFoto(chave);
    imagem.sizes = '100vw';
    imagem.src = urlDaFoto(chave);
    imagem.alt = foto.lugar;
    titulo.textContent = foto.lugar;
    contador.textContent = `${atual + 1} de ${chaves.length}`;
    credito.innerHTML = `Foto: ${escaparHtml(foto.autor)}, <a href="${foto.fonte}" target="_blank" rel="noopener">${escaparHtml(foto.licenca)}<span class="somente-leitor"> (abre em nova aba)</span></a>`;
    setas.forEach((seta) => (seta.hidden = false));
    anunciar(`${foto.lugar}. Foto ${atual + 1} de ${chaves.length}.`);
  };
  const trocar = (passo) => {
    if (atual < 0 || !janela.open) return;
    mostrarFoto(atual + passo);
  };

  const zoom = ativarZoomDeImagem(janela.querySelector('[data-area-zoom]'), imagem, {
    aoDeslizar: trocar,
  });
  janela.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-zoom-foto]')?.dataset.zoomFoto;
    if (acao === 'mais') zoom.aproximar(1.5);
    if (acao === 'menos') zoom.aproximar(1 / 1.5);
    if (acao === 'normal') zoom.restaurar();
    if (evento.target.closest('[data-foto-anterior]')) trocar(-1);
    if (evento.target.closest('[data-foto-proxima]')) trocar(1);
  });
  const abrir = () => {
    zoom.restaurar();
    janela.showModal();
    janela.querySelector('[data-area-zoom]').focus();
  };

  lista.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-chave]');
    if (!botao) return;
    mostrarFoto(chaves.indexOf(botao.dataset.chave));
    abrir();
  });
  document.querySelector('[data-ampliar-painel]')?.addEventListener('click', (evento) => {
    const foto = evento.currentTarget.querySelector('img');
    atual = -1;
    imagem.removeAttribute('srcset');
    imagem.src = foto.currentSrc || foto.src;
    imagem.alt = foto.alt;
    titulo.textContent = 'Painel de azulejos no Fórum Eleitoral de São Luís (TRE-MA)';
    contador.textContent = '';
    credito.textContent = 'Assinatura no painel: “Santos, 09”. Foto: Lauro Andrade.';
    setas.forEach((seta) => (seta.hidden = true));
    abrir();
  });
  janela
    .querySelector('[data-fechar-visualizador]')
    .addEventListener('click', () => janela.close());
}
