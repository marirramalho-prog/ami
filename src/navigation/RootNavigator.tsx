import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import ChildrenProfileScreen from '../screens/ChildrenProfileScreen';
import AgendaScreen from '../screens/AgendaScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import StoriesScreen from '../screens/StoriesScreen';
import SleepScreen from '../screens/SleepScreen';
import AssistantScreen from '../screens/AssistantScreen';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = {
  Lumi: '🧚',
  Perfis: '👶',
  Agenda: '🗓️',
  Checklist: '✅',
  Descobrir: '🔍',
  Histórias: '📖',
  Sono: '🌙',
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
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
        })}
      >
        <Tab.Screen name="Lumi" component={AssistantScreen} />
        <Tab.Screen name="Perfis" component={ChildrenProfileScreen} />
        <Tab.Screen name="Agenda" component={AgendaScreen} />
        <Tab.Screen name="Checklist" component={ChecklistScreen} />
        <Tab.Screen name="Descobrir" component={DiscoverScreen} />
        <Tab.Screen name="Histórias" component={StoriesScreen} />
        <Tab.Screen name="Sono" component={SleepScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
