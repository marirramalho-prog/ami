import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { DailyLog, SleepSchedule } from '../types/sleep';
import { addDays, isSameDay } from '../utils/calendarDates';
import { dateKey } from '../utils/date';

interface Props {
  inicioSemana: Date;
  schedule: SleepSchedule | null;
  logs: DailyLog[];
}

const DIAS_HEADER = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];
const COR_SONECA = colors.azulClaro;
const COR_NOITE = colors.lilasSuave;

interface ResumoDia {
  soneca: boolean;
  log: DailyLog | null;
}

function resumoDoDia(date: Date, schedule: SleepSchedule | null, logs: DailyLog[]): ResumoDia {
  const key = dateKey(date);
  const log = logs.find((l) => l.data === key) || null;
  return { soneca: !!schedule?.tiraSoneca, log };
}

export default function SleepWeeklyCalendar({ inicioSemana, schedule, logs }: Props) {
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));
  const hoje = new Date();
  const [selecionado, setSelecionado] = useState<Date>(hoje);

  const resumoSelecionado = resumoDoDia(selecionado, schedule, logs);

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.grid}>
        {dias.map((dia, i) => {
          const resumo = resumoDoDia(dia, schedule, logs);
          const ehHoje = isSameDay(dia, hoje);
          const ehSelecionado = isSameDay(dia, selecionado);
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
              <Text style={styles.headerLabel}>{DIAS_HEADER[i]}</Text>
              <View style={ehHoje ? styles.diaNumeroHojeBadge : undefined}>
                <Text style={[styles.diaNumero, ehHoje && styles.diaNumeroHoje]}>
                  {dia.getDate()}
                </Text>
              </View>
              <View style={styles.listaItens}>
                {resumo.soneca && (
                  <Text style={styles.itemLinha} numberOfLines={1}>
                    <Text style={{ color: COR_SONECA }}>● </Text>Soneca
                  </Text>
                )}
                {resumo.log?.status ? (
                  <Text style={styles.itemLinha} numberOfLines={1}>
                    <Text style={{ color: COR_NOITE }}>● </Text>
                    {resumo.log.status}
                  </Text>
                ) : null}
                {resumo.log && resumo.log.despertares.length > 0 && (
                  <Text style={styles.itemLinha} numberOfLines={1}>
                    <Text style={{ color: COR_NOITE }}>● </Text>
                    {resumo.log.despertares.length}{' '}
                    {resumo.log.despertares.length === 1 ? 'despertar' : 'despertares'}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.detalhe}>
        <Text style={styles.detalheTitulo}>
          {selecionado.getDate()}/{selecionado.getMonth() + 1}
        </Text>
        {!resumoSelecionado.soneca && !resumoSelecionado.log ? (
          <Text style={styles.vazio}>Nada por aqui.</Text>
        ) : (
          <>
            {resumoSelecionado.soneca && (
              <View style={[styles.item, { borderLeftColor: COR_SONECA }]}>
                <Text style={styles.itemTitulo}>
                  Soneca{schedule?.horarioSoneca ? ` · ${schedule.horarioSoneca}` : ''}
                  {schedule?.duracaoSoneca ? ` (${schedule.duracaoSoneca})` : ''}
                </Text>
              </View>
            )}
            {resumoSelecionado.log?.status ? (
              <View style={[styles.item, { borderLeftColor: COR_NOITE }]}>
                <Text style={styles.itemTitulo}>{resumoSelecionado.log.status}</Text>
              </View>
            ) : null}
            {resumoSelecionado.log?.observacao ? (
              <View style={[styles.item, { borderLeftColor: COR_NOITE }]}>
                <Text style={styles.itemSubtitulo}>{resumoSelecionado.log.observacao}</Text>
              </View>
            ) : null}
            {resumoSelecionado.log?.despertares.map((d) => (
              <View key={d.id} style={[styles.item, { borderLeftColor: COR_NOITE }]}>
                <Text style={styles.itemTitulo}>
                  Despertou {d.horarioDespertou || '?'} · dormiu de novo {d.horarioAdormeceu || '?'}
                </Text>
                {d.detalhes ? <Text style={styles.itemSubtitulo}>{d.detalhes}</Text> : null}
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row' },
  celula: {
    flex: 1,
    minHeight: 120,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
    gap: 3,
  },
  celulaSelecionada: { backgroundColor: colors.lavandaClaro },
  celulaHoje: { backgroundColor: colors.card },
  headerLabel: { fontSize: 8, fontWeight: '700', color: colors.textMuted },
  diaNumero: { fontSize: 12, color: colors.text },
  diaNumeroHoje: { color: colors.text, fontWeight: '700' },
  diaNumeroHojeBadge: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listaItens: { gap: 2, width: '100%' },
  itemLinha: { fontSize: 8, color: colors.text },
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
  item: { borderLeftWidth: 3, paddingLeft: 8, paddingVertical: 2 },
  itemTitulo: { fontSize: 13, color: colors.text, fontWeight: '600' },
  itemSubtitulo: { fontSize: 12, color: colors.textMuted },
});
