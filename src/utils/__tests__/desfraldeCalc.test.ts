import { DesfraldeRegistro } from '../../types/desfralde';
import {
  escapesPorDia,
  evolucaoIniciativaPedida,
  evolucaoNoitesSecas,
  filtrarRegistros,
  intervaloMedioMinutos,
  picoHorarioEscapes,
  totaisIniciativa,
  totaisNoite,
  totaisPorTipo,
  totalEscapes,
} from '../desfraldeCalc';

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

describe('totaisPorTipo / totaisIniciativa / totaisNoite / totalEscapes', () => {
  it('soma os totais corretamente, ignorando campos vazios', () => {
    const registros = [
      registro({ registradoEm: '2026-11-20T08:00:00.000Z', conteudo: 'xixi', iniciativa: 'pediu' }),
      registro({ registradoEm: '2026-11-20T10:00:00.000Z', conteudo: 'coco', iniciativa: 'levado' }),
      registro({ registradoEm: '2026-11-20T12:00:00.000Z', conteudo: 'ambos' }),
      registro({ registradoEm: '2026-11-20T14:00:00.000Z' }),
    ];

    expect(totaisPorTipo(registros)).toEqual({ xixi: 1, coco: 1, ambos: 1 });
    expect(totaisIniciativa(registros)).toEqual({ pedida: 1, levada: 1 });
  });

  it('conta noites secas e molhadas só entre registros de período noite', () => {
    const registros = [
      registro({ registradoEm: '2026-11-20T23:00:00.000Z', periodo: 'noite', noiteResultado: 'seco' }),
      registro({ registradoEm: '2026-11-21T06:00:00.000Z', periodo: 'noite', noiteResultado: 'molhado' }),
      registro({ registradoEm: '2026-11-21T10:00:00.000Z', periodo: 'dia', noiteResultado: 'seco' }),
    ];
    expect(totaisNoite(registros)).toEqual({ seco: 1, molhado: 1 });
  });

  it('conta escapes pelo campo local', () => {
    const registros = [
      registro({ registradoEm: '2026-11-20T08:00:00.000Z', local: 'escape_roupa' }),
      registro({ registradoEm: '2026-11-20T09:00:00.000Z', local: 'penico_vaso' }),
    ];
    expect(totalEscapes(registros)).toBe(1);
  });

  it('retorna zero em tudo pra lista vazia', () => {
    expect(totaisPorTipo([])).toEqual({ xixi: 0, coco: 0, ambos: 0 });
    expect(totaisIniciativa([])).toEqual({ pedida: 0, levada: 0 });
    expect(totaisNoite([])).toEqual({ seco: 0, molhado: 0 });
    expect(totalEscapes([])).toBe(0);
  });
});

describe('escapesPorDia', () => {
  it('agrupa escapes por dia, ignorando outros locais', () => {
    const registros = [
      registro({ registradoEm: '2026-11-20T08:00:00.000Z', local: 'escape_roupa' }),
      registro({ registradoEm: '2026-11-20T15:00:00.000Z', local: 'escape_roupa' }),
      registro({ registradoEm: '2026-11-21T09:00:00.000Z', local: 'escape_roupa' }),
      registro({ registradoEm: '2026-11-21T10:00:00.000Z', local: 'penico_vaso' }),
    ];
    expect(escapesPorDia(registros)).toEqual({ '2026-11-20': 2, '2026-11-21': 1 });
  });
});

describe('intervaloMedioMinutos', () => {
  it('calcula a média dos intervalos dentro de cada dia', () => {
    const registros = [
      registro({ registradoEm: '2026-11-20T08:00:00.000Z' }),
      registro({ registradoEm: '2026-11-20T10:00:00.000Z' }), // +120 min
      registro({ registradoEm: '2026-11-20T11:30:00.000Z' }), // +90 min
    ];
    expect(intervaloMedioMinutos(registros)).toBe(105);
  });

  it('não soma o intervalo entre o último registro de um dia e o primeiro do seguinte', () => {
    const registros = [
      registro({ registradoEm: '2026-11-20T20:00:00.000Z' }),
      registro({ registradoEm: '2026-11-21T07:00:00.000Z' }), // dia diferente, não conta
    ];
    expect(intervaloMedioMinutos(registros)).toBeNull();
  });

  it('retorna null sem registros suficientes', () => {
    expect(intervaloMedioMinutos([])).toBeNull();
    expect(intervaloMedioMinutos([registro({ registradoEm: '2026-11-20T08:00:00.000Z' })])).toBeNull();
  });
});

