import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Child, childFullName } from '../types/child';
import {
  DailyLog,
  Despertar,
  DuracaoSoneca,
  RitualStep,
  SleepSchedule,
  StatusNoite,
} from '../types/sleep';
import { loadChildren } from '../storage/childrenStorage';
import {
  loadSchedules,
  saveSchedules,
  loadCompletions,
  saveCompletions,
  loadDailyLogs,
  saveDailyLogs,
} from '../storage/sleepStorage';
import { calcularIdade, todayKey } from '../utils/date';
import { addDays, addMonths, labelMesAno, startOfWeek } from '../utils/calendarDates';
import { ensurePermission, scheduleDailyReminder } from '../utils/notifications';
import ChipSelector from '../components/ChipSelector';
import HoraInput from '../components/HoraInput';
import SleepWeeklyCalendar from '../components/SleepWeeklyCalendar';

const IDADE_MAXIMA_SONECA = 5;

function emptySchedule(childId: string): SleepSchedule {
  return {
    childId,
    dormirSemana: '',
    dormirFimDeSemana: '',
    mesmoDormirFds: false,
    acordarSemana: '',
    acordarFimDeSemana: '',
    mesmoAcordarFds: false,
    tiraSoneca: false,
    horarioSoneca: '',
    duracaoSoneca: '',
    ritual: [],
    lembreteMinutos: '',
    notificationId: null,
  };
}

