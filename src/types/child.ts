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
  turnoEscolar: Turno;
  atividades: string[];
  responsaveisBusca: string[];
  interesses: string[];
  observacoes: string;
}
