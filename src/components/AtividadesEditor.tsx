import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';
import { AtividadeExtracurricular, DIAS_SEMANA, DiaKey } from '../types/weeklyRoutine';
import { ATIVIDADES_SUGERIDAS } from '../data/atividadesSugeridas';
import DiasSemanaSelector from './DiasSemanaSelector';
import HoraInput from './HoraInput';

interface Props {
  value: AtividadeExtracurricular[];
  onChange: (value: AtividadeExtracurricular[]) => void;
}

export default function AtividadesEditor({ value, onChange }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [nomeDraft, setNomeDraft] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');
  const [diasDraft, setDiasDraft] = useState<DiaKey[]>([]);
  const horarioFimRef = useRef<TextInput>(null);

  const sugestoes =
    nomeDraft.trim().length > 0
      ? ATIVIDADES_SUGERIDAS.filter(
          (a) =>
            a.toLowerCase().includes(nomeDraft.trim().toLowerCase()) &&
            a.toLowerCase() !== nomeDraft.trim().toLowerCase(),
        ).slice(0, 5)
      : [];

  const podeAdicionarAtividade =
    nomeDraft.trim().length > 0 && horarioInicio.trim().length > 0 && horarioFim.trim().length > 0;

  function handleAdd() {
    if (!podeAdicionarAtividade) return;

    const atividade: AtividadeExtracurricular = {
      id: Date.now().toString(),
      nome: nomeDraft.trim(),
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
          {resumoDias(atividade.diasSemana) ? (
            <Text style={styles.diasResumo}>{resumoDias(atividade.diasSemana)}</Text>
          ) : null}
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
                <Pressable key={s} style={styles.sugestaoItem} onPress={() => setNomeDraft(s)}>
                  <Text style={styles.sugestaoTexto}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.horarioRow}>
          <HoraInput
            value={horarioInicio}
            onChangeText={setHorarioInicio}
            placeholder="Início HH:MM"
            proximoCampoRef={horarioFimRef}
            style={styles.horarioInput}
          />
          <HoraInput
            ref={horarioFimRef}
            value={horarioFim}
            onChangeText={setHorarioFim}
            placeholder="Fim HH:MM"
            style={styles.horarioInput}
          />
        </View>
        {!podeAdicionarAtividade && (nomeDraft || horarioInicio || horarioFim) && (
          <Text style={styles.warning}>
            Preencha nome, horário de início e de fim pra criar a atividade.
          </Text>
        )}

        <DiasSemanaSelector value={diasDraft} onChange={setDiasDraft} />

        <Pressable
          style={[styles.addButton, !podeAdicionarAtividade && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!podeAdicionarAtividade}
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

function getStyles(colors: Colors) {
  return StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  atividadeBloco: { gap: 8 },
  atividadeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  atividadeNome: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 },
  remove: { color: colors.textMuted, fontSize: 12 },
  diasResumo: { fontSize: 12, color: colors.textMuted },
  warning: { fontSize: 12, color: '#B5555A' },
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
}
