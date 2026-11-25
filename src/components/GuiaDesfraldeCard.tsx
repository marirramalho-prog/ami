import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';
import { ConteudoGuiaItem } from '../types/conteudoGuia';

interface Props {
  item: ConteudoGuiaItem;
  destaque: boolean;
  expandido: boolean;
  onToggle: () => void;
}

// Todas as seções do guia ficam liberadas em qualquer ordem — "destaque"
// só realça visualmente a seção mais útil pra fase atual, nunca bloqueia
// as outras (briefing, seção 3.7).
export default function GuiaDesfraldeCard({ item, destaque, expandido, onToggle }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <Pressable
      style={[styles.card, destaque && styles.cardDestaque]}
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`${item.titulo}, seção do guia de desfralde`}
      accessibilityState={{ expanded: expandido }}
    >
      <View style={styles.header}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.seta}>{expandido ? '▲' : '▼'}</Text>
      </View>

      {!item.validadoEspecialista && (
        <View style={styles.selo}>
          <Text style={styles.seloTexto}>🕒 Aguardando validação de especialista</Text>
        </View>
      )}

      {expandido && <Text style={styles.corpo}>{item.corpoMd}</Text>}
    </Pressable>
  );
}

function getStyles(colors: Colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 8,
    },
    cardDestaque: { borderWidth: 1, borderColor: colors.primary },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    titulo: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 },
    seta: { fontSize: 12, color: colors.textMuted, marginLeft: 8 },
    selo: {
      backgroundColor: colors.azulGelo,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      alignSelf: 'flex-start',
    },
    seloTexto: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
    corpo: { fontSize: 13, color: colors.text, lineHeight: 19 },
  });
}
