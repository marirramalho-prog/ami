import React, { useCallback, useState } from 'react';
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
import { confirmAction } from '../utils/confirm';
import ChipSelector from '../components/ChipSelector';
import DateFields from '../components/DateFields';

const RELACOES = ['Mãe', 'Pai', 'Avó', 'Avô', 'Babá'];

const emptyForm = {
  nomeCompleto: '',
  dia: '',
  mes: '',
  ano: '',
  relacao: '',
  celular: '',
  email: '',
  principal: false,
};

export default function CaregiversScreen() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadCaregivers().then((loaded) => {
        setCaregivers(loaded);
        // primeiro cuidador cadastrado: sugere já como principal (quem
        // baixou o app), mas a pessoa pode desmarcar se quiser.
        if (loaded.length === 0) setForm((prev) => ({ ...prev, principal: true }));
      });
    }, []),
  );

  function updateForm<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleEdit(caregiver: Caregiver) {
    setEditingId(caregiver.id);
    setForm({
      nomeCompleto: caregiver.nomeCompleto,
      dia: caregiver.dataNascimento.dia,
      mes: caregiver.dataNascimento.mes,
      ano: caregiver.dataNascimento.ano,
      relacao: caregiver.relacao,
      celular: caregiver.celular,
      email: caregiver.email,
      principal: caregiver.principal,
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.nomeCompleto.trim()) return;
    if (!isValidDatePart({ dia: form.dia, mes: form.mes, ano: form.ano })) return;

    const dados: Omit<Caregiver, 'id'> = {
      nomeCompleto: form.nomeCompleto.trim(),
      dataNascimento: { dia: form.dia.trim(), mes: form.mes.trim(), ano: form.ano.trim() },
      relacao: form.relacao,
      celular: form.celular.trim(),
      email: form.email.trim(),
      principal: form.principal,
    };

    let updated = editingId
      ? caregivers.map((c) => (c.id === editingId ? { id: editingId, ...dados } : c))
      : [...caregivers, { id: Date.now().toString(), ...dados }];

    // só um cuidador pode ser o principal por vez
    if (dados.principal) {
      const idPrincipal = editingId ?? updated[updated.length - 1].id;
      updated = updated.map((c) => ({ ...c, principal: c.id === idPrincipal }));
    }

    setCaregivers(updated);
    await saveCaregivers(updated);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleRemove(id: string) {
    const caregiver = caregivers.find((c) => c.id === id);
    confirmAction(
      'Remover cuidador?',
      `"${caregiver?.nomeCompleto || 'este cuidador'}" será removido. Essa ação não pode ser desfeita.`,
      async () => {
        const updated = caregivers.filter((c) => c.id !== id);
        setCaregivers(updated);
        await saveCaregivers(updated);
        if (editingId === id) handleCancelEdit();
      },
    );
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
                  <View style={styles.nomeRow}>
                    <Text style={styles.cardName}>{item.nomeCompleto}</Text>
                    {item.principal && (
                      <View style={styles.principalTag}>
                        <Text style={styles.principalTagTexto}>Você</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardDetail}>
                    {[item.relacao, idade !== null && `${idade} anos`].filter(Boolean).join(' · ')}
                  </Text>
                  {(item.celular || item.email) && (
                    <Text style={styles.cardDetail}>
                      {[item.celular, item.email].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </View>
                <Pressable onPress={() => handleEdit(item)}>
                  <Text style={styles.edit}>editar</Text>
                </Pressable>
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

        <View style={styles.form}>
          <View style={styles.formHeaderRow}>
            <Text style={styles.label}>
              {editingId ? `Editando ${form.nomeCompleto || 'cuidador(a)'}` : 'Novo cuidador(a)'}
            </Text>
            {editingId && (
              <Pressable onPress={handleCancelEdit}>
                <Text style={styles.cancelEdit}>cancelar</Text>
              </Pressable>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor={colors.textMuted}
            value={form.nomeCompleto}
            onChangeText={(v) => updateForm('nomeCompleto', v)}
          />

          <Text style={styles.label}>Data de nascimento</Text>
          <DateFields
            dia={form.dia}
            mes={form.mes}
            ano={form.ano}
            onChangeDia={(v) => updateForm('dia', v)}
            onChangeMes={(v) => updateForm('mes', v)}
            onChangeAno={(v) => updateForm('ano', v)}
          />
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

          <TextInput
            style={styles.input}
            placeholder="Celular"
            placeholderTextColor={colors.textMuted}
            value={form.celular}
            onChangeText={(v) => updateForm('celular', v)}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.textMuted}
            value={form.email}
            onChangeText={(v) => updateForm('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Pressable
            style={[styles.toggleChip, form.principal && styles.toggleChipSelected]}
            onPress={() => updateForm('principal', !form.principal)}
            accessibilityRole="switch"
            accessibilityState={{ checked: form.principal }}
          >
            <Text style={[styles.toggleChipText, form.principal && styles.toggleChipTextSelected]}>
              Esse sou eu (uso principal do app)
            </Text>
          </Pressable>
          <Text style={styles.helper}>
            Marca quem baixou o app neste aparelho — só um cuidador pode ser o principal.
          </Text>

          <Pressable
            style={[styles.button, !podeAdicionar && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!podeAdicionar}
          >
            <Text style={styles.buttonText}>
              {editingId ? 'Salvar alterações' : 'Adicionar cuidador(a)'}
            </Text>
          </Pressable>
        </View>
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
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  warning: { fontSize: 12, color: '#B5555A', marginTop: -4 },
  helper: { fontSize: 12, color: colors.textMuted, marginTop: -4 },
  toggleChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.brancoSuave,
  },
  toggleChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleChipText: { fontSize: 13, color: colors.textMuted },
  toggleChipTextSelected: { color: colors.text, fontWeight: '600' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.text, fontWeight: '600' },
  list: { paddingBottom: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  nomeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.text },
  principalTag: {
    backgroundColor: colors.lavandaClaro,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  principalTagTexto: { fontSize: 10, fontWeight: '700', color: colors.text },
  cardDetail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  edit: { color: colors.text, fontSize: 12, fontWeight: '600' },
  remove: { color: colors.textMuted, fontSize: 12 },
  cancelEdit: { color: colors.textMuted, fontSize: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
});
