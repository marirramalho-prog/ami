import {
  elegivelParaIniciarDesfralde,
  IDADE_MAXIMA_DESFRALDE_MESES,
  IDADE_MINIMA_DESFRALDE_MESES,
  mostrarEntradaDesfralde,
} from '../desfraldeElegibilidade';

describe('elegivelParaIniciarDesfralde', () => {
  it('não libera sem idade conhecida', () => {
    expect(elegivelParaIniciarDesfralde(null)).toBe(false);
  });

  it('não libera abaixo da idade mínima (24 meses)', () => {
    expect(elegivelParaIniciarDesfralde(IDADE_MINIMA_DESFRALDE_MESES - 1)).toBe(false);
  });

  it('libera a partir da idade mínima, inclusive', () => {
    expect(elegivelParaIniciarDesfralde(IDADE_MINIMA_DESFRALDE_MESES)).toBe(true);
    expect(elegivelParaIniciarDesfralde(IDADE_MINIMA_DESFRALDE_MESES + 10)).toBe(true);
  });
});

describe('mostrarEntradaDesfralde', () => {
  it('esconde sem idade conhecida, mesmo com processo', () => {
    expect(mostrarEntradaDesfralde(null, true)).toBe(false);
  });

  it('esconde acima da idade máxima, mesmo com processo', () => {
    expect(mostrarEntradaDesfralde(IDADE_MAXIMA_DESFRALDE_MESES + 1, true)).toBe(false);
  });

  it('esconde abaixo da idade mínima sem processo em andamento', () => {
    expect(mostrarEntradaDesfralde(IDADE_MINIMA_DESFRALDE_MESES - 1, false)).toBe(false);
  });

  it('mostra abaixo da idade mínima se já existe processo (efeito gatilho)', () => {
    expect(mostrarEntradaDesfralde(IDADE_MINIMA_DESFRALDE_MESES - 1, true)).toBe(true);
  });

  it('mostra dentro da faixa, com ou sem processo', () => {
    expect(mostrarEntradaDesfralde(30, false)).toBe(true);
    expect(mostrarEntradaDesfralde(30, true)).toBe(true);
  });
});
