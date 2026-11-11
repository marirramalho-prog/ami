import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';

// Placeholder até existir um conjunto de avatares ilustrados da marca.
export const AVATAR_OPTIONS = ['🦄', '🌟', '🦋', '🐰', '🐻', '🌈', '🐱', '🦊'];

const AVATAR_NAMES: Record<string, string> = {
  '🦄': 'Unicórnio',
  '🌟': 'Estrela',
  '🦋': 'Borboleta',
  '🐰': 'Coelho',
  '🐻': 'Urso',
  '🌈': 'Arco-íris',
  '🐱': 'Gato',
  '🦊': 'Raposa',
};

interface Props {
  value: string;
  onChange: (avatar: string) => void;
}

export default function AvatarPicker({ value, onChange }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const backgrounds = [colors.lilasSuave, colors.azulClaro, colors.lavandaClaro, colors.azulGelo];
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>Avatar</Text>
      <View style={styles.row}>
        {AVATAR_OPTIONS.map((emoji, index) => {
          const selected = value === emoji;
          return (
            <Pressable
              key={emoji}
              onPress={() => onChange(emoji)}
              style={[
                styles.circle,
                { backgroundColor: backgrounds[index % backgrounds.length] },
                selected && styles.selected,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Avatar ${AVATAR_NAMES[emoji] || emoji}`}
              accessibilityState={{ selected }}
            >
              <Text style={styles.emoji}>{emoji}</Text>
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
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.text,
  },
  emoji: {
    fontSize: 20,
  },
  });
}
