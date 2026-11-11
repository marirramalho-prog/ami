import { Alert, Platform } from 'react-native';

/**
 * Alert.alert não funciona na visualização web (react-native-web não
 * implementa diálogos nativos) — usa window.confirm lá, Alert.alert
 * nas demais plataformas.
 */
export function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Remover', style: 'destructive', onPress: onConfirm },
  ]);
}
