// Escala tipográfica — tamanhos/pesos já em uso real no app (AgendaScreen etc.), agora nomeados (ux-backlog.md #16)
export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
} as const;
