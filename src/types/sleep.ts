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
  acordarSemana: string;
  acordarFimDeSemana: string;
  tiraSoneca: boolean;
  horarioSoneca: string;
  duracaoSoneca: DuracaoSoneca;
  ritual: RitualStep[];
  lembreteMinutos: string;
  notificationId: string | null;
}

// chave: `${childId}_${data (YYYY-MM-DD)}_${stepId}`
export type RitualCompletionMap = Record<string, boolean>;

export interface DailyLog {
  id: string;
  childId: string;
  data: string;
  status: StatusNoite;
}
