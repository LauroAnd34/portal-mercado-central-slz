import { iniciarPaginaComum } from './comum.js';
import '../estilos/componentes/modulos.css';
import '../estilos/paginas/nao-encontrada.css';

iniciarPaginaComum();

// "Página anterior" só aparece se houver para onde voltar
const voltar = document.querySelector('[data-voltar]');
if (voltar) {
  if (history.length > 1 && document.referrer)
    voltar.addEventListener('click', () => history.back());
  else voltar.hidden = true;
}
