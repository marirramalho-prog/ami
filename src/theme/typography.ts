// Escala tipográfica — tamanhos/pesos já em uso real no app (AgendaScreen etc.), agora nomeados (ux-backlog.md #16)
export const typography = {
  // Serifada de destaque nos títulos de tela — aprovada por Mari em 2026-11-12 (ux-backlog.md #18).
  // "fontWeight" fica de fora de propósito: a fonte já carrega o peso 600 (ver App.tsx); declarar
  // fontWeight junto faria o RN tentar sintetizar um peso que a fonte custom não tem.
  title: { fontSize: 24, fontFamily: 'Fraunces_600SemiBold' },
  label: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
} as const;
