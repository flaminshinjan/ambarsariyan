'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { WorkflowBuilder } from '@/components/domain/workflow-builder';
import { useWorkflowStore } from '@/stores/workflow.store';

export default function NewWorkflowPage() {
  const router = useRouter();
  const { createWorkflow, loading } = useWorkflowStore();

  const handleSave = async (data: { name: string; description: string; taskIds: string[] }) => {
    try {
      await createWorkflow(data);
      router.push('/workflows');
    } catch {
      /* noop */
    }
  };

  return (
    <div>
      <Header title="Create Workflow" subtitle="Define a new workflow with task sequence" />
      <WorkflowBuilder onSave={handleSave} loading={loading} />
    </div>
  );
}
