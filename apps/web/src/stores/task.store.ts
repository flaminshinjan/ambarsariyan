import { create } from 'zustand';
import { api } from '@/lib/api';
import type { ITask, CreateTaskDto } from '@ambarsariyan/shared';

interface TaskState {
  tasks: ITask[];
  loading: boolean;
  error: string | null;
  handlers: string[];
  fetchTasks: () => Promise<void>;
  fetchHandlers: () => Promise<void>;
  createTask: (dto: CreateTaskDto) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()((set) => ({
  tasks: [],
  loading: false,
  error: null,
  handlers: [],

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await api.get<ITask[]>('/tasks');
      set({ tasks, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchHandlers: async () => {
    try {
      const handlers = await api.get<string[]>('/tasks/handlers');
      set({ handlers });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  createTask: async (dto: CreateTaskDto) => {
    set({ loading: true, error: null });
    try {
      const task = await api.post<ITask>('/tasks', dto);
      set((state) => ({ tasks: [...state.tasks, task], loading: false }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  deleteTask: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.del(`/tasks/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        loading: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
}));
