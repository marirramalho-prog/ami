// Escala de espaçamento 4/8pt — base pra sair dos valores soltos hoje em cada tela (ux-backlog.md #16)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// Raios observados em uso hoje (CareScreen, ChecklistScreen, etc.), nomeados pra reuso
export const radii = {
  sm: 10, // botões, inputs
  md: 14, // cards de item
  lg: 16, // cards grandes
} as const;
