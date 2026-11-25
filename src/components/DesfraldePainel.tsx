import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';
import ChipSelector from './ChipSelector';
import { Caregiver } from '../types/caregiver';
import { AmbienteRegistroDesfralde, ConteudoRegistroDesfralde, DesfraldeRegistro } from '../types/desfralde';
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
} from '../utils/desfraldeCalc';
import { addDays, addMonths, labelDataCurta, labelMesAno, startOfWeek } from '../utils/calendarDates';
import { dateKey } from '../utils/date';

type Periodo = 'dia' | 'semana' | 'mes';

const LABEL_PERIODO_PAINEL: Record<Periodo, string> = { dia: 'Dia', semana: 'Semana', mes: 'Mês' };
const LABEL_CONTEUDO_FILTRO: Record<ConteudoRegistroDesfralde, string> = {
  '': 'Todos',
  xixi: 'Xixi',
  coco: 'Cocô',
  ambos: 'Os dois',
};
const LABEL_AMBIENTE_FILTRO: Record<AmbienteRegistroDesfralde, string> = {
  '': 'Todos',
  casa: 'Casa',
  escola: 'Escola',
  outro: 'Outro',
};

function calcularPeriodo(periodo: Periodo, referencia: Date): { de: string; ate: string; label: string } {
  if (periodo === 'dia') {
    const chave = dateKey(referencia);
    return { de: chave, ate: chave, label: labelDataCurta(referencia) };
  }
  if (periodo === 'semana') {
    const inicio = startOfWeek(referencia);
    const fim = addDays(inicio, 6);
    return {
      de: dateKey(inicio),
      ate: dateKey(fim),
      label: `${labelDataCurta(inicio)} – ${labelDataCurta(fim)}`,
    };
  }
  const inicioMes = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
  const fimMes = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0);
  return { de: dateKey(inicioMes), ate: dateKey(fimMes), label: labelMesAno(referencia) };
}

