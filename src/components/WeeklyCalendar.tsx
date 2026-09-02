import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Child } from '../types/child';
import { Caregiver } from '../types/caregiver';
import { AgendaEvent } from '../types/routine';
import { addDays, isSameDay, labelDataCurta, labelDiaAbrev } from '../utils/calendarDates';
import { getEventsForDate, TIPO_COR } from '../utils/calendarEvents';

interface Props {
  inicioSemana: Date;
  children: Child[];
  events: AgendaEvent[];
  caregivers: Caregiver[];
  onRemoveEvento?: (eventId: string) => void;
}

export default function WeeklyCalendar({
  inicioSemana,
  children,
  events,
  caregivers,
  onRemoveEvento,
}: Props) {
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));
  const hoje = new Date();

  return (
    <View style={{ gap: 10 }}>
      {dias.map((dia) => {
        const itens = getEventsForDate(dia, children, events, caregivers);
        const ehHoje = isSameDay(dia, hoje);
        return (
          <View key={dia.toISOString()} style={styles.diaBloco}>
            <View style={styles.diaHeader}>
              <Text style={[styles.diaLabel, ehHoje && styles.diaLabelHoje]}>
                {labelDiaAbrev(dia)} · {labelDataCurta(dia)}
              </Text>
              {ehHoje && <Text style={styles.hojeTag}>hoje</Text>}
            </View>
            {itens.length === 0 ? (
              <Text style={styles.vazio}>Nada por aqui.</Text>
            ) : (
              itens.map((item) => (
                <View
                  key={item.id}
                  style={[styles.item, { borderLeftColor: TIPO_COR[item.tipo] }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitulo}>
                      {item.hora ? `${item.hora} · ` : ''}
                      {item.titulo}
                    </Text>
                    {item.subtitulo ? (
                      <Text style={styles.itemSubtitulo}>{item.subtitulo}</Text>
                    ) : null}
                  </View>
                  {item.tipo === 'evento' && onRemoveEvento && (
                    <Pressable onPress={() => onRemoveEvento(item.id.replace('evento-', ''))}>
                      <Text style={styles.remove}>remover</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  diaBloco: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  diaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diaLabel: { fontSize: 13, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
  diaLabelHoje: { color: colors.text },
  hojeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  vazio: { fontSize: 12, color: colors.textMuted },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 2,
  },
  itemTitulo: { fontSize: 13, color: colors.text, fontWeight: '600' },
  itemSubtitulo: { fontSize: 12, color: colors.textMuted },
  remove: { fontSize: 11, color: colors.textMuted },
});
