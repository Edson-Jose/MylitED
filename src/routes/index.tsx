import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuthStore } from '../hooks/useAuthStore';
import { RootStackParamList } from '../types/routes';

import Login from '../screens/Login';
import AppRoutes from './app.routes';

const Stack = createStackNavigator<RootStackParamList>();

export default function Routes() {
  // Escuta em tempo real se o usuário está autenticado
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Fluxo de telas logadas
          <Stack.Screen name="MainApp" component={AppRoutes} />
        ) : (
          // Fluxo de autenticação
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}