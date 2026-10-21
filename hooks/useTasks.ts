
import { useCallback, useState } from 'react';

import {
createTask,
deleteTask,
getTasks,
updateTask,
updateTaskStatus,
} from '@/services/tasksService';

import type {
CreateTaskInput,
TaskRecord,
TaskStatus,
UpdateTaskInput,
} from '@/types/tasks';

export function useTasks() {
const [tasks, setTasks] = useState<TaskRecord[]>([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);

const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
    const records = await getTasks();
    setTasks(records);
    } catch (err) {
    setError(
        err instanceof Error
        ? err.message
        : 'No se pudieron cargar las tareas.'
    );
    } finally {
    setLoading(false);
    }
}, []);

const addTask = async (input: CreateTaskInput) => {
    setSaving(true);

    try {
    const created = await createTask(input);
    setTasks((current) => [...current, created]);
    return created;
    } finally {
    setSaving(false);
    }
};

const editTask = async (
    id: string,
    input: UpdateTaskInput
) => {
    setSaving(true);

    try {
    const updated = await updateTask(id, input);

    setTasks((current) =>
        current.map((task) =>
        task.id === id ? updated : task
        )
    );

    return updated;
    } finally {
    setSaving(false);
    }
};

const toggleTask = async (task: TaskRecord) => {
    const nextStatus: TaskStatus =
    task.status === 'completed' ? 'pending' : 'completed';

    const updated = await updateTaskStatus(
    task.id,
    nextStatus
    );

    setTasks((current) =>
    current.map((item) =>
        item.id === task.id ? updated : item
    )
    );
};

const removeTask = async (id: string) => {
    setSaving(true);

    try {
    await deleteTask(id);

    setTasks((current) =>
        current.filter((task) => task.id !== id)
    );
    } finally {
    setSaving(false);
    }
};

return {
    tasks,
    loading,
    saving,
    error,
    refreshTasks,
    addTask,
    editTask,
    toggleTask,
    removeTask,
};
}
