import React, { useMemo, useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';

type TextInputRef = React.ComponentRef<typeof TextInput>;

interface Props {
  dia: string;
  mes: string;
  ano: string;
  onChangeDia: (v: string) => void;
  onChangeMes: (v: string) => void;
  onChangeAno: (v: string) => void;
  // campo pra focar automaticamente depois que o ano for preenchido (opcional)
  proximoCampoRef?: React.RefObject<TextInputRef | null>;
}

// Avança sozinho pro próximo campo assim que o atual é preenchido
// (dia -> mês -> ano -> próximo campo, se informado).
export default function DateFields({
  dia,
  mes,
  ano,
  onChangeDia,
  onChangeMes,
  onChangeAno,
  proximoCampoRef,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const mesRef = useRef<TextInputRef>(null);
  const anoRef = useRef<TextInputRef>(null);

  function handleDia(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 2);
    onChangeDia(digits);
    if (digits.length === 2) mesRef.current?.focus();
  }

  function handleMes(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 2);
    onChangeMes(digits);
    if (digits.length === 2) anoRef.current?.focus();
  }

  function handleAno(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    onChangeAno(digits);
    if (digits.length === 4) proximoCampoRef?.current?.focus();
  }

  return (
    <View style={styles.row}>
      <TextInput
        style={[styles.input, styles.small]}
        placeholder="DD"
        placeholderTextColor={colors.textMuted}
        value={dia}
        onChangeText={handleDia}
        keyboardType="number-pad"
        maxLength={2}
      />
      <TextInput
        ref={mesRef}
        style={[styles.input, styles.small]}
        placeholder="MM"
        placeholderTextColor={colors.textMuted}
        value={mes}
        onChangeText={handleMes}
        keyboardType="number-pad"
        maxLength={2}
      />
      <TextInput
        ref={anoRef}
        style={[styles.input, styles.large]}
        placeholder="AAAA"
        placeholderTextColor={colors.textMuted}
        value={ano}
        onChangeText={handleAno}
        keyboardType="number-pad"
        maxLength={4}
      />
    </View>
  );
}

function getStyles(colors: Colors) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: 8 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.brancoSuave,
      textAlign: 'center',
    },
    small: { width: 60 },
    large: { width: 90 },
  });
}
