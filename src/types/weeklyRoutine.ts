export type DiaKey = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export const DIAS_SEMANA: { key: DiaKey; label: string; nomeCompleto: string }[] = [
  { key: 'dom', label: 'D', nomeCompleto: 'Domingo' },
  { key: 'seg', label: 'S', nomeCompleto: 'Segunda' },
  { key: 'ter', label: 'T', nomeCompleto: 'Terça' },
  { key: 'qua', label: 'Q', nomeCompleto: 'Quarta' },
  { key: 'qui', label: 'Q', nomeCompleto: 'Quinta' },
  { key: 'sex', label: 'S', nomeCompleto: 'Sexta' },
  { key: 'sab', label: 'S', nomeCompleto: 'Sábado' },
];

export interface AtividadeExtracurricular {
  id: string;
  nome: string;
  horarioInicio: string;
  horarioFim: string;
  diasSemana: DiaKey[];
}
