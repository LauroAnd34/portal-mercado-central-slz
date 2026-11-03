import { iniciarPaginaComum } from './comum.js';
import '@fontsource/merriweather/latin-400.css';
import '@fontsource/merriweather/latin-700.css';
import '@fontsource/merriweather/latin-400-italic.css';
import '../estilos/componentes/modulos.css';
import '../estilos/paginas/livro.css';
import { iniciarLeitor, preencherInformacoesDoLivro } from '../recursos/livro/leitor.js';

iniciarPaginaComum();
preencherInformacoesDoLivro();
const leitor = document.querySelector('[data-leitor]');
if (leitor) iniciarLeitor(leitor);
