export type DiaKey = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export interface DiaRotina {
  ativo: boolean;
  leva: string | null;
  busca: string | null;
}

export type WeeklyRoutine = Record<DiaKey, DiaRotina>;

export const DIAS_SEMANA: { key: DiaKey; label: string; nomeCompleto: string }[] = [
  { key: 'dom', label: 'D', nomeCompleto: 'Domingo' },
  { key: 'seg', label: 'S', nomeCompleto: 'Segunda' },
  { key: 'ter', label: 'T', nomeCompleto: 'Terça' },
  { key: 'qua', label: 'Q', nomeCompleto: 'Quarta' },
  { key: 'qui', label: 'Q', nomeCompleto: 'Quinta' },
  { key: 'sex', label: 'S', nomeCompleto: 'Sexta' },
  { key: 'sab', label: 'S', nomeCompleto: 'Sábado' },
];

export const DIAS_UTEIS: DiaKey[] = ['seg', 'ter', 'qua', 'qui', 'sex'];

export function criarRotinaVazia(): WeeklyRoutine {
  const dias = {} as WeeklyRoutine;
  DIAS_SEMANA.forEach((d) => {
    dias[d.key] = { ativo: false, leva: null, busca: null };
  });
  return dias;
}

export interface ResponsavelEscola {
  leva: string | null;
  busca: string | null;
}

export function criarResponsavelEscolaVazio(): ResponsavelEscola {
  return { leva: null, busca: null };
}

export interface AtividadeExtracurricular {
  id: string;
  nome: string;
  horarioInicio: string;
  horarioFim: string;
  rotina: WeeklyRoutine;
}