export default function SleepScreen() {
  const navigation = useNavigation<any>();
  const today = todayKey();

  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<SleepSchedule[]>([]);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [novoPasso, setNovoPasso] = useState('');
  const [dataReferencia, setDataReferencia] = useState(new Date());

  const [despertou, setDespertou] = useState('');
  const [adormeceu, setAdormeceu] = useState('');
  const [detalhesDespertar, setDetalhesDespertar] = useState('');
  const adormeceuRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      loadChildren().then((list) => {
        setChildren(list);
        setChildId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0]?.id ?? null));
      });
      loadSchedules().then(setSchedules);
      loadCompletions().then(setCompletions);
      loadDailyLogs().then(setLogs);
    }, []),
  );

  const child = children.find((c) => c.id === childId) || null;
  const idade = child ? calcularIdade(child.dataNascimento) : null;
  const podeSoneca = idade === null || idade <= IDADE_MAXIMA_SONECA;

  const schedule = useMemo(
    () => schedules.find((s) => s.childId === childId) || (childId ? emptySchedule(childId) : null),
    [schedules, childId],
  );

  async function persistSchedule(updated: SleepSchedule) {
    const others = schedules.filter((s) => s.childId !== updated.childId);
    const list = [...others, updated];
    setSchedules(list);
    await saveSchedules(list);
  }

  function updateSchedule<K extends keyof SleepSchedule>(key: K, value: SleepSchedule[K]) {
    if (!schedule) return;
    persistSchedule({ ...schedule, [key]: value });
  }

  function updateDormirSemana(v: string) {
    if (!schedule) return;
    const novo = { ...schedule, dormirSemana: v };
    if (schedule.mesmoDormirFds) novo.dormirFimDeSemana = v;
    persistSchedule(novo);
  }

  function toggleMesmoDormirFds(v: boolean) {
    if (!schedule) return;
    persistSchedule({
      ...schedule,
      mesmoDormirFds: v,
      dormirFimDeSemana: v ? schedule.dormirSemana : schedule.dormirFimDeSemana,
    });
  }

  function updateAcordarSemana(v: string) {
    if (!schedule) return;
    const novo = { ...schedule, acordarSemana: v };
    if (schedule.mesmoAcordarFds) novo.acordarFimDeSemana = v;
    persistSchedule(novo);
  }

  function toggleMesmoAcordarFds(v: boolean) {
    if (!schedule) return;
    persistSchedule({
      ...schedule,
      mesmoAcordarFds: v,
      acordarFimDeSemana: v ? schedule.acordarSemana : schedule.acordarFimDeSemana,
    });
  }

  async function handleToggleLembrete(minutos: string) {
    if (!schedule) return;

    if (minutos === schedule.lembreteMinutos) {
      updateSchedule('lembreteMinutos', '');
      return;
    }

    const granted = await ensurePermission();
    if (!granted && Platform.OS !== 'web') return;

    const [horaStr, minutoStr] = (schedule.dormirSemana || '20:00').split(':');
    let hour = Number(horaStr || '20');
    let minute = Number(minutoStr || '0') - Number(minutos);
    if (minute < 0) {
      minute += 60;
      hour = (hour - 1 + 24) % 24;
    }

    const notificationId = await scheduleDailyReminder(
      hour,
      minute,
      'Lumi — hora do ritual do sono',
      child
        ? `Hora de começar o ritual de dormir de ${childFullName(child)}.`
        : 'Hora de começar o ritual de dormir.',
    );

    await persistSchedule({ ...schedule, lembreteMinutos: minutos, notificationId });
  }

  async function handleAddPasso() {
    if (!schedule || !novoPasso.trim()) return;
    const passo: RitualStep = { id: Date.now().toString(), texto: novoPasso.trim() };
    updateSchedule('ritual', [...schedule.ritual, passo]);
    setNovoPasso('');
  }

  async function handleRemovePasso(id: string) {
    if (!schedule) return;
    updateSchedule('ritual', schedule.ritual.filter((p) => p.id !== id));
  }

  async function handleTogglePasso(stepId: string) {
    if (!childId) return;
    const key = `${childId}_${today}_${stepId}`;
    const updated = { ...completions, [key]: !completions[key] };
    setCompletions(updated);
    await saveCompletions(updated);
  }

  async function updateTodayLog(patch: Partial<Omit<DailyLog, 'id' | 'childId' | 'data'>>) {
    if (!childId) return;
    const existing = logs.find((l) => l.childId === childId && l.data === today);
    let updated: DailyLog[];
    if (existing) {
      updated = logs.map((l) => (l.id === existing.id ? { ...l, ...patch } : l));
    } else {
      updated = [
        ...logs,
        {
          id: Date.now().toString(),
          childId,
          data: today,
          status: '',
          observacao: '',
          despertares: [],
          ...patch,
        },
      ];
    }
    setLogs(updated);
    await saveDailyLogs(updated);
  }

  async function handleRegistrarStatus(status: StatusNoite) {
    const novoStatus = statusHoje === status ? '' : status;
    await updateTodayLog({ status: novoStatus });
  }

  async function handleAddDespertar() {
    if (!despertou.trim() && !adormeceu.trim() && !detalhesDespertar.trim()) return;
    const novo: Despertar = {
      id: Date.now().toString(),
      horarioDespertou: despertou.trim(),
      horarioAdormeceu: adormeceu.trim(),
      detalhes: detalhesDespertar.trim(),
    };
    await updateTodayLog({ despertares: [...despertaresHoje, novo] });
    setDespertou('');
    setAdormeceu('');
    setDetalhesDespertar('');
  }

  async function handleRemoveDespertar(id: string) {
    await updateTodayLog({ despertares: despertaresHoje.filter((d) => d.id !== id) });
  }

  function handleAnterior() {
    setDataReferencia((prev) => addDays(prev, -7));
  }

  function handleProximo() {
    setDataReferencia((prev) => addDays(prev, 7));
  }

  function handleHoje() {
    setDataReferencia(new Date());
  }

  const logHoje = logs.find((l) => l.childId === childId && l.data === today) || null;
  const statusHoje = logHoje?.status || '';
  const observacaoHoje = logHoje?.observacao || '';
  const despertaresHoje = logHoje?.despertares || [];

  const logsDoFilho = logs.filter((l) => l.childId === childId);

  if (children.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>Rotina do sono</Text>
        <Text style={styles.empty}>
          Cadastre um perfil de filho(a) na aba Perfis para configurar a rotina de sono.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Rotina do sono</Text>
        <Text style={styles.subtitle}>
          Foco em logística e hábito — sem dados de qualidade do sono ou diagnóstico.
        </Text>

        <View style={styles.row}>
          {children.map((c) => {
            const selected = childId === c.id;
            return (
              <Pressable
                key={c.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setChildId(c.id)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {c.avatar} {childFullName(c)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {schedule && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Rotina básica</Text>

            <Text style={styles.label}>Horário de dormir</Text>
            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.helper}>Semana</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={schedule.dormirSemana}
                  onChangeText={updateDormirSemana}
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.helper}>Fim de semana</Text>
                <TextInput
                  style={[styles.input, schedule.mesmoDormirFds && styles.inputDesabilitado]}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={schedule.dormirFimDeSemana}
                  onChangeText={(v) => updateSchedule('dormirFimDeSemana', v)}
                  editable={!schedule.mesmoDormirFds}
                  maxLength={5}
                />
              </View>
            </View>
            <Pressable
              style={styles.checkboxRow}
              onPress={() => toggleMesmoDormirFds(!schedule.mesmoDormirFds)}
            >
              <View style={[styles.checkbox, schedule.mesmoDormirFds && styles.checkboxChecked]}>
                {schedule.mesmoDormirFds && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Mesmo horário da semana</Text>
            </Pressable>

            <Text style={styles.label}>Horário de acordar</Text>
            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.helper}>Semana</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={schedule.acordarSemana}
                  onChangeText={updateAcordarSemana}
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.helper}>Fim de semana</Text>
                <TextInput
                  style={[styles.input, schedule.mesmoAcordarFds && styles.inputDesabilitado]}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={schedule.acordarFimDeSemana}
                  onChangeText={(v) => updateSchedule('acordarFimDeSemana', v)}
                  editable={!schedule.mesmoAcordarFds}
                  maxLength={5}
                />
              </View>
            </View>
            <Pressable
              style={styles.checkboxRow}
              onPress={() => toggleMesmoAcordarFds(!schedule.mesmoAcordarFds)}
            >
              <View style={[styles.checkbox, schedule.mesmoAcordarFds && styles.checkboxChecked]}>
                {schedule.mesmoAcordarFds && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Mesmo horário da semana</Text>
            </Pressable>

            {podeSoneca && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Soneca</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.label}>Tira soneca</Text>
                  <Switch
                    value={schedule.tiraSoneca}
                    onValueChange={(v) => updateSchedule('tiraSoneca', v)}
                  />
                </View>
                {schedule.tiraSoneca && (
                  <>
                    <Text style={styles.label}>Horário da soneca</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="HH:MM"
                      placeholderTextColor={colors.textMuted}
                      value={schedule.horarioSoneca}
                      onChangeText={(v) => updateSchedule('horarioSoneca', v)}
                      maxLength={5}
                    />
                    <ChipSelector
                      label="Duração da soneca"
                      options={['30 min', '1h', '1h30', '2h']}
                      value={schedule.duracaoSoneca}
                      onChange={(v) => updateSchedule('duracaoSoneca', v as DuracaoSoneca)}
                    />
                  </>
                )}
              </>
            )}

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Ritual pré-sono</Text>

            {schedule.ritual.map((passo) => {
              const key = `${childId}_${today}_${passo.id}`;
              const feito = !!completions[key];
              const ehHistoria = passo.texto.toLowerCase().includes('história');
              return (
                <View key={passo.id} style={styles.passoRow}>
                  <Pressable
                    style={styles.passoCheck}
                    onPress={() => handleTogglePasso(passo.id)}
                  >
                    <View style={[styles.checkbox, feito && styles.checkboxChecked]}>
                      {feito && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.passoText, feito && styles.passoTextDone]}>
                      {passo.texto}
                    </Text>
                  </Pressable>
                  {ehHistoria && (
                    <Pressable onPress={() => navigation.navigate('Histórias')}>
                      <Text style={styles.link}>📖 abrir</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => handleRemovePasso(passo.id)}>
                    <Text style={styles.itemRemove}>×</Text>
                  </Pressable>
                </View>
              );
            })}

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ex: banho, história, escovar dente, luz apagada"
                placeholderTextColor={colors.textMuted}
                value={novoPasso}
                onChangeText={setNovoPasso}
                onSubmitEditing={handleAddPasso}
              />
              <Pressable style={styles.addButton} onPress={handleAddPasso}>
                <Text style={styles.addButtonText}>+</Text>
              </Pressable>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Lembretes</Text>
            <ChipSelector
              label="Avisar antes de começar o ritual"
              options={['10', '15', '30', '60']}
              value={schedule.lembreteMinutos}
              onChange={handleToggleLembrete}
              customPlaceholder=""
            />
            <Text style={styles.helper}>
              Minutos antes do horário de dormir (dias de semana). Só funciona no app instalado
              no celular — sem efeito na visualização web.
            </Text>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Registro de hoje</Text>
            <ChipSelector
              label="Status da noite"
              options={['Dormiu no horário', 'Atrasou', 'Não dormiu em casa']}
              value={statusHoje}
              onChange={(v) => handleRegistrarStatus(v as StatusNoite)}
            />

            <Text style={styles.label}>Observação</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Alguma nota sobre a noite de hoje"
              placeholderTextColor={colors.textMuted}
              value={observacaoHoje}
              onChangeText={(v) => updateTodayLog({ observacao: v })}
              multiline
            />

            <Text style={styles.label}>Despertares noturnos</Text>
            {despertaresHoje.map((d) => (
              <View key={d.id} style={styles.despertarCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.despertarTitulo}>
                    Despertou {d.horarioDespertou || '?'} · dormiu de novo{' '}
                    {d.horarioAdormeceu || '?'}
                  </Text>
                  {d.detalhes ? (
                    <Text style={styles.despertarDetalhes}>{d.detalhes}</Text>
                  ) : null}
                </View>
                <Pressable onPress={() => handleRemoveDespertar(d.id)}>
                  <Text style={styles.itemRemove}>×</Text>
                </Pressable>
              </View>
            ))}

            <View style={styles.novoDespertar}>
              <View style={styles.timeRow}>
                <HoraInput
                  value={despertou}
                  onChangeText={setDespertou}
                  placeholder="Despertou HH:MM"
                  proximoCampoRef={adormeceuRef}
                  style={styles.horaInput}
                />
                <HoraInput
                  ref={adormeceuRef}
                  value={adormeceu}
                  onChangeText={setAdormeceu}
                  placeholder="Dormiu de novo HH:MM"
                  style={styles.horaInput}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Detalhes (opcional)"
                placeholderTextColor={colors.textMuted}
                value={detalhesDespertar}
                onChangeText={setDetalhesDespertar}
              />
              <Pressable style={styles.addDespertarButton} onPress={handleAddDespertar}>
                <Text style={styles.addButtonText}>Adicionar despertar</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.calendarHeader}>
          <Text style={styles.sectionTitle}>Resumo do sono</Text>
          <View style={styles.navRow}>
            <Pressable onPress={handleAnterior}>
              <Text style={styles.navSeta}>◀</Text>
            </Pressable>
            <Pressable onPress={handleHoje}>
              <Text style={styles.navLabel}>{labelMesAno(dataReferencia)}</Text>
            </Pressable>
            <Pressable onPress={handleProximo}>
              <Text style={styles.navSeta}>▶</Text>
            </Pressable>
          </View>
        </View>

        <SleepWeeklyCalendar
          inicioSemana={startOfWeek(dataReferencia)}
          schedule={schedule}
          logs={logsDoFilho}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.card,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textMuted },
  chipTextSelected: { color: colors.text, fontWeight: '600' },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  helper: { fontSize: 12, color: colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.brancoSuave,
  },
  inputDesabilitado: { opacity: 0.5 },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  timeRow: { flexDirection: 'row', gap: 10 },
  horaInput: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -4 },
  checkboxLabel: { fontSize: 12, color: colors.textMuted },
  addButton: {
    width: 42,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { fontSize: 14, fontWeight: '700', color: colors.text },
  passoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  passoCheck: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brancoSuave,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { fontSize: 12, color: colors.text, fontWeight: '700' },
  passoText: { flex: 1, fontSize: 14, color: colors.text },
  passoTextDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  itemRemove: { fontSize: 16, color: colors.textMuted, paddingHorizontal: 4 },
  link: { fontSize: 12, color: colors.text, fontWeight: '600' },
  despertarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brancoSuave,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  despertarTitulo: { fontSize: 13, fontWeight: '600', color: colors.text },
  despertarDetalhes: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  novoDespertar: {
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
  },
  addDespertarButton: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  calendarHeader: { marginTop: 24, marginBottom: 12, gap: 8 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  navSeta: { fontSize: 16, color: colors.text, paddingHorizontal: 8 },
  navLabel: { fontSize: 14, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
});
