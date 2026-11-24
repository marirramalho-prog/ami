import { startOfWeek } from './calendarDates';
import { dateKey } from './date';
import {
  AmbienteRegistroDesfralde,
  ConteudoRegistroDesfralde,
  DesfraldeRegistro,
} from '../types/desfralde';

// Cálculos puros do painel (briefing, seção 3.4 e 5: "calculados no
// back-end a partir dos registros, sem guardar conclusões nem rótulos
// sobre a criança"). Aqui não há back-end, mas o princípio é o mesmo: nada
// aqui decide ou rotula, só soma e agrupa — o texto acolhedor de cada
// número é responsabilidade da tela, não deste módulo.

export interface FiltroPainelDesfralde {
  de?: string; // YYYY-MM-DD, inclusive
  ate?: string; // YYYY-MM-DD, inclusive
  conteudo?: ConteudoRegistroDesfralde;
  caregiverId?: string;
  ambiente?: AmbienteRegistroDesfralde;
}

function dataDoRegistro(registro: DesfraldeRegistro): string {
  return registro.registradoEm.slice(0, 10);
}

export function filtrarRegistros(
  registros: DesfraldeRegistro[],
  filtro: FiltroPainelDesfralde,
): DesfraldeRegistro[] {
  return registros.filter((r) => {
    const data = dataDoRegistro(r);
    if (filtro.de && data < filtro.de) return false;
    if (filtro.ate && data > filtro.ate) return false;
    if (filtro.conteudo && r.conteudo !== filtro.conteudo) return false;
    if (filtro.caregiverId && r.registradoPor !== filtro.caregiverId) return false;
    if (filtro.ambiente && r.ambiente !== filtro.ambiente) return false;
    return true;
  });
}

export interface TotaisPorTipo {
  xixi: number;
  coco: number;
  ambos: number;
}

export function totaisPorTipo(registros: DesfraldeRegistro[]): TotaisPorTipo {
  const totais: TotaisPorTipo = { xixi: 0, coco: 0, ambos: 0 };
  for (const r of registros) {
    if (r.conteudo === 'xixi' || r.conteudo === 'coco' || r.conteudo === 'ambos') {
      totais[r.conteudo] += 1;
    }
  }
  return totais;
}

export interface TotaisIniciativa {
  pedida: number;
  levada: number;
}

export function totaisIniciativa(registros: DesfraldeRegistro[]): TotaisIniciativa {
  let pedida = 0;
  let levada = 0;
  for (const r of registros) {
    if (r.iniciativa === 'pediu') pedida += 1;
    else if (r.iniciativa === 'levado') levada += 1;
  }
  return { pedida, levada };
}

export interface TotaisNoite {
  seco: number;
  molhado: number;
}

export function totaisNoite(registros: DesfraldeRegistro[]): TotaisNoite {
  let seco = 0;
  let molhado = 0;
  for (const r of registros) {
    if (r.periodo !== 'noite') continue;
    if (r.noiteResultado === 'seco') seco += 1;
    else if (r.noiteResultado === 'molhado') molhado += 1;
  }
  return { seco, molhado };
}

export function totalEscapes(registros: DesfraldeRegistro[]): number {
  return registros.filter((r) => r.local === 'escape_roupa').length;
}

export function escapesPorDia(registros: DesfraldeRegistro[]): Record<string, number> {
  const porDia: Record<string, number> = {};
  for (const r of registros) {
    if (r.local !== 'escape_roupa') continue;
    const dia = dataDoRegistro(r);
    porDia[dia] = (porDia[dia] || 0) + 1;
  }
  return porDia;
}

// Intervalo médio entre idas, em minutos — calculado dentro de cada dia
// (o intervalo "noturno" entre o último registro de um dia e o primeiro do
// seguinte não é uma ida ao banheiro espaçada, então não entra na conta).
export function intervaloMedioMinutos(registros: DesfraldeRegistro[]): number | null {
  const porDia = new Map<string, number[]>();
  for (const r of registros) {
    const dia = dataDoRegistro(r);
    const minutos = new Date(r.registradoEm).getTime() / 60000;
    const lista = porDia.get(dia) || [];
    lista.push(minutos);
    porDia.set(dia, lista);
  }

  const intervalos: number[] = [];
  for (const lista of porDia.values()) {
    const ordenada = lista.slice().sort((a, b) => a - b);
    for (let i = 1; i < ordenada.length; i++) {
      intervalos.push(ordenada[i] - ordenada[i - 1]);
    }
  }

  if (intervalos.length === 0) return null;
  const soma = intervalos.reduce((acc, v) => acc + v, 0);
  return Math.round(soma / intervalos.length);
}

