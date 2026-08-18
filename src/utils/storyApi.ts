import { StoryPreferences } from '../types/story';

// Ao testar no celular via Expo Go, troque para o IP da sua máquina na rede
// local (ex: http://192.168.0.10:4001), já que "localhost" no celular aponta
// para o próprio celular, não para o computador rodando o servidor.
const STORY_SERVER_URL = 'http://localhost:4001';

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
