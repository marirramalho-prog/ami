import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Child, childFullName } from '../types/child';

interface Props {
  children: Child[];
  value: string | null;
  onChange: (childId: string | null) => void;
}

export default function ChildSelector({ children, value, onChange }: Props) {
  if (children.length === 0) {
    return (
      <Text style={styles.empty}>
        Cadastre um perfil de filho(a) na aba Perfis para vincular a eventos.
      </Text>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>Filho(a) (opcional)</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.chip, value === null && styles.chipSelected]}
          onPress={() => onChange(null)}
        >
          <Text style={[styles.chipText, value === null && styles.chipTextSelected]}>
            Nenhum
          </Text>
        </Pressable>
        {children.map((child) => {
          const selected = value === child.id;
          return (
            <Pressable
              key={child.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(child.id)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {child.avatar} {childFullName(child)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.brancoSuave,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  empty: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
