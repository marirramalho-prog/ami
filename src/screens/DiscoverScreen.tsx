import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { mockActivities, PILOT_CITY } from '../data/mockActivities';
import { ActivityCategory } from '../types/activity';

const CATEGORIAS: (ActivityCategory | 'Todas')[] = ['Todas', 'Extracurricular', 'Fim de semana'];

export default function DiscoverScreen() {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<ActivityCategory | 'Todas'>('Todas');

  const resultados = useMemo(() => {
    return mockActivities.filter((a) => {
      const combinaCategoria = categoria === 'Todas' || a.categoria === categoria;
      const termo = busca.trim().toLowerCase();
      const combinaBusca =
        !termo ||
        a.nome.toLowerCase().includes(termo) ||
        a.tipo.toLowerCase().includes(termo) ||
        a.bairro.toLowerCase().includes(termo);
      return combinaCategoria && combinaBusca;
    });
  }, [busca, categoria]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Descobrir atividades</Text>
      <Text style={styles.city}>{PILOT_CITY}</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Dados de exemplo, ainda não conectados a fontes reais — usados só para testar a busca.
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nome, tipo ou bairro"
        placeholderTextColor={colors.textMuted}
        value={busca}
        onChangeText={setBusca}
      />

      <View style={styles.categoriaRow}>
        {CATEGORIAS.map((c) => {
          const selected = categoria === c;
          return (
            <Pressable
              key={c}
              style={[styles.categoriaChip, selected && styles.categoriaChipSelected]}
              onPress={() => setCategoria(c)}
            >
              <Text
                style={[styles.categoriaChipText, selected && styles.categoriaChipTextSelected]}
              >
                {c}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardName}>{item.nome}</Text>
            <Text style={styles.cardDetail}>
              {item.tipo} · {item.bairro} · {item.faixaEtaria}
            </Text>
            <Text style={styles.cardDetail}>
              {item.horario} · {item.preco}
            </Text>
            <Text style={styles.cardDescription}>{item.descricao}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum resultado para essa busca.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  city: { fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: 12 },
  banner: {
    backgroundColor: colors.lavandaClaro,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  bannerText: { fontSize: 12, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  categoriaRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  categoriaChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.card,
  },
  categoriaChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoriaChipText: { fontSize: 13, color: colors.textMuted },
  categoriaChipTextSelected: { color: colors.text, fontWeight: '600' },
  list: { paddingBottom: 40, gap: 10 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardDetail: { fontSize: 13, color: colors.textMuted },
  cardDescription: { fontSize: 13, color: colors.text, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
});
