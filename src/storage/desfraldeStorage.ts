import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DesfraldeConfiguracao,
  DesfraldeConquista,
  DesfraldeLembrete,
  DesfraldePermissao,
  DesfraldeProcesso,
  DesfraldeRegistro,
  SinalProntidao,
} from '../types/desfralde';

// Chaves próprias e separadas do resto do app de propósito (ver briefing,
// seção 7 — LGPD): facilita apagar tudo de uma vez e migrar pro banco de
// saúde depois, se o parecer de LGPD pedir.
const PROCESSOS_KEY = '@ami/desfralde_processos';
const SINAIS_KEY = '@ami/desfralde_sinais';
const CONFIGURACOES_KEY = '@ami/desfralde_configuracoes';
const REGISTROS_KEY = '@ami/desfralde_registros';
const CONQUISTAS_KEY = '@ami/desfralde_conquistas';
const LEMBRETES_KEY = '@ami/desfralde_lembretes';
const PERMISSOES_KEY = '@ami/desfralde_permissoes';

async function loadList<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

async function saveList<T>(key: string, list: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

export const loadProcessos = () => loadList<DesfraldeProcesso>(PROCESSOS_KEY);
export const saveProcessos = (list: DesfraldeProcesso[]) => saveList(PROCESSOS_KEY, list);

export const loadSinais = () => loadList<SinalProntidao>(SINAIS_KEY);
export const saveSinais = (list: SinalProntidao[]) => saveList(SINAIS_KEY, list);

export const loadConfiguracoes = () => loadList<DesfraldeConfiguracao>(CONFIGURACOES_KEY);
export const saveConfiguracoes = (list: DesfraldeConfiguracao[]) =>
  saveList(CONFIGURACOES_KEY, list);

export const loadRegistros = () => loadList<DesfraldeRegistro>(REGISTROS_KEY);
export const saveRegistros = (list: DesfraldeRegistro[]) => saveList(REGISTROS_KEY, list);

export const loadConquistas = () => loadList<DesfraldeConquista>(CONQUISTAS_KEY);
export const saveConquistas = (list: DesfraldeConquista[]) => saveList(CONQUISTAS_KEY, list);

export const loadLembretes = () => loadList<DesfraldeLembrete>(LEMBRETES_KEY);
export const saveLembretes = (list: DesfraldeLembrete[]) => saveList(LEMBRETES_KEY, list);

export const loadPermissoes = () => loadList<DesfraldePermissao>(PERMISSOES_KEY);
export const savePermissoes = (list: DesfraldePermissao[]) => saveList(PERMISSOES_KEY, list);

// Exclusão completa: apagar o filho (ou, no chamador, a conta) remove todo
// rastro de Desfralde — sinais, processo(s), configuração, registros,
// conquistas, lembretes e permissões desse filho. Não deixa nada "órfão"
// pra trás, nem nos backups locais (AsyncStorage já reflete isso na hora).
export async function removeDesfraldeForChild(childId: string): Promise<void> {
  const [processos, sinais, configuracoes, registros, conquistas, lembretes, permissoes] =
    await Promise.all([
      loadProcessos(),
      loadSinais(),
      loadConfiguracoes(),
      loadRegistros(),
      loadConquistas(),
      loadLembretes(),
      loadPermissoes(),
    ]);

  const processosDoFilho = new Set(
    processos.filter((p) => p.childId === childId).map((p) => p.id),
  );

  await Promise.all([
    saveProcessos(processos.filter((p) => p.childId !== childId)),
    saveSinais(sinais.filter((s) => s.childId !== childId)),
    saveConfiguracoes(configuracoes.filter((c) => !processosDoFilho.has(c.processoId))),
    saveRegistros(registros.filter((r) => r.childId !== childId)),
    saveConquistas(conquistas.filter((c) => !processosDoFilho.has(c.processoId))),
    saveLembretes(lembretes.filter((l) => !processosDoFilho.has(l.processoId))),
    savePermissoes(permissoes.filter((p) => !processosDoFilho.has(p.processoId))),
  ]);
}
