export type DuracaoSoneca = '30 min' | '1h' | '1h30' | '2h' | '';
export type StatusNoite = 'Dormiu no horário' | 'Atrasou' | 'Não dormiu em casa' | '';

export interface RitualStep {
  id: string;
  texto: string;
}

export interface SleepSchedule {
  childId: string;
  dormirSemana: string;
  dormirFimDeSemana: string;
  mesmoDormirFds: boolean;
  acordarSemana: string;
  acordarFimDeSemana: string;
  mesmoAcordarFds: boolean;
  tiraSoneca: boolean;
  horarioSoneca: string;
  duracaoSoneca: DuracaoSoneca;
  ritual: RitualStep[];
  lembreteMinutos: string;
  notificationId: string | null;
}

// chave: `${childId}_${data (YYYY-MM-DD)}_${stepId}`
export type RitualCompletionMap = Record<string, boolean>;

export interface Despertar {
  id: string;
  horarioDespertou: string;
  horarioAdormeceu: string;
  detalhes: string;
}

export interface DailyLog {
  id: string;
  childId: string;
  data: string;
  status: StatusNoite;
  // Horário real de hoje — separado da rotina base (SleepSchedule), porque
  // quem acompanha a noite dia a dia precisa registrar até minutos de
  // diferença, mesmo com a rotina já cadastrada.
  horarioDormiu: string;
  horarioAcordou: string;
  observacao: string;
  despertares: Despertar[];
}
