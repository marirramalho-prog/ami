import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Child } from '../types/child';
import { loadChildren } from '../storage/childrenStorage';

interface Message {
  id: string;
  from: 'lumi' | 'mae';
  text: string;
}

interface Shortcut {
  id: string;
  label: string;
  resposta: string;
  destino: string;
}

const SHORTCUTS: Shortcut[] = [
  {
    id: 'atividades',
    label: 'Um passeio pro fim de semana',
    resposta: 'Boa escolha. Separei um jeito rápido de achar passeios certeiros pertinho de casa.',
    destino: 'Descobrir',
  },
  {
    id: 'checklist',
    label: 'Organizar a rotina de hoje',
    resposta: 'Vamos deixar isso redondo. Aqui está o checklist pra organizar o dia.',
    destino: 'Checklist',
  },
  {
    id: 'agenda',
    label: 'Marcar um compromisso',
    resposta: 'Prontinho, já abri a agenda pra você anotar.',
    destino: 'Agenda',
  },
  {
    id: 'historia',
    label: 'Uma história pro meu filho',
    resposta: 'Adoro essa parte. Vamos montar uma história do jeitinho dele.',
    destino: 'Histórias',
  },
  {
    id: 'sono',
    label: 'Rotina de sono',
    resposta: 'Vamos organizar o fim do dia com calma. Aqui está a rotina de sono.',
    destino: 'Sono',
  },
];

const GREETING = 'Oi, eu sou a Lumi. Me diz o que você precisa agora que eu já encaminho.';
const FALLBACK_NO_CHILD =
  'Antes de eu ajudar em tudo isso, me conta quem é seu filho — cadastre o perfil dele que eu já deixo tudo mais certeiro pra vocês.';

export default function AssistantScreen() {
  const navigation = useNavigation<any>();
  const [children, setChildren] = useState<Child[]>([]);
  const [messages, setMessages] = useState<Message[]>([{ id: 'greeting', from: 'lumi', text: GREETING }]);

  useFocusEffect(
    React.useCallback(() => {
      loadChildren().then(setChildren);
    }, []),
  );

  function handleShortcut(shortcut: Shortcut) {
    setMessages((prev) => [
      ...prev,
      { id: `${shortcut.id}-mae-${Date.now()}`, from: 'mae', text: shortcut.label },
      { id: `${shortcut.id}-lumi-${Date.now()}`, from: 'lumi', text: shortcut.resposta },
    ]);
    setTimeout(() => navigation.navigate(shortcut.destino), 600);
  }

  const semFilhos = children.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.avatar}>🧚</Text>
        <Text style={styles.title}>Lumi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.chatContent}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubble,
              message.from === 'lumi' ? styles.bubbleLumi : styles.bubbleMae,
            ]}
          >
            <Text style={message.from === 'lumi' ? styles.bubbleTextLumi : styles.bubbleTextMae}>
              {message.text}
            </Text>
          </View>
        ))}

        {semFilhos && (
          <View style={[styles.bubble, styles.bubbleLumi]}>
            <Text style={styles.bubbleTextLumi}>{FALLBACK_NO_CHILD}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.shortcuts}>
        {semFilhos ? (
          <Pressable
            style={styles.shortcutButton}
            onPress={() => navigation.navigate('Perfis')}
          >
            <Text style={styles.shortcutText}>Cadastrar meu filho</Text>
          </Pressable>
        ) : (
          SHORTCUTS.map((shortcut) => (
            <Pressable
              key={shortcut.id}
              style={styles.shortcutButton}
              onPress={() => handleShortcut(shortcut)}
            >
              <Text style={styles.shortcutText}>{shortcut.label}</Text>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatar: { fontSize: 28 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  chatContent: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleLumi: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleMae: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleTextLumi: { color: colors.text, fontSize: 14, lineHeight: 20 },
  bubbleTextMae: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  shortcuts: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
    gap: 8,
  },
  shortcutButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  shortcutText: { color: colors.text, fontSize: 14, fontWeight: '500' },
});
