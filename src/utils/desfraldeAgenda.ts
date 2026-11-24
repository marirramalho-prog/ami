import { AgendaEvent } from '../types/routine';

// Evento de marco na Agenda pro início do desfralde (briefing, seção 4) —
// só o marco de início, sem hora nem lembrete. Os horários de ida ao
// banheiro ficam só no lembrete por push (etapa 4): virar cada horário em
// evento de agenda poluiria a agenda da família.
export function idEventoInicioDesfralde(processoId: string): string {
  return `desfralde-inicio-${processoId}`;
}

export function montarEventoInicioDesfralde(
  processoId: string,
  childId: string,
  data: Date,
): AgendaEvent {
  return {
    id: idEventoInicioDesfralde(processoId),
    titulo: 'Início do desfralde',
    data: {
      dia: String(data.getDate()),
      mes: String(data.getMonth() + 1),
      ano: String(data.getFullYear()),
    },
    hora: '',
    horaFim: '',
    local: '',
    childIds: [childId],
    caregiverIds: [],
    lembrete: false,
    notificationId: null,
  };
}
