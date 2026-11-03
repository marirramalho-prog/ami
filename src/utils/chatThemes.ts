import { ChatTema } from '../types/chat';

// Categorização por palavra-chave — sem IA nesta etapa (só a estrutura
// visual de histórico). Quando a Âmi ganhar respostas de verdade, esse
// arquivo pode virar só o rótulo/exibição, e a categorização passa a vir
// do modelo.
const REGRAS: { tema: ChatTema; palavras: string[] }[] = [
  { tema: 'sono', palavras: ['sono', 'dormir', 'dorme', 'soneca', 'acordar', 'acorda'] },
  { tema: 'historias', palavras: ['história', 'historia', 'historinha', 'conto'] },
  {
    tema: 'agenda',
    palavras: ['agenda', 'compromisso', 'consulta', 'marcar', 'médico', 'medico'],
  },
  { tema: 'rotina', palavras: ['rotina', 'checklist', 'organizar', 'tarefa', 'lista'] },
  { tema: 'cuidados', palavras: ['vacina', 'pediatra', 'cuidado', 'saúde', 'saude'] },
  {
    tema: 'passeios',
    palavras: ['passeio', 'passear', 'atividade', 'parque', 'praia', 'brincar', 'fim de semana'],
  },
];

export function identificarTema(texto: string): ChatTema {
  const lower = texto.toLowerCase();
  for (const regra of REGRAS) {
    if (regra.palavras.some((p) => lower.includes(p))) return regra.tema;
  }
  return 'outros';
}

export const TEMA_LABEL: Record<ChatTema, string> = {
  passeios: 'Passeios e atividades',
  rotina: 'Rotina e organização',
  agenda: 'Agenda e compromissos',
  historias: 'Histórias',
  sono: 'Sono',
  cuidados: 'Cuidados e saúde',
  outros: 'Outros assuntos',
};

// Resposta fixa por tema — a Âmi ainda não responde de verdade nesta
// etapa (só a estrutura de chat/histórico), mas a resposta já orienta pra
// aba certa, como os atalhos antigos faziam.
const RESPOSTA_POR_TEMA: Record<ChatTema, string> = {
  passeios:
    'Anotado! Em breve trago sugestões certeiras por aqui — até lá, dá uma olhada na aba Descobrir.',
  rotina: 'Anotado! Dá pra organizar isso com mais detalhe na aba Checklist.',
  agenda: 'Anotado! Pra marcar direitinho com data e horário, usa a aba Agenda.',
  historias: 'Adoro esse assunto! Pra montar a história completa, usa a aba Histórias.',
  sono: 'Anotado! Pra configurar a rotina de sono direitinho, dá uma olhada na aba Sono.',
  cuidados: 'Anotado! A aba Cuidados tem o calendário de vacina e consultas pra te ajudar com isso.',
  outros:
    'Anotado! Ainda estou aprendendo a responder de verdade por aqui — mas essa conversa fica salva pra você continuar quando quiser.',
};

export function respostaPadrao(tema: ChatTema): string {
  return RESPOSTA_POR_TEMA[tema];
}
