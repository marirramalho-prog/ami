import React, { useCallback, useRef, useState } from 'react';
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
import { Child } from '../types/child';
import { Caregiver } from '../types/caregiver';
import { AgendaEvent, ChecklistTemplate } from '../types/routine';
import { loadChildren } from '../storage/childrenStorage';
import { loadCaregivers } from '../storage/caregiverStorage';
import { loadEvents, saveEvents, loadChecklists } from '../storage/routineStorage';
import { isValidDatePart } from '../utils/date';
import { ensurePermission, scheduleReminder, cancelReminder } from '../utils/notifications';
import ChildSelector from '../components/ChildSelector';
import CaregiverSelector from '../components/CaregiverSelector';
import WeeklyCalendar from '../components/WeeklyCalendar';
import MonthlyCalendar from '../components/MonthlyCalendar';
import DateFields from '../components/DateFields';
import HoraInput from '../components/HoraInput';
import { addDays, addMonths, labelMesAno, startOfWeek } from '../utils/calendarDates';

type Visualizacao = 'semana' | 'mes';

const emptyForm = {
  titulo: '',
  dia: '',
  mes: '',
  ano: '',
  hora: '',
  horaFim: '',
  local: '',
  childIds: [] as string[],
  caregiverIds: [] as string[],
  lembrete: false,
};

