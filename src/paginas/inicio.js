import { iniciarPaginaComum } from './comum.js';
import '../estilos/componentes/modulos.css';
import '../estilos/paginas/inicio.css';
import { LINHA_DO_TEMPO } from '../dados/linha-do-tempo.js';
import { MERCADO_CENTRAL, PONTOS_TURISTICOS, CATEGORIAS } from '../dados/pontos-turisticos.js';
import { iniciarLinhaDoTempo } from '../recursos/inicio/linha-do-tempo.js';
import { desenharMiniMapa } from '../recursos/inicio/mini-mapa.js';
import { montarSetores, montarSabores } from '../recursos/inicio/sabores-e-setores.js';
import { SETORES, SABORES } from '../dados/mercado.js';
import { iniciarComparador } from '../recursos/inicio/comparador.js';

iniciarPaginaComum();

const linha = document.querySelector('[data-linha-do-tempo]');
if (linha) iniciarLinhaDoTempo(linha, LINHA_DO_TEMPO);

const miniMapa = document.querySelector('[data-mini-mapa]');
if (miniMapa) {
  desenharMiniMapa(miniMapa, {
    mercado: MERCADO_CENTRAL,
    pontos: PONTOS_TURISTICOS,
    categorias: CATEGORIAS,
  });
}
document
  .querySelectorAll('[data-total-pontos]')
  .forEach((el) => (el.textContent = String(PONTOS_TURISTICOS.length)));

const setores = document.querySelector('[data-setores]');
if (setores) montarSetores(setores, SETORES);
const sabores = document.querySelector('[data-sabores]');
if (sabores) montarSabores(sabores, SABORES);

document.querySelectorAll('[data-comparador]').forEach(iniciarComparador);
