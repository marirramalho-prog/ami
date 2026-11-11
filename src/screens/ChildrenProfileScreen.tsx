import React, { useCallback, useMemo, useState } from 'react';
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
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';
import { Child, childFullName, Turno } from '../types/child';
import { AtividadeExtracurricular } from '../types/weeklyRoutine';
import { loadChildren, saveChildren } from '../storage/childrenStorage';
import { calcularIdade, isValidDatePart } from '../utils/date';
import TagInput from '../components/TagInput';
import AvatarPicker, { AVATAR_OPTIONS } from '../components/AvatarPicker';
import TurnoSelector from '../components/TurnoSelector';
import AtividadesEditor, { resumoDias } from '../components/AtividadesEditor';
import DateFields from '../components/DateFields';
import { syncChecklistsForAllChildren, removeChecklistsForChild } from '../utils/checklistSync';
import { confirmAction } from '../utils/confirm';

const TURNO_LABEL: Record<Exclude<Turno, ''>, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  integral: 'Integral',
};

const emptyForm = {
  nome: '',
  dia: '',
  mes: '',
  ano: '',
  avatar: AVATAR_OPTIONS[0],
  escola: '',
  naoVaiEscola: false,
  turnoEscolar: '' as Turno,
  atividades: [] as AtividadeExtracurricular[],
  interesses: [] as string[],
  observacoes: '',
};

