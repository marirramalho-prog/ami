import React, { useEffect, useState } from 'react';
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
import { colors } from '../theme/colors';
import { Child, Turno } from '../types/child';
import { loadChildren, saveChildren } from '../storage/childrenStorage';
import { calcularIdade, isValidDatePart } from '../utils/date';
import TagInput from '../components/TagInput';
import AvatarPicker, { AVATAR_OPTIONS } from '../components/AvatarPicker';
import TurnoSelector from '../components/TurnoSelector';

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
  turnoEscolar: '' as Turno,
  atividades: [] as string[],
  responsaveisBusca: [] as string[],
  interesses: [] as string[],
  observacoes: '',
};

export default function ChildrenProfileScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadChildren().then(setChildren);
  }, []);

  function updateForm<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd() {
    if (!form.nome.trim()) return;
    if (!isValidDatePart({ dia: form.dia, mes: form.mes, ano: form.ano })) return;

    const newChild: Child = {
      id: Date.now().toString(),
      nome: form.nome.trim(),
      dataNascimento: { dia: form.dia.trim(), mes: form.mes.trim(), ano: form.ano.trim() },
      avatar: form.avatar,
      escola: form.escola.trim(),
      turnoEscolar: form.turnoEscolar,
      atividades: form.atividades,
      responsaveisBusca: form.responsaveisBusca,
      interesses: form.interesses,
      observacoes: form.observacoes.trim(),
    };

    const updated = [...children, newChild];
    setChildren(updated);
    await saveChildren(updated);
    setForm(emptyForm);
  }

  async function handleRemove(id: string) {
    const updated = children.filter((c) => c.id !== id);
    setChildren(updated);
    await saveChildren(updated);
  }

  const dataValida = isValidDatePart({ dia: form.dia, mes: form.mes, ano: form.ano });
  const podeAdicionar = form.nome.trim().length > 0 && dataValida;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Perfis dos filhos</Text>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Essenciais</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome ou apelido"
            placeholderTextColor={colors.textMuted}
            value={form.nome}
            onChangeText={(v) => updateForm('nome', v)}
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

          <AvatarPicker value={form.avatar} onChange={(v) => updateForm('avatar', v)} />

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Contexto de rotina</Text>

          <TextInput
            style={styles.input}
            placeholder="Escola"
            placeholderTextColor={colors.textMuted}
            value={form.escola}
            onChangeText={(v) => updateForm('escola', v)}
          />

          <TurnoSelector value={form.turnoEscolar} onChange={(v) => updateForm('turnoEscolar', v)} />

          <TagInput
            label="Atividades extracurriculares"
            placeholder="Ex: natação"
            values={form.atividades}
            onChange={(v) => updateForm('atividades', v)}
          />

          <TagInput
            label="Responsáveis por buscar/levar"
            placeholder="Ex: avó Marta"
            values={form.responsaveisBusca}
            onChange={(v) => updateForm('responsaveisBusca', v)}
          />

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
            onPress={handleAdd}
            disabled={!podeAdicionar}
          >
            <Text style={styles.buttonText}>Adicionar filho(a)</Text>
          </Pressable>
        </View>

        <FlatList
          data={children}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const idade = calcularIdade(item.dataNascimento);
            const turnoLabel = item.turnoEscolar ? TURNO_LABEL[item.turnoEscolar] : '';
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardAvatar}>{item.avatar}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{item.nome}</Text>
                    <Text style={styles.cardDetail}>
                      {[idade !== null && `${idade} anos`, item.escola, turnoLabel]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleRemove(item.id)}>
                    <Text style={styles.remove}>remover</Text>
                  </Pressable>
                </View>

                {item.atividades.length > 0 && (
                  <Text style={styles.cardTags}>Atividades: {item.atividades.join(', ')}</Text>
                )}
                {item.interesses.length > 0 && (
                  <Text style={styles.cardTags}>Interesses: {item.interesses.join(', ')}</Text>
                )}
                {item.responsaveisBusca.length > 0 && (
                  <Text style={styles.cardTags}>
                    Busca/leva: {item.responsaveisBusca.join(', ')}
                  </Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 24,
  },
});
