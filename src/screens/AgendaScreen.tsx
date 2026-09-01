import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  FlatList,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Child, childFullName } from '../types/child';
import { Caregiver } from '../types/caregiver';
import { AgendaEvent } from '../types/routine';
import { loadChildren } from '../storage/childrenStorage';
import { loadCaregivers } from '../storage/caregiverStorage';
import { loadEvents, saveEvents } from '../storage/routineStorage';
import { isValidDatePart } from '../utils/date';
import { ensurePermission, scheduleReminder, cancelReminder } from '../utils/notifications';
import ChildSelector from '../components/ChildSelector';
import CaregiverSelector from '../components/CaregiverSelector';

const emptyForm = {
  titulo: '',
  dia: '',
  mes: '',
  ano: '',
  hora: '',
  childId: null as string | null,
  caregiverId: null as string | null,
  lembrete: false,
};

export default function AgendaScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [form, setForm] = useState(emptyForm);

  useFocusEffect(
    useCallback(() => {
      loadChildren().then(setChildren);
      loadCaregivers().then(setCaregivers);
      loadEvents().then(setEvents);
    }, []),
  );

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
      childId: form.childId,
      caregiverId: form.caregiverId,
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
          <View style={styles.dateRow}>
            <TextInput
              style={[styles.input, styles.dateInputSmall]}
              placeholder="DD"
              placeholderTextColor={colors.textMuted}
              value={form.dia}
              onChangeText={(v) => updateForm('dia', v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={2}
            />
            <TextInput
              style={[styles.input, styles.dateInputSmall]}
              placeholder="MM"
              placeholderTextColor={colors.textMuted}
              value={form.mes}
              onChangeText={(v) => updateForm('mes', v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={2}
            />
            <TextInput
              style={[styles.input, styles.dateInputLarge]}
              placeholder="AAAA"
              placeholderTextColor={colors.textMuted}
              value={form.ano}
              onChangeText={(v) => updateForm('ano', v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={4}
            />
            <TextInput
              style={[styles.input, styles.dateInputLarge]}
              placeholder="HH:MM"
              placeholderTextColor={colors.textMuted}
              value={form.hora}
              onChangeText={(v) => updateForm('hora', v)}
              maxLength={5}
            />
          </View>
          {!dataValida && (form.dia || form.mes || form.ano) && (
            <Text style={styles.warning}>Data incompleta ou inválida.</Text>
          )}

          <ChildSelector
            children={children}
            value={form.childId}
            onChange={(v) => updateForm('childId', v)}
          />

          <CaregiverSelector
            caregivers={caregivers}
            value={form.caregiverId}
            onChange={(v) => updateForm('caregiverId', v)}
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

        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const child = children.find((c) => c.id === item.childId);
            const caregiver = caregivers.find((c) => c.id === item.caregiverId);
            return (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  <Text style={styles.cardDetail}>
                    {item.data.dia}/{item.data.mes}/{item.data.ano}
                    {item.hora ? ` às ${item.hora}` : ''}
                    {child ? ` · ${child.avatar} ${childFullName(child)}` : ''}
                    {caregiver ? ` · 👤 ${caregiver.nomeCompleto}` : ''}
                    {item.lembrete ? ' · 🔔' : ''}
                  </Text>
                </View>
                <Pressable onPress={() => handleRemove(item.id)}>
                  <Text style={styles.remove}>remover</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum evento cadastrado ainda.</Text>}
        />
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
