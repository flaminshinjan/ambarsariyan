'use client';

import { useState, useEffect } from 'react';
import type { ITask } from '@ambarsariyan/shared';
import { useTaskStore } from '@/stores/task.store';
import { Input, Button, Icon, Card } from '@/components/ui';
import styles from './workflow-builder.module.css';

interface WorkflowBuilderProps {
  onSave: (data: { name: string; description: string; taskIds: string[] }) => void;
  loading?: boolean;
}

export function WorkflowBuilder({ onSave, loading }: WorkflowBuilderProps) {
  const { tasks, fetchTasks } = useTaskStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<ITask[]>([]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const availableTasks = tasks.filter(
    (t) => !selectedTasks.some((s) => s.id === t.id)
  );

  const addTask = (task: ITask) => {
    setSelectedTasks((prev) => [...prev, task]);
  };

  const removeTask = (id: string) => {
    setSelectedTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const moveTask = (index: number, direction: 'up' | 'down') => {
    const newTasks = [...selectedTasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTasks.length) return;
    [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
    setSelectedTasks(newTasks);
  };

  const handleSubmit = () => {
    if (!name.trim() || selectedTasks.length === 0) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      taskIds: selectedTasks.map((t) => t.id),
    });
  };

  return (
    <div className={styles.builder}>
      <div className={styles.form}>
        <Input
          label="Workflow Name"
          placeholder="Enter workflow name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Description"
          placeholder="What does this workflow do?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.columns}>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Available Tasks</h3>
          <div className={styles.taskList}>
            {availableTasks.length === 0 && (
              <p className={styles.empty}>No tasks available</p>
            )}
            {availableTasks.map((task) => (
              <div
                key={task.id}
                className={styles.taskItem}
                onClick={() => addTask(task)}
              >
                <div className={styles.taskInfo}>
                  <span className={styles.taskName}>{task.name}</span>
                  <span className={styles.taskHandler}>{task.handler}</span>
                </div>
                <Icon name="add" size={18} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            Workflow Sequence ({selectedTasks.length})
          </h3>
          <div className={styles.taskList}>
            {selectedTasks.length === 0 && (
              <p className={styles.empty}>Add tasks from the left panel</p>
            )}
            {selectedTasks.map((task, index) => (
              <div key={task.id} className={styles.selectedItem}>
                <span className={styles.sequence}>{index + 1}</span>
                <div className={styles.taskInfo}>
                  <span className={styles.taskName}>{task.name}</span>
                  <span className={styles.taskHandler}>{task.handler}</span>
                </div>
                <div className={styles.itemActions}>
                  <button
                    className={styles.moveBtn}
                    onClick={() => moveTask(index, 'up')}
                    disabled={index === 0}
                  >
                    <Icon name="keyboard_arrow_up" size={16} />
                  </button>
                  <button
                    className={styles.moveBtn}
                    onClick={() => moveTask(index, 'down')}
                    disabled={index === selectedTasks.length - 1}
                  >
                    <Icon name="keyboard_arrow_down" size={16} />
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeTask(task.id)}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          icon="save"
          onClick={handleSubmit}
          disabled={!name.trim() || selectedTasks.length === 0}
          loading={loading}
        >
          Create Workflow
        </Button>
      </div>
    </div>
  );
}
