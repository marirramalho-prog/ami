import React from 'react';
import { Text, Image } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import mascoteIcon from '../../assets/mascote/avatar-circular-bust.png';
import ChildrenProfileScreen from '../screens/ChildrenProfileScreen';
import CaregiversScreen from '../screens/CaregiversScreen';
import AgendaScreen from '../screens/AgendaScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import StoriesScreen from '../screens/StoriesScreen';
import SleepScreen from '../screens/SleepScreen';
import CareScreen from '../screens/CareScreen';
import AssistantScreen from '../screens/AssistantScreen';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = {
  Perfis: '👶',
  Cuidadores: '🧑‍🤝‍🧑',
  Agenda: '🗓️',
  Checklist: '✅',
  Descobrir: '🔍',
  Histórias: '📖',
  Sono: '🌙',
  Cuidados: '🩺',
};

// Rótulos exibidos na barra de abas — abreviados só onde o nome
// completo corta em telas estreitas (375px); o nome da rota em si
// (usado por navigation.navigate) continua o nome completo.
const TAB_LABELS: Record<string, string> = {
  Cuidadores: 'Cuidad.',
  Checklist: 'Check.',
  Descobrir: 'Descobr.',
  Histórias: 'Histór.',
};

// Sem isso, a versão web só gera links corretos (href="/Agenda" etc.),
// mas não sabe reconstruir o estado ao abrir/recarregar direto numa
// URL — sempre caía na primeira aba. Mapeando cada rota explicitamente,
// o próprio nome da URL volta a abrir a aba certa.
const linking: LinkingOptions<any> = {
  prefixes: [],
  config: {
    screens: {
      Âmi: '',
      Perfis: 'Perfis',
      Cuidadores: 'Cuidadores',
      Agenda: 'Agenda',
      Checklist: 'Checklist',
      Descobrir: 'Descobrir',
      Histórias: 'Histórias',
      Sono: 'Sono',
      Cuidados: 'Cuidados',
    },
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          tabBarItemStyle: { paddingHorizontal: 0, paddingTop: 2 },
          tabBarIcon: () =>
            route.name === 'Âmi' ? (
              <Image source={mascoteIcon} style={{ width: 20, height: 20 }} resizeMode="contain" />
            ) : (
              <Text style={{ fontSize: 16 }}>{ICONS[route.name]}</Text>
            ),
          tabBarLabel: ({ color }) => (
            <Text style={{ fontSize: 10, color, textAlign: 'center' }}>
              {TAB_LABELS[route.name] || route.name}
            </Text>
          ),
        })}
      >
        <Tab.Screen name="Âmi" component={AssistantScreen} />
        <Tab.Screen name="Perfis" component={ChildrenProfileScreen} />
        <Tab.Screen name="Cuidadores" component={CaregiversScreen} />
        <Tab.Screen name="Agenda" component={AgendaScreen} />
        <Tab.Screen name="Checklist" component={ChecklistScreen} />
        <Tab.Screen name="Descobrir" component={DiscoverScreen} />
        <Tab.Screen name="Histórias" component={StoriesScreen} />
        <Tab.Screen name="Sono" component={SleepScreen} />
        <Tab.Screen name="Cuidados" component={CareScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
