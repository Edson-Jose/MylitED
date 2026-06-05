import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// FUNÇÃO AUXILIAR: Salva o estado atual direto no Firestore do Firebase
const syncWithFirestore = async (userId: string, tasks: any[], notes: any[], schedules: any[], columns: any[]) => {
  try {
    const userDocRef = doc(db, 'users_data', userId);
    await setDoc(userDocRef, { tasks, notes, schedules, columns }, { merge: true });
    console.log(`\n☁️ [Firestore] Sincronização em nuvem realizada com sucesso!\n`);
  } catch (error) {
    console.error(`\n❌ [Firestore] Erro ao sincronizar dados na nuvem:`, error);
  }
};

export const useAuthStore = create<any>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isDarkMode: false,
      columns: ['A fazer', 'Em andamento', 'Concluído'],
      tasks: [],
      notes: [],
      schedules: [],

      toggleTheme: () => set((state: any) => ({ isDarkMode: !state.isDarkMode })),
      updateAvatar: (url: string) => set((state: any) => ({
        user: state.user ? { ...state.user, avatarUrl: url } : null
      })),

      // --- AUTENTICAÇÃO FIREBASE ---
      registerUser: async (email, name, password) => {
        set({ isLoading: true });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;
          
          console.log(`\n🔵 [MylitED] NOVA CONTA CRIADA! -> Nome: ${name} | E-mail: ${email}\n`);
          
          const initialColumns = ['A fazer', 'Em andamento', 'Concluído'];
          await setDoc(doc(db, 'users_data', uid), { tasks: [], notes: [], schedules: [], columns: initialColumns });

          set({ 
            user: { uid, email, name }, 
            isAuthenticated: true,
            columns: initialColumns,
            tasks: [], notes: [], schedules: []
          });
        } catch (error: any) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loginUser: async (email, password) => {
        set({ isLoading: true });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;
          
          console.log(`\n🟩 [MylitED] LOGIN EFETUADO COM SUCESSO! -> Usuário: ${email}\n`);

          const userDoc = await getDoc(doc(db, 'users_data', uid));
          let cloudData = { tasks: [], notes: [], schedules: [], columns: ['A fazer', 'Em andamento', 'Concluído'] };
          
          if (userDoc.exists()) {
            console.log(`☁️ [Firestore] Carregando dados salvos em nuvem para este usuário...`);
            cloudData = userDoc.data() as any;
          }

          set({ 
            user: { uid, email: userCredential.user.email || email, name: 'Sr. Edson' }, 
            isAuthenticated: true,
            tasks: cloudData.tasks || [],
            notes: cloudData.notes || [],
            schedules: cloudData.schedules || [],
            columns: cloudData.columns || ['A fazer', 'Em andamento', 'Concluído']
          });
        } catch (error: any) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logoutUser: async () => {
        await signOut(auth);
        console.log(`\n🟥 [MylitED] LOGOUT EFETUADO! SESSÃO LIMPA NO CELULAR.\n`);
        set({ user: null, isAuthenticated: false, tasks: [], notes: [], schedules: [] });
      },

      // --- GERENCIAMENTO DE COLUNAS (TRELLO) ---
      addColumn: (name) => set((state: any) => {
        const newColumns = state.columns.includes(name) ? state.columns : [...state.columns, name];
        if (state.user) syncWithFirestore(state.user.uid, state.tasks, state.notes, state.schedules, newColumns);
        return { columns: newColumns };
      }),

      deleteColumn: (name) => set((state: any) => {
        const newColumns = state.columns.filter((col: any) => col !== name);
        const newTasks = state.tasks.filter((task: any) => task.status !== name);
        if (state.user) syncWithFirestore(state.user.uid, newTasks, state.notes, state.schedules, newColumns);
        return { columns: newColumns, tasks: newTasks };
      }),

      // --- GERENCIAMENTO DE TAREFAS (KANBAN) ---
      addTask: (title, description, category, status) => set((state: any) => {
        const newTask = {
          id: String(Date.now()),
          title,
          description,
          category,
          status,
          date: 'Sem prazo',
          priority: 'Baixa'
        };
        const updatedTasks = [...state.tasks, newTask];
        if (state.user) syncWithFirestore(state.user.uid, updatedTasks, state.notes, state.schedules, state.columns);
        return { tasks: updatedTasks };
      }),

      moveTask: (id, newStatus) => set((state: any) => {
        const updatedTasks = state.tasks.map((t: any) => t.id === id ? { ...t, status: newStatus } : t);
        if (state.user) syncWithFirestore(state.user.uid, updatedTasks, state.notes, state.schedules, state.columns);
        return { tasks: updatedTasks };
      }),

      updateTask: (id, updatedFields) => set((state: any) => {
        const updatedTasks = state.tasks.map((t: any) => t.id === id ? { ...t, ...updatedFields } : t);
        if (state.user) syncWithFirestore(state.user.uid, updatedTasks, state.notes, state.schedules, state.columns);
        return { tasks: updatedTasks };
      }),

      deleteTask: (id) => set((state: any) => {
        const updatedTasks = state.tasks.filter((t: any) => t.id !== id);
        if (state.user) syncWithFirestore(state.user.uid, updatedTasks, state.notes, state.schedules, state.columns);
        return { tasks: updatedTasks };
      }),

      // --- GERENCIAMENTO DE NOTAS MUDADO PARA GLOBAL ---
      addNote: (title, content, color, createdAt) => set((state: any) => {
        const newNote = {
          id: String(Date.now()),
          title,
          content,
          color,
          createdAt: createdAt || new Date().toLocaleDateString('pt-BR')
        };
        const updatedNotes = [...state.notes, newNote];
        if (state.user) syncWithFirestore(state.user.uid, state.tasks, updatedNotes, state.schedules, state.columns);
        return { notes: updatedNotes };
      }),

      updateNote: (id, title, content, color, createdAt) => set((state: any) => {
        const updatedNotes = state.notes.map((n: any) => n.id === id 
          ? { ...n, title, content, color, createdAt } : n
        );
        if (state.user) syncWithFirestore(state.user.uid, state.tasks, updatedNotes, state.schedules, state.columns);
        return { notes: updatedNotes };
      }),

      deleteNote: (id) => set((state: any) => {
        const updatedNotes = state.notes.filter((n: any) => n.id !== id);
        if (state.user) syncWithFirestore(state.user.uid, state.tasks, updatedNotes, state.schedules, state.columns);
        return { notes: updatedNotes };
      }),

      // --- GERENCIAMENTO DE COMPROMISSOS (AGENDA) MUDADO PARA GLOBAL ---
      addSchedule: (name, description, time, date, priority) => set((state: any) => {
        const newEvent = {
          id: String(Date.now()),
          name,
          description,
          time,
          date,
          priority,
          category: 'Geral'
        };
        const updatedSchedules = [...state.schedules, newEvent];
        if (state.user) syncWithFirestore(state.user.uid, state.tasks, state.notes, updatedSchedules, state.columns);
        return { schedules: updatedSchedules };
      }),

      deleteSchedule: (id) => set((state: any) => {
        const updatedSchedules = state.schedules.filter((e: any) => e.id !== id);
        if (state.user) syncWithFirestore(state.user.uid, state.tasks, state.notes, updatedSchedules, state.columns);
        return { schedules: updatedSchedules };
      }),

    }),
    {
      name: '@MylitED:store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);