/**
 * Galeria "A cidade dos azulejos": fotos reais (Wikimedia Commons) que abrem
 * ampliadas numa janela (dialog nativo: prende o foco e fecha com Esc).
 */
import { FOTOS, GALERIA_AZULEJOS, urlDaFoto, srcsetDaFoto } from '../../dados/fotos.js';
import { escaparHtml } from '../../nucleo/dom.js';
import { ativarZoomDeImagem } from '../../nucleo/zoom-de-imagem.js';

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
          <span class="azulejaria__nome">${escaparHtml(foto.lugar)}<span class="somente-leitor"> — ampliar foto</span></span>
        </button>
      </li>`;
    })
    .join('');

  const imagem = janela.querySelector('[data-visualizador-foto]');
  const titulo = janela.querySelector('[data-visualizador-titulo]');
  const credito = janela.querySelector('[data-visualizador-credito]');
  const zoom = ativarZoomDeImagem(janela.querySelector('[data-area-zoom]'), imagem);
  janela.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-zoom-foto]')?.dataset.zoomFoto;
    if (acao === 'mais') zoom.aproximar(1.5);
    if (acao === 'menos') zoom.aproximar(1 / 1.5);
    if (acao === 'normal') zoom.restaurar();
  });
  const abrir = () => {
    zoom.restaurar();
    janela.showModal();
  };

  lista.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-chave]');
    if (!botao) return;
    const foto = FOTOS[botao.dataset.chave];
    imagem.srcset = srcsetDaFoto(botao.dataset.chave);
    imagem.sizes = '94vw';
    imagem.src = urlDaFoto(botao.dataset.chave);
    imagem.alt = foto.lugar;
    titulo.textContent = foto.lugar;
    credito.innerHTML = `Foto: ${escaparHtml(foto.autor)} · <a href="${foto.fonte}" target="_blank" rel="noopener">${escaparHtml(foto.licenca)}<span class="somente-leitor"> (abre em nova aba)</span></a>`;
    abrir();
  });
  document.querySelector('[data-ampliar-painel]')?.addEventListener('click', (evento) => {
    const foto = evento.currentTarget.querySelector('img');
    imagem.removeAttribute('srcset');
    imagem.src = foto.currentSrc || foto.src;
    imagem.alt = foto.alt;
    titulo.textContent = 'Painel de azulejos no Fórum Eleitoral de São Luís (TRE-MA)';
    credito.textContent = 'Assinatura no painel: “Santos, 09”. Foto: Lauro Andrade.';
    abrir();
  });
  janela
    .querySelector('[data-fechar-visualizador]')
    .addEventListener('click', () => janela.close());
  janela.addEventListener('click', (evento) => {
    if (evento.target === janela) janela.close(); // clique fora da foto
  });
}
