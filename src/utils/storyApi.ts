import { StoryPreferences } from '../types/story';
import { SERVER_URL } from './serverUrl';

interface GenerateStoryParams extends StoryPreferences {
  eventoContexto?: string;
}

export async function generateStory(params: GenerateStoryParams): Promise<string> {
  const response = await fetch(`${SERVER_URL}/generate-story`, {
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