export interface FaixaHorarioPico {
  inicio: number;
  fim: number;
  quantidade: number;
}

// Pico de horário dos escapes, em janelas de 2h (0-2, 2-4, ..., 22-24).
export function picoHorarioEscapes(registros: DesfraldeRegistro[]): FaixaHorarioPico | null {
  const escapes = registros.filter((r) => r.local === 'escape_roupa');
  if (escapes.length === 0) return null;

  const porFaixa = new Array(12).fill(0);
  for (const r of escapes) {
    const hora = Number(r.registradoEm.slice(11, 13));
    const faixa = Math.min(Math.max(Math.floor(hora / 2), 0), 11);
    porFaixa[faixa] += 1;
  }

  let indiceMax = 0;
  for (let i = 1; i < porFaixa.length; i++) {
    if (porFaixa[i] > porFaixa[indiceMax]) indiceMax = i;
  }

  return { inicio: indiceMax * 2, fim: indiceMax * 2 + 2, quantidade: porFaixa[indiceMax] };
}

export interface HorarioLembrete {
  hour: number;
  minute: number;
}

// Horários de um lembrete por intervalo fixo, de horaInicio até horaFim
// (inclusive), a cada intervaloMin minutos. Fica aqui (não em
// desfraldeNotifications.ts) pra poder ser testado sem precisar carregar
// expo-notifications, que não roda bem sob Jest fora de um app nativo real.
export function calcularHorariosIntervalo(
  horaInicio: string,
  horaFim: string,
  intervaloMin: string,
): HorarioLembrete[] {
  const passo = Number(intervaloMin);
  if (!passo || passo <= 0) return [];

  const [hiH, hiM] = (horaInicio || '08:00').split(':').map(Number);
  const [hfH, hfM] = (horaFim || '19:00').split(':').map(Number);
  const inicioMin = (hiH || 0) * 60 + (hiM || 0);
  const fimMin = (hfH || 0) * 60 + (hfM || 0);
  if (fimMin < inicioMin) return [];

  const horarios: HorarioLembrete[] = [];
  for (let m = inicioMin; m <= fimMin; m += passo) {
    horarios.push({ hour: Math.floor(m / 60) % 24, minute: m % 60 });
  }
  return horarios;
}

export interface PontoEvolucaoSemanal {
  semanaInicio: string;
  percentual: number;
  total: number;
}

function agruparPorSemana(registros: DesfraldeRegistro[]): Map<string, DesfraldeRegistro[]> {
  const porSemana = new Map<string, DesfraldeRegistro[]>();
  for (const r of registros) {
    const inicio = dateKey(startOfWeek(new Date(r.registradoEm)));
    const lista = porSemana.get(inicio) || [];
    lista.push(r);
    porSemana.set(inicio, lista);
  }
  return porSemana;
}

// Evolução das idas pedidas pela criança, semana a semana — só considera
// registros com iniciativa preenchida ("pediu" ou "levado").
export function evolucaoIniciativaPedida(registros: DesfraldeRegistro[]): PontoEvolucaoSemanal[] {
  const comIniciativa = registros.filter(
    (r) => r.iniciativa === 'pediu' || r.iniciativa === 'levado',
  );
  const porSemana = agruparPorSemana(comIniciativa);
  return Array.from(porSemana.entries())
    .map(([semanaInicio, lista]) => {
      const pedidas = lista.filter((r) => r.iniciativa === 'pediu').length;
      return {
        semanaInicio,
        percentual: Math.round((pedidas / lista.length) * 100),
        total: lista.length,
      };
    })
    .sort((a, b) => a.semanaInicio.localeCompare(b.semanaInicio));
}

// Evolução das noites secas, semana a semana — só considera registros de
// noite com resultado preenchido.
export function evolucaoNoitesSecas(registros: DesfraldeRegistro[]): PontoEvolucaoSemanal[] {
  const comResultado = registros.filter((r) => r.periodo === 'noite' && !!r.noiteResultado);
  const porSemana = agruparPorSemana(comResultado);
  return Array.from(porSemana.entries())
    .map(([semanaInicio, lista]) => {
      const secas = lista.filter((r) => r.noiteResultado === 'seco').length;
      return {
        semanaInicio,
        percentual: Math.round((secas / lista.length) * 100),
        total: lista.length,
      };
    })
    .sort((a, b) => a.semanaInicio.localeCompare(b.semanaInicio));
}
