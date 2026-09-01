import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Caregiver } from '../types/caregiver';

interface Props {
  caregivers: Caregiver[];
  value: string | null;
  onChange: (caregiverId: string | null) => void;
}

export default function CaregiverSelector({ caregivers, value, onChange }: Props) {
  if (caregivers.length === 0) {
    return (
      <Text style={styles.empty}>
        Cadastre um cuidador na aba Cuidadores para atribuir responsáveis.
      </Text>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>Responsável (opcional)</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.chip, value === null && styles.chipSelected]}
          onPress={() => onChange(null)}
        >
          <Text style={[styles.chipText, value === null && styles.chipTextSelected]}>
            Nenhum
          </Text>
        </Pressable>
        {caregivers.map((caregiver) => {
          const selected = value === caregiver.id;
          return (
            <Pressable
              key={caregiver.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(caregiver.id)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {caregiver.nomeCompleto}
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.brancoSuave,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textMuted },
  chipTextSelected: { color: colors.text, fontWeight: '600' },
  empty: { fontSize: 12, color: colors.textMuted },
});
