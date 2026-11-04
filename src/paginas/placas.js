/**
 * Placas com QR code para os pontos turísticos (página para imprimir).
 * O QR aponta para mapa.html#<ponto>, que abre o lugar já selecionado.
 */
import { iniciarPaginaComum } from './comum.js';
import '../estilos/componentes/modulos.css';
import '../estilos/paginas/placas.css';
import QRCode from 'qrcode';
import { PONTOS_TURISTICOS, MERCADO_CENTRAL, CATEGORIAS } from '../dados/pontos-turisticos.js';
import { escaparHtml } from '../nucleo/dom.js';

iniciarPaginaComum();

const base = new URL('./mapa.html', import.meta.env.VITE_ENDERECO_SITE || location.href).href;
const lista = document.querySelector('[data-placas]');
const pontos = [MERCADO_CENTRAL, ...PONTOS_TURISTICOS];

Promise.all(
  pontos.map(async (ponto) => {
    const endereco = `${base}#${ponto.id}`;
    const svg = await QRCode.toString(endereco, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0b2a45', light: '#ffffff' },
    });
    const categoria = CATEGORIAS[ponto.categoria]?.nome ?? 'Ponto de partida';
    return `<li class="placa">
      <p class="placa__marca">Prefeitura de São Luís · Portal do Mercado Central</p>
      <h2 class="placa__nome">${escaparHtml(ponto.nome)}</h2>
      <p class="placa__categoria">${escaparHtml(categoria)}</p>
      <div class="placa__qr" role="img" aria-label="QR code para ${escaparHtml(ponto.nome)}">${svg}</div>
      <p class="placa__instrucao">Aponte a câmera do celular para conhecer a história, ouvir a descrição e ver o caminho.</p>
      <p class="placa__link"><a href="${endereco}">${escaparHtml(endereco.replace(/^https?:\/\//, ''))}</a></p>
    </li>`;
  }),
).then((placas) => {
  lista.innerHTML = placas.join('');
});

document.querySelector('[data-imprimir-placas]').addEventListener('click', () => window.print());
document.querySelector('[data-quatro-por-folha]').addEventListener('change', (evento) => {
  lista.classList.toggle('placas--quatro', evento.target.checked);
});
