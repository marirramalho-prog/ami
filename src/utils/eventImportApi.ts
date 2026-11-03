import { ExtractedEvent } from '../types/eventImport';
import { SERVER_URL } from './serverUrl';

export async function extractEventsFromFile(
  mediaType: string,
  base64Data: string,
): Promise<ExtractedEvent[]> {
  const response = await fetch(`${SERVER_URL}/extract-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mediaType, data: base64Data }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Falha ao ler o arquivo.');
  }

  return (data.eventos || []) as ExtractedEvent[];
}
