import { Platform, Share } from 'react-native';

export type ResultadoCompartilhar = 'compartilhado' | 'copiado' | 'falhou';

// Abre o menu nativo de compartilhar com um texto já montado (de
// desfraldeRelatorio.ts). Fica num arquivo separado, sem teste automatizado
// — Share é uma API nativa de verdade, igual expo-notifications, então foi
// verificado manualmente no preview web (que cai no ramo de baixo) e,
// quando possível, num build nativo real. Cada ramo é melhor-esforço: o
// usuário pode cancelar o share, ou o navegador pode negar a permissão de
// área de transferência (comum em ambiente automatizado/sandbox) — nenhum
// dos dois é um bug, então viram 'falhou' em vez de derrubar a tela.
export async function compartilharTexto(titulo: string, texto: string): Promise<ResultadoCompartilhar> {
  if (Platform.OS === 'web') {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (nav?.share) {
      try {
        await nav.share({ title: titulo, text: texto });
        return 'compartilhado';
      } catch {
        return 'falhou';
      }
    }
    if (nav?.clipboard?.writeText) {
      try {
        await nav.clipboard.writeText(texto);
        return 'copiado';
      } catch {
        return 'falhou';
      }
    }
    return 'falhou';
  }
  try {
    await Share.share({ title: titulo, message: texto });
    return 'compartilhado';
  } catch {
    return 'falhou';
  }
}
