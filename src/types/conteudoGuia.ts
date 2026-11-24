// Conteúdo editorial do guia de Desfralde, carregado como dados (não fixo
// na tela) pra poder ser trocado/validado sem publicar nova versão do app —
// mesmo padrão do validadoPediatra em careMilestone.ts.

export type SecaoGuiaDesfralde =
  | 'preparar'
  | 'primeiros_dias'
  | 'dia_a_dia'
  | 'passeios_escola'
  | 'noite'
  | 'recaidas_escapes'
  | 'pediatra';

export interface ConteudoGuiaItem {
  id: string;
  area: 'desfralde';
  secao: SecaoGuiaDesfralde;
  ordemSugerida: number;
  titulo: string;
  corpoMd: string;
  idadeMinMeses: number | null;
  idadeMaxMeses: number | null;
  // Enquanto false, a UI mostra o selo "aguardando validação de
  // especialista" — vira true só depois da validação real (ver briefing
  // seção 11: validadora médica, psicóloga ou pedagoga infantil).
  validadoEspecialista: boolean;
  validadoPor: string | null;
  validadoEm: string | null;
  versao: number;
}
