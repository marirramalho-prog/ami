import { Platform } from 'react-native';
import { StoryPreferences } from '../types/story';

// No navegador (web), "localhost" já aponta pro computador que roda o
// servidor. No celular via Expo Go, "localhost" apontaria pro próprio
// celular — por isso usamos o IP da máquina na rede Wi-Fi local.
// Se esse IP mudar (rede diferente, reinício do roteador), atualize aqui.
const LAN_IP = '192.168.15.26';
const STORY_SERVER_URL = Platform.OS === 'web' ? 'http://localhost:4001' : `http://${LAN_IP}:4001`;

interface GenerateStoryParams extends StoryPreferences {
  eventoContexto?: string;
}

export async function generateStory(params: GenerateStoryParams): Promise<string> {
  const response = await fetch(`${STORY_SERVER_URL}/generate-story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Falha ao gerar história.');
  }

  return data.texto as string;
}
