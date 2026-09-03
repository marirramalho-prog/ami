// Ver claude_agenda-cuidados_especificacao.md (raiz do OneDrive) pra spec completa:
// enquadramento regulatório, paleta e a lista de marcos com fontes oficiais.

export type CategoriaCuidado = 'vacina' | 'puericultura' | 'especialidade' | 'triagem_neonatal';

export type FrequenciaCuidado =
  | 'unica'
  | 'anual'
  | 'anual_influenza'
  | 'a_cada_6_meses'
  | 'a_cada_2_anos'
  | 'conforme_resultado';

export interface CareMilestone {
  id: string;
  categoria: CategoriaCuidado;
  idadeLabel: string;
  // Só um dos dois é preenchido — dias pra marcos bem no início da vida
  // (triagens, primeira dose), meses pro resto.
  idadeDias?: number;
  idadeMeses?: number;
  titulo: string;
  observacao: string | null;
  frequencia: FrequenciaCuidado;
  fonte: string;
  // Só vale pra categoria "especialidade". Enquanto false, a UI mostra o
  // selo "aguardando validação do pediatra parceiro" — quando o time trocar
  // pra true (depois da validação real com o pediatra parceiro), o selo
  // some sozinho, sem mexer em mais nada.
  validadoPediatra: boolean;
}
