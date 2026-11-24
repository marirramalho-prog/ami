import {
  calcularPeriodoRelatorio,
  montarTextoRelatorio,
  montarTextoResumoCompartilhavel,
} from '../desfraldeRelatorio';
import { DesfraldeConfiguracao, DesfraldeConquista, DesfraldeRegistro, SinalProntidao } from '../../types/desfralde';

let proximoId = 1;

function registro(parcial: Partial<DesfraldeRegistro> & { registradoEm: string }): DesfraldeRegistro {
  proximoId += 1;
  return {
    id: `registro-${proximoId}`,
    processoId: 'processo-1',
    childId: 'filho-1',
    conteudo: '',
    local: '',
    iniciativa: '',
    periodo: 'dia',
    noiteResultado: '',
    ambiente: 'casa',
    registradoPor: 'cuidador-1',
    observacao: '',
    criadoEm: parcial.registradoEm,
    editadoEm: null,
    editadoPor: null,
    ...parcial,
  };
}

describe('calcularPeriodoRelatorio', () => {
  it('calcula o intervalo da semana (segunda-feira como referência, cai dentro da mesma semana)', () => {
    const { de, ate } = calcularPeriodoRelatorio('semana', new Date('2026-11-24T12:00:00'));
    expect(de <= '2026-11-24').toBe(true);
    expect(ate >= '2026-11-24').toBe(true);
  });

  it('calcula o intervalo do mês inteiro', () => {
    const { de, ate } = calcularPeriodoRelatorio('mes', new Date('2026-11-24T12:00:00'));
    expect(de).toBe('2026-11-01');
    expect(ate).toBe('2026-11-30');
  });
});

describe('montarTextoRelatorio', () => {
  const labelConquista = { primeiro_xixi: 'Primeiro xixi no penico' };

  it('avisa quando não há registros no período', () => {
    const texto = montarTextoRelatorio({
      nomeCrianca: 'Ana',
      de: '2026-11-01',
      ate: '2026-11-30',
      labelPeriodo: 'Novembro',
      registros: [],
      sinais: [],
      conquistas: [],
      labelConquista,
    });
    expect(texto).toContain('Nenhum registro neste período.');
    expect(texto).toContain('Relatório de desfralde — Ana');
  });

  it('inclui totais, escapes e conquistas do período, ignorando o que está fora', () => {
    const registros = [
      registro({ registradoEm: '2026-11-10T08:00:00.000Z', conteudo: 'xixi', iniciativa: 'pediu' }),
      registro({ registradoEm: '2026-11-10T10:00:00.000Z', local: 'escape_roupa' }),
      registro({ registradoEm: '2026-12-01T08:00:00.000Z', conteudo: 'coco' }), // fora do período
    ];
    const conquistas: DesfraldeConquista[] = [
      { id: 'c1', processoId: 'processo-1', tipo: 'primeiro_xixi', data: '2026-11-10', registradoPor: 'cuidador-1' },
      { id: 'c2', processoId: 'processo-1', tipo: 'primeiro_xixi', data: '2026-12-05', registradoPor: 'cuidador-1' }, // fora
    ];
    const sinais: SinalProntidao[] = [
      { id: 's1', childId: 'filho-1', sinal: 'avisa_ou_esconde', marcado: true, marcadoEm: '2026-11-01', desmarcadoEm: null, atualizadoPor: 'cuidador-1' },
    ];

    const texto = montarTextoRelatorio({
      nomeCrianca: 'Ana',
      de: '2026-11-01',
      ate: '2026-11-30',
      labelPeriodo: 'Novembro',
      registros,
      sinais,
      conquistas,
      labelConquista,
    });

    expect(texto).toContain('Xixi: 1 · Cocô: 0 · Os dois: 0');
    expect(texto).toContain('Escapes: 1');
    expect(texto).toContain('Sinais de prontidão observados: 1');
    expect(texto).toContain('Primeiro xixi no penico (10/11/2026)');
    expect(texto).not.toContain('05/12/2026');
  });
});

describe('montarTextoResumoCompartilhavel', () => {
  const baseConfig: DesfraldeConfiguracao = {
    processoId: 'processo-1',
    fraldaDia: false,
    fraldaSoneca: true,
    fraldaNoite: true,
    fraldaPasseio: true,
    recipiente: 'penico',
    modoHorario: 'intervalo',
    intervaloMin: '120',
    momentos: [],
    palavras: { xixi: 'xixi', coco: 'cocô', banheiro: 'banheiro' },
    combinados: 'Levar sempre uma troca de roupa na mochila.',
    recompensa: 'Adesivo no quadro a cada dia seco.',
    atualizadoPor: 'cuidador-1',
    atualizadoEm: '2026-11-01',
  };
  const labelRecipiente = { penico: 'Penico', vaso: 'Vaso com redutor' };

  it('inclui fase, recipiente, palavras, combinados e recompensa, mas nunca registros', () => {
    const texto = montarTextoResumoCompartilhavel({
      nomeCrianca: 'Ana',
      fase: 'dia_a_dia',
      labelFase: 'Dia a dia',
      config: baseConfig,
      labelRecipiente,
      horaInicio: '08:00',
      horaFim: '19:00',
      diasSemanaLabel: 'seg, ter, qua, qui, sex',
    });

    expect(texto).toContain('Fase atual: Dia a dia');
    expect(texto).toContain('Usa: Penico');
    expect(texto).toContain('xixi = "xixi"');
    expect(texto).toContain('Levar ao banheiro entre 08:00 e 19:00 (seg, ter, qua, qui, sex)');
    expect(texto).toContain('Levar sempre uma troca de roupa na mochila.');
    expect(texto).toContain('Adesivo no quadro a cada dia seco.');
    expect(texto).toContain('não inclui registros detalhados');
  });

  it('omite blocos quando os campos estão vazios', () => {
    const texto = montarTextoResumoCompartilhavel({
      nomeCrianca: 'Ana',
      fase: 'preparar',
      labelFase: 'Preparar',
      config: { ...baseConfig, recipiente: '', palavras: { xixi: '', coco: '', banheiro: '' }, combinados: '', recompensa: '' },
      labelRecipiente,
    });

    expect(texto).not.toContain('Usa:');
    expect(texto).not.toContain('Palavras usadas');
    expect(texto).not.toContain('Combinados:');
    expect(texto).not.toContain('Recompensa combinada:');
  });
});
