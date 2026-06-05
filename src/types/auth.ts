// Definição do objeto de Usuário
export interface User {
  name: string;
  email: string;
}

// Definição de tudo o que a nossa store (central de estado) do Zustand vai armazenar e fazer
export interface AuthState {
  user: User | null;         // Se for null, significa que não tem ninguém logado
  isLoading: boolean;       // Controla o loading global do botão de entrar
  isAuthenticated: boolean; // Atalho booleano para checar se está logado
  
  // Ações (Funções que alteram o estado)
  login: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}