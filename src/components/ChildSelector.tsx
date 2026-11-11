import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';
import { Child, childFullName } from '../types/child';

interface Props {
  children: Child[];
  value: string[];
  onChange: (childIds: string[]) => void;
}

export default function ChildSelector({ children, value, onChange }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  if (children.length === 0) {
    return (
      <Text style={styles.empty}>
        Cadastre um perfil de filho(a) na aba Perfis para vincular a eventos.
      </Text>
    );
  }

  function toggle(childId: string) {
    onChange(value.includes(childId) ? value.filter((id) => id !== childId) : [...value, childId]);
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>Filho(s) (opcional)</Text>
      <View style={styles.row}>
        {children.map((child) => {
          const selected = value.includes(child.id);
          return (
            <Pressable
              key={child.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggle(child.id)}
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

function getStyles(colors: Colors) {
  return StyleSheet.create({
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
    minHeight: 44,
    justifyContent: 'center',
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
}
