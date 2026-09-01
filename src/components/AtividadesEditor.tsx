import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Caregiver } from '../types/caregiver';
import { AtividadeExtracurricular } from '../types/weeklyRoutine';
import { criarRotinaVazia } from '../types/weeklyRoutine';
import { ATIVIDADES_SUGERIDAS } from '../data/atividadesSugeridas';
import RotinaSemanal from './RotinaSemanal';

interface Props {
  value: AtividadeExtracurricular[];
  onChange: (value: AtividadeExtracurricular[]) => void;
  cuidadores: Caregiver[];
}

export default function AtividadesEditor({ value, onChange, cuidadores }: Props) {
  const [nomeDraft, setNomeDraft] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');

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
      rotina: criarRotinaVazia(),
    };

    onChange([...value, atividade]);
    setNomeDraft('');
    setHorarioInicio('');
    setHorarioFim('');
  }

  function handleRemove(id: string) {
    onChange(value.filter((a) => a.id !== id));
  }

  function handleUpdateRotina(id: string, rotina: AtividadeExtracurricular['rotina']) {
    onChange(value.map((a) => (a.id === id ? { ...a, rotina } : a)));
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
          <RotinaSemanal
            titulo={atividade.nome}
            icone="⭐"
            cuidadores={cuidadores}
            value={atividade.rotina}
            onChange={(rotina) => handleUpdateRotina(atividade.id, rotina)}
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
