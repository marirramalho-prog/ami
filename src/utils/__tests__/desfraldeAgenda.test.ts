import { idEventoInicioDesfralde, montarEventoInicioDesfralde } from '../desfraldeAgenda';

describe('montarEventoInicioDesfralde', () => {
  it('monta um evento de marco, sem hora e sem lembrete', () => {
    const evento = montarEventoInicioDesfralde('processo-1', 'filho-1', new Date(2026, 10, 24));

    expect(evento.id).toBe(idEventoInicioDesfralde('processo-1'));
    expect(evento.titulo).toBe('Início do desfralde');
    expect(evento.data).toEqual({ dia: '24', mes: '11', ano: '2026' });
    expect(evento.hora).toBe('');
    expect(evento.lembrete).toBe(false);
    expect(evento.childIds).toEqual(['filho-1']);
  });

  it('gera o mesmo id pro mesmo processo, pra não duplicar o evento', () => {
    const a = montarEventoInicioDesfralde('processo-1', 'filho-1', new Date(2026, 10, 24));
    const b = montarEventoInicioDesfralde('processo-1', 'filho-1', new Date(2027, 0, 1));
    expect(a.id).toBe(b.id);
  });
});
