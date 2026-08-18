import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { Child } from '../types/child';
import { loadChildren, saveChildren } from '../storage/childrenStorage';

export default function ChildrenProfileScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [escola, setEscola] = useState('');
  const [interesses, setInteresses] = useState('');

  useEffect(() => {
    loadChildren().then(setChildren);
  }, []);

  async function handleAdd() {
    if (!nome.trim()) return;

    const newChild: Child = {
      id: Date.now().toString(),
      nome: nome.trim(),
      idade: idade.trim(),
      escola: escola.trim(),
      interesses: interesses.trim(),
    };

    const updated = [...children, newChild];
    setChildren(updated);
    await saveChildren(updated);

    setNome('');
    setIdade('');
    setEscola('');
    setInteresses('');
  }

  async function handleRemove(id: string) {
    const updated = children.filter((c) => c.id !== id);
    setChildren(updated);
    await saveChildren(updated);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Perfis dos filhos</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor={colors.textMuted}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Idade"
          placeholderTextColor={colors.textMuted}
          value={idade}
          onChangeText={setIdade}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Escola"
          placeholderTextColor={colors.textMuted}
          value={escola}
          onChangeText={setEscola}
        />
        <TextInput
          style={styles.input}
          placeholder="Interesses"
          placeholderTextColor={colors.textMuted}
          value={interesses}
          onChangeText={setInteresses}
        />
        <Pressable style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Adicionar filho(a)</Text>
        </Pressable>
      </View>

      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.nome}</Text>
              <Text style={styles.cardDetail}>
                {[item.idade && `${item.idade} anos`, item.escola, item.interesses]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
            <Pressable onPress={() => handleRemove(item.id)}>
              <Text style={styles.remove}>remover</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum perfil cadastrado ainda.</Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.brancoSuave,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '600',
  },
  list: {
    paddingVertical: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardDetail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  remove: {
    color: colors.textMuted,
    fontSize: 12,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 24,
  },
});
