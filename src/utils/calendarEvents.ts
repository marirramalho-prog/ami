import { colors } from '../theme/colors';
import { Child, childFullName } from '../types/child';
import { Caregiver } from '../types/caregiver';
import { AgendaEvent } from '../types/routine';
import { DIAS_SEMANA } from '../types/weeklyRoutine';

export const TIPO_COR: Record<string, string> = {
  escola: colors.azulClaro,
  atividade: colors.lilasSuave,
  evento: colors.lavandaClaro,
};

export interface CalendarItem {
  id: string;
  tipo: 'escola' | 'atividade' | 'evento';
  titulo: string;
  subtitulo: string;
  hora: string;
  // usado só pra ordenar (ex: turno da escola), pode ser diferente do
  // horário mostrado na tela
  horaOrdenacao: string;
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
): CalendarItem[] {
  const diaKey = DIAS_SEMANA[date.getDay()].key;
  const itens: CalendarItem[] = [];

  children.forEach((child) => {
    if (!child.naoVaiEscola && child.escola) {
      itens.push({
        id: `escola-${child.id}`,
        tipo: 'escola',
        titulo: 'Escola',
        subtitulo: `${childFullName(child)} · ${child.escola}`,
        hora: '',
        horaOrdenacao: HORA_REFERENCIA_TURNO[child.turnoEscolar] || '',
      });
    }

    child.atividades.forEach((atividade) => {
      if (atividade.diasSemana?.includes(diaKey)) {
        itens.push({
          id: `atividade-${child.id}-${atividade.id}`,
          tipo: 'atividade',
          titulo: atividade.nome,
          subtitulo: childFullName(child),
          hora: atividade.horarioInicio || '',
          horaOrdenacao: atividade.horarioInicio || '',
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
