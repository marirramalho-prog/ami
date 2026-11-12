import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';
import { typography } from '../theme/typography';
import { ChecklistTemplate } from '../types/routine';
import { loadChecklists, saveChecklists } from '../storage/routineStorage';
import { confirmAction } from '../utils/confirm';
import { loadChildren } from '../storage/childrenStorage';
import { syncChecklistsForAllChildren } from '../utils/checklistSync';

const TIPOS_SUGERIDOS = ['Rotina escolar', 'Passeio', 'Viagem', 'Fim de semana'];

export default function ChecklistScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const route = useRoute<any>();
  const highlightId: string | undefined = route.params?.highlightId;
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [nome, setNome] = useState(route.params?.nomeSugerido || '');
  const [tipo, setTipo] = useState(route.params?.tipoSugerido || '');
  const [novoItem, setNovoItem] = useState<Record<string, string>>({});
  // Aberto por padrão: sem checklist nenhum ainda, ou chegando com um
  // nome/tipo sugerido (vindo de Agenda/Import). Fechado nos outros casos,
  // pra não obrigar rolagem toda vez que já existem checklists criados.
  const [formExpanded, setFormExpanded] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadChildren()
        .then((children) => syncChecklistsForAllChildren(children))
        .then(loadChecklists)
        .then((list) => {
          setTemplates(list);
          if (!route.params?.nomeSugerido) {
            setFormExpanded(list.length === 0);
          }
        });
    }, [route.params?.nomeSugerido]),
  );

  async function persist(updated: ChecklistTemplate[]) {
    setTemplates(updated);
    await saveChecklists(updated);
  }

  async function handleCreateTemplate() {
    if (!nome.trim()) return;
    const template: ChecklistTemplate = {
      id: Date.now().toString(),
      nome: nome.trim(),
      tipo: tipo.trim(),
      itens: [],
    };
    await persist([...templates, template]);
    setNome('');
    setTipo('');
    setFormExpanded(false);
  }

  function handleRemoveTemplate(id: string) {
    const template = templates.find((t) => t.id === id);
    confirmAction(
      'Remover checklist?',
      `"${template?.nome || 'este checklist'}" e todos os itens dele serão removidos. Essa ação não pode ser desfeita.`,
      async () => {
        await persist(templates.filter((t) => t.id !== id));
      },
    );
  }

  async function handleAddItem(templateId: string) {
    const texto = (novoItem[templateId] || '').trim();
    if (!texto) return;
    const updated = templates.map((t) =>
      t.id === templateId
        ? { ...t, itens: [...t.itens, { id: Date.now().toString(), texto, feito: false }] }
        : t,
    );
    await persist(updated);
    setNovoItem((prev) => ({ ...prev, [templateId]: '' }));
  }

  async function handleToggleItem(templateId: string, itemId: string) {
    const updated = templates.map((t) =>
      t.id === templateId
        ? {
            ...t,
            itens: t.itens.map((i) => (i.id === itemId ? { ...i, feito: !i.feito } : i)),
          }
        : t,
    );
    await persist(updated);
  }

  async function handleRemoveItem(templateId: string, itemId: string) {
    const updated = templates.map((t) =>
      t.id === templateId ? { ...t, itens: t.itens.filter((i) => i.id !== itemId) } : t,
    );
    await persist(updated);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Checklists de rotina</Text>

        {!formExpanded && (
          <Pressable
            style={styles.novoChecklistButton}
            onPress={() => setFormExpanded(true)}
            accessibilityRole="button"
          >
            <Text style={styles.novoChecklistButtonText}>+ Novo checklist</Text>
          </Pressable>
        )}

        {formExpanded && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome do checklist (ex: Sair de casa de manhã)"
            placeholderTextColor={colors.textMuted}
            value={nome}
            onChangeText={setNome}
          />
          <Text style={styles.label}>Tipo de atividade</Text>
          <View style={styles.tipoRow}>
            {TIPOS_SUGERIDOS.map((t) => {
              const selected = tipo === t;
              return (
                <Pressable
                  key={t}
                  style={[styles.tipoChip, selected && styles.tipoChipSelected]}
                  onPress={() => setTipo(selected ? '' : t)}
                >
                  <Text
                    style={[styles.tipoChipText, selected && styles.tipoChipTextSelected]}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Ou digite um tipo próprio"
            placeholderTextColor={colors.textMuted}
            value={tipo}
            onChangeText={setTipo}
          />
          <Pressable
            style={[styles.button, !nome.trim() && styles.buttonDisabled]}
            onPress={handleCreateTemplate}
            disabled={!nome.trim()}
          >
            <Text style={styles.buttonText}>Criar checklist</Text>
          </Pressable>
          {templates.length > 0 && (
            <Pressable onPress={() => setFormExpanded(false)}>
              <Text style={styles.cancelarLink}>cancelar</Text>
            </Pressable>
          )}
        </View>
        )}

        <View style={styles.list}>
          {templates.length === 0 && (
            <Text style={styles.empty}>
              🧚 Nenhum checklist por aqui ainda — cria um ali em cima pra te ajudar a não
              esquecer nada na próxima rotina, passeio ou viagem.
            </Text>
          )}
          {templates.map((template) => {
            const totalItens = template.itens.length;
            const feitos = template.itens.filter((i) => i.feito).length;
            return (
            <View
              key={template.id}
              style={[styles.card, template.id === highlightId && styles.cardDestacado]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{template.nome}</Text>
                  <View style={styles.cardTypeRow}>
                    {template.tipo ? (
                      <Text style={styles.cardType}>{template.tipo}</Text>
                    ) : null}
                    {template.origemAuto && (
                      <View style={styles.autoTag}>
                        <Text style={styles.autoTagTexto}>vinculado ao perfil</Text>
                      </View>
                    )}
                  </View>
                  {totalItens > 0 && (
                    <Text style={styles.cardProgress}>
                      {feitos} de {totalItens} feitos
                    </Text>
                  )}
                </View>
                <Pressable onPress={() => handleRemoveTemplate(template.id)}>
                  <Text style={styles.remove}>remover</Text>
                </Pressable>
              </View>

              {template.itens.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => handleToggleItem(template.id, item.id)}
                >
                  <View style={[styles.checkbox, item.feito && styles.checkboxChecked]}>
                    {item.feito && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.itemText, item.feito && styles.itemTextDone]}>
                    {item.texto}
                  </Text>
                  <Pressable
                    style={styles.itemRemoveButton}
                    onPress={() => handleRemoveItem(template.id, item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remover item "${item.texto}"`}
                  >
                    <Text style={styles.itemRemove}>×</Text>
                  </Pressable>
                </Pressable>
              ))}

              <View style={styles.addItemRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Novo item"
                  placeholderTextColor={colors.textMuted}
                  value={novoItem[template.id] || ''}
                  onChangeText={(v) =>
                    setNovoItem((prev) => ({ ...prev, [template.id]: v }))
                  }
                  onSubmitEditing={() => handleAddItem(template.id)}
                  returnKeyType="done"
                />
                <Pressable
                  style={styles.addItemButton}
                  onPress={() => handleAddItem(template.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Adicionar item ao checklist"
                >
                  <Text style={styles.addItemButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
            );
          })}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(colors: Colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  title: { ...typography.title, color: colors.text, marginBottom: 16 },
  novoChecklistButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  novoChecklistButtonText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  cancelarLink: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 13,
    minHeight: 44,
    textAlignVertical: 'center',
  },
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
  tipoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipoChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: colors.brancoSuave,
  },
  tipoChipSelected: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  tipoChipText: { fontSize: 13, color: colors.textMuted },
  tipoChipTextSelected: { color: colors.text, fontWeight: '600' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.text, fontWeight: '600' },
  list: { paddingVertical: 16, gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardDestacado: { borderColor: colors.primary, borderWidth: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  cardType: { fontSize: 12, color: colors.textMuted },
  cardProgress: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  autoTag: {
    backgroundColor: colors.lavandaClaro,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  autoTagTexto: { fontSize: 10, fontWeight: '700', color: colors.text },
  remove: { color: colors.textMuted, fontSize: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  itemText: { flex: 1, fontSize: 14, color: colors.text },
  itemTextDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  itemRemoveButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRemove: { fontSize: 16, color: colors.textMuted },
  addItemRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  addItemButton: {
    width: 42,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemButtonText: { fontSize: 18, fontWeight: '700', color: colors.text },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 8, lineHeight: 20 },
  });
}
