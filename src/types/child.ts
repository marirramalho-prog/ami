import { AtividadeExtracurricular } from './weeklyRoutine';

export type Turno = 'manha' | 'tarde' | 'integral' | '';

export interface Child {
  id: string;
  nome: string;
  dataNascimento: {
    dia: string;
    mes: string;
    ano: string;
  };
  avatar: string;
  escola: string;
  naoVaiEscola: boolean;
  turnoEscolar: Turno;
  atividades: AtividadeExtracurricular[];
  interesses: string[];
  observacoes: string;
}

export function childFullName(child: Pick<Child, 'nome'>): string {
  return child.nome;
}
