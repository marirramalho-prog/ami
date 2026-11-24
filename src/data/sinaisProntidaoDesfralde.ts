import { CodigoSinalProntidao } from '../types/desfralde';

// Catálogo fixo dos sinais de prontidão (briefing, seção 3.1). O texto é
// original da Âmi — sem nota, sem teste, só uma lista que os pais marcam e
// revisam quando quiserem.
export const CATALOGO_SINAIS_PRONTIDAO: { codigo: CodigoSinalProntidao; texto: string }[] = [
  { codigo: 'fica_seco_mais_tempo', texto: 'Fica seco por mais tempo entre as trocas' },
  { codigo: 'avisa_ou_esconde', texto: 'Avisa ou se esconde quando faz' },
  { codigo: 'incomoda_com_fralda_suja', texto: 'Demonstra incômodo com a fralda suja' },
  { codigo: 'curiosidade_banheiro', texto: 'Tem curiosidade pelo banheiro' },
  { codigo: 'abaixa_sobe_roupa', texto: 'Consegue abaixar e subir a própria roupa' },
  { codigo: 'entende_pedidos_simples', texto: 'Entende pedidos simples' },
];