describe('picoHorarioEscapes', () => {
  it('encontra a faixa de 2h com mais escapes', () => {
    const registros = [
      registro({ registradoEm: '2026-11-20T15:10:00.000Z', local: 'escape_roupa' }),
      registro({ registradoEm: '2026-11-20T15:50:00.000Z', local: 'escape_roupa' }),
      registro({ registradoEm: '2026-11-20T09:00:00.000Z', local: 'escape_roupa' }),
    ];
    expect(picoHorarioEscapes(registros)).toEqual({ inicio: 14, fim: 16, quantidade: 2 });
  });

  it('retorna null sem nenhum escape', () => {
    const registros = [registro({ registradoEm: '2026-11-20T09:00:00.000Z', local: 'penico_vaso' })];
    expect(picoHorarioEscapes(registros)).toBeNull();
  });
});

describe('evolucaoIniciativaPedida / evolucaoNoitesSecas', () => {
  it('calcula o percentual pedido por semana, ignorando registros sem iniciativa', () => {
    const registros = [
      registro({ registradoEm: '2026-11-02T08:00:00.000Z', iniciativa: 'pediu' }), // semana de 01/11 (dom)
      registro({ registradoEm: '2026-11-03T08:00:00.000Z', iniciativa: 'levado' }),
      registro({ registradoEm: '2026-11-03T09:00:00.000Z' }), // sem iniciativa, ignorado
      registro({ registradoEm: '2026-11-10T08:00:00.000Z', iniciativa: 'pediu' }), // semana seguinte
      registro({ registradoEm: '2026-11-10T09:00:00.000Z', iniciativa: 'pediu' }),
    ];

    const evolucao = evolucaoIniciativaPedida(registros);
    expect(evolucao).toEqual([
      { semanaInicio: '2026-11-01', percentual: 50, total: 2 },
      { semanaInicio: '2026-11-08', percentual: 100, total: 2 },
    ]);
  });

  it('calcula o percentual de noites secas por semana', () => {
    const registros = [
      registro({ registradoEm: '2026-11-02T23:00:00.000Z', periodo: 'noite', noiteResultado: 'seco' }),
      registro({ registradoEm: '2026-11-03T06:00:00.000Z', periodo: 'noite', noiteResultado: 'molhado' }),
    ];
    expect(evolucaoNoitesSecas(registros)).toEqual([
      { semanaInicio: '2026-11-01', percentual: 50, total: 2 },
    ]);
  });
});

describe('filtrarRegistros', () => {
  const registros = [
    registro({ registradoEm: '2026-11-01T08:00:00.000Z', conteudo: 'xixi', ambiente: 'casa', registradoPor: 'c1' }),
    registro({ registradoEm: '2026-11-15T08:00:00.000Z', conteudo: 'coco', ambiente: 'escola', registradoPor: 'c2' }),
    registro({ registradoEm: '2026-11-30T08:00:00.000Z', conteudo: 'xixi', ambiente: 'casa', registradoPor: 'c1' }),
  ];

  it('filtra por período (de/ate, inclusive)', () => {
    const filtrados = filtrarRegistros(registros, { de: '2026-11-10', ate: '2026-11-20' });
    expect(filtrados).toHaveLength(1);
    expect(filtrados[0].conteudo).toBe('coco');
  });

  it('filtra por conteúdo, cuidador e ambiente', () => {
    expect(filtrarRegistros(registros, { conteudo: 'xixi' })).toHaveLength(2);
    expect(filtrarRegistros(registros, { caregiverId: 'c2' })).toHaveLength(1);
    expect(filtrarRegistros(registros, { ambiente: 'casa' })).toHaveLength(2);
  });

  it('sem filtro nenhum, retorna tudo', () => {
    expect(filtrarRegistros(registros, {})).toHaveLength(3);
  });
});
