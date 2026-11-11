import React, { forwardRef, useMemo } from 'react';
import { TextInput, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';

type TextInputRef = React.ComponentRef<typeof TextInput>;

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  // campo pra focar automaticamente assim que HH:MM for completado (opcional)
  proximoCampoRef?: React.RefObject<TextInputRef | null>;
  style?: StyleProp<TextStyle>;
  editable?: boolean;
}

// Campo de horário: coloca os dois pontos sozinho depois de 2 dígitos
// (15 -> 15:) e avança pro próximo campo quando completa HH:MM.
// Padrão pra qualquer campo de horário do app — usar este componente
// em vez de TextInput puro sempre que pedir um horário.
const HoraInput = forwardRef<TextInputRef, Props>(
  ({ value, onChangeText, placeholder, proximoCampoRef, style, editable = true }, ref) => {
    const colors = useThemeColors();
    const styles = useMemo(() => getStyles(colors), [colors]);
    function handleChangeText(raw: string) {
      const prevDigits = value.replace(/\D/g, '');
      const rawDigits = raw.replace(/\D/g, '').slice(0, 4);
      const apagando = raw.length < value.length;

      let formatted = rawDigits;
      if (rawDigits.length === 2 && apagando && prevDigits.length === 2) {
        // permite apagar o ":" sem ele reaparecer sozinho
        formatted = rawDigits;
      } else if (rawDigits.length >= 2) {
        formatted = `${rawDigits.slice(0, 2)}:${rawDigits.slice(2)}`;
      }

      onChangeText(formatted);
      if (rawDigits.length === 4) {
        proximoCampoRef?.current?.focus();
      }
    }

    return (
      <TextInput
        ref={ref}
        style={[styles.input, style]}
        placeholder={placeholder || 'HH:MM'}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        maxLength={5}
        editable={editable}
      />
    );
  },
);

export default HoraInput;

function getStyles(colors: Colors) {
  return StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.brancoSuave,
    },
  });
}
