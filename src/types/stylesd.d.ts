import 'styled-components/native';
import { ThemeType } from '../styles/theme';

// Estamos estendendo (adicionando) as propriedades do nosso ThemeType dentro do módulo padrão do styled-components
declare module 'styled-components/native' {
  export interface DefaultTheme extends ThemeType {}
}