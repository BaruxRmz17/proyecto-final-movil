import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { TaskRecord } from '@/types/tasks';

const STORAGE_KEY = '@campus-mind/task-notification-ids';

type NotificationMap = Record<string, string[]>;

let handlerConfigured = false;

function configureNotificationHandler() {
if (handlerConfigured || Platform.OS === 'web') return;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    }),
});

handlerConfigured = true;
}

async function readNotificationMap(): Promise<NotificationMap> {
const value = await AsyncStorage.getItem(STORAGE_KEY);

if (!value) return {};

try {
    return JSON.parse(value) as NotificationMap;
} catch {
    return {};
}
}

async function writeNotificationMap(map: NotificationMap) {
await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

async function hasNotificationPermission(
request: boolean
): Promise<boolean> {
const current = await Notifications.getPermissionsAsync();

if (current.granted) return true;
if (!request || !current.canAskAgain) return false;

const requested = await Notifications.requestPermissionsAsync();
return requested.granted;
}

function getTaskDueDate(task: TaskRecord): Date {
const [year, month, day] = task.due_date.split('-').map(Number);
const [hours, minutes] = task.due_time
    ? task.due_time.slice(0, 5).split(':').map(Number)
    : [23, 59];

return new Date(
    year,
    month - 1,
    day,
    Number.isFinite(hours) ? hours : 23,
    Number.isFinite(minutes) ? minutes : 59,
    0,
    0
);
}

async function scheduleTaskNotifications(
task: TaskRecord,
requestPermission: boolean
) {
if (
    Platform.OS === 'web' ||
    task.status === 'completed'
) {
    return;
}

configureNotificationHandler();

if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tasks', {
    name: 'Tareas',
    importance: Notifications.AndroidImportance.DEFAULT,
    });
}

const allowed = await hasNotificationPermission(requestPermission);

if (!allowed) return;

const dueDate = getTaskDueDate(task);
const reminders = [
    {
    date: new Date(dueDate.getTime() - 24 * 60 * 60 * 1000),
    label: 'mañana',
    },
    {
    date: new Date(dueDate.getTime() - 60 * 60 * 1000),
    label: 'en una hora',
    },
].filter((reminder) => reminder.date.getTime() > Date.now());

if (reminders.length === 0) return;

const identifiers = await Promise.all(
    reminders.map((reminder) =>
    Notifications.scheduleNotificationAsync({
        content: {
        title: 'Entrega pendiente',
        body: `"${task.title}" vence ${reminder.label}.`,
        data: { taskId: task.id },
        sound: false,
        },
        trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        ...(Platform.OS === 'android'
            ? { channelId: 'tasks' }
            : {}),
        },
    })
    )
);

const map = await readNotificationMap();
map[task.id] = identifiers;
await writeNotificationMap(map);
}

export async function cancelTaskNotifications(taskId: string) {
if (Platform.OS === 'web') return;

try {
    const map = await readNotificationMap();
    const identifiers = map[taskId] ?? [];

    await Promise.all(
    identifiers.map((identifier) =>
        Notifications.cancelScheduledNotificationAsync(
        identifier
        )
    )
    );

    delete map[taskId];
    await writeNotificationMap(map);
} catch {
    // Las notificaciones no deben impedir guardar o eliminar una tarea.
}
}

export async function rescheduleTaskNotifications(
task: TaskRecord
) {
try {
    await cancelTaskNotifications(task.id);
    await scheduleTaskNotifications(task, true);
} catch {
    // Las notificaciones son una ayuda opcional del dispositivo.
}
}

export async function ensureTaskNotifications(
task: TaskRecord
) {
if (Platform.OS === 'web') return;

try {
    const map = await readNotificationMap();

    if (map[task.id]?.length) return;

    await scheduleTaskNotifications(task, false);
} catch {
    // No bloquear la carga de tareas si el sistema no permite notificaciones.
}
}
