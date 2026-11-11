import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';
import { Caregiver } from '../types/caregiver';

interface Props {
  caregivers: Caregiver[];
  value: string[];
  onChange: (caregiverIds: string[]) => void;
  label?: string;
}

export default function CaregiverSelector({
  caregivers,
  value,
  onChange,
  label = 'Responsável (opcional)',
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  if (caregivers.length === 0) {
    return (
      <Text style={styles.empty}>
        Cadastre um cuidador na aba Cuidadores para atribuir responsáveis.
      </Text>
    );
  }

  function toggle(caregiverId: string) {
    onChange(
      value.includes(caregiverId)
        ? value.filter((id) => id !== caregiverId)
        : [...value, caregiverId],
    );
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {caregivers.map((caregiver) => {
          const selected = value.includes(caregiver.id);
          return (
            <Pressable
              key={caregiver.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggle(caregiver.id)}
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

function getStyles(colors: Colors) {
  return StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: colors.brancoSuave,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textMuted },
  chipTextSelected: { color: colors.text, fontWeight: '600' },
  empty: { fontSize: 12, color: colors.textMuted },
  });
}
