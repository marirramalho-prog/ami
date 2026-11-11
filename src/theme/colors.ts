// Paleta oficial da marca Âmi (Contexto/lumi_registro_completo_projeto.docx, seção 7)
const light = {
  lilasSuave: '#CCC3E6',
  azulClaro: '#C8DFF0',
  brancoSuave: '#F5F4F8',
  lavandaClaro: '#DED4EC',
  azulGelo: '#E1EEF7',
  cinzaLilas: '#D1CDDA',

  background: '#F5F4F8',
  primary: '#CCC3E6',
  secondary: '#C8DFF0',
  border: '#D1CDDA',
  card: '#FFFFFF',
  text: '#3A3550',
  // Escurecido de #7A7390 pra passar no mínimo AA (4.5:1) em texto normal — ux-backlog.md #17
  textMuted: '#675F7A',
} as const;

// Modo escuro — roxos profundos em vez de preto puro, pedido explícito da Mari (ux-backlog.md #14).
// Mantém o mesmo papel de cada token (texto sempre escuro sobre primary/secondary, nunca branco)
// pra não repetir o erro de contraste comum em paletas pastel.
const dark = {
  lilasSuave: '#8B7FC4',
  azulClaro: '#6FA8C9',
  brancoSuave: '#1E1A2E',
  lavandaClaro: '#453D66',
  azulGelo: '#2C3B49',
  cinzaLilas: '#46405E',

  background: '#1E1A2E',
  primary: '#8B7FC4',
  secondary: '#6FA8C9',
  border: '#46405E',
  card: '#2A2440',
  text: '#EDEAF5',
  textMuted: '#A79FBF',
} as const;

export type Colors = typeof light;
export const palettes = { light, dark } as const;

/** @deprecated use `useThemeColors()` — este export fica fixo no claro, só pra telas ainda não migradas */
export const colors = light;
