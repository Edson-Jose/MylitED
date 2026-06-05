import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { lightTheme, darkTheme } from './src/styles/theme';
import { useAuthStore } from './src/hooks/useAuthStore';
import Routes from './src/routes';

export default function App() {
  // Escuta em tempo real se o modo escuro está ativado na store global
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  // Seleciona a paleta de cores correta com base no estado do interruptor
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={currentTheme}>
        <StatusBar 
          barStyle={isDarkMode ? "light-content" : "dark-content"} 
          backgroundColor={currentTheme.colors.background} 
        />
        
        <Routes />
        
      </ThemeProvider>
    </SafeAreaProvider>
  );
}