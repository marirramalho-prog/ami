import { dateKey } from './date';
import { addDays, addMonths, labelDataCurta, labelMesAno, startOfWeek } from './calendarDates';
import {
  evolucaoIniciativaPedida,
  evolucaoNoitesSecas,
  filtrarRegistros,
  intervaloMedioMinutos,
  picoHorarioEscapes,
  totaisIniciativa,
  totaisNoite,
  totaisPorTipo,
  totalEscapes,
} from './desfraldeCalc';
import {
  DesfraldeConfiguracao,
  DesfraldeConquista,
  DesfraldeRegistro,
  FaseDesfralde,
  SinalProntidao,
} from '../types/desfralde';

// Relatório do período e resumo compartilhável (briefing, seção 3.9) — tudo
// aqui é só montagem de texto a partir dos cálculos puros de
// desfraldeCalc.ts, sem decidir nada sobre a criança. Nenhuma função daqui
// chama API nativa, então fica testável no Jest; quem efetivamente abre o
// menu de compartilhar (Share do React Native) fica em desfraldeShare.ts.

export type PeriodoRelatorio = 'semana' | 'mes';

export function calcularPeriodoRelatorio(
  periodo: PeriodoRelatorio,
  referencia: Date,
): { de: string; ate: string; label: string } {
  if (periodo === 'semana') {
    const inicio = startOfWeek(referencia);
    const fim = addDays(inicio, 6);
    return { de: dateKey(inicio), ate: dateKey(fim), label: `${labelDataCurta(inicio)} – ${labelDataCurta(fim)}` };
  }
  const inicioMes = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
  const fimMes = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0);
  return { de: dateKey(inicioMes), ate: dateKey(fimMes), label: labelMesAno(referencia) };
}

export function proximaReferencia(periodo: PeriodoRelatorio, referencia: Date, direcao: -1 | 1): Date {
  return periodo === 'semana' ? addDays(referencia, direcao * 7) : addMonths(referencia, direcao);
}

