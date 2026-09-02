import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Child } from '../types/child';
import { Caregiver } from '../types/caregiver';
import { AgendaEvent } from '../types/routine';
import { isSameDay, isSameMonth, monthGrid } from '../utils/calendarDates';
import { getEventsForDate, TIPO_COR } from '../utils/calendarEvents';

interface Props {
  mesReferencia: Date;
  children: Child[];
  events: AgendaEvent[];
  caregivers: Caregiver[];
  onRemoveEvento?: (eventId: string) => void;
}

const DIAS_HEADER = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];
const MAX_ITENS_VISIVEIS = 4;

export default function MonthlyCalendar({
  mesReferencia,
  children,
  events,
  caregivers,
  onRemoveEvento,
}: Props) {
  const dias = monthGrid(mesReferencia);
  const hoje = new Date();
  const [selecionado, setSelecionado] = useState<Date>(hoje);

  const itensSelecionado = getEventsForDate(selecionado, children, events, caregivers);

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.headerRow}>
        {DIAS_HEADER.map((d, i) => (
          <Text key={i} style={styles.headerLabel}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {dias.map((dia) => {
          const itens = getEventsForDate(dia, children, events, caregivers);
          const foraDoMes = !isSameMonth(dia, mesReferencia);
          const ehHoje = isSameDay(dia, hoje);
          const ehSelecionado = isSameDay(dia, selecionado);
          const visiveis = itens.slice(0, MAX_ITENS_VISIVEIS);
          const restantes = itens.length - visiveis.length;
          return (
            <Pressable
              key={dia.toISOString()}
              style={[
                styles.celula,
                ehSelecionado && styles.celulaSelecionada,
                ehHoje && !ehSelecionado && styles.celulaHoje,
              ]}
              onPress={() => setSelecionado(dia)}
            >
              <View style={ehHoje ? styles.diaNumeroHojeBadge : undefined}>
                <Text
                  style={[
                    styles.diaNumero,
                    foraDoMes && styles.diaForaDoMes,
                    ehHoje && styles.diaNumeroHoje,
                  ]}
                >
                  {dia.getDate()}
                </Text>
              </View>
              <View style={styles.listaItens}>
                {visiveis.map((item) => (
                  <Text key={item.id} style={styles.itemLinha} numberOfLines={1}>
                    <Text style={{ color: TIPO_COR[item.tipo] }}>● </Text>
                    {item.hora ? `${item.hora} ` : ''}
                    {item.titulo}
                  </Text>
                ))}
                {restantes > 0 && <Text style={styles.maisTexto}>Mais {restantes}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.detalhe}>
        <Text style={styles.detalheTitulo}>
          {selecionado.getDate()}/{selecionado.getMonth() + 1}
        </Text>
        {itensSelecionado.length === 0 ? (
          <Text style={styles.vazio}>Nada por aqui.</Text>
        ) : (
          itensSelecionado.map((item) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row' },
  headerLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: '700',
    color: colors.textMuted,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: {
    width: `${100 / 7}%`,
    minHeight: 92,
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    gap: 2,
  },
  celulaSelecionada: { backgroundColor: colors.lavandaClaro },
  celulaHoje: { backgroundColor: colors.card },
  diaNumero: { fontSize: 11, color: colors.text },
  diaNumeroHoje: { color: colors.text, fontWeight: '700' },
  diaNumeroHojeBadge: {
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaForaDoMes: { color: colors.textMuted, opacity: 0.5 },
  listaItens: { gap: 1 },
  itemLinha: { fontSize: 9, color: colors.text },
  maisTexto: { fontSize: 9, color: colors.textMuted },
  detalhe: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  detalheTitulo: { fontSize: 13, fontWeight: '700', color: colors.text },
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
