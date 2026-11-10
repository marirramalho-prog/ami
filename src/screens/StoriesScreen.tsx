import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Child, childFullName } from '../types/child';
import { Caregiver } from '../types/caregiver';
import { AgendaEvent } from '../types/routine';
import {
  Arco,
  Comprimento,
  CustomCharacter,
  Narrador,
  PapelCrianca,
  Story,
  StoryPreferences,
  Sustinho,
  Tema,
  TipoFinal,
} from '../types/story';
import { loadChildren } from '../storage/childrenStorage';
import { loadCaregivers } from '../storage/caregiverStorage';
import { loadEvents } from '../storage/routineStorage';
import {
  loadCharacters,
  saveCharacters,
  loadStories,
  saveStories,
} from '../storage/storyStorage';
import { generateStory } from '../utils/storyApi';
import ChipSelector from '../components/ChipSelector';

interface PersonagemSelecionado {
  id: string;
  nome: string;
  isChild: boolean;
}

const emptyPrefs: StoryPreferences = {
  personagens: [],
  arco: '',
  vilao: '',
  papelCrianca: '',
  relacao: '',
  tema: '',
  sustinho: '',
  moral: '',
  lugar: '',
  epoca: '',
  comprimento: 'média (4-7 min)',
  faixaEtaria: '',
  narrador: '',
  tipoFinal: 'fechado',
  serie: false,
  eventoVinculadoId: null,
};

