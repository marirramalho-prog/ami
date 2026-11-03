export type NivelConfianca = 'alta' | 'media' | 'baixa';

export type CampoExtraido =
  | 'titulo'
  | 'tipo'
  | 'data'
  | 'horaInicio'
  | 'horaFim'
  | 'local'
  | 'prazoConfirmacao'
  | 'contato'
  | 'observacoes';

export interface ExtractedEvent {
  titulo: string;
  tipo: string;
  data: { dia: string; mes: string; ano: string };
  horaInicio: string;
  horaFim: string;
  local: string;
  criancasCitadas: string[];
  prazoConfirmacao: string;
  contato: string;
  observacoes: string;
  confianca: Partial<Record<CampoExtraido, NivelConfianca>>;
}
