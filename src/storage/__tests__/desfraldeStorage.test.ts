jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadConfiguracoes,
  loadConquistas,
  loadLembretes,
  loadPermissoes,
  loadProcessos,
  loadRegistros,
  loadSinais,
  removeDesfraldeForChild,
  saveConfiguracoes,
  saveConquistas,
  saveLembretes,
  savePermissoes,
  saveProcessos,
  saveRegistros,
  saveSinais,
} from '../desfraldeStorage';

const FILHO_A = 'filho-a';
const FILHO_B = 'filho-b';
const PROCESSO_A = 'processo-a';
const PROCESSO_B = 'processo-b';

async function semearDadosDeDoisFilhos() {
  await saveProcessos([
    {
      id: PROCESSO_A,
      childId: FILHO_A,
      status: 'em_andamento',
      faseAtual: 'dia_a_dia',
      iniciadoEm: '2026-01-01',
      pausadoEm: null,
      concluidoEm: null,
      criadoPor: 'cuidador-1',
      atualizadoEm: '2026-01-01',
    },
    {
      id: PROCESSO_B,
      childId: FILHO_B,
      status: 'em_andamento',
      faseAtual: 'preparar',
      iniciadoEm: '2026-01-01',
      pausadoEm: null,
      concluidoEm: null,
      criadoPor: 'cuidador-1',
      atualizadoEm: '2026-01-01',
    },
  ]);
  await saveSinais([
    {
      id: 'sinal-a',
      childId: FILHO_A,
      sinal: 'avisa_ou_esconde',
      marcado: true,
      marcadoEm: '2026-01-01',
      desmarcadoEm: null,
      atualizadoPor: 'cuidador-1',
    },
    {
      id: 'sinal-b',
      childId: FILHO_B,
      sinal: 'avisa_ou_esconde',
      marcado: true,
      marcadoEm: '2026-01-01',
      desmarcadoEm: null,
      atualizadoPor: 'cuidador-1',
    },
  ]);
  await saveConfiguracoes([
    {
      processoId: PROCESSO_A,
      fraldaDia: false,
      fraldaSoneca: true,
      fraldaNoite: true,
      fraldaPasseio: true,
      recipiente: 'penico',
      modoHorario: 'intervalo',
      intervaloMin: '120',
      momentos: [],
      palavras: { xixi: 'xixi', coco: 'cocô', banheiro: 'banheiro' },
      combinados: '',
      recompensa: '',
      atualizadoPor: 'cuidador-1',
      atualizadoEm: '2026-01-01',
    },
    {
      processoId: PROCESSO_B,
      fraldaDia: true,
      fraldaSoneca: true,
      fraldaNoite: true,
      fraldaPasseio: true,
      recipiente: 'vaso',
      modoHorario: 'momentos',
      intervaloMin: '',
      momentos: ['ao_acordar'],
      palavras: { xixi: 'xixi', coco: 'cocô', banheiro: 'banheiro' },
      combinados: '',
      recompensa: '',
      atualizadoPor: 'cuidador-1',
      atualizadoEm: '2026-01-01',
    },
  ]);
  await saveRegistros([
    {
      id: 'registro-a',
      processoId: PROCESSO_A,
      childId: FILHO_A,
      conteudo: 'xixi',
      local: 'penico_vaso',
      iniciativa: 'pediu',
      periodo: 'dia',
      noiteResultado: '',
      ambiente: 'casa',
      registradoEm: '2026-01-01T10:00:00.000Z',
      registradoPor: 'cuidador-1',
      observacao: '',
      criadoEm: '2026-01-01T10:00:00.000Z',
      editadoEm: null,
      editadoPor: null,
    },
    {
      id: 'registro-b',
      processoId: PROCESSO_B,
      childId: FILHO_B,
      conteudo: 'coco',
      local: 'fralda',
      iniciativa: 'levado',
      periodo: 'noite',
      noiteResultado: 'molhado',
      ambiente: 'casa',
      registradoEm: '2026-01-01T22:00:00.000Z',
      registradoPor: 'cuidador-1',
      observacao: '',
      criadoEm: '2026-01-01T22:00:00.000Z',
      editadoEm: null,
      editadoPor: null,
    },
  ]);
  await saveConquistas([
    { id: 'conquista-a', processoId: PROCESSO_A, tipo: 'primeiro_xixi', data: '2026-01-01', registradoPor: 'cuidador-1' },
    { id: 'conquista-b', processoId: PROCESSO_B, tipo: 'primeiro_xixi', data: '2026-01-01', registradoPor: 'cuidador-1' },
  ]);
  await saveLembretes([
    {
      id: 'lembrete-a',
      processoId: PROCESSO_A,
      tipo: 'banheiro',
      modoHorario: 'intervalo',
      intervaloMin: '120',
      momentos: [],
      horaInicio: '08:00',
      horaFim: '19:00',
      diasSemana: [1, 2, 3, 4, 5],
      destinatarios: ['cuidador-1'],
      ativo: true,
      notificationIds: [],
    },
    {
      id: 'lembrete-b',
      processoId: PROCESSO_B,
      tipo: 'banheiro',
      modoHorario: 'intervalo',
      intervaloMin: '120',
      momentos: [],
      horaInicio: '08:00',
      horaFim: '19:00',
      diasSemana: [1, 2, 3, 4, 5],
      destinatarios: ['cuidador-1'],
      ativo: true,
      notificationIds: [],
    },
  ]);
  await savePermissoes([
    { processoId: PROCESSO_A, caregiverId: 'cuidador-2', podeVer: true, podeRegistrar: true, podeConfigurar: false },
    { processoId: PROCESSO_B, caregiverId: 'cuidador-2', podeVer: true, podeRegistrar: true, podeConfigurar: false },
  ]);
}

describe('removeDesfraldeForChild', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await semearDadosDeDoisFilhos();
  });

  it('remove todos os dados do filho apagado e preserva os do outro filho', async () => {
    await removeDesfraldeForChild(FILHO_A);

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

    expect(processos.find((p) => p.childId === FILHO_A)).toBeUndefined();
    expect(sinais.find((s) => s.childId === FILHO_A)).toBeUndefined();
    expect(configuracoes.find((c) => c.processoId === PROCESSO_A)).toBeUndefined();
    expect(registros.find((r) => r.childId === FILHO_A)).toBeUndefined();
    expect(conquistas.find((c) => c.processoId === PROCESSO_A)).toBeUndefined();
    expect(lembretes.find((l) => l.processoId === PROCESSO_A)).toBeUndefined();
    expect(permissoes.find((p) => p.processoId === PROCESSO_A)).toBeUndefined();

    expect(processos.find((p) => p.childId === FILHO_B)).toBeDefined();
    expect(sinais.find((s) => s.childId === FILHO_B)).toBeDefined();
    expect(configuracoes.find((c) => c.processoId === PROCESSO_B)).toBeDefined();
    expect(registros.find((r) => r.childId === FILHO_B)).toBeDefined();
    expect(conquistas.find((c) => c.processoId === PROCESSO_B)).toBeDefined();
    expect(lembretes.find((l) => l.processoId === PROCESSO_B)).toBeDefined();
    expect(permissoes.find((p) => p.processoId === PROCESSO_B)).toBeDefined();
  });
});