export default function ChildrenProfileScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [children, setChildren] = useState<Child[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadChildren().then(setChildren);
    }, []),
  );

  function updateForm<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleToggleNaoVaiEscola() {
    setForm((prev) => ({ ...prev, naoVaiEscola: !prev.naoVaiEscola, escola: '' }));
  }

  function handleEdit(child: Child) {
    setEditingId(child.id);
    setForm({
      nome: child.nome,
      dia: child.dataNascimento.dia,
      mes: child.dataNascimento.mes,
      ano: child.dataNascimento.ano,
      avatar: child.avatar,
      escola: child.escola,
      naoVaiEscola: child.naoVaiEscola,
      turnoEscolar: child.turnoEscolar,
      atividades: child.atividades,
      interesses: child.interesses,
      observacoes: child.observacoes,
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.nome.trim()) return;
    if (!isValidDatePart({ dia: form.dia, mes: form.mes, ano: form.ano })) return;
    if (!form.naoVaiEscola && !form.escola.trim()) return;

    const dadosFilho: Omit<Child, 'id'> = {
      nome: form.nome.trim(),
      dataNascimento: { dia: form.dia.trim(), mes: form.mes.trim(), ano: form.ano.trim() },
      avatar: form.avatar,
      escola: form.escola.trim(),
      naoVaiEscola: form.naoVaiEscola,
      turnoEscolar: form.turnoEscolar,
      atividades: form.atividades,
      interesses: form.interesses,
      observacoes: form.observacoes.trim(),
    };

    const updated = editingId
      ? children.map((c) => (c.id === editingId ? { id: editingId, ...dadosFilho } : c))
      : [...children, { id: Date.now().toString(), ...dadosFilho }];

    setChildren(updated);
    await saveChildren(updated);
    await syncChecklistsForAllChildren(updated);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleRemove(id: string) {
    const child = children.find((c) => c.id === id);
    confirmAction(
      'Remover perfil?',
      `O perfil de "${child ? childFullName(child) : 'este filho'}" e os checklists vinculados a ele serão removidos. Essa ação não pode ser desfeita.`,
      async () => {
        const updated = children.filter((c) => c.id !== id);
        setChildren(updated);
        await saveChildren(updated);
        await removeChecklistsForChild(id);
        if (editingId === id) handleCancelEdit();
      },
    );
  }

  const dataValida = isValidDatePart({ dia: form.dia, mes: form.mes, ano: form.ano });
  const podeAdicionar =
    form.nome.trim().length > 0 &&
    dataValida &&
    (form.naoVaiEscola || form.escola.trim().length > 0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Perfis dos filhos</Text>
        <Text style={styles.privacyNote}>
          Esses dados ficam guardados só neste aparelho — a Âmi não envia nada pra fora sem te
          avisar.
        </Text>

        <FlatList
          data={children}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const idade = calcularIdade(item.dataNascimento);
            const turnoLabel = item.turnoEscolar ? TURNO_LABEL[item.turnoEscolar] : '';
            const escolaLabel = item.naoVaiEscola ? 'Não vai à escola' : item.escola;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardAvatar}>{item.avatar}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{childFullName(item)}</Text>
                    <Text style={styles.cardDetail}>
                      {[idade !== null && `${idade} anos`, escolaLabel, turnoLabel]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleEdit(item)}>
                    <Text style={styles.edit}>editar</Text>
                  </Pressable>
                  <Pressable onPress={() => handleRemove(item.id)}>
                    <Text style={styles.remove}>remover</Text>
                  </Pressable>
                </View>

                {item.atividades.length > 0 && (
                  <Text style={styles.cardTags}>
                    Atividades:{' '}
                    {item.atividades
                      .map((a) => {
                        const dias = resumoDias(a.diasSemana);
                        return dias ? `${a.nome} (${dias})` : a.nome;
                      })
                      .join(', ')}
                  </Text>
                )}
                {item.interesses.length > 0 && (
                  <Text style={styles.cardTags}>Interesses: {item.interesses.join(', ')}</Text>
                )}
                {item.observacoes ? (
                  <Text style={styles.cardTags}>Obs: {item.observacoes}</Text>
                ) : null}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum perfil cadastrado ainda.</Text>
          }
        />

        <View style={styles.form}>
          <View style={styles.formHeaderRow}>
            <Text style={styles.sectionTitle}>
              {editingId ? `Editando ${form.nome || 'perfil'}` : 'Campos obrigatórios'}
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
            value={form.nome}
            onChangeText={(v) => updateForm('nome', v)}
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

          <AvatarPicker value={form.avatar} onChange={(v) => updateForm('avatar', v)} />

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Contexto de rotina</Text>

          {!form.naoVaiEscola && (
            <TextInput
              style={styles.input}
              placeholder="Escola"
              placeholderTextColor={colors.textMuted}
              value={form.escola}
              onChangeText={(v) => updateForm('escola', v)}
            />
          )}
          <Pressable
            style={[styles.toggleChip, form.naoVaiEscola && styles.toggleChipSelected]}
            onPress={handleToggleNaoVaiEscola}
          >
            <Text
              style={[styles.toggleChipText, form.naoVaiEscola && styles.toggleChipTextSelected]}
            >
              Não vai à escola
            </Text>
          </Pressable>
          {!form.naoVaiEscola && !form.escola.trim() && (
            <Text style={styles.warning}>Informe a escola ou marque "Não vai à escola".</Text>
          )}

          {!form.naoVaiEscola && (
            <TurnoSelector
              value={form.turnoEscolar}
              onChange={(v) => updateForm('turnoEscolar', v)}
            />
          )}

          <AtividadesEditor value={form.atividades} onChange={(v) => updateForm('atividades', v)} />

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Personalização</Text>

          <TagInput
            label="Interesses / hobbies"
            placeholder="Ex: dinossauros"
            values={form.interesses}
            onChange={(v) => updateForm('interesses', v)}
          />

          <Text style={styles.label}>Observações gerais</Text>
          <Text style={styles.helper}>
            Só notas do dia a dia (preferências, rotina). Não use este campo para dados de saúde.
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Observações"
            placeholderTextColor={colors.textMuted}
            value={form.observacoes}
            onChangeText={(v) => updateForm('observacoes', v)}
            multiline
          />

          <Pressable
            style={[styles.button, !podeAdicionar && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!podeAdicionar}
          >
            <Text style={styles.buttonText}>
              {editingId ? 'Salvar alterações' : 'Adicionar filho(a)'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(colors: Colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  privacyNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  helper: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
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
  nomeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateInputSmall: {
    width: 60,
    textAlign: 'center',
  },
  dateInputLarge: {
    width: 90,
    textAlign: 'center',
  },
  warning: {
    fontSize: 12,
    color: '#B5555A',
    marginTop: -4,
  },
  toggleChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.brancoSuave,
  },
  toggleChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleChipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  toggleChipTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '600',
  },
  list: {
    paddingVertical: 16,
    gap: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardAvatar: {
    fontSize: 28,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardDetail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardTags: {
    fontSize: 12,
    color: colors.textMuted,
  },
  remove: {
    color: colors.textMuted,
    fontSize: 12,
  },
  edit: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelEdit: {
    color: colors.textMuted,
    fontSize: 12,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 24,
  },
  });
}