export default function AgendaScreen() {
  const navigation = useNavigation<any>();
  const [children, setChildren] = useState<Child[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('semana');
  const [dataReferencia, setDataReferencia] = useState(new Date());
  const horaInicioRef = useRef<TextInput>(null);
  const horaFimRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      loadChildren().then(setChildren);
      loadCaregivers().then(setCaregivers);
      loadEvents().then(setEvents);
      loadChecklists().then(setChecklists);
    }, []),
  );

  function handleOpenChecklist(templateId: string) {
    navigation.navigate('Checklist', { highlightId: templateId });
  }

  function updateForm<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleToggleLembrete(value: boolean) {
    if (value) {
      const granted = await ensurePermission();
      if (!granted && Platform.OS !== 'web') {
        return;
      }
    }
    updateForm('lembrete', value);
  }

  async function handleAdd() {
    if (!form.titulo.trim()) return;
    if (!isValidDatePart({ dia: form.dia, mes: form.mes, ano: form.ano })) return;

    const base: AgendaEvent = {
      id: Date.now().toString(),
      titulo: form.titulo.trim(),
      data: { dia: form.dia.trim(), mes: form.mes.trim(), ano: form.ano.trim() },
      hora: form.hora.trim(),
      horaFim: form.horaFim.trim(),
      local: form.local.trim(),
      childIds: form.childIds,
      caregiverIds: form.caregiverIds,
      lembrete: form.lembrete,
      notificationId: null,
    };

    if (base.lembrete) {
      base.notificationId = await scheduleReminder(base);
    }

    const updated = [...events, base].sort((a, b) => {
      const da = `${a.data.ano}-${a.data.mes}-${a.data.dia}`;
      const db = `${b.data.ano}-${b.data.mes}-${b.data.dia}`;
      return da.localeCompare(db);
    });

    setEvents(updated);
    await saveEvents(updated);
    setForm(emptyForm);
  }

  async function handleRemove(id: string) {
    const target = events.find((e) => e.id === id);
    if (target) await cancelReminder(target.notificationId);
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    await saveEvents(updated);
  }

  const dataValida = isValidDatePart({ dia: form.dia, mes: form.mes, ano: form.ano });
  const podeAdicionar = form.titulo.trim().length > 0 && dataValida;

  function handleAnterior() {
    setDataReferencia((prev) =>
      visualizacao === 'semana' ? addDays(prev, -7) : addMonths(prev, -1),
    );
  }

  function handleProximo() {
    setDataReferencia((prev) =>
      visualizacao === 'semana' ? addDays(prev, 7) : addMonths(prev, 1),
    );
  }

  function handleHoje() {
    setDataReferencia(new Date());
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Agenda e lembretes</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="O que é? (ex: consulta, aniversário)"
            placeholderTextColor={colors.textMuted}
            value={form.titulo}
            onChangeText={(v) => updateForm('titulo', v)}
          />

          <Text style={styles.label}>Data</Text>
          <DateFields
            dia={form.dia}
            mes={form.mes}
            ano={form.ano}
            onChangeDia={(v) => updateForm('dia', v)}
            onChangeMes={(v) => updateForm('mes', v)}
            onChangeAno={(v) => updateForm('ano', v)}
            proximoCampoRef={horaInicioRef}
          />
          {!dataValida && (form.dia || form.mes || form.ano) && (
            <Text style={styles.warning}>Data incompleta ou inválida.</Text>
          )}

          <Text style={styles.label}>Horário</Text>
          <View style={styles.horaRow}>
            <HoraInput
              ref={horaInicioRef}
              value={form.hora}
              onChangeText={(v) => updateForm('hora', v)}
              placeholder="Início HH:MM"
              proximoCampoRef={horaFimRef}
              style={styles.horaInput}
            />
            <HoraInput
              ref={horaFimRef}
              value={form.horaFim}
              onChangeText={(v) => updateForm('horaFim', v)}
              placeholder="Fim HH:MM"
              style={styles.horaInput}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Local (endereço)"
            placeholderTextColor={colors.textMuted}
            value={form.local}
            onChangeText={(v) => updateForm('local', v)}
          />

          <ChildSelector
            children={children}
            value={form.childIds}
            onChange={(v) => updateForm('childIds', v)}
          />

          <CaregiverSelector
            caregivers={caregivers}
            value={form.caregiverIds}
            onChange={(v) => updateForm('caregiverIds', v)}
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Lembrete por notificação push</Text>
            <Switch value={form.lembrete} onValueChange={handleToggleLembrete} />
          </View>
          {Platform.OS === 'web' && (
            <Text style={styles.helper}>
              Notificações push não funcionam na visualização web — testar no app instalado (Expo
              Go) no celular.
            </Text>
          )}

          <Pressable
            style={[styles.button, !podeAdicionar && styles.buttonDisabled]}
            onPress={handleAdd}
            disabled={!podeAdicionar}
          >
            <Text style={styles.buttonText}>Adicionar à agenda</Text>
          </Pressable>
        </View>

        <View style={styles.calendarHeader}>
          <View style={styles.visualizacaoRow}>
            <Pressable
              style={[styles.visToggle, visualizacao === 'semana' && styles.visToggleAtivo]}
              onPress={() => setVisualizacao('semana')}
            >
              <Text
                style={[
                  styles.visToggleTexto,
                  visualizacao === 'semana' && styles.visToggleTextoAtivo,
                ]}
              >
                Semana
              </Text>
            </Pressable>
            <Pressable
              style={[styles.visToggle, visualizacao === 'mes' && styles.visToggleAtivo]}
              onPress={() => setVisualizacao('mes')}
            >
              <Text
                style={[
                  styles.visToggleTexto,
                  visualizacao === 'mes' && styles.visToggleTextoAtivo,
                ]}
              >
                Mês
              </Text>
            </Pressable>
          </View>

          <View style={styles.navRow}>
            <Pressable onPress={handleAnterior}>
              <Text style={styles.navSeta}>◀</Text>
            </Pressable>
            <Pressable onPress={handleHoje}>
              <Text style={styles.navLabel}>
                {visualizacao === 'semana'
                  ? labelMesAno(dataReferencia)
                  : labelMesAno(dataReferencia)}
              </Text>
            </Pressable>
            <Pressable onPress={handleProximo}>
              <Text style={styles.navSeta}>▶</Text>
            </Pressable>
          </View>
        </View>

        {visualizacao === 'semana' ? (
          <WeeklyCalendar
            inicioSemana={startOfWeek(dataReferencia)}
            children={children}
            events={events}
            caregivers={caregivers}
            checklists={checklists}
            onRemoveEvento={handleRemove}
            onOpenChecklist={handleOpenChecklist}
          />
        ) : (
          <MonthlyCalendar
            mesReferencia={dataReferencia}
            children={children}
            events={events}
            caregivers={caregivers}
            checklists={checklists}
            onRemoveEvento={handleRemove}
            onOpenChecklist={handleOpenChecklist}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 16 },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  helper: { fontSize: 12, color: colors.textMuted, marginTop: -4 },
  calendarHeader: { marginTop: 28, marginBottom: 12, gap: 10 },
  horaRow: { flexDirection: 'row', gap: 8 },
  horaInput: { flex: 1 },
  visualizacaoRow: { flexDirection: 'row', gap: 8 },
  visToggle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  visToggleAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  visToggleTexto: { fontSize: 13, color: colors.textMuted },
  visToggleTextoAtivo: { color: colors.text, fontWeight: '600' },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  navSeta: { fontSize: 16, color: colors.text, paddingHorizontal: 8 },
  navLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.brancoSuave,
  },
  dateRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  dateInputSmall: { width: 60, textAlign: 'center' },
  dateInputLarge: { width: 90, textAlign: 'center' },
  warning: { fontSize: 12, color: '#B5555A', marginTop: -4 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.text, fontWeight: '600' },
  list: { paddingVertical: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardDetail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  remove: { color: colors.textMuted, fontSize: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
});