export default function StoriesScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [customCharacters, setCustomCharacters] = useState<CustomCharacter[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [stories, setStories] = useState<Story[]>([]);

  const [selecionados, setSelecionados] = useState<PersonagemSelecionado[]>([]);
  const [novoPersonagem, setNovoPersonagem] = useState('');
  const [prefs, setPrefs] = useState<StoryPreferences>(emptyPrefs);

  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState('');
  const [historiaGerada, setHistoriaGerada] = useState<Story | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadChildren().then(setChildren);
      loadCaregivers().then(setCaregivers);
      loadCharacters().then(setCustomCharacters);
      loadEvents().then(setEvents);
      loadStories().then(setStories);
    }, []),
  );

  function updatePrefs<K extends keyof StoryPreferences>(key: K, value: StoryPreferences[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function togglePersonagem(p: PersonagemSelecionado) {
    setSelecionados((prev) =>
      prev.some((s) => s.id === p.id) ? prev.filter((s) => s.id !== p.id) : [...prev, p],
    );
  }

  async function handleAddCustomCharacter() {
    const nome = novoPersonagem.trim();
    if (!nome) return;
    const character: CustomCharacter = { id: Date.now().toString(), nome, descricao: '' };
    const updated = [...customCharacters, character];
    setCustomCharacters(updated);
    await saveCharacters(updated);
    togglePersonagem({ id: character.id, nome: character.nome, isChild: false });
    setNovoPersonagem('');
  }

  const eventoSelecionado = events.find((e) => e.id === prefs.eventoVinculadoId) || null;

  async function handleGerar() {
    setErro('');
    setHistoriaGerada(null);
    setGerando(true);

    const preferenciasFinal: StoryPreferences = {
      ...prefs,
      personagens: selecionados.map((s) => s.nome),
    };

    try {
      const texto = await generateStory({
        ...preferenciasFinal,
        eventoContexto: eventoSelecionado?.titulo,
      });

      const story: Story = {
        id: Date.now().toString(),
        criadaEm: new Date().toISOString(),
        childIds: selecionados.filter((s) => s.isChild).map((s) => s.id),
        preferencias: preferenciasFinal,
        serieId: null,
        texto,
      };

      const updated = [story, ...stories];
      setStories(updated);
      await saveStories(updated);
      setHistoriaGerada(story);

      // Sem "criar como série" marcado, não carrega os personagens/preferências
      // pra próxima história — cada uma começa do zero, sem vincular por engano
      // quem foi escolhido da última vez (ex: um irmão que não devia entrar
      // nesta história nova). Com série marcada, mantém a base (é o propósito
      // da opção), só limpa o vínculo de evento, que é específico de cada história.
      if (!preferenciasFinal.serie) {
        setSelecionados([]);
        setPrefs(emptyPrefs);
      } else {
        updatePrefs('eventoVinculadoId', null);
      }
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível gerar a história. O servidor local está rodando? (server/README.md)',
      );
    } finally {
      setGerando(false);
    }
  }

  const podeGerar = selecionados.length > 0 && !gerando;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Contador de histórias</Text>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Personagens</Text>
          <View style={styles.row}>
            {children.map((child) => {
              const selected = selecionados.some((s) => s.id === child.id);
              return (
                <Pressable
                  key={child.id}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() =>
                    togglePersonagem({ id: child.id, nome: childFullName(child), isChild: true })
                  }
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {child.avatar} {childFullName(child)}
                  </Text>
                </Pressable>
              );
            })}
            {caregivers.map((caregiver) => {
              const selected = selecionados.some((s) => s.id === caregiver.id);
              return (
                <Pressable
                  key={caregiver.id}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() =>
                    togglePersonagem({
                      id: caregiver.id,
                      nome: caregiver.nomeCompleto,
                      isChild: false,
                    })
                  }
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {caregiver.nomeCompleto}
                  </Text>
                </Pressable>
              );
            })}
            {customCharacters.map((character) => {
              const selected = selecionados.some((s) => s.id === character.id);
              return (
                <Pressable
                  key={character.id}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() =>
                    togglePersonagem({
                      id: character.id,
                      nome: character.nome,
                      isChild: false,
                    })
                  }
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {character.nome}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.helperSmall}>
            Os personagens acima vêm de perfis já cadastrados (filhos e cuidadores) — um texto
            novo no campo abaixo cria um personagem separado, sem vínculo com ninguém cadastrado.
          </Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Novo personagem (pet, familiar, amigo imaginário...)"
              placeholderTextColor={colors.textMuted}
              value={novoPersonagem}
              onChangeText={setNovoPersonagem}
              onSubmitEditing={handleAddCustomCharacter}
            />
            <Pressable style={styles.addButton} onPress={handleAddCustomCharacter}>
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>

          <ChipSelector
            label="Personagem principal é"
            options={['herói', 'vilão', 'ambos']}
            value={prefs.arco}
            onChange={(v) => updatePrefs('arco', v as Arco)}
            allowCustom
          />

          <View style={{ gap: 6 }}>
            <Text style={styles.label}>Vilão (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do vilão, se a história tiver um"
              placeholderTextColor={colors.textMuted}
              value={prefs.vilao}
              onChangeText={(v) => updatePrefs('vilao', v)}
            />
          </View>

          <ChipSelector
            label="Papel da criança na história"
            options={['protagonista', 'coadjuvante', 'não aparece']}
            value={prefs.papelCrianca}
            onChange={(v) => updatePrefs('papelCrianca', v as PapelCrianca)}
            allowCustom
          />

          <ChipSelector
            label="Relação entre os personagens"
            options={['amigos', 'irmãos', 'família']}
            value={prefs.relacao}
            onChange={(v) => updatePrefs('relacao', v)}
            allowCustom
          />

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Tema e tom</Text>

          <ChipSelector
            label="Tema"
            options={['Aventura', 'Drama', 'Terror', 'Comédia', 'Fantasia']}
            value={prefs.tema}
            onChange={(v) => updatePrefs('tema', v as Tema)}
            allowCustom
          />

          {prefs.tema === 'Terror' && (
            <ChipSelector
              label="Nível de sustinho"
              options={['leve', 'moderado', 'nenhum']}
              value={prefs.sustinho}
              onChange={(v) => updatePrefs('sustinho', v as Sustinho)}
              allowCustom
            />
          )}

          <ChipSelector
            label="Moral da história"
            options={['coragem', 'amizade', 'dividir', 'paciência']}
            value={prefs.moral}
            onChange={(v) => updatePrefs('moral', v)}
            allowCustom
          />

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Cenário</Text>

          <ChipSelector
            label="Lugar"
            options={['floresta', 'espaço', 'castelo', 'cidade']}
            value={prefs.lugar}
            onChange={(v) => updatePrefs('lugar', v)}
            allowCustom
          />

          <ChipSelector
            label="Época"
            options={['hoje', 'passado', 'futuro', 'fantasia atemporal']}
            value={prefs.epoca}
            onChange={(v) => updatePrefs('epoca', v)}
            allowCustom
          />

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Formato</Text>

          <ChipSelector
            label="Duração"
            options={['curta (3-4 min)', 'média (4-7 min)', 'longa (7-10 min)']}
            value={prefs.comprimento}
            onChange={(v) => updatePrefs('comprimento', v as Comprimento)}
            allowCustom
          />

          <ChipSelector
            label="Faixa etária / nível de leitura"
            options={['até 2 anos', '2 a 4 anos', '5 a 7 anos', '8 a 10 anos', '11 a 13 anos']}
            value={prefs.faixaEtaria}
            onChange={(v) => updatePrefs('faixaEtaria', v)}
          />

          <ChipSelector
            label="Narrador"
            options={['1ª pessoa', '3ª pessoa']}
            value={prefs.narrador}
            onChange={(v) => updatePrefs('narrador', v as Narrador)}
          />

          <ChipSelector
            label="Tipo de final"
            options={['fechado', 'escolha sua aventura']}
            value={prefs.tipoFinal}
            onChange={(v) => updatePrefs('tipoFinal', v as TipoFinal)}
            allowCustom
          />
          {prefs.tipoFinal === 'escolha sua aventura' && (
            <Text style={styles.helper}>
              Por enquanto isso só adiciona pontos de decisão no texto da história — a
              interação real de escolher o caminho ainda não existe no app.
            </Text>
          )}

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Série e contexto</Text>

          <View style={styles.switchRow}>
            <Text style={[styles.label, styles.switchLabel]}>
              Criar como série (mesmos personagens/cenário)
            </Text>
            <Switch
              value={prefs.serie}
              onValueChange={(v) => updatePrefs('serie', v)}
            />
          </View>

          {events.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={styles.label}>
                Inspirar a história em um compromisso real da agenda (opcional)
              </Text>
              <Text style={styles.helperSmall}>
                Escolha um evento pra Âmi usar como pano de fundo — por exemplo, contar a história
                no cenário de um passeio ou comemoração já marcados.
              </Text>
              <View style={styles.row}>
                <Pressable
                  style={[
                    styles.chip,
                    prefs.eventoVinculadoId === null && styles.chipSelected,
                  ]}
                  onPress={() => updatePrefs('eventoVinculadoId', null)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      prefs.eventoVinculadoId === null && styles.chipTextSelected,
                    ]}
                  >
                    Nenhuma
                  </Text>
                </Pressable>
                {events.map((event) => {
                  const selected = prefs.eventoVinculadoId === event.id;
                  return (
                    <Pressable
                      key={event.id}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => updatePrefs('eventoVinculadoId', event.id)}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {event.titulo}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {!podeGerar && selecionados.length === 0 && (
            <Text style={styles.warning}>Escolha ao menos um personagem.</Text>
          )}
          {erro ? <Text style={styles.warning}>{erro}</Text> : null}

          <Pressable
            style={[styles.button, (!podeGerar || gerando) && styles.buttonDisabled]}
            onPress={handleGerar}
            disabled={!podeGerar}
          >
            {gerando ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.buttonText}>Gerar história</Text>
            )}
          </Pressable>
        </View>

        {historiaGerada && (
          <View style={styles.storyCard}>
            <Text style={styles.storyTitle}>História gerada</Text>
            <Text style={styles.storyText}>{historiaGerada.texto}</Text>
          </View>
        )}

        <View style={styles.list}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          {stories.length === 0 && (
            <Text style={styles.empty}>Nenhuma história gerada ainda.</Text>
          )}
          {stories.map((story) => (
            <View key={story.id} style={styles.historyCard}>
              <Text style={styles.historyMeta}>
                {story.preferencias.personagens.join(', ')}
                {story.preferencias.tema ? ` · ${story.preferencias.tema}` : ''}
              </Text>
              <Text style={styles.historyText} numberOfLines={4}>
                {story.texto}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 16 },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  helper: { fontSize: 12, color: colors.textMuted, marginTop: -4 },
  helperSmall: { fontSize: 12, color: colors.textMuted },
  warning: { fontSize: 12, color: '#B5555A' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.brancoSuave,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textMuted },
  chipTextSelected: { color: colors.text, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.brancoSuave,
  },
  addButton: {
    width: 42,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { fontSize: 18, fontWeight: '700', color: colors.text },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  switchLabel: { flex: 1 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.text, fontWeight: '600' },
  storyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  storyTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  storyText: { fontSize: 14, color: colors.text, lineHeight: 21 },
  list: { marginTop: 20, gap: 10 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 8 },
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  historyMeta: { fontSize: 12, color: colors.textMuted },
  historyText: { fontSize: 13, color: colors.text },
});
