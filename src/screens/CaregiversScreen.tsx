import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Caregiver } from '../types/caregiver';
import { loadCaregivers, saveCaregivers } from '../storage/caregiverStorage';
import { calcularIdade, isValidDatePart } from '../utils/date';
import ChipSelector from '../components/ChipSelector';

const RELACOES = ['Mãe', 'Pai', 'Avó', 'Avô', 'Babá'];

const emptyForm = {
  nomeCompleto: '',
  dia: '',
  mes: '',
  ano: '',
  relacao: '',
};

export default function CaregiversScreen() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [form, setForm] = useState(emptyForm);

  useFocusEffect(
    React.useCallback(() => {
      loadCaregivers().then(setCaregivers);
    }, []),
  );

  function updateForm<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd() {
    if (!form.nomeCompleto.trim()) return;
    if (!isValidDatePart({ dia: form.dia, mes: form.mes, ano: form.ano })) return;

    const caregiver: Caregiver = {
      id: Date.now().toString(),
      nomeCompleto: form.nomeCompleto.trim(),
      dataNascimento: { dia: form.dia.trim(), mes: form.mes.trim(), ano: form.ano.trim() },
      relacao: form.relacao,
    };

    const updated = [...caregivers, caregiver];
    setCaregivers(updated);
    await saveCaregivers(updated);
    setForm(emptyForm);
  }

  async function handleRemove(id: string) {
    const updated = caregivers.filter((c) => c.id !== id);
    setCaregivers(updated);
    await saveCaregivers(updated);
  }

  const dataValida = isValidDatePart({ dia: form.dia, mes: form.mes, ano: form.ano });
  const podeAdicionar = form.nomeCompleto.trim().length > 0 && dataValida;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Cuidadores</Text>
        <Text style={styles.subtitle}>
          Quem cuida das crianças e pode ser responsável por tarefas e atividades.
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor={colors.textMuted}
            value={form.nomeCompleto}
            onChangeText={(v) => updateForm('nomeCompleto', v)}
          />

          <Text style={styles.label}>Data de nascimento</Text>
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
          </View>
          {!dataValida && (form.dia || form.mes || form.ano) && (
            <Text style={styles.warning}>Data incompleta ou inválida.</Text>
          )}

          <ChipSelector
            label="Relação"
            options={RELACOES}
            value={form.relacao}
            onChange={(v) => updateForm('relacao', v)}
            allowCustom
            customPlaceholder="Ou digite outra relação"
          />

          <Pressable
            style={[styles.button, !podeAdicionar && styles.buttonDisabled]}
            onPress={handleAdd}
            disabled={!podeAdicionar}
          >
            <Text style={styles.buttonText}>Adicionar cuidador(a)</Text>
          </Pressable>
        </View>

        <FlatList
          data={caregivers}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const idade = calcularIdade(item.dataNascimento);
            return (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.nomeCompleto}</Text>
                  <Text style={styles.cardDetail}>
                    {[item.relacao, idade !== null && `${idade} anos`].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Pressable onPress={() => handleRemove(item.id)}>
                  <Text style={styles.remove}>remover</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum cuidador cadastrado ainda.</Text>
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: 16 },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.brancoSuave,
  },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateInputSmall: { width: 60, textAlign: 'center' },
  dateInputLarge: { width: 90, textAlign: 'center' },
  warning: { fontSize: 12, color: '#B5555A', marginTop: -4 },
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
  cardName: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardDetail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  remove: { color: colors.textMuted, fontSize: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
});
