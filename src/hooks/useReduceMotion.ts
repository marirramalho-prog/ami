import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Lê a preferência "reduzir movimento" do sistema e escuta mudanças —
// usado por FadeIn/ChatBubble pra pular a animação de entrada (ux-backlog.md #24)
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
