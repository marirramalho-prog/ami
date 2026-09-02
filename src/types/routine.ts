export interface AgendaEvent {
  id: string;
  titulo: string;
  data: { dia: string; mes: string; ano: string };
  hora: string;
  horaFim: string;
  childId: string | null;
  caregiverId: string | null;
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
}
