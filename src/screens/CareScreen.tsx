import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Child, childFullName } from '../types/child';
import { CareMilestone, CategoriaCuidado } from '../types/careMilestone';
import { AGENDA_CUIDADOS } from '../data/agendaCuidados';
import { loadChildren } from '../storage/childrenStorage';
import { calcularDataAncora, prazoRelativo, proximaOcorrencia } from '../utils/careSchedule';

const ICONE_MARCO: Record<string, string> = {
  vacina_ao_nascer: '💉',
  vacina_2m: '💉',
  vacina_3m: '💉',
  vacina_4m: '💉',
  vacina_5m: '💉',
  vacina_6m: '💉',
  vacina_9m: '💉',
  vacina_12m: '💉',
  vacina_15m: '💉',
  vacina_4a: '💉',
  puericultura_1sem: '🩺',
  puericultura_1m: '🩺',
  puericultura_2m: '🩺',
  puericultura_4m: '🩺',
  puericultura_6m: '🩺',
  puericultura_9m: '🩺',
  puericultura_12m: '🩺',
  puericultura_18m: '🩺',
  puericultura_24m: '🩺',
  puericultura_anual: '🩺',
  especialidade_odontopediatra: '🦷',
  especialidade_oftalmologista: '👁️',
  especialidade_audicao: '👂',
  triagem_pezinho: '🩸',
  triagem_olhinho: '👁️',
  triagem_orelhinha: '👂',
  triagem_coracaozinho: '❤️',
  triagem_linguinha: '👶',
};

const FILTROS: { categoria: CategoriaCuidado | 'todos'; label: string }[] = [
  { categoria: 'todos', label: 'Todos' },
  { categoria: 'vacina', label: 'Vacina' },
  { categoria: 'puericultura', label: 'Puericultura' },
  { categoria: 'especialidade', label: 'Especialidade' },
  { categoria: 'triagem_neonatal', label: 'Triagem neonatal' },
];

interface MarcoCalculado {
  marco: CareMilestone;
  data: Date;
}

export default function CareScreen() {
  const navigation = useNavigation<any>();
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<CategoriaCuidado | 'todos'>('todos');

  useFocusEffect(
    useCallback(() => {
      loadChildren().then((list) => {
        setChildren(list);
        setChildId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0]?.id ?? null));
      });
    }, []),
  );

  const child = children.find((c) => c.id === childId) || null;

  const marcosCalculados = useMemo<MarcoCalculado[]>(() => {
    if (!child) return [];
    const hoje = new Date();
    return AGENDA_CUIDADOS.filter((m) => filtro === 'todos' || m.categoria === filtro)
      .map((marco) => {
        const ancora = calcularDataAncora(child.dataNascimento, marco);
        const data = proximaOcorrencia(ancora, marco.frequencia, hoje);
        return { marco, data };
      })
      .sort((a, b) => a.data.getTime() - b.data.getTime());
  }, [child, filtro]);

  if (children.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>Agenda de cuidados</Text>
        <Text style={styles.empty}>
          Cadastre um perfil de filho(a) na aba Perfis pra ver o calendário de cuidados.
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Perfis')}
          accessibilityRole="button"
          accessibilityLabel="Ir para a aba Perfis"
        >
          <Text style={[styles.empty, styles.link]}>👶 ir para Perfis</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda de cuidados</Text>
        <Text style={styles.subtitle}>
          Calendário público de vacina, puericultura e triagens aplicado à data de nascimento — não
          é orientação médica personalizada.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.row}>
          {children.map((c) => {
            const selected = childId === c.id;
            return (
              <Pressable
                key={c.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setChildId(c.id)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {c.avatar} {childFullName(c)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroScroll}>
          <View style={styles.row}>
            {FILTROS.map((f) => {
              const selected = filtro === f.categoria;
              return (
                <Pressable
                  key={f.categoria}
                  style={[styles.filtroChip, selected && styles.filtroChipSelected]}
                  onPress={() => setFiltro(f.categoria)}
                >
                  <Text
                    style={[styles.filtroChipText, selected && styles.filtroChipTextSelected]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.list}>
          {marcosCalculados.length === 0 && (
            <Text style={styles.empty}>Nenhum marco encontrado nesse filtro.</Text>
          )}
          {marcosCalculados.map(({ marco, data }) => {
            const mostrarSelo = marco.categoria === 'especialidade' && !marco.validadoPediatra;
            return (
              <View key={marco.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.icone}>
                    <Text style={styles.iconeTexto}>{ICONE_MARCO[marco.id] || '🩺'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitulo}>{marco.titulo}</Text>
                    <Text style={styles.cardSubtitulo}>
                      {marco.idadeLabel} · {prazoRelativo(data, new Date())}
                    </Text>
                  </View>
                </View>

                {marco.observacao ? (
                  <Text style={styles.observacao}>{marco.observacao}</Text>
                ) : null}

                {mostrarSelo && (
                  <View style={styles.selo}>
                    <Text style={styles.seloTexto}>
                      🕒 Aguardando validação do pediatra parceiro
                    </Text>
                  </View>
                )}

                <View style={styles.divider} />
                <Text style={styles.fonte}>
                  Fonte: {marco.fonte}
                  {marco.categoria === 'especialidade'
                    ? ' — confirme com o pediatra da família'
                    : ''}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  header: {
    backgroundColor: colors.lilasSuave,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 12 },
  link: { color: colors.text, fontWeight: '600', marginTop: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textMuted },
  chipTextSelected: { color: colors.text, fontWeight: '600' },
  filtroScroll: { marginBottom: 4 },
  filtroChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: colors.brancoSuave,
  },
  filtroChipSelected: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  filtroChipText: { fontSize: 13, color: colors.textMuted },
  filtroChipTextSelected: { color: colors.text, fontWeight: '600' },
  list: { gap: 12, marginTop: 8 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icone: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.lavandaClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeTexto: { fontSize: 16 },
  cardTitulo: { fontSize: 14, fontWeight: '500', color: colors.text },
  cardSubtitulo: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  observacao: { fontSize: 12, color: colors.textMuted },
  selo: {
    backgroundColor: colors.azulGelo,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  seloTexto: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  divider: { height: 0.5, backgroundColor: colors.azulGelo },
  fonte: { fontSize: 11, color: colors.textMuted },
});
