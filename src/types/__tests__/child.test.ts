import { childUsaFralda } from '../child';

describe('childUsaFralda', () => {
  it('trata o campo ausente (perfis antigos) como "sim"', () => {
    expect(childUsaFralda({})).toBe(true);
  });

  it('respeita true e false quando o campo existe', () => {
    expect(childUsaFralda({ usaFralda: true })).toBe(true);
    expect(childUsaFralda({ usaFralda: false })).toBe(false);
  });
});
