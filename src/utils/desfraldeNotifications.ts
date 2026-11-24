import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { DiaKey } from '../types/weeklyRoutine';
import { DesfraldeLembrete } from '../types/desfralde';
import { ensurePermission } from './notifications';
import { calcularHorariosIntervalo } from './desfraldeCalc';

// Expo usa 1-7 pra weekday, com 1 = domingo.
const WEEKDAY_POR_DIA: Record<DiaKey, number> = {
  dom: 1,
  seg: 2,
  ter: 3,
  qua: 4,
  qui: 5,
  sex: 6,
  sab: 7,
};

// Agenda o lembrete de ida ao banheiro — um push semanal (WEEKLY) por
// horário x dia da semana escolhido. Cobre só o modo "intervalo": o modo
// "momentos" (ao acordar, antes de sair...) não tem um horário de relógio
// fixo pra agendar sozinho, então fica só como lembrete visível na tela,
// sem push automático por enquanto. Chame cancelarNotificacoes com os ids
// antigos antes de reagendar, pra não duplicar.
export async function agendarLembreteBanheiro(
  lembrete: Pick<DesfraldeLembrete, 'modoHorario' | 'intervaloMin' | 'horaInicio' | 'horaFim' | 'diasSemana'>,
  titulo: string,
  corpo: string,
): Promise<string[]> {
  if (Platform.OS === 'web' || lembrete.modoHorario !== 'intervalo') return [];
  const granted = await ensurePermission();
  if (!granted) return [];

  const horarios = calcularHorariosIntervalo(lembrete.horaInicio, lembrete.horaFim, lembrete.intervaloMin);
  const ids: string[] = [];
  for (const dia of lembrete.diasSemana) {
    const weekday = WEEKDAY_POR_DIA[dia];
    for (const { hour, minute } of horarios) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: titulo, body: corpo },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute },
      });
      ids.push(id);
    }
  }
  return ids;
}

export async function cancelarNotificacoes(ids: string[]): Promise<void> {
  if (Platform.OS === 'web') return;
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

const QUINZE_DIAS_EM_SEGUNDOS = 14 * 24 * 60 * 60;

// Lembrete recorrente pra revisar a fase a cada 2 semanas (briefing, 3.5).
export async function agendarLembreteRevisarFase(titulo: string, corpo: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const granted = await ensurePermission();
  if (!granted) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: corpo },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: QUINZE_DIAS_EM_SEGUNDOS,
      repeats: true,
    },
  });
}

// Lembrete único pra revisar os sinais de prontidão, daqui a `semanas`
// semanas — não precisa ser cancelável/persistido porque é de uma vez só.
export async function agendarLembreteRevisarSinais(
  titulo: string,
  corpo: string,
  semanas: number,
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const granted = await ensurePermission();
  if (!granted) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: corpo },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: semanas * 7 * 24 * 60 * 60,
      repeats: false,
    },
  });
}
