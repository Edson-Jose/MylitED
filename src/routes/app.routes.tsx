import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';

import { useAuthStore } from '../hooks/useAuthStore';

// Importações das suas telas reais (Apontando para a pasta Schedules)
import Login from '../screens/Login';
import Home from '../screens/Home';
import Notes from '../screens/Notes';
import Profile from '../screens/Profile';
import Schedules from '../screens/Schedules'; //  Conexão corrigida!

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Cor do ícone e do texto quando selecionado
        tabBarActiveTintColor: theme.colors.primary, 
        // Cor do ícone e do texto quando apagado
        tabBarInactiveTintColor: theme.colors.placeholder, 
        
        // 🌟 CUSTOMIZAÇÃO DA BARRA INSPIRADA NO WHATSAPP:
        tabBarStyle: {
          backgroundColor: theme.colors.surface, // Fundo escuro/marinho do seu tema
          borderTopWidth: 1,
          borderTopColor: theme.colors.border, // Linha fina divisória superior
          
          // Altura anatómica ideal, idêntica à do WhatsApp
          height: Platform.OS === 'ios' ? 88 : 68, 
          paddingTop: 8,
          // Evita que no iPhone os ícones fiquem colados à barra física do sistema
          paddingBottom: Platform.OS === 'ios' ? 28 : 12, 
          
          // Sombra leve para dar efeito de elevação física
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        
        // Alinhamento perfeito das legendas abaixo dos ícones
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        }
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        component={Home} 
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
        }}
      />
      
      <Tab.Screen 
        name="Notas" 
        component={Notes} 
        options={{
          tabBarLabel: 'Notas',
          tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} />
        }}
      />

      {/* 🌟 ABA DA AGENDA INTEGRADA COM O COMPONENTE SCHEDULES: */}
      <Tab.Screen 
        name="Agenda" 
        component={Schedules} // Chamando o componente real do seu arquivo
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />
        }}
      />
      
      <Tab.Screen 
        name="Perfil" 
        component={Profile} 
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Se logado, monta a barra inferior alta estilo WhatsApp com as 4 telas
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        // Se deslogado, mantém o utilizador na sua tela de Login original
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}