function formatarMinutos(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`;
}

function formatarDataBR(dataYYYYMMDD: string): string {
  const [ano, mes, dia] = dataYYYYMMDD.split('-');
  return `${dia}/${mes}/${ano}`;
}

export interface ParametrosRelatorio {
  nomeCrianca: string;
  de: string;
  ate: string;
  labelPeriodo: string;
  registros: DesfraldeRegistro[];
  sinais: SinalProntidao[];
  conquistas: DesfraldeConquista[];
  labelConquista: Record<string, string>;
}

// Monta o texto do relatório do período — totais, padrões e marcos, do
// jeito que um pai leria, sem nota, sem comparação e sem rótulo. Pensado
// pra virar o corpo de um compartilhamento (texto), não um PDF: sem
// biblioteca de geração de PDF/imagem no projeto hoje, o texto plano é o
// que dá pra oferecer com confiança de que funciona de verdade.
export function montarTextoRelatorio(params: ParametrosRelatorio): string {
  const { nomeCrianca, de, ate, labelPeriodo, registros, sinais, conquistas, labelConquista } = params;
  const doPeriodo = filtrarRegistros(registros, { de, ate });

  const linhas: string[] = [];
  linhas.push(`Relatório de desfralde — ${nomeCrianca}`);
  linhas.push(labelPeriodo);
  linhas.push('');

  if (doPeriodo.length === 0) {
    linhas.push('Nenhum registro neste período.');
  } else {
    const tipo = totaisPorTipo(doPeriodo);
    const iniciativa = totaisIniciativa(doPeriodo);
    const noite = totaisNoite(doPeriodo);
    const escapes = totalEscapes(doPeriodo);
    const pico = picoHorarioEscapes(doPeriodo);
    const intervaloMedio = intervaloMedioMinutos(doPeriodo);

    linhas.push(`Xixi: ${tipo.xixi} · Cocô: ${tipo.coco} · Os dois: ${tipo.ambos}`);
    linhas.push(`Pediu sozinho(a): ${iniciativa.pedida} · Foi levado(a) no horário: ${iniciativa.levada}`);
    if (noite.seco > 0 || noite.molhado > 0) {
      linhas.push(`Noites secas: ${noite.seco} · molhadas: ${noite.molhado}`);
    }
    if (intervaloMedio !== null) {
      linhas.push(`Intervalo médio entre as idas: ${formatarMinutos(intervaloMedio)}`);
    }
    linhas.push(`Escapes: ${escapes}`);
    if (escapes > 0 && pico) {
      linhas.push(
        `A maioria dos escapes foi entre ${String(pico.inicio).padStart(2, '0')}h e ${String(pico.fim).padStart(2, '0')}h.`,
      );
    }

    const evolucaoPedida = evolucaoIniciativaPedida(doPeriodo).slice(-4);
    if (evolucaoPedida.length > 0) {
      linhas.push('');
      linhas.push('Evolução das idas pedidas pela criança, semana a semana:');
      for (const ponto of evolucaoPedida) {
        linhas.push(`- Semana de ${labelDataCurta(new Date(`${ponto.semanaInicio}T00:00:00`))}: ${ponto.percentual}%`);
      }
    }
    const evolucaoNoite = evolucaoNoitesSecas(doPeriodo).slice(-4);
    if (evolucaoNoite.length > 0) {
      linhas.push('');
      linhas.push('Evolução das noites secas, semana a semana:');
      for (const ponto of evolucaoNoite) {
        linhas.push(`- Semana de ${labelDataCurta(new Date(`${ponto.semanaInicio}T00:00:00`))}: ${ponto.percentual}%`);
      }
    }
  }

  const sinaisMarcados = sinais.filter((s) => s.marcado);
  if (sinaisMarcados.length > 0) {
    linhas.push('');
    linhas.push(`Sinais de prontidão observados: ${sinaisMarcados.length}`);
  }

  const conquistasDoPeriodo = conquistas.filter((c) => c.data >= de && c.data <= ate);
  if (conquistasDoPeriodo.length > 0) {
    linhas.push('');
    linhas.push('Conquistas neste período:');
    for (const c of conquistasDoPeriodo) {
      linhas.push(`- ${labelConquista[c.tipo] || c.tipo} (${formatarDataBR(c.data)})`);
    }
  }

  return linhas.join('\n');
}

export interface ParametrosResumoCompartilhavel {
  nomeCrianca: string;
  fase: FaseDesfralde;
  labelFase: string;
  config: DesfraldeConfiguracao;
  labelRecipiente: Record<string, string>;
  horaInicio?: string;
  horaFim?: string;
  diasSemanaLabel?: string;
}

// Monta o resumo pra escola/babá (briefing, seção 3.9): fase atual,
// combinados, palavras da família e horários — nunca os registros ou
// observações detalhadas, que podem ter informação sensível e não servem
// pra quem só precisa saber "como ajudar hoje".
export function montarTextoResumoCompartilhavel(params: ParametrosResumoCompartilhavel): string {
  const { nomeCrianca, labelFase, config, labelRecipiente, horaInicio, horaFim, diasSemanaLabel } = params;

  const linhas: string[] = [];
  linhas.push(`Desfralde de ${nomeCrianca} — resumo`);
  linhas.push(`Fase atual: ${labelFase}`);
  linhas.push('');

  if (config.recipiente) {
    linhas.push(`Usa: ${labelRecipiente[config.recipiente] || config.recipiente}`);
  }
  if (config.palavras.xixi || config.palavras.coco || config.palavras.banheiro) {
    linhas.push(
      `Palavras usadas em casa: xixi = "${config.palavras.xixi}", cocô = "${config.palavras.coco}", banheiro = "${config.palavras.banheiro}"`,
    );
  }
  if (horaInicio && horaFim) {
    linhas.push(`Levar ao banheiro entre ${horaInicio} e ${horaFim}${diasSemanaLabel ? ` (${diasSemanaLabel})` : ''}.`);
  }
  if (config.combinados) {
    linhas.push('');
    linhas.push(`Combinados: ${config.combinados}`);
  }
  if (config.recompensa) {
    linhas.push(`Recompensa combinada: ${config.recompensa}`);
  }

  linhas.push('');
  linhas.push('Este resumo não inclui registros detalhados do dia a dia.');

  return linhas.join('\n');
}
