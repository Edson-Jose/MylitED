import { DefaultTheme } from 'styled-components/native';

// Declaração dos tipos para manter o autocomplete do TypeScript ativo e seguro
declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      background: string;
      surface: string;
      border: string;
      textPrimary: string;
      textSecondary: string;
      placeholder: string;
      success: string;
      warning: string;
      danger: string;
    };
  }
}

//  PALETA MODO CLARO (Trello Clássico)
export const lightTheme: DefaultTheme = {
  colors: {
    primary: '#0079BF',      // Azul Trello original
    background: '#F4F5F7',   // Cinza claro de fundo
    surface: '#FFFFFF',      // Cards brancos
    border: '#DFE1E6',       // Bordas cinzas suaves
    textPrimary: '#172B4D',  // Azul escuro para títulos legíveis
    textSecondary: '#5E6C84',// Cinza médio para descrições
    placeholder: '#97A0AF',  // Textos de dica dentro dos inputs
    success: '#61BD4F',      // Verde para Concluído/Prioridade Baixa
    warning: '#F2D600',      // Amarelo para Prioridade Média
    danger: '#EB5A46',       // Vermelho para Prioridade Alta/Excluir
  },
};

//  PALETA MODO ESCURO (Customizado: Marinho Tricoline 100% Algodão Lisa)
export const darkTheme: DefaultTheme = {
  colors: {
    primary: '#579DFF',      // Azul celeste brilhante para dar destaque no marinho
    background: '#0D1B2A',   // O Marinho Tricoline Fechado (Fundo Principal)
    surface: '#1B263B',      // Um tom acima do marinto tricoline para destacar os Cards do fundo
    border: '#415A77',       // Azul jeans médio para delimitar bordas de forma suave
    textPrimary: '#F4F5F7',  // Branco acinzentado para leitura confortável sem agredir os olhos
    textSecondary: '#E2FCEF',// Tom pastel suave para textos secundários
    placeholder: '#778DA9',  // Azul acinzentado opaco para campos de digitação vazios
    success: '#61BD4F',      // Mantém o verde estável
    warning: '#F2D600',      // Mantém o amarelo estável
    danger: '#EB5A46',       // Mantém o vermelho estável
  },
};
