import { useCallback, useEffect, useRef, useState } from 'react';

import {
archiveTask as archiveTaskRecord,
createTask,
deleteTask,
getTasks,
getTaskNotificationStatuses,
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
const [notificationStatuses, setNotificationStatuses] =
useState<Record<string, boolean>>({});
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);
const mountedRef = useRef(true);
const requestIdRef = useRef(0);

const refreshTaskNotificationStatus = useCallback(
    async (task: TaskRecord) => {
    try {
        const statuses = await getTaskNotificationStatuses([
        task,
        ]);

        if (mountedRef.current) {
        setNotificationStatuses((current) => ({
            ...current,
            ...statuses,
        }));
        }
    } catch {
        // Las notificaciones son opcionales y no bloquean el CRUD.
    }
    },
    []
);

useEffect(() => {
    return () => {
    mountedRef.current = false;
    };
}, []);

const refreshTasks = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
    const records = await getTasks();
    let statuses: Record<string, boolean> = {};

    try {
        statuses = await getTaskNotificationStatuses(records);
    } catch {
        // El estado de notificaciones no debe impedir cargar tareas.
    }

    if (
        mountedRef.current &&
        requestId === requestIdRef.current
    ) {
        setTasks(records);
        setNotificationStatuses(statuses);
    }
    } catch (err) {
    if (
        mountedRef.current &&
        requestId === requestIdRef.current
    ) {
        setError(
        err instanceof Error
            ? err.message
            : 'No se pudieron cargar las tareas.'
        );
    }
    } finally {
    if (
        mountedRef.current &&
        requestId === requestIdRef.current
    ) {
        setLoading(false);
    }
    }
}, []);

const addTask = useCallback(async (input: CreateTaskInput) => {
    setSaving(true);
    setError(null);

    try {
    const created = await createTask(input);

    if (mountedRef.current) {
        setTasks((current) => [...current, created]);
        setNotificationStatuses((current) => ({
        ...current,
        [created.id]: false,
        }));
    }

    return created;
    } catch (err) {
    if (mountedRef.current) {
        setError(
        err instanceof Error
            ? err.message
            : 'No se pudo crear la tarea.'
        );
    }

    throw err;
    } finally {
    if (mountedRef.current) setSaving(false);
    }
}, []);

const editTask = useCallback(
    async (id: string, input: UpdateTaskInput) => {
    setSaving(true);
    setError(null);

    try {
        const updated = await updateTask(id, input);

        if (mountedRef.current) {
        setTasks((current) =>
            current.map((task) =>
            task.id === id ? updated : task
            )
        );
        }

        void refreshTaskNotificationStatus(updated);

        return updated;
    } catch (err) {
        if (mountedRef.current) {
        setError(
            err instanceof Error
            ? err.message
            : 'No se pudo actualizar la tarea.'
        );
        }

        throw err;
    } finally {
        if (mountedRef.current) setSaving(false);
    }
    },
    [refreshTaskNotificationStatus]
);

const toggleTask = useCallback(async (task: TaskRecord) => {
    setError(null);

    try {
    const nextStatus: TaskStatus =
        task.status === 'completed'
        ? 'pending'
        : 'completed';

    const updated = await updateTaskStatus(
        task.id,
        nextStatus
    );

    if (mountedRef.current) {
        setTasks((current) =>
        current.map((item) =>
            item.id === task.id ? updated : item
        )
        );
    }

    void refreshTaskNotificationStatus(updated);

    return updated;
    } catch (err) {
    if (mountedRef.current) {
        setError(
        err instanceof Error
            ? err.message
            : 'No se pudo actualizar la tarea.'
        );
    }

    throw err;
    }
}, [refreshTaskNotificationStatus]);

const removeTask = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);

    try {
    await deleteTask(id);

    if (mountedRef.current) {
        setTasks((current) =>
        current.filter((task) => task.id !== id)
        );
        setNotificationStatuses((current) => {
        const next = { ...current };
        delete next[id];
        return next;
        });
    }
    } catch (err) {
    if (mountedRef.current) {
        setError(
        err instanceof Error
            ? err.message
            : 'No se pudo eliminar la tarea.'
        );
    }

    throw err;
    } finally {
    if (mountedRef.current) setSaving(false);
    }
}, []);

const archiveTask = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);

    try {
    await archiveTaskRecord(id);

    if (mountedRef.current) {
        setTasks((current) =>
        current.filter((task) => task.id !== id)
        );
        setNotificationStatuses((current) => {
        const next = { ...current };
        delete next[id];
        return next;
        });
    }
    } catch (err) {
    if (mountedRef.current) {
        setError(
        err instanceof Error
            ? err.message
            : 'No se pudo archivar la tarea.'
        );
    }

    throw err;
    } finally {
    if (mountedRef.current) setSaving(false);
    }
}, []);

return {
    tasks,
    notificationStatuses,
    loading,
    saving,
    error,
    refreshTasks,
    addTask,
    editTask,
    toggleTask,
    removeTask,
    archiveTask,
};
}
