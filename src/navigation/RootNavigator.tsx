import React from 'react';
import { Text, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          tabBarIcon: () =>
            route.name === 'Âmi' ? (
              <Image source={mascoteIcon} style={{ width: 22, height: 22 }} resizeMode="contain" />
            ) : (
              <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>
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
