/**
 * "Acompanhe a obra": etapas da reconstrução, lidas de conteudo/obra.json
 * (arquivo que a equipe de comunicação edita pelo painel de edição).
 */
import obra from '../../../conteudo/obra.json';
import { escaparHtml } from '../../nucleo/dom.js';

const SITUACAO = {
  concluida: 'Concluída',
  andamento: 'Em andamento',
  prevista: 'Prevista',
};
const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function formatarData(texto) {
  if (!texto) return '';
  const [ano, mes, dia] = texto.split('-').map(Number);
  if (!mes) return String(ano);
  return dia ? `${dia} de ${MESES[mes - 1]} de ${ano}` : `${MESES[mes - 1]} de ${ano}`;
}

export function montarAcompanhamentoDaObra(lista) {
  lista.innerHTML = obra.etapas
    .map(
      (etapa) => `<li class="obra__etapa obra__etapa--${etapa.situacao}">
        <span class="obra__marca" aria-hidden="true"></span>
        <div>
          <p class="obra__situacao">${SITUACAO[etapa.situacao] ?? ''}${etapa.data ? ` · <time datetime="${etapa.data}">${formatarData(etapa.data)}</time>` : ''}</p>
          <h4>${escaparHtml(etapa.titulo)}</h4>
          <p>${escaparHtml(etapa.texto)}</p>
        </div>
      </li>`,
    )
    .join('');
  const nota = lista.parentElement.querySelector('[data-obra-nota]');
  if (nota)
    nota.textContent = `${obra.aviso} Última atualização: ${formatarData(obra.atualizadoEm)}.`;
}
