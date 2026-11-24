import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';
import { typography } from '../theme/typography';
import mascoteIcon from '../../assets/mascote/avatar-circular-bust.png';
import FadeIn from '../components/FadeIn';
import ChipSelector from '../components/ChipSelector';
import HoraInput from '../components/HoraInput';
import GuiaDesfraldeCard from '../components/GuiaDesfraldeCard';
import DesfraldePainel from '../components/DesfraldePainel';
import { Child, childFullName } from '../types/child';
import { Caregiver } from '../types/caregiver';
import {
  AmbienteRegistroDesfralde,
  CodigoSinalProntidao,
  ConteudoRegistroDesfralde,
  DesfraldeConfiguracao,
  DesfraldeConquista,
  DesfraldePermissao,
  DesfraldeProcesso,
  DesfraldeRegistro,
  FaseDesfralde,
  IniciativaRegistroDesfralde,
  LocalRegistroDesfralde,
  MomentoRotinaDesfralde,
  NoiteResultadoDesfralde,
  PeriodoRegistroDesfralde,
  RecipienteDesfralde,
  SinalProntidao,
  TipoConquistaDesfralde,
} from '../types/desfralde';
import { loadChildren } from '../storage/childrenStorage';
import { loadCaregivers } from '../storage/caregiverStorage';
import {
  loadConfiguracoes,
  loadConquistas,
  loadPermissoes,
  loadProcessos,
  loadRegistros,
  loadSinais,
  saveConfiguracoes,
  saveConquistas,
  savePermissoes,
  saveProcessos,
  saveRegistros,
  saveSinais,
} from '../storage/desfraldeStorage';
import { CATALOGO_SINAIS_PRONTIDAO } from '../data/sinaisProntidaoDesfralde';
import { CONTEUDO_GUIA_DESFRALDE } from '../data/conteudoGuiaDesfralde';
import { obterPermissaoEfetiva, PermissaoEfetivaDesfralde } from '../utils/desfraldePermissoes';
import { todayKey } from '../utils/date';

const FASES: { valor: FaseDesfralde; label: string }[] = [
  { valor: 'preparar', label: 'Preparar' },
  { valor: 'primeiros_dias', label: 'Primeiros dias' },
  { valor: 'dia_a_dia', label: 'Dia a dia' },
  { valor: 'noite', label: 'Noite' },
];

const SECAO_POR_FASE: Record<FaseDesfralde, string> = {
  preparar: 'preparar',
  primeiros_dias: 'primeiros_dias',
  dia_a_dia: 'dia_a_dia',
  noite: 'noite',
};

const LABEL_CONTEUDO: Record<Exclude<ConteudoRegistroDesfralde, ''>, string> = {
  xixi: 'Xixi',
  coco: 'Cocô',
  ambos: 'Os dois',
};
const LABEL_LOCAL: Record<Exclude<LocalRegistroDesfralde, ''>, string> = {
  penico_vaso: 'Penico/vaso',
  escape_roupa: 'Escape na roupa',
  fralda: 'Na fralda',
};
const LABEL_INICIATIVA: Record<Exclude<IniciativaRegistroDesfralde, ''>, string> = {
  pediu: 'Pediu sozinho(a)',
  levado: 'Foi levado(a) no horário',
};
const LABEL_PERIODO: Record<PeriodoRegistroDesfralde, string> = {
  dia: 'Dia',
  soneca: 'Soneca',
  noite: 'Noite',
};
const LABEL_NOITE: Record<Exclude<NoiteResultadoDesfralde, ''>, string> = {
  seco: 'Acordou seco',
  molhado: 'Acordou molhado',
};
const LABEL_AMBIENTE: Record<Exclude<AmbienteRegistroDesfralde, ''>, string> = {
  casa: 'Casa',
  escola: 'Escola',
  outro: 'Outro',
};
const LABEL_RECIPIENTE: Record<Exclude<RecipienteDesfralde, ''>, string> = {
  penico: 'Penico',
  vaso: 'Vaso',
  vaso_redutor: 'Vaso com redutor',
};
const LABEL_MOMENTO: Record<MomentoRotinaDesfralde, string> = {
  ao_acordar: 'Ao acordar',
  antes_de_sair: 'Antes de sair',
  depois_das_refeicoes: 'Depois das refeições',
  antes_do_banho: 'Antes do banho',
  antes_de_dormir: 'Antes de dormir',
};
const TODOS_MOMENTOS = Object.keys(LABEL_MOMENTO) as MomentoRotinaDesfralde[];

const LABEL_CONQUISTA: Record<TipoConquistaDesfralde, string> = {
  primeiro_xixi: 'Primeiro xixi no penico',
  primeiro_coco: 'Primeiro cocô no penico',
  primeiro_dia_sem_fralda: 'Primeiro dia sem fralda',
  pediu_sozinho: 'Pediu sozinho(a) pela primeira vez',
  primeira_noite_seca: 'Primeira noite seca',
  concluido: 'Desfralde concluído',
};
const TODAS_CONQUISTAS = Object.keys(LABEL_CONQUISTA) as TipoConquistaDesfralde[];

