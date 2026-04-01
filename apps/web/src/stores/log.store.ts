import { create } from 'zustand';
import { api } from '@/lib/api';
import type { ILogEntry, ILogQuery } from '@ambarsariyan/shared';

interface LogState {
  logs: ILogEntry[];
  stats: Record<string, number>;
  loading: boolean;
  query: ILogQuery;
  fetchLogs: () => Promise<void>;
  fetchStats: () => Promise<void>;
  setQuery: (partial: Partial<ILogQuery>) => void;
}

export const useLogStore = create<LogState>()((set, get) => ({
  logs: [],
  stats: {},
  loading: false,
  query: {
    page: 1,
    limit: 50,
  },

  fetchLogs: async () => {
    set({ loading: true });
    try {
      const { query } = get();
      const res = await api.get<{ data: ILogEntry[]; total: number }>('/logs', query as Record<string, string | number | undefined>);
      set({ logs: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await api.get<Record<string, number>>('/logs/stats');
      set({ stats });
    } catch {
      /* noop */
    }
  },

  setQuery: (partial: Partial<ILogQuery>) => {
    set((state) => ({
      query: { ...state.query, ...partial },
    }));
  },
}));
