import { DatePart } from './date';
import { addDays } from './calendarDates';
import { CareMilestone, FrequenciaCuidado } from '../types/careMilestone';

// Meses de intervalo entre ocorrências pra cada frequência recorrente.
// "unica" e "conforme_resultado" não repetem — ficam parados na primeira
// data calculada.
const INTERVALO_MESES: Partial<Record<FrequenciaCuidado, number>> = {
  anual: 12,
  anual_influenza: 12,
  a_cada_6_meses: 6,
  a_cada_2_anos: 24,
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Diferente de addMonths em calendarDates.ts (que zera pro dia 1, pensado
// pra navegação de calendário) — aqui precisamos preservar o dia de
// nascimento pra calcular a data certa de cada marco.
function addMonthsKeepDay(date: Date, meses: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + meses);
  return d;
}

// Primeira data em que o marco se aplica, a partir do nascimento.
export function calcularDataAncora(nascimento: DatePart, marco: CareMilestone): Date {
  const nascDate = new Date(Number(nascimento.ano), Number(nascimento.mes) - 1, Number(nascimento.dia));
  if (marco.idadeDias !== undefined) return addDays(nascDate, marco.idadeDias);
  if (marco.idadeMeses !== undefined) return addMonthsKeepDay(nascDate, marco.idadeMeses);
  return nascDate;
}

// Pra marcos recorrentes (vacina anual, retorno a cada 6 meses/2 anos),
// avança a partir da data-âncora até achar a próxima ocorrência que ainda
// não passou. Marcos "unica"/"conforme_resultado" retornam a âncora direto.
export function proximaOcorrencia(dataAncora: Date, frequencia: FrequenciaCuidado, hoje: Date): Date {
  const intervalo = INTERVALO_MESES[frequencia];
  if (!intervalo) return dataAncora;

  let data = dataAncora;
  const referencia = startOfDay(hoje);
  while (startOfDay(data) < referencia) {
    data = addMonthsKeepDay(data, intervalo);
  }
  return data;
}

function plural(n: number, singular: string, pluralForm: string): string {
  return n === 1 ? singular : pluralForm;
}

// Texto curto e neutro (sem "atrasado"/alarme) pra idade · prazo do card.
export function prazoRelativo(data: Date, hoje: Date): string {
  const diffDias = Math.round(
    (startOfDay(data).getTime() - startOfDay(hoje).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDias === 0) return 'hoje';

  if (diffDias > 0) {
    if (diffDias < 30) return `em ${diffDias} ${plural(diffDias, 'dia', 'dias')}`;
    const meses = Math.round(diffDias / 30);
    if (meses < 12) return `em ${meses} ${plural(meses, 'mês', 'meses')}`;
    const anos = Math.round(meses / 12);
    return `em ${anos} ${plural(anos, 'ano', 'anos')}`;
  }

  // Data já passada: mostra a data em vez de linguagem de atraso — o card
  // é informativo, não uma cobrança.
  const dd = String(data.getDate()).padStart(2, '0');
  const mm = String(data.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${data.getFullYear()}`;
}
