// Grandes temas pra categorizar as conversas — mesma linguagem das abas do
// app, pra ficar fácil de reconhecer na hora de retomar.
export type ChatTema =
  | 'passeios'
  | 'rotina'
  | 'agenda'
  | 'historias'
  | 'sono'
  | 'cuidados'
  | 'outros';

export interface ChatMessage {
  id: string;
  from: 'ami' | 'mae';
  text: string;
  criadoEm: string; // ISO
}

export interface ChatConversation {
  id: string;
  tema: ChatTema;
  // resumo curto da primeira mensagem da mãe — usado como título na lista
  // de conversas anteriores.
  titulo: string;
  mensagens: ChatMessage[];
  criadoEm: string;
  atualizadoEm: string;
}
