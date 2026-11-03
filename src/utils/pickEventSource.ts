import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';

export interface PickedSource {
  mediaType: string;
  base64: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

function checkTamanho(base64: string) {
  const bytesAproximados = (base64.length * 3) / 4;
  if (bytesAproximados > MAX_BYTES) {
    throw new Error('Arquivo maior que 10 MB — escolha um arquivo menor.');
  }
}

// Sempre converte a imagem (foto, PNG ou HEIC) pra JPEG antes de ler em
// base64 — o HEIC da câmera do iPhone não é aceito pelo modelo de IA.
async function normalizeImage(uri: string): Promise<PickedSource> {
  const context = ImageManipulator.manipulate(uri);
  const image = await context.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.85, base64: true });
  if (!result.base64) throw new Error('Não foi possível ler a imagem.');
  checkTamanho(result.base64);
  return { mediaType: 'image/jpeg', base64: result.base64 };
}

export async function pickFromCamera(): Promise<PickedSource | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new Error('Permita o acesso à câmera para importar por foto.');
  const result = await ImagePicker.launchCameraAsync({ quality: 1 });
  if (result.canceled || !result.assets?.[0]) return null;
  return normalizeImage(result.assets[0].uri);
}

export async function pickFromGallery(): Promise<PickedSource | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error('Permita o acesso às fotos para importar da galeria.');
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (result.canceled || !result.assets?.[0]) return null;
  return normalizeImage(result.assets[0].uri);
}

export async function pickFromFile(): Promise<PickedSource | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  if (asset.size && asset.size > MAX_BYTES) {
    throw new Error('Arquivo maior que 10 MB — escolha um arquivo menor.');
  }

  if (asset.mimeType === 'application/pdf') {
    const base64 = await new File(asset.uri).base64();
    checkTamanho(base64);
    return { mediaType: 'application/pdf', base64 };
  }

  return normalizeImage(asset.uri);
}
