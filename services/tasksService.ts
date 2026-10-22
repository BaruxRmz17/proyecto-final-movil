
import { supabase } from '@/lib/supabase';

import {
cancelTaskNotifications,
getTaskNotificationStatuses as readTaskNotificationStatuses,
reconcileTaskNotifications,
rescheduleTaskNotifications,
} from '@/services/taskNotificationsService';

import type {
CreateTaskInput,
TaskRecord,
TaskStatus,
UpdateTaskInput,
} from '@/types/tasks';

async function getCurrentUserId(): Promise<string> {
const {
    data: { user },
    error,
} = await supabase.auth.getUser();

if (error || !user) {
    throw new Error('Debes iniciar sesión para administrar tus tareas.');
}

return user.id;
}

export async function getTasks(): Promise<TaskRecord[]> {
const userId = await getCurrentUserId();

const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('due_date', { ascending: true })
    .order('due_time', { ascending: true });

if (error) throw new Error(error.message);

const tasks = (data ?? []) as TaskRecord[];
// Supabase es la fuente de verdad; la reconciliación se recupera después.
void reconcileTaskNotifications(userId, tasks);

return tasks;
}

export async function getTaskNotificationStatuses(
tasks: TaskRecord[]
): Promise<Record<string, boolean>> {
const userId = await getCurrentUserId();

return readTaskNotificationStatuses(userId, tasks);
}

export async function getGradedTasks(): Promise<TaskRecord[]> {
const userId = await getCurrentUserId();

const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .not('grade', 'is', null)
    .order('class_id', { ascending: true })
    .order('due_date', { ascending: true });

if (error) throw new Error(error.message);

return (data ?? []) as TaskRecord[];
}

export async function createTask(
input: CreateTaskInput
): Promise<TaskRecord> {
const userId = await getCurrentUserId();

const { data, error } = await supabase
    .from('tasks')
    .insert({
    ...input,
    user_id: userId,
    status: 'pending',
    })
    .select()
    .single();

if (error) throw new Error(error.message);

const task = data as TaskRecord;
// Las notificaciones son un efecto secundario recuperable.
void rescheduleTaskNotifications(task);

return task;
}

export async function updateTask(
id: string,
input: UpdateTaskInput
): Promise<TaskRecord> {
const userId = await getCurrentUserId();

const { data, error } = await supabase
    .from('tasks')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

if (error) throw new Error(error.message);

const task = data as TaskRecord;
// La actualización de la tarea no depende del sistema de notificaciones.
void rescheduleTaskNotifications(task);

return task;
}

export async function updateTaskStatus(
id: string,
status: TaskStatus
): Promise<TaskRecord> {
return updateTask(id, { status });
}

export async function archiveTask(id: string): Promise<TaskRecord> {
return updateTask(id, { archived: true });
}

export async function deleteTask(id: string): Promise<void> {
const userId = await getCurrentUserId();

const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

if (error) throw new Error(error.message);

// La eliminación en Supabase no debe fallar por una notificación pendiente.
void cancelTaskNotifications(id);
}
