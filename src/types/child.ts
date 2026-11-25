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
  // Opcional pra não quebrar perfis já cadastrados antes desse campo existir
  // — childUsaFralda() trata ausente como "sim" (comportamento de sempre).
  usaFralda?: boolean;
}

export function childFullName(child: Pick<Child, 'nome'>): string {
  return child.nome;
}

// Perfis cadastrados antes do campo "Usa fralda?" existir não têm o valor
// salvo — tratamos ausente como "sim" pra não esconder o Desfralde de quem
// já estava usando.
export function childUsaFralda(child: Pick<Child, 'usaFralda'>): boolean {
  return child.usaFralda !== false;
}
