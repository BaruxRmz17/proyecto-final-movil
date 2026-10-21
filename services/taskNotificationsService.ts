import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { TaskRecord } from '@/types/tasks';
import { getTaskDueDate } from '@/utils/taskDates';

const STORAGE_KEY = '@campus-mind/task-notifications-v2';
const LEGACY_STORAGE_KEY = '@campus-mind/task-notification-ids';
const NOTIFICATION_SOURCE = 'campus-mind-task';

interface StoredNotificationRecord {
identifiers: string[];
fingerprint: string;
}

type NotificationState = Record<
string,
Record<string, StoredNotificationRecord>
>;

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

async function readNotificationState(): Promise<NotificationState> {
const value = await AsyncStorage.getItem(STORAGE_KEY);

if (!value) return {};

try {
    return JSON.parse(value) as NotificationState;
} catch {
    return {};
}
}

async function writeNotificationState(state: NotificationState) {
await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function cancelIdentifiers(identifiers: string[]) {
await Promise.all(
    identifiers.map((identifier) =>
    Notifications.cancelScheduledNotificationAsync(
        identifier
    )
    )
);
}

async function getManagedNotifications(
taskId?: string
) {
const scheduled =
    await Notifications.getAllScheduledNotificationsAsync();

return scheduled.filter((notification) => {
    const data = notification.content.data as {
        source?: string;
        taskId?: string;
    };

    return (
        data?.source === NOTIFICATION_SOURCE &&
        (!taskId || data.taskId === taskId)
    );
});
}

async function cancelManagedNotifications(
taskId?: string
) {
const notifications = await getManagedNotifications(taskId);
const identifiers = notifications.map(
    (notification) => notification.identifier
);

await cancelIdentifiers(identifiers);
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

function getTaskFingerprint(task: TaskRecord): string {
return [
    task.id,
    task.user_id,
    task.title,
    task.due_date,
    task.due_time ?? '',
    task.status,
].join('|');
}

async function createTaskNotifications(
task: TaskRecord,
requestPermission: boolean
): Promise<StoredNotificationRecord | null> {
if (
    Platform.OS === 'web' ||
    task.status === 'completed'
) {
    return null;
}

configureNotificationHandler();

if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tasks', {
    name: 'Tareas',
    importance: Notifications.AndroidImportance.DEFAULT,
    });
}

const allowed = await hasNotificationPermission(requestPermission);

if (!allowed) return null;

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

if (reminders.length === 0) return null;

const identifiers = await Promise.all(
    reminders.map((reminder) =>
    Notifications.scheduleNotificationAsync({
        content: {
        title: 'Entrega pendiente',
        body: `"${task.title}" vence ${reminder.label}.`,
        data: {
            source: NOTIFICATION_SOURCE,
            taskId: task.id,
            userId: task.user_id,
        },
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

return {
    identifiers,
    fingerprint: getTaskFingerprint(task),
};
}

async function saveTaskRecord(
task: TaskRecord,
record: StoredNotificationRecord | null
) {
const state = await readNotificationState();
const userState = state[task.user_id] ?? {};

if (record) {
    userState[task.id] = record;
} else {
    delete userState[task.id];
}

if (Object.keys(userState).length > 0) {
    state[task.user_id] = userState;
} else {
    delete state[task.user_id];
}

await writeNotificationState(state);
}

export async function reconcileTaskNotifications(
userId: string,
tasks: TaskRecord[]
) {
if (Platform.OS === 'web') return;

try {
    const previousState = await readNotificationState();
    const legacyValue = await AsyncStorage.getItem(
    LEGACY_STORAGE_KEY
    );

    if (legacyValue) {
    try {
        const legacyMap = JSON.parse(
        legacyValue
        ) as Record<string, string[]>;

        await cancelIdentifiers(
        Object.values(legacyMap).flat()
        );
    } catch {
        // Ignorar datos antiguos corruptos.
    }

    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    const scheduled = await getManagedNotifications();
    const scheduledIds = new Set(
    scheduled.map((notification) => notification.identifier)
    );
    const retainedIds = new Set<string>();

    const nextUserState: Record<
    string,
    StoredNotificationRecord
    > = {};

    for (const task of tasks) {
    if (
        task.user_id !== userId ||
        task.status === 'completed'
    ) {
        continue;
    }

    const previousRecord =
        previousState[userId]?.[task.id];

    if (
        previousRecord &&
        previousRecord.fingerprint ===
        getTaskFingerprint(task) &&
        previousRecord.identifiers.every((identifier) =>
        scheduledIds.has(identifier)
        )
    ) {
        nextUserState[task.id] = previousRecord;
        previousRecord.identifiers.forEach((identifier) =>
        retainedIds.add(identifier)
        );
        continue;
    }

    if (previousRecord) {
        await cancelIdentifiers(previousRecord.identifiers);
    }

    const record = await createTaskNotifications(task, false);

    if (record) {
        nextUserState[task.id] = record;
        record.identifiers.forEach((identifier) =>
        retainedIds.add(identifier)
        );
    }
    }

    const orphanedIds = scheduled
    .map((notification) => notification.identifier)
    .filter((identifier) => !retainedIds.has(identifier));

    await cancelIdentifiers(orphanedIds);

    await writeNotificationState({
    [userId]: nextUserState,
    });
} catch {
    // La reconciliación no debe impedir cargar las tareas.
}
}

export async function cancelTaskNotifications(taskId: string) {
if (Platform.OS === 'web') return;

try {
    const state = await readNotificationState();

    for (const userState of Object.values(state)) {
    const record = userState[taskId];

    if (record) {
        await cancelIdentifiers(record.identifiers);
        delete userState[taskId];
    }
    }

    await cancelManagedNotifications(taskId);
    await writeNotificationState(state);
} catch {
    // Las notificaciones no deben impedir guardar o eliminar una tarea.
}
}

export async function clearAllTaskNotifications() {
if (Platform.OS === 'web') return;

try {
    const state = await readNotificationState();
    const legacyValue = await AsyncStorage.getItem(
    LEGACY_STORAGE_KEY
    );
    const identifiers = Object.values(state)
    .flatMap((userState) =>
        Object.values(userState).flatMap(
        (record) => record.identifiers
        )
    );

    await cancelIdentifiers(identifiers);

    if (legacyValue) {
    try {
        const legacyMap = JSON.parse(
        legacyValue
        ) as Record<string, string[]>;

        await cancelIdentifiers(
        Object.values(legacyMap).flat()
        );
    } catch {
        // Ignorar datos antiguos corruptos.
    }
    }

    await cancelManagedNotifications();
    await AsyncStorage.multiRemove([
    STORAGE_KEY,
    LEGACY_STORAGE_KEY,
    ]);
} catch {
    // No bloquear el cierre de sesión si las notificaciones fallan.
}
}

export async function rescheduleTaskNotifications(
task: TaskRecord
) {
if (Platform.OS === 'web') return;

try {
    await cancelTaskNotifications(task.id);
    const record = await createTaskNotifications(task, true);
    await saveTaskRecord(task, record);
} catch {
    // Las notificaciones son una ayuda opcional del dispositivo.
}
}