// new Date('YYYY-MM-DD') é interpretado como meia-noite UTC — em fusos atrás
// de UTC, toLocaleDateString depois "volta" um dia. Formata direto da string
// (já no formato de todayKey()) pra não cair nessa armadilha.
function formatarDataBR(dataYYYYMMDD: string): string {
  const [ano, mes, dia] = dataYYYYMMDD.split('-');
  return `${dia}/${mes}/${ano}`;
}

function horaAtual(): string {
  const agora = new Date();
  return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
}

function periodoSugerido(): PeriodoRegistroDesfralde {
  const hora = new Date().getHours();
  if (hora < 6 || hora >= 20) return 'noite';
  return 'dia';
}

function emptyConfig(processoId: string): DesfraldeConfiguracao {
  return {
    processoId,
    fraldaDia: true,
    fraldaSoneca: true,
    fraldaNoite: true,
    fraldaPasseio: true,
    recipiente: '',
    modoHorario: 'intervalo',
    intervaloMin: '120',
    momentos: [],
    palavras: { xixi: '', coco: '', banheiro: '' },
    combinados: '',
    recompensa: '',
    atualizadoPor: null,
    atualizadoEm: new Date().toISOString(),
  };
}

// Confirmação genérica (web usa window.confirm, nativo usa Alert) — não
// reaproveita utils/confirm.ts porque aquele é específico pra remoção
// ("Remover" fixo no botão) e aqui o texto do botão varia por ação.
function confirmar(titulo: string, mensagem: string, textoConfirmar: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensagem}`)) onConfirm();
    return;
  }
  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoConfirmar, onPress: onConfirm },
  ]);
}

export default function DesfraldeScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState<string | null>(null);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [sinais, setSinais] = useState<SinalProntidao[]>([]);
  const [processos, setProcessos] = useState<DesfraldeProcesso[]>([]);
  const [configuracoes, setConfiguracoes] = useState<DesfraldeConfiguracao[]>([]);
  const [registros, setRegistros] = useState<DesfraldeRegistro[]>([]);
  const [conquistas, setConquistas] = useState<DesfraldeConquista[]>([]);
  const [permissoes, setPermissoes] = useState<DesfraldePermissao[]>([]);

  const [editandoConfig, setEditandoConfig] = useState(false);
  const [lerGuiaSemProcesso, setLerGuiaSemProcesso] = useState(false);
  const [secaoGuiaExpandida, setSecaoGuiaExpandida] = useState<string | null>(null);

  const [editandoRegistroId, setEditandoRegistroId] = useState<string | null>(null);
  const [conteudoForm, setConteudoForm] = useState<ConteudoRegistroDesfralde>('');
  const [localForm, setLocalForm] = useState<LocalRegistroDesfralde>('');
  const [iniciativaForm, setIniciativaForm] = useState<IniciativaRegistroDesfralde>('');
  const [periodoForm, setPeriodoForm] = useState<PeriodoRegistroDesfralde>(periodoSugerido());
  const [noiteForm, setNoiteForm] = useState<NoiteResultadoDesfralde>('');
  const [ambienteForm, setAmbienteForm] = useState<AmbienteRegistroDesfralde>('casa');
  const [horaForm, setHoraForm] = useState(horaAtual());
  const [observacaoForm, setObservacaoForm] = useState('');
  const [registroSalvo, setRegistroSalvo] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        loadChildren(),
        loadCaregivers(),
        loadSinais(),
        loadProcessos(),
        loadConfiguracoes(),
        loadRegistros(),
        loadConquistas(),
        loadPermissoes(),
      ]).then(([childList, caregiverList, sinaisList, processoList, configList, registroList, conquistaList, permissaoList]) => {
        setChildren(childList);
        setCaregivers(caregiverList);
        setSinais(sinaisList);
        setProcessos(processoList);
        setConfiguracoes(configList);
        setRegistros(registroList);
        setConquistas(conquistaList);
        setPermissoes(permissaoList);
        const childIdDaRota = route.params?.childId;
        setChildId((prev) => {
          if (childIdDaRota && childList.some((c) => c.id === childIdDaRota)) return childIdDaRota;
          return prev && childList.some((c) => c.id === prev) ? prev : childList[0]?.id ?? null;
        });
      });
    }, [route.params?.childId]),
  );

  const child = children.find((c) => c.id === childId) || null;

  const processo = useMemo(
    () =>
      processos.find(
        (p) => p.childId === childId && (p.status === 'em_andamento' || p.status === 'pausado'),
      ) || null,
    [processos, childId],
  );

  const sinaisDoFilho = useMemo(
    () => sinais.filter((s) => s.childId === childId),
    [sinais, childId],
  );

  const config = useMemo(() => {
    if (!processo) return null;
    return configuracoes.find((c) => c.processoId === processo.id) || emptyConfig(processo.id);
  }, [configuracoes, processo]);

  const registrosDoProcesso = useMemo(
    () => (processo ? registros.filter((r) => r.processoId === processo.id) : []),
    [registros, processo],
  );
  const registrosDeHoje = useMemo(
    () => registrosDoProcesso.filter((r) => r.registradoEm.startsWith(todayKey())),
    [registrosDoProcesso],
  );

  const permissoesDoProcesso = useMemo(
    () => (processo ? permissoes.filter((p) => p.processoId === processo.id) : []),
    [permissoes, processo],
  );
  const conquistasDoProcesso = useMemo(
    () => (processo ? conquistas.filter((c) => c.processoId === processo.id) : []),
    [conquistas, processo],
  );

  // Não há login real no app — o cuidador "principal" marcado em Cuidadores
  // (CaregiversScreen) é quem usa este aparelho. Sem ninguém marcado assim
  // (app recém-instalado, cuidadores ainda não cadastrados), não dá pra
  // restringir nada de verdade, então libera tudo por padrão.
  const currentCaregiver = caregivers.find((c) => c.principal) || null;
  const permissaoAtual: PermissaoEfetivaDesfralde = useMemo(() => {
    if (!currentCaregiver) return { podeVer: true, podeRegistrar: true, podeConfigurar: true };
    return obterPermissaoEfetiva(
      { id: currentCaregiver.id, principal: currentCaregiver.principal },
      permissoesDoProcesso,
      processo?.id || '',
    );
  }, [currentCaregiver, permissoesDoProcesso, processo]);
  const ehResponsavelPrincipal = !currentCaregiver || currentCaregiver.principal;

  async function persistSinais(lista: SinalProntidao[]) {
    setSinais(lista);
    await saveSinais(lista);
  }

  function handleToggleSinal(codigo: CodigoSinalProntidao) {
    if (!childId) return;
    const agora = new Date().toISOString();
    const existente = sinaisDoFilho.find((s) => s.sinal === codigo);
    const outros = sinais.filter((s) => !(s.childId === childId && s.sinal === codigo));

    if (!existente) {
      persistSinais([
        ...outros,
        {
          id: `${childId}_${codigo}`,
          childId,
          sinal: codigo,
          marcado: true,
          marcadoEm: agora,
          desmarcadoEm: null,
          atualizadoPor: currentCaregiver?.id || null,
        },
      ]);
      return;
    }

    const marcando = !existente.marcado;
    persistSinais([
      ...outros,
      {
        ...existente,
        marcado: marcando,
        marcadoEm: marcando ? agora : existente.marcadoEm,
        desmarcadoEm: marcando ? null : agora,
        atualizadoPor: currentCaregiver?.id || null,
      },
    ]);
  }

  const sinaisMarcados = sinaisDoFilho.filter((s) => s.marcado).length;
  const mensagemSinais =
    sinaisMarcados >= 4
      ? 'Parece um bom momento para começar. Quer ver como?'
      : 'Tudo bem esperar mais um pouco. Cada criança tem seu tempo. A gente te avisa para revisar daqui a algumas semanas.';

  async function handleComecarDesfralde() {
    if (!childId) return;
    const novoProcesso: DesfraldeProcesso = {
      id: Date.now().toString(),
      childId,
      status: 'em_andamento',
      faseAtual: 'preparar',
      iniciadoEm: new Date().toISOString(),
      pausadoEm: null,
      concluidoEm: null,
      criadoPor: currentCaregiver?.id || null,
      atualizadoEm: new Date().toISOString(),
    };
    const lista = [...processos, novoProcesso];
    setProcessos(lista);
    await saveProcessos(lista);
    setLerGuiaSemProcesso(false);
  }

  async function persistProcesso(atualizado: DesfraldeProcesso) {
    const lista = processos.map((p) => (p.id === atualizado.id ? atualizado : p));
    setProcessos(lista);
    await saveProcessos(lista);
  }

  function handleMudarFase(novaFase: FaseDesfralde) {
    if (!processo || novaFase === processo.faseAtual) return;
    confirmar(
      'Mudar de fase?',
      `Confirma a mudança de fase para "${FASES.find((f) => f.valor === novaFase)?.label}"?`,
      'Confirmar',
      () => persistProcesso({ ...processo, faseAtual: novaFase, atualizadoEm: new Date().toISOString() }),
    );
  }

  function handlePausar() {
    if (!processo) return;
    persistProcesso({ ...processo, status: 'pausado', pausadoEm: new Date().toISOString() });
  }

  function handleRetomar() {
    if (!processo) return;
    persistProcesso({ ...processo, status: 'em_andamento', pausadoEm: null });
  }

  function handleConcluir() {
    if (!processo) return;
    confirmar(
      'Concluir o desfralde?',
      'O desfralde vai para o histórico do filho. Os lembretes param automaticamente, mas o painel continua consultável.',
      'Concluir',
      () => persistProcesso({ ...processo, status: 'concluido', concluidoEm: new Date().toISOString() }),
    );
  }

  async function persistConfig(atualizado: DesfraldeConfiguracao) {
    const outros = configuracoes.filter((c) => c.processoId !== atualizado.processoId);
    const lista = [...outros, atualizado];
    setConfiguracoes(lista);
    await saveConfiguracoes(lista);
  }

  function updateConfig<K extends keyof DesfraldeConfiguracao>(key: K, value: DesfraldeConfiguracao[K]) {
    if (!config) return;
    persistConfig({
      ...config,
      [key]: value,
      atualizadoPor: currentCaregiver?.id || null,
      atualizadoEm: new Date().toISOString(),
    });
  }

  function toggleMomento(momento: MomentoRotinaDesfralde) {
    if (!config) return;
    const jaTem = config.momentos.includes(momento);
    updateConfig('momentos', jaTem ? config.momentos.filter((m) => m !== momento) : [...config.momentos, momento]);
  }

  function limparFormularioRegistro() {
    setEditandoRegistroId(null);
    setConteudoForm('');
    setLocalForm('');
    setIniciativaForm('');
    setPeriodoForm(periodoSugerido());
    setNoiteForm('');
    setAmbienteForm('casa');
    setHoraForm(horaAtual());
    setObservacaoForm('');
  }

  function handleEditarRegistro(registro: DesfraldeRegistro) {
    setEditandoRegistroId(registro.id);
    setConteudoForm(registro.conteudo);
    setLocalForm(registro.local);
    setIniciativaForm(registro.iniciativa);
    setPeriodoForm(registro.periodo);
    setNoiteForm(registro.noiteResultado);
    setAmbienteForm(registro.ambiente);
    setHoraForm(registro.registradoEm.slice(11, 16));
    setObservacaoForm(registro.observacao);
  }

  async function handleSalvarRegistro() {
    if (!processo || !childId || !permissaoAtual.podeRegistrar) return;
    const agoraIso = new Date().toISOString();
    const data = todayKey();
    const registradoEm = `${data}T${horaForm || horaAtual()}:00.000Z`;

    if (editandoRegistroId) {
      const lista = registros.map((r) =>
        r.id === editandoRegistroId
          ? {
              ...r,
              conteudo: conteudoForm,
              local: localForm,
              iniciativa: iniciativaForm,
              periodo: periodoForm,
              noiteResultado: noiteForm,
              ambiente: ambienteForm,
              registradoEm,
              observacao: observacaoForm.slice(0, 280),
              editadoEm: agoraIso,
              editadoPor: currentCaregiver?.id || null,
            }
          : r,
      );
      setRegistros(lista);
      await saveRegistros(lista);
    } else {
      const novo: DesfraldeRegistro = {
        id: Date.now().toString(),
        processoId: processo.id,
        childId,
        conteudo: conteudoForm,
        local: localForm,
        iniciativa: iniciativaForm,
        periodo: periodoForm,
        noiteResultado: noiteForm,
        ambiente: ambienteForm,
        registradoEm,
        registradoPor: currentCaregiver?.id || null,
        observacao: observacaoForm.slice(0, 280),
        criadoEm: agoraIso,
        editadoEm: null,
        editadoPor: null,
      };
      const lista = [...registros, novo];
      setRegistros(lista);
      await saveRegistros(lista);
    }

    limparFormularioRegistro();
    setRegistroSalvo(true);
    setTimeout(() => setRegistroSalvo(false), 2000);
  }

  function podeEditarOuApagar(registro: DesfraldeRegistro): boolean {
    if (ehResponsavelPrincipal) return true;
    return !!currentCaregiver && registro.registradoPor === currentCaregiver.id;
  }

  async function handleApagarRegistro(registro: DesfraldeRegistro) {
    if (!podeEditarOuApagar(registro)) return;
    const lista = registros.filter((r) => r.id !== registro.id);
    setRegistros(lista);
    await saveRegistros(lista);
    if (editandoRegistroId === registro.id) limparFormularioRegistro();
  }

  async function handleTogglePermissao(
    caregiverId: string,
    campo: 'podeVer' | 'podeRegistrar' | 'podeConfigurar',
  ) {
    if (!processo || !ehResponsavelPrincipal) return;
    const existente = permissoesDoProcesso.find((p) => p.caregiverId === caregiverId);
    const base: DesfraldePermissao =
      existente || { processoId: processo.id, caregiverId, podeVer: true, podeRegistrar: false, podeConfigurar: false };
    const atualizado = { ...base, [campo]: !base[campo] };
    const outros = permissoes.filter((p) => !(p.processoId === processo.id && p.caregiverId === caregiverId));
    const lista = [...outros, atualizado];
    setPermissoes(lista);
    await savePermissoes(lista);
  }

  async function handleToggleConquista(tipo: TipoConquistaDesfralde) {
    if (!processo) return;
    const existente = conquistasDoProcesso.find((c) => c.tipo === tipo);
    if (existente) {
      if (!ehResponsavelPrincipal) return;
      const lista = conquistas.filter((c) => c.id !== existente.id);
      setConquistas(lista);
      await saveConquistas(lista);
      return;
    }
    const nova: DesfraldeConquista = {
      id: Date.now().toString(),
      processoId: processo.id,
      tipo,
      data: todayKey(),
      registradoPor: currentCaregiver?.id || null,
    };
    const lista = [...conquistas, nova];
    setConquistas(lista);
    await saveConquistas(lista);
  }

  const outrosCuidadores = caregivers.filter((c) => !c.principal && c.id !== currentCaregiver?.id);

  const secaoAtivaGuia = processo ? SECAO_POR_FASE[processo.faseAtual] : null;

  if (children.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Image source={mascoteIcon} style={styles.mascoteEmpty} resizeMode="contain" />
        <Text style={styles.title}>Desfralde</Text>
        <Text style={styles.empty}>
          Cadastre um perfil de filho(a) na aba Perfis pra eu te ajudar com o desfralde.
        </Text>
        <Pressable onPress={() => navigation.navigate('Perfis')} accessibilityRole="button">
          <Text style={[styles.link, { marginTop: 12 }]}>👶 ir para Perfis</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Desfralde</Text>
        <Text style={styles.subtitle}>
          É rotina, não saúde — a Âmi organiza e mostra padrões, sem diagnosticar nada.
        </Text>

        <View style={styles.row}>
          {children.map((c) => {
            const selected = childId === c.id;
            return (
              <Pressable
                key={c.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => {
                  setChildId(c.id);
                  setLerGuiaSemProcesso(false);
                  limparFormularioRegistro();
                }}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {c.avatar} {childFullName(c)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!processo && !lerGuiaSemProcesso && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Sinais de prontidão</Text>
            <Text style={styles.helper}>
              Marque o que já apareceu. Não é teste e não dá nota — pode revisar quando quiser.
            </Text>
            {CATALOGO_SINAIS_PRONTIDAO.map(({ codigo, texto }) => {
              const sinal = sinaisDoFilho.find((s) => s.sinal === codigo);
              const marcado = !!sinal?.marcado;
              return (
                <Pressable key={codigo} style={styles.sinalRow} onPress={() => handleToggleSinal(codigo)}>
                  <View style={[styles.checkbox, marcado && styles.checkboxChecked]}>
                    {marcado && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.passoText}>{texto}</Text>
                    {marcado && sinal?.marcadoEm && (
                      <Text style={styles.helper}>
                        desde {new Date(sinal.marcadoEm).toLocaleDateString('pt-BR')}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}

            <Text style={[styles.resumoLinha, { marginTop: 4 }]}>{mensagemSinais}</Text>
            {sinaisMarcados < 4 && (
              <Text style={styles.helper}>Lembrete opcional pra revisar os sinais daqui a algumas semanas.</Text>
            )}

            <View style={styles.rowButtons}>
              <Pressable style={styles.saveButton} onPress={handleComecarDesfralde}>
                <Text style={styles.saveButtonText}>Começar o desfralde</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => setLerGuiaSemProcesso(true)}>
                <Text style={styles.secondaryButtonText}>Só quero ler o guia</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!processo && lerGuiaSemProcesso && (
          <Pressable onPress={() => setLerGuiaSemProcesso(false)}>
            <Text style={[styles.link, { marginBottom: 8 }]}>← voltar pros sinais de prontidão</Text>
          </Pressable>
        )}

        {processo && (
          <View style={styles.form}>
            <View style={styles.resumoHeaderRow}>
              <Text style={styles.sectionTitle}>
                Fase atual {processo.status === 'pausado' ? '· pausado' : ''}
              </Text>
            </View>
            <ChipSelector
              label=""
              options={FASES.map((f) => f.label)}
              value={FASES.find((f) => f.valor === processo.faseAtual)?.label || ''}
              onChange={(label) => {
                const fase = FASES.find((f) => f.label === label)?.valor;
                if (fase) handleMudarFase(fase);
              }}
            />
            {processo.status === 'pausado' ? (
              <>
                <Text style={styles.resumoLinha}>Pausar faz parte. Quando quiserem, é só retomar.</Text>
                <Pressable style={styles.saveButton} onPress={handleRetomar}>
                  <Text style={styles.saveButtonText}>Retomar</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.rowButtons}>
                <Pressable style={styles.secondaryButton} onPress={handlePausar}>
                  <Text style={styles.secondaryButtonText}>Pausar</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={handleConcluir}>
                  <Text style={styles.secondaryButtonText}>Concluir</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {processo && config && (
          <View style={[styles.form, { marginTop: 16 }]}>
            <View style={styles.resumoHeaderRow}>
              <Text style={styles.sectionTitle}>Configuração e combinados</Text>
              {!editandoConfig && permissaoAtual.podeConfigurar && (
                <Pressable onPress={() => setEditandoConfig(true)}>
                  <Text style={styles.edit}>editar</Text>
                </Pressable>
              )}
            </View>

            {!editandoConfig ? (
              <>
                <Text style={styles.resumoLinha}>
                  Fralda em: {[
                    config.fraldaDia && 'dia',
                    config.fraldaSoneca && 'soneca',
                    config.fraldaNoite && 'noite',
                    config.fraldaPasseio && 'passeios',
                  ]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </Text>
                <Text style={styles.resumoLinha}>
                  Recipiente: {config.recipiente ? LABEL_RECIPIENTE[config.recipiente] : '—'}
                </Text>
                <Text style={styles.resumoLinha}>
                  Horários:{' '}
                  {config.modoHorario === 'intervalo'
                    ? `a cada ${config.intervaloMin || '?'} min`
                    : config.momentos.map((m) => LABEL_MOMENTO[m]).join(', ') || '—'}
                </Text>
                {config.combinados ? (
                  <Text style={styles.resumoLinha}>Combinados: {config.combinados}</Text>
                ) : null}
              </>
            ) : !permissaoAtual.podeConfigurar ? (
              <Text style={styles.helper}>Só quem pode configurar vê o formulário de edição.</Text>
            ) : (
              <>
                <Text style={styles.label}>Ainda usa fralda em</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.resumoLinha}>Dia</Text>
                  <Switch value={config.fraldaDia} onValueChange={(v) => updateConfig('fraldaDia', v)} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.resumoLinha}>Soneca</Text>
                  <Switch value={config.fraldaSoneca} onValueChange={(v) => updateConfig('fraldaSoneca', v)} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.resumoLinha}>Noite</Text>
                  <Switch value={config.fraldaNoite} onValueChange={(v) => updateConfig('fraldaNoite', v)} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.resumoLinha}>Passeios</Text>
                  <Switch value={config.fraldaPasseio} onValueChange={(v) => updateConfig('fraldaPasseio', v)} />
                </View>

                <ChipSelector
                  label="Penico ou vaso"
                  options={Object.values(LABEL_RECIPIENTE)}
                  value={config.recipiente ? LABEL_RECIPIENTE[config.recipiente] : ''}
                  onChange={(label) => {
                    const chave = (Object.entries(LABEL_RECIPIENTE).find(([, v]) => v === label)?.[0] ||
                      '') as RecipienteDesfralde;
                    updateConfig('recipiente', chave);
                  }}
                />

                <ChipSelector
                  label="Horários de ida ao banheiro"
                  options={['Intervalo fixo', 'Momentos da rotina']}
                  value={config.modoHorario === 'intervalo' ? 'Intervalo fixo' : 'Momentos da rotina'}
                  onChange={(label) => updateConfig('modoHorario', label === 'Intervalo fixo' ? 'intervalo' : 'momentos')}
                />
                {config.modoHorario === 'intervalo' ? (
                  <TextInput
                    style={styles.input}
                    placeholder="Minutos entre idas (ex: 120)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={config.intervaloMin}
                    onChangeText={(v) => updateConfig('intervaloMin', v)}
                  />
                ) : (
                  <View style={styles.row}>
                    {TODOS_MOMENTOS.map((m) => {
                      const selecionado = config.momentos.includes(m);
                      return (
                        <Pressable
                          key={m}
                          style={[styles.chip, selecionado && styles.chipSelected]}
                          onPress={() => toggleMomento(m)}
                        >
                          <Text style={[styles.chipText, selecionado && styles.chipTextSelected]}>
                            {LABEL_MOMENTO[m]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                <Text style={styles.label}>Palavras da família</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="xixi"
                    placeholderTextColor={colors.textMuted}
                    value={config.palavras.xixi}
                    onChangeText={(v) => updateConfig('palavras', { ...config.palavras, xixi: v })}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="cocô"
                    placeholderTextColor={colors.textMuted}
                    value={config.palavras.coco}
                    onChangeText={(v) => updateConfig('palavras', { ...config.palavras, coco: v })}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="banheiro"
                    placeholderTextColor={colors.textMuted}
                    value={config.palavras.banheiro}
                    onChangeText={(v) => updateConfig('palavras', { ...config.palavras, banheiro: v })}
                  />
                </View>

                <Text style={styles.label}>Combinados da família</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder='Ex: "elogiar sem exagero", "não perguntar toda hora"'
                  placeholderTextColor={colors.textMuted}
                  value={config.combinados}
                  onChangeText={(v) => updateConfig('combinados', v.slice(0, 500))}
                  multiline
                />

                <Text style={styles.label}>Recompensa combinada (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: adesivo a cada ida"
                  placeholderTextColor={colors.textMuted}
                  value={config.recompensa}
                  onChangeText={(v) => updateConfig('recompensa', v.slice(0, 200))}
                />

                <Pressable style={styles.saveButton} onPress={() => setEditandoConfig(false)}>
                  <Text style={styles.saveButtonText}>Pronto</Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        {processo && (
          <View style={[styles.form, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>Registro rápido</Text>
            {!permissaoAtual.podeRegistrar ? (
              <Text style={styles.helper}>Você não tem permissão pra registrar neste desfralde.</Text>
            ) : (
              <>
                <ChipSelector
                  label="O quê"
                  options={Object.values(LABEL_CONTEUDO)}
                  value={conteudoForm ? LABEL_CONTEUDO[conteudoForm] : ''}
                  onChange={(label) =>
                    setConteudoForm(
                      (Object.entries(LABEL_CONTEUDO).find(([, v]) => v === label)?.[0] ||
                        '') as ConteudoRegistroDesfralde,
                    )
                  }
                />
                <ChipSelector
                  label="Onde"
                  options={Object.values(LABEL_LOCAL)}
                  value={localForm ? LABEL_LOCAL[localForm] : ''}
                  onChange={(label) =>
                    setLocalForm(
                      (Object.entries(LABEL_LOCAL).find(([, v]) => v === label)?.[0] ||
                        '') as LocalRegistroDesfralde,
                    )
                  }
                />
                <ChipSelector
                  label="Como"
                  options={Object.values(LABEL_INICIATIVA)}
                  value={iniciativaForm ? LABEL_INICIATIVA[iniciativaForm] : ''}
                  onChange={(label) =>
                    setIniciativaForm(
                      (Object.entries(LABEL_INICIATIVA).find(([, v]) => v === label)?.[0] ||
                        '') as IniciativaRegistroDesfralde,
                    )
                  }
                />
                <ChipSelector
                  label="Período"
                  options={Object.values(LABEL_PERIODO)}
                  value={LABEL_PERIODO[periodoForm]}
                  onChange={(label) =>
                    setPeriodoForm(
                      (Object.entries(LABEL_PERIODO).find(([, v]) => v === label)?.[0] ||
                        'dia') as PeriodoRegistroDesfralde,
                    )
                  }
                />
                {(periodoForm === 'noite' || periodoForm === 'soneca') && (
                  <ChipSelector
                    label="Noite/soneca"
                    options={Object.values(LABEL_NOITE)}
                    value={noiteForm ? LABEL_NOITE[noiteForm] : ''}
                    onChange={(label) =>
                      setNoiteForm(
                        (Object.entries(LABEL_NOITE).find(([, v]) => v === label)?.[0] ||
                          '') as NoiteResultadoDesfralde,
                      )
                    }
                  />
                )}
                <ChipSelector
                  label="Ambiente"
                  options={Object.values(LABEL_AMBIENTE)}
                  value={ambienteForm ? LABEL_AMBIENTE[ambienteForm] : ''}
                  onChange={(label) =>
                    setAmbienteForm(
                      (Object.entries(LABEL_AMBIENTE).find(([, v]) => v === label)?.[0] ||
                        'casa') as AmbienteRegistroDesfralde,
                    )
                  }
                />

                <Text style={styles.label}>Horário</Text>
                <HoraInput value={horaForm} onChangeText={setHoraForm} />

                <Text style={styles.label}>Observação (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Alguma nota sobre esse registro"
                  placeholderTextColor={colors.textMuted}
                  value={observacaoForm}
                  onChangeText={(v) => setObservacaoForm(v.slice(0, 280))}
                  multiline
                />
                <Text style={styles.helper}>Evite colocar informações de saúde aqui.</Text>

                <View style={styles.rowButtons}>
                  <Pressable style={styles.saveButton} onPress={handleSalvarRegistro}>
                    <Text style={styles.saveButtonText}>
                      {editandoRegistroId ? 'Salvar alterações' : 'Registrar'}
                    </Text>
                  </Pressable>
                  {editandoRegistroId && (
                    <Pressable style={styles.secondaryButton} onPress={limparFormularioRegistro}>
                      <Text style={styles.secondaryButtonText}>Cancelar edição</Text>
                    </Pressable>
                  )}
                </View>
                {registroSalvo && <Text style={styles.savedText}>✓ Registro salvo</Text>}
              </>
            )}

            {registrosDeHoje.length > 0 && (
              <>
                <View style={styles.divider} />
                <Text style={styles.label}>Hoje</Text>
                {registrosDeHoje
                  .slice()
                  .sort((a, b) => b.registradoEm.localeCompare(a.registradoEm))
                  .map((r) => (
                    <FadeIn key={r.id} style={styles.registroCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resumoLinha}>
                          {r.registradoEm.slice(11, 16)} ·{' '}
                          {[r.conteudo && LABEL_CONTEUDO[r.conteudo], r.local && LABEL_LOCAL[r.local]]
                            .filter(Boolean)
                            .join(' · ') || LABEL_PERIODO[r.periodo]}
                        </Text>
                        {r.observacao ? <Text style={styles.helper}>{r.observacao}</Text> : null}
                      </View>
                      {podeEditarOuApagar(r) && (
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <Pressable onPress={() => handleEditarRegistro(r)}>
                            <Text style={styles.edit}>editar</Text>
                          </Pressable>
                          <Pressable
                            style={styles.itemRemoveButton}
                            onPress={() => handleApagarRegistro(r)}
                            accessibilityRole="button"
                            accessibilityLabel="Apagar este registro"
                          >
                            <Text style={styles.itemRemove}>×</Text>
                          </Pressable>
                        </View>
                      )}
                    </FadeIn>
                  ))}
              </>
            )}
          </View>
        )}

        {processo && permissaoAtual.podeVer && (
          <View style={{ marginTop: 16 }}>
            <DesfraldePainel registros={registrosDoProcesso} caregivers={caregivers} />
          </View>
        )}

        {processo && (
          <View style={[styles.form, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>Conquistas</Text>
            {TODAS_CONQUISTAS.map((tipo) => {
              const registrada = conquistasDoProcesso.find((c) => c.tipo === tipo);
              return (
                <Pressable
                  key={tipo}
                  style={styles.sinalRow}
                  onPress={() => handleToggleConquista(tipo)}
                  disabled={!!registrada && !ehResponsavelPrincipal}
                >
                  <View style={[styles.checkbox, !!registrada && styles.checkboxChecked]}>
                    {registrada && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.passoText}>{LABEL_CONQUISTA[tipo]}</Text>
                    {registrada && (
                      <Text style={styles.helper}>
                        {formatarDataBR(registrada.data)}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {processo && (
          <View style={[styles.form, { marginTop: 16 }]}>
            <View style={styles.resumoHeaderRow}>
              <Text style={styles.sectionTitle}>Cuidadores e permissões</Text>
            </View>
            {!ehResponsavelPrincipal ? (
              <Text style={styles.helper}>Só o responsável principal edita as permissões.</Text>
            ) : outrosCuidadores.length === 0 ? (
              <Text style={styles.helper}>
                Cadastre outros cuidadores na aba Cuidadores pra dar acesso a eles aqui.
              </Text>
            ) : (
              outrosCuidadores.map((c) => {
                const p =
                  permissoesDoProcesso.find((perm) => perm.caregiverId === c.id) || {
                    processoId: processo.id,
                    caregiverId: c.id,
                    podeVer: true,
                    podeRegistrar: false,
                    podeConfigurar: false,
                  };
                return (
                  <View key={c.id} style={styles.cuidadorCard}>
                    <Text style={styles.resumoLinha}>{c.nomeCompleto || c.relacao}</Text>
                    <View style={styles.switchRow}>
                      <Text style={styles.helper}>Ver painel e histórico</Text>
                      <Switch value={p.podeVer} onValueChange={() => handleTogglePermissao(c.id, 'podeVer')} />
                    </View>
                    <View style={styles.switchRow}>
                      <Text style={styles.helper}>Registrar</Text>
                      <Switch
                        value={p.podeRegistrar}
                        onValueChange={() => handleTogglePermissao(c.id, 'podeRegistrar')}
                      />
                    </View>
                    <View style={styles.switchRow}>
                      <Text style={styles.helper}>Editar configurações e combinados</Text>
                      <Switch
                        value={p.podeConfigurar}
                        onValueChange={() => handleTogglePermissao(c.id, 'podeConfigurar')}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        <View style={[styles.form, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Guia</Text>
          <Text style={styles.avisoGuia}>
            Cada criança tem seu tempo. Estas dicas não substituem a orientação do pediatra.
          </Text>
          {CONTEUDO_GUIA_DESFRALDE.sort((a, b) => a.ordemSugerida - b.ordemSugerida).map((item) => (
            <GuiaDesfraldeCard
              key={item.id}
              item={item}
              destaque={item.secao === secaoAtivaGuia}
              expandido={secaoGuiaExpandida === item.id}
              onToggle={() => setSecaoGuiaExpandida((atual) => (atual === item.id ? null : item.id))}
            />
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(colors: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 0 },
    title: { ...typography.title, color: colors.text },
    subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: 12 },
    empty: { textAlign: 'center', color: colors.textMuted, marginTop: 12 },
    mascoteEmpty: { width: 56, height: 56, marginBottom: 12 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    rowButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
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
    form: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    resumoHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    resumoLinha: { fontSize: 13, color: colors.text },
    edit: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 4 },
    helper: { fontSize: 12, color: colors.textMuted },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.brancoSuave,
    },
    textArea: { minHeight: 60, textAlignVertical: 'top' },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    saveButtonText: { color: colors.text, fontWeight: '600' },
    secondaryButton: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    secondaryButtonText: { color: colors.text, fontWeight: '600' },
    savedText: { fontSize: 12, color: colors.text, fontWeight: '600', textAlign: 'center' },
    sinalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.brancoSuave,
    },
    checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
    checkmark: { fontSize: 12, color: colors.text, fontWeight: '700' },
    passoText: { fontSize: 14, color: colors.text },
    link: { fontSize: 12, color: colors.text, fontWeight: '600' },
    registroCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.brancoSuave,
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    itemRemoveButton: { minHeight: 32, minWidth: 32, justifyContent: 'center', alignItems: 'center' },
    itemRemove: { fontSize: 16, color: colors.textMuted },
    cuidadorCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 10,
      gap: 6,
    },
    avisoGuia: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  });
}
