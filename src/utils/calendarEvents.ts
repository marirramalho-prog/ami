import { Colors } from '../theme/colors';
import { Child, childFullName } from '../types/child';
import { Caregiver } from '../types/caregiver';
import { AgendaEvent, ChecklistTemplate } from '../types/routine';
import { DIAS_SEMANA } from '../types/weeklyRoutine';

// Função em vez de objeto fixo pra respeitar o tema atual (claro/escuro) — ux-backlog.md #14
export function tipoCor(colors: Colors): Record<string, string> {
  return {
    escola: colors.azulClaro,
    atividade: colors.lilasSuave,
    evento: colors.lavandaClaro,
  };
}

export interface CalendarItem {
  id: string;
  tipo: 'escola' | 'atividade' | 'evento';
  titulo: string;
  subtitulo: string;
  hora: string;
  // usado só pra ordenar (ex: turno da escola), pode ser diferente do
  // horário mostrado na tela
  horaOrdenacao: string;
  // checklist vinculado (escola/atividade), se houver — permite abrir
  // direto "o que precisa levar" a partir do calendário
  checklistTemplateId?: string;
}

// Horário de referência de cada turno, só pra ordenar a Escola junto
// com o resto do dia — não é exibido pra ninguém.
const HORA_REFERENCIA_TURNO: Record<string, string> = {
  manha: '07:00',
  integral: '07:00',
  tarde: '13:00',
};

export function getEventsForDate(
  date: Date,
  children: Child[],
  events: AgendaEvent[],
  caregivers: Caregiver[],
  checklists: ChecklistTemplate[] = [],
): CalendarItem[] {
  const diaKey = DIAS_SEMANA[date.getDay()].key;
  const itens: CalendarItem[] = [];

  children.forEach((child) => {
    if (!child.naoVaiEscola && child.escola) {
      const checklist = checklists.find(
        (t) => t.origemAuto?.childId === child.id && !t.origemAuto?.atividadeId,
      );
      itens.push({
        id: `escola-${child.id}`,
        tipo: 'escola',
        titulo: 'Escola',
        subtitulo: `${childFullName(child)} · ${child.escola}`,
        hora: '',
        horaOrdenacao: HORA_REFERENCIA_TURNO[child.turnoEscolar] || '',
        checklistTemplateId: checklist?.id,
      });
    }

    child.atividades.forEach((atividade) => {
      if (atividade.diasSemana?.includes(diaKey)) {
        const checklist = checklists.find(
          (t) => t.origemAuto?.childId === child.id && t.origemAuto?.atividadeId === atividade.id,
        );
        itens.push({
          id: `atividade-${child.id}-${atividade.id}`,
          tipo: 'atividade',
          titulo: atividade.nome,
          subtitulo: childFullName(child),
          hora: atividade.horarioInicio || '',
          horaOrdenacao: atividade.horarioInicio || '',
          checklistTemplateId: checklist?.id,
        });
      }
    });
  });

  events.forEach((event) => {
    const eventDate = new Date(
      Number(event.data.ano),
      Number(event.data.mes) - 1,
      Number(event.data.dia),
    );
    if (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    ) {
      const filhosDoEvento = children.filter((c) => event.childIds?.includes(c.id));
      const cuidadoresDoEvento = caregivers.filter((c) => event.caregiverIds?.includes(c.id));
      const subtituloPartes = [
        filhosDoEvento.map((c) => childFullName(c)).join(', ') || null,
        cuidadoresDoEvento.map((c) => c.nomeCompleto).join(', ') || null,
        event.local ? `📍 ${event.local}` : null,
      ].filter(Boolean);
      const faixaHorario = event.horaFim ? `${event.hora}–${event.horaFim}` : event.hora;
      itens.push({
        id: `evento-${event.id}`,
        tipo: 'evento',
        titulo: event.titulo,
        subtitulo: subtituloPartes.join(' · '),
        hora: faixaHorario || '',
        horaOrdenacao: event.hora || '',
      });
    }
  });

  return itens.sort((a, b) =>
    (a.horaOrdenacao || '99:99').localeCompare(b.horaOrdenacao || '99:99'),
  );
}
