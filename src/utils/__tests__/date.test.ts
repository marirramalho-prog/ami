import { datePartToKey } from '../date';

describe('datePartToKey', () => {
  it('monta YYYY-MM-DD com zero à esquerda, sem passar por Date', () => {
    expect(datePartToKey({ dia: '5', mes: '3', ano: '2026' })).toBe('2026-03-05');
  });

  it('mantém valores já com dois dígitos', () => {
    expect(datePartToKey({ dia: '24', mes: '11', ano: '2026' })).toBe('2026-11-24');
  });
});
