/**
 * Ônibus perto do Mercado Central.
 * Fonte: Wikiroutes (dados colaborativos), parada "Mercado Central" na Travessa
 * do Mercado — consultado em novembro de 2026. As linhas podem mudar: confirme
 * no ponto, no terminal ou no aplicativo de transporte da cidade.
 */
export const ONIBUS = Object.freeze({
  parada: {
    nome: 'Mercado Central',
    endereco: 'Travessa do Mercado, ao lado do Mercado',
    coordenadas: [-2.5344692, -44.3009511],
    linhas: ['302', 'T005', 'T031', 'T032', 'T033', 'T034', 'T036'],
  },
  terminal: {
    nome: 'Terminal de Integração da Praia Grande',
    endereco: 'Av. Senador Vitorino Freire, Centro (perto do Mercado da Cidade)',
    texto: 'Recebe linhas de quase todos os bairros; de lá, o Mercado fica a poucos minutos a pé.',
  },
  fonte: { nome: 'Wikiroutes', url: 'https://wikiroutes.info/pt/stops/1049765' },
});
