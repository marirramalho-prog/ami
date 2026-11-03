import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Child, childFullName } from '../types/child';
import { AgendaEvent } from '../types/routine';
import { ExtractedEvent, CampoExtraido } from '../types/eventImport';
import { extractEventsFromFile } from '../utils/eventImportApi';
import { pickFromCamera, pickFromGallery, pickFromFile } from '../utils/pickEventSource';
import { isValidDatePart } from '../utils/date';
import { addDays } from '../utils/calendarDates';
import ChildSelector from './ChildSelector';
import DateFields from './DateFields';
import HoraInput from './HoraInput';

type Passo = 'escolha' | 'carregando' | 'revisao' | 'erro';

interface ReviewItem {
  chave: string;
  selecionado: boolean;
  evento: ExtractedEvent;
  childIds: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  children: Child[];
  onAddEvents: (events: AgendaEvent[]) => Promise<void>;
}

function normalizeNome(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

function matchChildIds(citadas: string[], children: Child[]): string[] {
  const encontrados = new Set<string>();
  citadas.forEach((citada) => {
    const primeiroNomeCitado = normalizeNome(citada).split(' ')[0];
    if (!primeiroNomeCitado) return;
    const child = children.find((c) =>
      normalizeNome(c.nome).split(' ').includes(primeiroNomeCitado),
    );
    if (child) encontrados.add(child.id);
  });
  return Array.from(encontrados);
}

function ehAniversario(evento: ExtractedEvent): boolean {
  const alvo = normalizeNome(`${evento.tipo} ${evento.titulo}`);
  return alvo.includes('aniversario');
}

export default function ImportEventModal({ visible, onClose, children, onAddEvents }: Props) {
  const navigation = useNavigation<any>();
  const [passo, setPasso] = useState<Passo>('escolha');
  const [erro, setErro] = useState('');
  const [itens, setItens] = useState<ReviewItem[]>([]);

  function reset() {
    setPasso('escolha');
    setErro('');
    setItens([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function processar(pick: () => Promise<{ mediaType: string; base64: string } | null>) {
    try {
      setPasso('carregando');
      const fonte = await pick();
      if (!fonte) {
        setPasso('escolha');
        return;
      }

      const eventos = await extractEventsFromFile(fonte.mediaType, fonte.base64);
      if (eventos.length === 0) {
        setErro('Não consegui encontrar nenhum compromisso nesse arquivo.');
        setPasso('erro');
        return;
      }

      setItens(
        eventos.map((evento, i) => ({
          chave: `${Date.now()}-${i}`,
          selecionado: true,
          evento,
          childIds: matchChildIds(evento.criancasCitadas, children),
        })),
      );
      setPasso('revisao');
    } catch (err: any) {
      setErro(err?.message || 'Não foi possível ler o arquivo.');
      setPasso('erro');
    }
  }

  function updateItem(chave: string, patch: Partial<ReviewItem>) {
    setItens((prev) => prev.map((it) => (it.chave === chave ? { ...it, ...patch } : it)));
  }

  function updateEvento(chave: string, patch: Partial<ExtractedEvent>) {
    setItens((prev) =>
      prev.map((it) => (it.chave === chave ? { ...it, evento: { ...it.evento, ...patch } } : it)),
    );
  }

  function confiancaBaixa(item: ReviewItem, campo: CampoExtraido): boolean {
    return item.evento.confianca[campo] === 'baixa';
  }

  async function handleConfirmar() {
    const selecionados = itens.filter((it) => it.selecionado);
    if (selecionados.length === 0) return;

    const invalido = selecionados.find(
      (it) => !it.evento.titulo.trim() || !isValidDatePart(it.evento.data),
    );
    if (invalido) {
      Alert.alert('Confira os dados', 'Todo compromisso selecionado precisa de título e data válida.');
      return;
    }

    const novosEventos: AgendaEvent[] = selecionados.map((it) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      titulo: it.evento.titulo.trim(),
      data: it.evento.data,
      hora: it.evento.horaInicio.trim(),
      horaFim: it.evento.horaFim.trim(),
      local: it.evento.local.trim(),
      childIds: it.childIds,
      caregiverIds: [],
      lembrete: false,
      notificationId: null,
    }));

    await onAddEvents(novosEventos);

    const aniversarios = selecionados.filter((it) => ehAniversario(it.evento));
    if (aniversarios.length > 0) {
      Alert.alert(
        'Lembrete de aniversário',
        'Quer um lembrete pra confirmar presença e outro pra comprar o presente?',
        [
          { text: 'Não, obrigada', style: 'cancel', onPress: () => finalizar(selecionados[0]) },
          {
            text: 'Sim, criar lembretes',
            onPress: async () => {
              const lembretes: AgendaEvent[] = aniversarios.flatMap((it) => {
                const dataEvento = new Date(
                  Number(it.evento.data.ano),
                  Number(it.evento.data.mes) - 1,
                  Number(it.evento.data.dia),
                );
                const dataLembrete = addDays(dataEvento, -7);
                const data = {
                  dia: String(dataLembrete.getDate()).padStart(2, '0'),
                  mes: String(dataLembrete.getMonth() + 1).padStart(2, '0'),
                  ano: String(dataLembrete.getFullYear()),
                };
                return [
                  {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    titulo: `Confirmar presença — ${it.evento.titulo.trim()}`,
                    data,
                    hora: '09:00',
                    horaFim: '',
                    local: '',
                    childIds: it.childIds,
                    caregiverIds: [],
                    lembrete: true,
                    notificationId: null,
                  },
                  {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    titulo: `Comprar presente — ${it.evento.titulo.trim()}`,
                    data,
                    hora: '09:00',
                    horaFim: '',
                    local: '',
                    childIds: it.childIds,
                    caregiverIds: [],
                    lembrete: true,
                    notificationId: null,
                  },
                ];
              });
              await onAddEvents(lembretes);
              finalizar(selecionados[0]);
            },
          },
        ],
      );
      return;
    }

    finalizar(selecionados[0]);
  }

  function finalizar(primeiro: ReviewItem) {
    Alert.alert('Compromisso importado', 'Quer criar um checklist pra esse compromisso?', [
      { text: 'Não, obrigada', style: 'cancel', onPress: handleClose },
      {
        text: 'Criar checklist',
        onPress: () => {
          handleClose();
          navigation.navigate('Checklist', {
            nomeSugerido: primeiro.evento.titulo.trim(),
            tipoSugerido: primeiro.evento.tipo.trim(),
          });
        },
      },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Importar de foto ou PDF</Text>
          <Pressable onPress={handleClose}>
            <Text style={styles.fechar}>Fechar</Text>
          </Pressable>
        </View>

        {passo === 'escolha' && (
          <View style={{ gap: 10 }}>
            <Text style={styles.helper}>
              Fotografe ou envie um convite, boletim, folheto da escola ou qualquer papel com data
              e horário — a Âmi lê e preenche o evento pra você confirmar.
            </Text>
            <Pressable style={styles.opcaoBtn} onPress={() => processar(pickFromCamera)}>
              <Text style={styles.opcaoTexto}>📷 Tirar foto</Text>
            </Pressable>
            <Pressable style={styles.opcaoBtn} onPress={() => processar(pickFromGallery)}>
              <Text style={styles.opcaoTexto}>🖼️ Escolher da galeria</Text>
            </Pressable>
            <Pressable style={styles.opcaoBtn} onPress={() => processar(pickFromFile)}>
              <Text style={styles.opcaoTexto}>📄 Escolher arquivo (PDF, JPG, PNG)</Text>
            </Pressable>
          </View>
        )}

        {passo === 'carregando' && (
          <View style={styles.centro}>
            <ActivityIndicator color={colors.text} size="large" />
            <Text style={styles.helper}>Lendo o documento…</Text>
          </View>
        )}

        {passo === 'erro' && (
          <View style={styles.centro}>
            <Text style={styles.warning}>{erro}</Text>
            <Pressable style={styles.opcaoBtn} onPress={() => setPasso('escolha')}>
              <Text style={styles.opcaoTexto}>Tentar de novo</Text>
            </Pressable>
          </View>
        )}

        {passo === 'revisao' && (
          <View style={{ gap: 16 }}>
            <Text style={styles.helper}>
              Confira os dados antes de salvar. Campos em lilás são os que a Âmi leu com menos
              certeza.
            </Text>

            {itens.length > 1 && (
              <Text style={styles.helper}>
                {itens.length} compromissos encontrados — desmarque os que não quer importar.
              </Text>
            )}

            {itens.map((item) => (
              <View key={item.chave} style={styles.card}>
                {itens.length > 1 && (
                  <Pressable
                    style={styles.checkboxRow}
                    onPress={() => updateItem(item.chave, { selecionado: !item.selecionado })}
                  >
                    <View style={[styles.checkbox, item.selecionado && styles.checkboxOn]} />
                    <Text style={styles.checkboxLabel}>Importar este compromisso</Text>
                  </Pressable>
                )}

                <TextInput
                  style={[styles.input, confiancaBaixa(item, 'titulo') && styles.baixaConfianca]}
                  placeholder="Título"
                  placeholderTextColor={colors.textMuted}
                  value={item.evento.titulo}
                  onChangeText={(v) => updateEvento(item.chave, { titulo: v })}
                />

                <TextInput
                  style={[styles.input, confiancaBaixa(item, 'tipo') && styles.baixaConfianca]}
                  placeholder="Tipo (ex: aniversário, escola, passeio)"
                  placeholderTextColor={colors.textMuted}
                  value={item.evento.tipo}
                  onChangeText={(v) => updateEvento(item.chave, { tipo: v })}
                />

                <Text style={styles.label}>Data</Text>
                <View style={confiancaBaixa(item, 'data') ? styles.baixaConfiancaWrap : undefined}>
                  <DateFields
                    dia={item.evento.data.dia}
                    mes={item.evento.data.mes}
                    ano={item.evento.data.ano}
                    onChangeDia={(v) =>
                      updateEvento(item.chave, { data: { ...item.evento.data, dia: v } })
                    }
                    onChangeMes={(v) =>
                      updateEvento(item.chave, { data: { ...item.evento.data, mes: v } })
                    }
                    onChangeAno={(v) =>
                      updateEvento(item.chave, { data: { ...item.evento.data, ano: v } })
                    }
                  />
                </View>
                {!isValidDatePart(item.evento.data) && (
                  <Text style={styles.warning}>Data incompleta ou inválida.</Text>
                )}

                <Text style={styles.label}>Horário</Text>
                <View style={styles.horaRow}>
                  <HoraInput
                    value={item.evento.horaInicio}
                    onChangeText={(v) => updateEvento(item.chave, { horaInicio: v })}
                    placeholder="Início HH:MM"
                    style={[
                      styles.horaInput,
                      confiancaBaixa(item, 'horaInicio') && styles.baixaConfianca,
                    ]}
                  />
                  <HoraInput
                    value={item.evento.horaFim}
                    onChangeText={(v) => updateEvento(item.chave, { horaFim: v })}
                    placeholder="Fim HH:MM"
                    style={[
                      styles.horaInput,
                      confiancaBaixa(item, 'horaFim') && styles.baixaConfianca,
                    ]}
                  />
                </View>

                <TextInput
                  style={[styles.input, confiancaBaixa(item, 'local') && styles.baixaConfianca]}
                  placeholder="Local"
                  placeholderTextColor={colors.textMuted}
                  value={item.evento.local}
                  onChangeText={(v) => updateEvento(item.chave, { local: v })}
                />

                <TextInput
                  style={[
                    styles.input,
                    confiancaBaixa(item, 'prazoConfirmacao') && styles.baixaConfianca,
                  ]}
                  placeholder="Prazo de confirmação (se houver)"
                  placeholderTextColor={colors.textMuted}
                  value={item.evento.prazoConfirmacao}
                  onChangeText={(v) => updateEvento(item.chave, { prazoConfirmacao: v })}
                />

                <TextInput
                  style={[styles.input, confiancaBaixa(item, 'contato') && styles.baixaConfianca]}
                  placeholder="Contato"
                  placeholderTextColor={colors.textMuted}
                  value={item.evento.contato}
                  onChangeText={(v) => updateEvento(item.chave, { contato: v })}
                />

                <TextInput
                  style={[
                    styles.input,
                    styles.multiline,
                    confiancaBaixa(item, 'observacoes') && styles.baixaConfianca,
                  ]}
                  placeholder="Observações"
                  placeholderTextColor={colors.textMuted}
                  value={item.evento.observacoes}
                  onChangeText={(v) => updateEvento(item.chave, { observacoes: v })}
                  multiline
                />

                <ChildSelector
                  children={children}
                  value={item.childIds}
                  onChange={(v) => updateItem(item.chave, { childIds: v })}
                />
                {item.evento.criancasCitadas.length > 0 && (
                  <Text style={styles.helperSmall}>
                    Nomes encontrados no documento: {item.evento.criancasCitadas.join(', ')}
                  </Text>
                )}
              </View>
            ))}

            <Pressable style={styles.confirmarBtn} onPress={handleConfirmar}>
              <Text style={styles.confirmarTexto}>Confirmar e salvar na agenda</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 60,
    backgroundColor: colors.background,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  fechar: { color: colors.textMuted, fontSize: 14 },
  helper: { fontSize: 13, color: colors.textMuted },
  helperSmall: { fontSize: 12, color: colors.textMuted, marginTop: -4 },
  centro: { alignItems: 'center', gap: 12, paddingTop: 40 },
  opcaoBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  opcaoTexto: { fontSize: 15, color: colors.text, fontWeight: '600' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.brancoSuave,
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxLabel: { fontSize: 13, color: colors.text },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.brancoSuave,
  },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  baixaConfianca: { backgroundColor: colors.lilasSuave, borderColor: colors.lilasSuave },
  baixaConfiancaWrap: {
    backgroundColor: colors.lilasSuave,
    borderRadius: 12,
    padding: 6,
  },
  horaRow: { flexDirection: 'row', gap: 8 },
  horaInput: { flex: 1 },
  warning: { fontSize: 12, color: '#B5555A' },
  confirmarBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmarTexto: { color: colors.text, fontWeight: '700', fontSize: 15 },
});
