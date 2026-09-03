export interface AgendaEvent {
  id: string;
  titulo: string;
  data: { dia: string; mes: string; ano: string };
  hora: string;
  horaFim: string;
  local: string;
  childIds: string[];
  caregiverIds: string[];
  lembrete: boolean;
  notificationId: string | null;
}

export interface ChecklistItem {
  id: string;
  texto: string;
  feito: boolean;
}

export interface ChecklistTemplate {
  id: string;
  nome: string;
  tipo: string;
  itens: ChecklistItem[];
  // presente quando o checklist nasceu sozinho a partir da escola ou de
  // uma atividade extracurricular cadastrada no perfil do filho —
  // mantém o vínculo pra atualizar o nome e limpar se a atividade sumir
  origemAuto?: {
    childId: string;
    atividadeId?: string; // ausente = é o checklist da escola
  };
}
