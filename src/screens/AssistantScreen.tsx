import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';
import { Child } from '../types/child';
import { loadChildren } from '../storage/childrenStorage';
import { ChatConversation, ChatMessage } from '../types/chat';
import { loadConversations, saveConversations } from '../storage/chatStorage';
import { identificarTema, respostaPadrao, TEMA_LABEL } from '../utils/chatThemes';
import mascoteIcon from '../../assets/mascote/avatar-circular-bust.png';
import amiWordmark from '../../assets/marca/ami-wordmark.png';
import ChatBubble from '../components/ChatBubble';

const GREETING = 'Oi, eu sou a Âmi. Pode me contar o que você precisa.';
const FALLBACK_NO_CHILD =
  'Uma dica: cadastrar o perfil do seu filho na aba Perfis deixa minhas respostas mais certeiras.';

type Estagio = 'carregando' | 'perguntar_retomar' | 'lista' | 'conversa';

function novaConversa(): ChatConversation {
  const agora = new Date().toISOString();
  return {
    id: Date.now().toString(),
    tema: 'outros',
    titulo: '',
    mensagens: [],
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

function labelData(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function AssistantScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [children, setChildren] = useState<Child[]>([]);
  const [conversas, setConversas] = useState<ChatConversation[]>([]);
  const [ativa, setAtiva] = useState<ChatConversation | null>(null);
  const [estagio, setEstagio] = useState<Estagio>('carregando');
  const [texto, setTexto] = useState('');
  const inicializadoRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      loadChildren().then(setChildren);
      loadConversations().then((lista) => {
        setConversas(lista);
        // Só decide a tela inicial (perguntar se quer retomar, ou ir direto
        // pra uma conversa nova) uma vez — refocos seguintes só atualizam
        // os dados em segundo plano, sem interromper o que a pessoa
        // estiver fazendo.
        if (!inicializadoRef.current) {
          inicializadoRef.current = true;
          if (lista.length > 0) {
            setEstagio('perguntar_retomar');
          } else {
            setAtiva(novaConversa());
            setEstagio('conversa');
          }
        }
      });
    }, []),
  );

  function handleIniciarNovaConversa() {
    setAtiva(novaConversa());
    setEstagio('conversa');
  }

  function handleAbrirConversa(conversa: ChatConversation) {
    setAtiva(conversa);
    setEstagio('conversa');
  }

  async function persistirConversa(atualizada: ChatConversation) {
    const outras = conversas.filter((c) => c.id !== atualizada.id);
    const lista = [...outras, atualizada];
    setConversas(lista);
    setAtiva(atualizada);
    await saveConversations(lista);
  }

  async function handleEnviar() {
    if (!ativa || !texto.trim()) return;
    const textoEnviado = texto.trim();
    setTexto('');

    const primeiraMensagem = ativa.mensagens.length === 0;
    const tema = primeiraMensagem ? identificarTema(textoEnviado) : ativa.tema;
    const titulo = primeiraMensagem ? textoEnviado.slice(0, 60) : ativa.titulo;

    const mensagemMae: ChatMessage = {
      id: `${Date.now()}-mae`,
      from: 'mae',
      text: textoEnviado,
      criadoEm: new Date().toISOString(),
    };
    const respostaAmi: ChatMessage = {
      id: `${Date.now()}-ami`,
      from: 'ami',
      text: respostaPadrao(tema),
      criadoEm: new Date().toISOString(),
    };

    await persistirConversa({
      ...ativa,
      tema,
      titulo,
      mensagens: [...ativa.mensagens, mensagemMae, respostaAmi],
      atualizadoEm: new Date().toISOString(),
    });
  }

  const semFilhos = children.length === 0;
  const conversasOrdenadas = [...conversas].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));

  if (estagio === 'carregando') {
    return <View style={styles.container} />;
  }

  if (estagio === 'perguntar_retomar') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={mascoteIcon} style={styles.avatar} resizeMode="contain" />
          <View style={styles.titleLogo}>
            <Image source={amiWordmark} style={styles.wordmark} resizeMode="contain" accessibilityLabel="Âmi" />
          </View>
        </View>
        <View style={styles.perguntaBox}>
          <Text style={styles.perguntaTexto}>Deseja continuar alguma conversa anterior?</Text>
          <View style={styles.perguntaBotoes}>
            <Pressable
              style={[styles.perguntaBotao, styles.perguntaBotaoPrimario]}
              onPress={() => setEstagio('lista')}
            >
              <Text style={styles.perguntaBotaoTextoPrimario}>Sim</Text>
            </Pressable>
            <Pressable style={styles.perguntaBotao} onPress={handleIniciarNovaConversa}>
              <Text style={styles.perguntaBotaoTexto}>Não</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (estagio === 'lista') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={mascoteIcon} style={styles.avatar} resizeMode="contain" />
          <Text style={styles.title}>Conversas anteriores</Text>
        </View>
        <FlatList
          data={conversasOrdenadas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listaContent}
          renderItem={({ item }) => {
            const ultima = item.mensagens[item.mensagens.length - 1];
            return (
              <Pressable style={styles.conversaCard} onPress={() => handleAbrirConversa(item)}>
                <View style={styles.conversaCardHeader}>
                  <View style={styles.temaTag}>
                    <Text style={styles.temaTagTexto}>{TEMA_LABEL[item.tema]}</Text>
                  </View>
                  <Text style={styles.conversaData}>{labelData(item.atualizadoEm)}</Text>
                </View>
                <Text style={styles.conversaTitulo} numberOfLines={1}>
                  {item.titulo || 'Conversa sem título'}
                </Text>
                {ultima && (
                  <Text style={styles.conversaPreview} numberOfLines={1}>
                    {ultima.from === 'ami' ? 'Âmi: ' : 'Você: '}
                    {ultima.text}
                  </Text>
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhuma conversa anterior ainda.</Text>
          }
        />
        <Pressable style={styles.novaConversaLink} onPress={handleIniciarNovaConversa}>
          <Text style={styles.novaConversaLinkTexto}>+ iniciar uma conversa nova</Text>
        </Pressable>
      </View>
    );
  }

  // estagio === 'conversa'
  const mensagens = ativa?.mensagens ?? [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Image source={mascoteIcon} style={styles.avatar} resizeMode="contain" />
        <View style={styles.titleLogo}>
          <Image source={amiWordmark} style={styles.wordmark} resizeMode="contain" accessibilityLabel="Âmi" />
        </View>
        {conversas.length > 0 && (
          <Pressable style={styles.trocarConversa} onPress={() => setEstagio('lista')}>
            <Text style={styles.trocarConversaTexto}>conversas salvas</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.chatContent}>
        {mensagens.length === 0 && (
          <View style={[styles.bubble, styles.bubbleAmi]}>
            <Text style={styles.bubbleTextAmi}>{GREETING}</Text>
          </View>
        )}
        {mensagens.length === 0 && semFilhos && (
          <View style={[styles.bubble, styles.bubbleAmi]}>
            <Text style={styles.bubbleTextAmi}>{FALLBACK_NO_CHILD}</Text>
          </View>
        )}
        {mensagens.map((message) => (
          <ChatBubble
            key={message.id}
            text={message.text}
            from={message.from}
            bubbleStyle={[styles.bubble, message.from === 'ami' ? styles.bubbleAmi : styles.bubbleMae]}
            textStyle={message.from === 'ami' ? styles.bubbleTextAmi : styles.bubbleTextMae}
          />
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem"
          placeholderTextColor={colors.textMuted}
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={handleEnviar}
          returnKeyType="send"
          multiline
        />
        <Pressable
          style={[styles.sendButton, !texto.trim() && styles.sendButtonDisabled]}
          onPress={handleEnviar}
          disabled={!texto.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function getStyles(colors: Colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatar: { width: 32, height: 32 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, flex: 1 },
  titleLogo: { flex: 1, justifyContent: 'center' },
  // wordmark oficial (assets/marca/ami-wordmark.png, proporção 621x310)
  wordmark: { height: 30, width: 60 },
  trocarConversa: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minHeight: 44,
    justifyContent: 'center',
  },
  trocarConversaTexto: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  chatContent: { paddingHorizontal: 20, paddingBottom: 12, gap: 10, flexGrow: 1 },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleAmi: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleMae: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleTextAmi: { color: colors.text, fontSize: 14, lineHeight: 20 },
  bubbleTextMae: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.card,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonText: { color: colors.text, fontSize: 16, fontWeight: '700' },

  perguntaBox: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 14,
    alignItems: 'center',
  },
  perguntaTexto: { fontSize: 15, color: colors.text, textAlign: 'center', fontWeight: '600' },
  perguntaBotoes: { flexDirection: 'row', gap: 10 },
  perguntaBotao: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.brancoSuave,
  },
  perguntaBotaoPrimario: { backgroundColor: colors.primary, borderColor: colors.primary },
  perguntaBotaoTexto: { color: colors.textMuted, fontWeight: '600' },
  perguntaBotaoTextoPrimario: { color: colors.text, fontWeight: '700' },

  listaContent: { paddingHorizontal: 20, paddingTop: 4, gap: 10, paddingBottom: 16 },
  conversaCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  conversaCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  temaTag: {
    backgroundColor: colors.lavandaClaro,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  temaTagTexto: { fontSize: 10, fontWeight: '700', color: colors.text },
  conversaData: { fontSize: 11, color: colors.textMuted },
  conversaTitulo: { fontSize: 14, fontWeight: '600', color: colors.text },
  conversaPreview: { fontSize: 12, color: colors.textMuted },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 12 },
  novaConversaLink: { padding: 16, alignItems: 'center' },
  novaConversaLinkTexto: { color: colors.text, fontWeight: '600', fontSize: 13 },
  });
}
