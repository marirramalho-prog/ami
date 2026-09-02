import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AtividadeExtracurricular, DIAS_SEMANA, DiaKey } from '../types/weeklyRoutine';
import { ATIVIDADES_SUGERIDAS } from '../data/atividadesSugeridas';
import DiasSemanaSelector from './DiasSemanaSelector';

interface Props {
  value: AtividadeExtracurricular[];
  onChange: (value: AtividadeExtracurricular[]) => void;
}

export default function AtividadesEditor({ value, onChange }: Props) {
  const [nomeDraft, setNomeDraft] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');
  const [diasDraft, setDiasDraft] = useState<DiaKey[]>([]);

  const sugestoes =
    nomeDraft.trim().length > 0
      ? ATIVIDADES_SUGERIDAS.filter((a) =>
          a.toLowerCase().includes(nomeDraft.trim().toLowerCase()),
        ).slice(0, 5)
      : [];

  function handleAdd(nomeEscolhido?: string) {
    const nome = (nomeEscolhido ?? nomeDraft).trim();
    if (!nome) return;

    const atividade: AtividadeExtracurricular = {
      id: Date.now().toString(),
      nome,
      horarioInicio: horarioInicio.trim(),
      horarioFim: horarioFim.trim(),
      diasSemana: diasDraft,
    };

    onChange([...value, atividade]);
    setNomeDraft('');
    setHorarioInicio('');
    setHorarioFim('');
    setDiasDraft([]);
  }

  function handleRemove(id: string) {
    onChange(value.filter((a) => a.id !== id));
  }

  function handleUpdateDias(id: string, diasSemana: AtividadeExtracurricular['diasSemana']) {
    onChange(value.map((a) => (a.id === id ? { ...a, diasSemana } : a)));
  }

  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.label}>Atividades extracurriculares</Text>

      {value.map((atividade) => (
        <View key={atividade.id} style={styles.atividadeBloco}>
          <View style={styles.atividadeHeader}>
            <Text style={styles.atividadeNome}>
              {atividade.nome}
              {atividade.horarioInicio || atividade.horarioFim
                ? ` · ${atividade.horarioInicio || '?'}–${atividade.horarioFim || '?'}`
                : ''}
            </Text>
            <Pressable onPress={() => handleRemove(atividade.id)}>
              <Text style={styles.remove}>remover</Text>
            </Pressable>
          </View>
          <DiasSemanaSelector
            value={atividade.diasSemana}
            onChange={(dias) => handleUpdateDias(atividade.id, dias)}
          />
        </View>
      ))}

      <View style={styles.novaAtividade}>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={styles.input}
            placeholder="Nome da atividade (ex: natação)"
            placeholderTextColor={colors.textMuted}
            value={nomeDraft}
            onChangeText={setNomeDraft}
          />
          {sugestoes.length > 0 && (
            <View style={styles.sugestoesBox}>
              {sugestoes.map((s) => (
                <Pressable key={s} style={styles.sugestaoItem} onPress={() => handleAdd(s)}>
                  <Text style={styles.sugestaoTexto}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.horarioRow}>
          <TextInput
            style={[styles.input, styles.horarioInput]}
            placeholder="Início HH:MM"
            placeholderTextColor={colors.textMuted}
            value={horarioInicio}
            onChangeText={setHorarioInicio}
            maxLength={5}
          />
          <TextInput
            style={[styles.input, styles.horarioInput]}
            placeholder="Fim HH:MM"
            placeholderTextColor={colors.textMuted}
            value={horarioFim}
            onChangeText={setHorarioFim}
            maxLength={5}
          />
        </View>

        <DiasSemanaSelector value={diasDraft} onChange={setDiasDraft} />

        <Pressable
          style={[styles.addButton, !nomeDraft.trim() && styles.addButtonDisabled]}
          onPress={() => handleAdd()}
          disabled={!nomeDraft.trim()}
        >
          <Text style={styles.addButtonText}>Adicionar atividade</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function resumoDias(dias: AtividadeExtracurricular['diasSemana']): string {
  // Defensivo: perfis cadastrados antes desta mudança podem não ter esse
  // campo (formato antigo), sem isso a tela quebra ao ler dados velhos.
  if (!dias) return '';
  return DIAS_SEMANA.filter((d) => dias.includes(d.key))
    .map((d) => d.nomeCompleto.slice(0, 3))
    .join(', ');
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  atividadeBloco: { gap: 8 },
  atividadeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  atividadeNome: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 },
  remove: { color: colors.textMuted, fontSize: 12 },
  novaAtividade: {
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
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
  sugestoesBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.card,
    marginTop: 4,
    overflow: 'hidden',
  },
  sugestaoItem: { paddingHorizontal: 12, paddingVertical: 8 },
  sugestaoTexto: { fontSize: 13, color: colors.text },
  horarioRow: { flexDirection: 'row', gap: 8 },
  horarioInput: { flex: 1 },
  addButton: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonDisabled: { opacity: 0.5 },
  addButtonText: { color: colors.text, fontWeight: '600', fontSize: 13 },
});
