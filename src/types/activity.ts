export type ActivityCategory = 'Extracurricular' | 'Fim de semana';

export interface Activity {
  id: string;
  nome: string;
  categoria: ActivityCategory;
  tipo: string;
  bairro: string;
  faixaEtaria: string;
  preco: string;
  horario: string;
  descricao: string;
}
