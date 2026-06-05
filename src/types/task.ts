export type TaskPriority = 'Baixa' | 'Média' | 'Alta';
export type TaskStatus = 'A fazer' | 'Em andamento' | 'Concluído';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  date: string;
  category: string;
}