export interface Caregiver {
  id: string;
  nomeCompleto: string;
  dataNascimento: {
    dia: string;
    mes: string;
    ano: string;
  };
  relacao: string;
}
