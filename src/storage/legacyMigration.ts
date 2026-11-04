import AsyncStorage from '@react-native-async-storage/async-storage';

// Lê uma chave do AsyncStorage e, se estiver vazia, migra o valor salvo na
// chave antiga (prefixo @lumi/, de antes do rebranding pra Âmi) — sem isso,
// quem já tinha dados salvos perderia tudo ao atualizar o app.
export async function readWithLegacyKey(key: string, legacyKey: string): Promise<string | null> {
  const atual = await AsyncStorage.getItem(key);
  if (atual !== null) return atual;

  const antigo = await AsyncStorage.getItem(legacyKey);
  if (antigo !== null) {
    await AsyncStorage.setItem(key, antigo);
  }
  return antigo;
}
