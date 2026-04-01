import { create } from 'zustand';
import { api } from '@/lib/api';
import type { IWorkflow, IWorkflowRun, CreateWorkflowDto } from '@ambarsariyan/shared';

interface WorkflowState {
  workflows: IWorkflow[];
  currentWorkflow: IWorkflow | null;
  currentRun: IWorkflowRun | null;
  runs: IWorkflowRun[];
  loading: boolean;
  error: string | null;
  fetchWorkflows: () => Promise<void>;
  fetchWorkflow: (id: string) => Promise<void>;
  createWorkflow: (dto: CreateWorkflowDto) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  runWorkflow: (id: string) => Promise<IWorkflowRun>;
  fetchRuns: (workflowId: string) => Promise<void>;
  pollRun: (runId: string) => Promise<void>;
}

export const useWorkflowStore = create<WorkflowState>()((set) => ({
  workflows: [],
  currentWorkflow: null,
  currentRun: null,
  runs: [],
  loading: false,
  error: null,

  fetchWorkflows: async () => {
    set({ loading: true, error: null });
    try {
      const workflows = await api.get<IWorkflow[]>('/workflows');
      set({ workflows, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchWorkflow: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const workflow = await api.get<IWorkflow>(`/workflows/${id}`);
      set({ currentWorkflow: workflow, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createWorkflow: async (dto: CreateWorkflowDto) => {
    set({ loading: true, error: null });
    try {
      const workflow = await api.post<IWorkflow>('/workflows', dto);
      set((state) => ({
        workflows: [...state.workflows, workflow],
        loading: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  deleteWorkflow: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.del(`/workflows/${id}`);
      set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id),
        loading: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  runWorkflow: async (id: string) => {
    set({ error: null });
    try {
      const run = await api.post<IWorkflowRun>(`/workflows/${id}/run`);
      set({ currentRun: run });
      return run;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  fetchRuns: async (workflowId: string) => {
    try {
      const runs = await api.get<IWorkflowRun[]>(`/workflows/${workflowId}/runs`);
      set({ runs });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  pollRun: async (runId: string) => {
    try {
      const run = await api.get<IWorkflowRun>(`/workflows/runs/${runId}/poll`);
      set({ currentRun: run });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
