import { AtividadeExtracurricular, ResponsavelEscola } from './weeklyRoutine';

export type Turno = 'manha' | 'tarde' | 'integral' | '';

export interface Child {
  id: string;
  nome: string;
  sobrenome: string;
  dataNascimento: {
    dia: string;
    mes: string;
    ano: string;
  };
  avatar: string;
  escola: string;
  naoVaiEscola: boolean;
  turnoEscolar: Turno;
  responsavelEscola: ResponsavelEscola;
  atividades: AtividadeExtracurricular[];
  interesses: string[];
  observacoes: string;
}

export function childFullName(child: Pick<Child, 'nome' | 'sobrenome'>): string {
  return [child.nome, child.sobrenome].filter(Boolean).join(' ');
}