function formatarMinutos(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`;
}

interface Props {
  registros: DesfraldeRegistro[];
  caregivers: Caregiver[];
}

// Painel de acompanhamento (briefing, seção 3.4) — mostra padrões de forma
// neutra, sem nota, sem cor de alerta pra escape e sem comparação entre
// crianças. Os números vêm só dos cálculos puros de desfraldeCalc.ts.
export default function DesfraldePainel({ registros, caregivers }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [periodo, setPeriodo] = useState<Periodo>('semana');
  const [referencia, setReferencia] = useState(new Date());
  const [filtroConteudo, setFiltroConteudo] = useState<ConteudoRegistroDesfralde>('');
  const [filtroCaregiverId, setFiltroCaregiverId] = useState('');
  const [filtroAmbiente, setFiltroAmbiente] = useState<AmbienteRegistroDesfralde>('');

  const { de, ate, label } = useMemo(() => calcularPeriodo(periodo, referencia), [periodo, referencia]);

  const registrosDoPeriodo = useMemo(
    () =>
      filtrarRegistros(registros, {
        de,
        ate,
        conteudo: filtroConteudo,
        caregiverId: filtroCaregiverId,
        ambiente: filtroAmbiente,
      }),
    [registros, de, ate, filtroConteudo, filtroCaregiverId, filtroAmbiente],
  );

  // Evolução olha pras últimas semanas independente do período escolhido
  // acima (dia/semana/mês é sobre os totais, não sobre a tendência).
  const registrosParaEvolucao = useMemo(
    () =>
      filtrarRegistros(registros, {
        conteudo: filtroConteudo,
        caregiverId: filtroCaregiverId,
        ambiente: filtroAmbiente,
      }),
    [registros, filtroConteudo, filtroCaregiverId, filtroAmbiente],
  );

  const totaisTipo = totaisPorTipo(registrosDoPeriodo);
  const iniciativa = totaisIniciativa(registrosDoPeriodo);
  const noite = totaisNoite(registrosDoPeriodo);
  const escapes = totalEscapes(registrosDoPeriodo);
  const pico = picoHorarioEscapes(registrosDoPeriodo);
  const intervaloMedio = intervaloMedioMinutos(registrosDoPeriodo);
  const evolucaoPedida = evolucaoIniciativaPedida(registrosParaEvolucao).slice(-4);
  const evolucaoNoite = evolucaoNoitesSecas(registrosParaEvolucao).slice(-4);

  function navegar(direcao: -1 | 1) {
    setReferencia((atual) => {
      if (periodo === 'dia') return addDays(atual, direcao);
      if (periodo === 'semana') return addDays(atual, direcao * 7);
      return addMonths(atual, direcao);
    });
  }

  return (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>Painel de acompanhamento</Text>

      <ChipSelector
        label=""
        options={Object.values(LABEL_PERIODO_PAINEL)}
        value={LABEL_PERIODO_PAINEL[periodo]}
        onChange={(l) => {
          const chave = (Object.entries(LABEL_PERIODO_PAINEL).find(([, v]) => v === l)?.[0] ||
            'semana') as Periodo;
          setPeriodo(chave);
          setReferencia(new Date());
        }}
      />

      <View style={styles.navRow}>
        <Pressable onPress={() => navegar(-1)} accessibilityRole="button" accessibilityLabel="Período anterior">
          <Text style={styles.navSeta}>◀</Text>
        </Pressable>
        <Pressable onPress={() => setReferencia(new Date())}>
          <Text style={styles.navLabel}>{label}</Text>
        </Pressable>
        <Pressable onPress={() => navegar(1)} accessibilityRole="button" accessibilityLabel="Próximo período">
          <Text style={styles.navSeta}>▶</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      <ChipSelector
        label="Tipo"
        options={Object.values(LABEL_CONTEUDO_FILTRO)}
        value={LABEL_CONTEUDO_FILTRO[filtroConteudo]}
        onChange={(l) =>
          setFiltroConteudo(
            (Object.entries(LABEL_CONTEUDO_FILTRO).find(([, v]) => v === l)?.[0] ||
              '') as ConteudoRegistroDesfralde,
          )
        }
      />
      <ChipSelector
        label="Ambiente"
        options={Object.values(LABEL_AMBIENTE_FILTRO)}
        value={LABEL_AMBIENTE_FILTRO[filtroAmbiente]}
        onChange={(l) =>
          setFiltroAmbiente(
            (Object.entries(LABEL_AMBIENTE_FILTRO).find(([, v]) => v === l)?.[0] ||
              '') as AmbienteRegistroDesfralde,
          )
        }
      />
      {caregivers.length > 0 && (
        <ChipSelector
          label="Cuidador"
          options={['Todos', ...caregivers.map((c) => c.nomeCompleto)]}
          value={caregivers.find((c) => c.id === filtroCaregiverId)?.nomeCompleto || 'Todos'}
          onChange={(l) =>
            setFiltroCaregiverId(l === 'Todos' ? '' : caregivers.find((c) => c.nomeCompleto === l)?.id || '')
          }
        />
      )}

      <View style={styles.divider} />

      {registrosDoPeriodo.length === 0 ? (
        <Text style={styles.helper}>Nenhum registro nesse período com esses filtros.</Text>
      ) : (
        <>
          <Text style={styles.resumoLinha}>
            Xixi: {totaisTipo.xixi} · Cocô: {totaisTipo.coco} · Os dois: {totaisTipo.ambos}
          </Text>
          <Text style={styles.resumoLinha}>
            Pediu sozinho(a): {iniciativa.pedida} · Foi levado(a) no horário: {iniciativa.levada}
          </Text>
          {(noite.seco > 0 || noite.molhado > 0) && (
            <Text style={styles.resumoLinha}>
              Noites secas: {noite.seco} · molhadas: {noite.molhado}
            </Text>
          )}
          {intervaloMedio !== null && (
            <Text style={styles.resumoLinha}>Intervalo médio entre as idas: {formatarMinutos(intervaloMedio)}</Text>
          )}
          <Text style={styles.resumoLinha}>Escapes: {escapes}</Text>
          {escapes > 0 && (
            <>
              <Text style={styles.helper}>Escapes fazem parte. Olhar os horários ajuda a ajustar a rotina.</Text>
              {pico && (
                <Text style={styles.helper}>
                  A maioria dos escapes foi entre {String(pico.inicio).padStart(2, '0')}h e{' '}
                  {String(pico.fim).padStart(2, '0')}h.
                </Text>
              )}
            </>
          )}
        </>
      )}

      {(evolucaoPedida.length > 0 || evolucaoNoite.length > 0) && (
        <>
          <View style={styles.divider} />
          <Text style={styles.label}>Evolução, semana a semana</Text>
          {evolucaoPedida.map((ponto) => (
            <Text key={`pedida-${ponto.semanaInicio}`} style={styles.helper}>
              Semana de {labelDataCurta(new Date(`${ponto.semanaInicio}T00:00:00`))}: {ponto.percentual}% das idas
              foram pedidas pela criança ({ponto.total} registros)
            </Text>
          ))}
          {evolucaoNoite.map((ponto) => (
            <Text key={`noite-${ponto.semanaInicio}`} style={styles.helper}>
              Semana de {labelDataCurta(new Date(`${ponto.semanaInicio}T00:00:00`))}: {ponto.percentual}% das noites
              secas ({ponto.total} registros)
            </Text>
          ))}
        </>
      )}
    </View>
  );
}

function getStyles(colors: Colors) {
  return StyleSheet.create({
    form: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
    navSeta: { fontSize: 16, color: colors.text, paddingHorizontal: 8 },
    navLabel: { fontSize: 14, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
    resumoLinha: { fontSize: 13, color: colors.text },
    helper: { fontSize: 12, color: colors.textMuted },
    label: { fontSize: 13, fontWeight: '600', color: colors.text },
  });
}
