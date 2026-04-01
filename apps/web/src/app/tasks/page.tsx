'use client';

import { useEffect, useState } from 'react';
import { TaskCategory, TaskType } from '@ambarsariyan/shared';
import type { CreateTaskDto } from '@ambarsariyan/shared';
import { Header } from '@/components/layout/header';
import { Button, Modal, Input, Select } from '@/components/ui';
import { TaskCard } from '@/components/domain/task-card';
import { useTaskStore } from '@/stores/task.store';
import styles from './page.module.css';

const categoryOptions = Object.values(TaskCategory).map((v) => ({ value: v, label: v }));
const typeOptions = Object.values(TaskType).map((v) => ({ value: v, label: v }));

export default function TasksPage() {
  const { tasks, handlers, loading, fetchTasks, fetchHandlers, createTask } = useTaskStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateTaskDto>({
    name: '',
    description: '',
    category: TaskCategory.HTTP,
    type: TaskType.BUILTIN,
    handler: '',
    config: {},
  });
  const [configStr, setConfigStr] = useState('{}');

  useEffect(() => {
    fetchTasks();
    fetchHandlers();
  }, [fetchTasks, fetchHandlers]);

  const handlerOptions = handlers.map((h) => ({ value: h, label: h }));

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      category: TaskCategory.HTTP,
      type: TaskType.BUILTIN,
      handler: '',
      config: {},
    });
    setConfigStr('{}');
  };

  const handleCreate = async () => {
    try {
      const config = JSON.parse(configStr);
      await createTask({ ...form, config });
      setModalOpen(false);
      resetForm();
    } catch {
      /* noop */
    }
  };

  return (
    <div>
      <Header title="Tasks" subtitle="Manage your automation tasks">
        <Button variant="primary" icon="add" onClick={() => setModalOpen(true)}>
          Create Task
        </Button>
      </Header>

      <div className={styles.grid}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {!loading && tasks.length === 0 && (
        <div className={styles.empty}>
          <p>No tasks created yet</p>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Task"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} loading={loading}>
              Create
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <Input
            label="Name"
            placeholder="Task name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Description"
            placeholder="What does this task do?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })}
          />
          <Select
            label="Type"
            options={typeOptions}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as TaskType })}
          />
          {handlerOptions.length > 0 ? (
            <Select
              label="Handler"
              options={handlerOptions}
              value={form.handler}
              placeholder="Select a handler"
              onChange={(e) => setForm({ ...form, handler: e.target.value })}
            />
          ) : (
            <Input
              label="Handler"
              placeholder="Handler key"
              value={form.handler}
              onChange={(e) => setForm({ ...form, handler: e.target.value })}
            />
          )}
          <div className={styles.textareaWrapper}>
            <label className={styles.textareaLabel}>Config (JSON)</label>
            <textarea
              className={styles.textarea}
              rows={4}
              value={configStr}
              onChange={(e) => setConfigStr(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
