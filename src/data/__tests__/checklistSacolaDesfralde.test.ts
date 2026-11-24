import { idChecklistSacolaDesfralde, montarChecklistSacolaDesfralde } from '../checklistSacolaDesfralde';

describe('montarChecklistSacolaDesfralde', () => {
  it('monta o checklist com os itens padrão e sem origemAuto (fica editável igual aos outros)', () => {
    const checklist = montarChecklistSacolaDesfralde('filho-1', 'Ana');

    expect(checklist.id).toBe(idChecklistSacolaDesfralde('filho-1'));
    expect(checklist.nome).toBe('Sacola do desfralde — Ana');
    expect(checklist.origemAuto).toBeUndefined();
    expect(checklist.itens.length).toBeGreaterThan(0);
    expect(checklist.itens.every((i) => i.feito === false)).toBe(true);
    expect(new Set(checklist.itens.map((i) => i.id)).size).toBe(checklist.itens.length);
  });
});
