export interface Caregiver {
  id: string;
  nomeCompleto: string;
  dataNascimento: {
    dia: string;
    mes: string;
    ano: string;
  };
  relacao: string;
  celular: string;
  email: string;
  // marca quem baixou/usa o app neste aparelho — enquanto não existe
  // login de verdade, é como sabemos "quem é o usuário principal"
  principal: boolean;
}
