import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
}

export default function ChipSelector({
  label,
  options,
  value,
  onChange,
  allowCustom,
  customPlaceholder,
}: Props) {
  const isCustomValue = value !== '' && !options.includes(value);

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(selected ? '' : option)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {allowCustom && (
        <TextInput
          style={styles.input}
          placeholder={customPlaceholder || 'Ou digite o seu'}
          placeholderTextColor={colors.textMuted}
          value={isCustomValue ? value : ''}
          onChangeText={onChange}
        />
      )}
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
  chipSelected: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { fontSize: 13, color: colors.textMuted },
  chipTextSelected: { color: colors.text, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    backgroundColor: colors.brancoSuave,
    fontSize: 13,
  },
});
