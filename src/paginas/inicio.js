import { iniciarPaginaComum } from './comum.js';
import '../estilos/componentes/modulos.css';
import '../estilos/paginas/inicio.css';
import { LINHA_DO_TEMPO } from '../dados/linha-do-tempo.js';
import { SETORES, SABORES } from '../dados/mercado.js';
import { iniciarLinhaDoTempo } from '../recursos/inicio/linha-do-tempo.js';
import { montarSetores, montarSabores } from '../recursos/inicio/sabores-e-setores.js';
import { montarCaminhos } from '../recursos/inicio/caminhos.js';
import { montarGaleriaDeAzulejos } from '../recursos/inicio/galeria-azulejos.js';
import { iniciarVisualizador3D } from '../recursos/modelo3d/visualizador-3d.js';

const linha = document.querySelector('[data-linha-do-tempo]');
if (linha) iniciarLinhaDoTempo(linha, LINHA_DO_TEMPO);
const setores = document.querySelector('[data-setores]');
if (setores) montarSetores(setores, SETORES);
const sabores = document.querySelector('[data-sabores]');
if (sabores) montarSabores(sabores, SABORES);
const caminhos = document.querySelector('[data-caminhos]');
if (caminhos) montarCaminhos(caminhos);
montarGaleriaDeAzulejos();
iniciarVisualizador3D();

iniciarPaginaComum();
