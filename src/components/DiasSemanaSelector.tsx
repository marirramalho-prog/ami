import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { DIAS_SEMANA, DiaKey } from '../types/weeklyRoutine';

interface Props {
  value: DiaKey[];
  onChange: (value: DiaKey[]) => void;
}

export default function DiasSemanaSelector({ value, onChange }: Props) {
  function alternar(dia: DiaKey) {
    if (value.includes(dia)) {
      onChange(value.filter((d) => d !== dia));
    } else {
      onChange([...value, dia]);
    }
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>Dias da semana</Text>
      <View style={styles.row}>
        {DIAS_SEMANA.map((d) => {
          const ativo = value.includes(d.key);
          return (
            <Pressable
              key={d.key}
              onPress={() => alternar(d.key)}
              style={[styles.diaBotao, ativo && styles.diaBotaoAtivo]}
            >
              <Text style={[styles.diaBotaoTexto, ativo && styles.diaBotaoTextoAtivo]}>
                {d.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', gap: 6 },
  diaBotao: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.brancoSuave,
  },
  diaBotaoAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  diaBotaoTexto: { fontSize: 13, color: colors.textMuted },
  diaBotaoTextoAtivo: { color: colors.text, fontWeight: '600' },
});
