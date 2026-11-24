import { ChecklistTemplate } from '../types/routine';

// Itens padrão da "sacola do desfralde" (briefing, seção 4) — pra levar na
// bolsa/mochila nos dias de passeio ou escola enquanto a criança está no
// processo. Igual a qualquer outro checklist: vira totalmente editável
// depois de criado, sem vínculo automático (origemAuto) que force os itens
// de volta — a família pode adicionar, remover ou apagar o checklist.
const ITENS_SACOLA_DESFRALDE = [
  'Troca de roupa extra',
  'Calcinhas/cuecas extras',
  'Saquinho pra roupa molhada',
  'Lenços umedecidos',
  'Penico ou redutor portátil',
];

export function idChecklistSacolaDesfralde(childId: string): string {
  return `sacola-desfralde-${childId}`;
}

export function montarChecklistSacolaDesfralde(childId: string, nomeCrianca: string): ChecklistTemplate {
  return {
    id: idChecklistSacolaDesfralde(childId),
    nome: `Sacola do desfralde — ${nomeCrianca}`,
    tipo: 'Desfralde',
    itens: ITENS_SACOLA_DESFRALDE.map((texto, indice) => ({
      id: `${idChecklistSacolaDesfralde(childId)}-item-${indice}`,
      texto,
      feito: false,
    })),
  };
}
