import { Task } from '../types/task';
import { Note } from '../types/note';

// Função auxiliar de Engenharia para simular o delay/atraso de uma rede de internet real (800ms)
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 800));

export const ApiService = {
  
  // --- ENDPOINT SIMULADO: TAREFAS/KANBAN ---
  
  /**
   * Consulta as tarefas salvas (Simula um GET /tasks)
   */
  async fetchTasks(currentTasks: Task[]): Promise<Task[]> {
    await simulateNetworkDelay();
    // Aqui retornamos os dados atuais. Num cenário real, seria um: return fetch('https://api.com/tasks')
    return [...currentTasks];
  },

  /**
   * Envia uma nova tarefa para o servidor (Simula um POST /tasks)
   */
  async saveTaskOnServer(newTask: Task): Promise<boolean> {
    await simulateNetworkDelay();
    console.log(`[WebService API] Sucesso: Cartão "${newTask.title}" registrado no banco de dados externo.`);
    return true;
  },

  // --- ENDPOINT SIMULADO: ANOTAÇÕES COLORIDAS ---

  /**
   * Consulta as anotações do servidor (Simula um GET /notes)
   */
  async fetchNotes(currentNotes: Note[]): Promise<Note[]> {
    await simulateNetworkDelay();
    return [...currentNotes];
  },

  /**
   * Sincroniza a exclusão de uma nota (Simula um DELETE /notes/:id)
   */
  async deleteNoteOnServer(noteId: string): Promise<boolean> {
    await simulateNetworkDelay();
    console.log(`[WebService API] Sucesso: Nota ID ${noteId} deletada do servidor de nuvem.`);
    return true;
  }
};