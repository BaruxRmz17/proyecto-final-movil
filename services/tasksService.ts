
import { supabase } from '@/lib/supabase';

import {
cancelTaskNotifications,
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
    .order('due_date', { ascending: true })
    .order('due_time', { ascending: true });

if (error) throw new Error(error.message);

const tasks = (data ?? []) as TaskRecord[];
await reconcileTaskNotifications(userId, tasks);

return tasks;
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
await rescheduleTaskNotifications(task);

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
await rescheduleTaskNotifications(task);

return task;
}

export async function updateTaskStatus(
id: string,
status: TaskStatus
): Promise<TaskRecord> {
return updateTask(id, { status });
}

export async function deleteTask(id: string): Promise<void> {
const userId = await getCurrentUserId();

const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

if (error) throw new Error(error.message);

await cancelTaskNotifications(id);
}
