import { useColorScheme } from 'react-native';
import { palettes, Colors } from './colors';

// Lê o tema do sistema (claro/escuro) e devolve a paleta certa — ux-backlog.md #14
export function useThemeColors(): Colors {
  const scheme = useColorScheme();
  return palettes[scheme === 'dark' ? 'dark' : 'light'];
}
