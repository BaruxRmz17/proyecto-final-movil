
import { useCallback, useState } from 'react';
import {
ActivityIndicator,
Alert,
Pressable,
ScrollView,
Text,
View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
useFocusEffect,
useLocalSearchParams,
useRouter,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useScheduleClasses } from '@/hooks/useScheduleClasses';
import { useTasks } from '@/hooks/useTasks';

function formatDate(value: string): string {
const [year, month, day] = value.split('-').map(Number);

return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(new Date(year, month - 1, day));
}

export default function TaskDetailScreen() {
const { id } = useLocalSearchParams<{ id: string }>();
const router = useRouter();
const {
    tasks,
    loading,
    refreshTasks,
    toggleTask,
    removeTask,
} = useTasks();

const { classes, refreshClasses } = useScheduleClasses();

const [busy, setBusy] = useState(false);

useFocusEffect(
    useCallback(() => {
    void refreshTasks();
    void refreshClasses();
    }, [refreshTasks, refreshClasses])
);

const task = tasks.find((item) => item.id === id);

const subject = classes.find(
    (item) => item.id === task?.class_id
);

const handleDelete = () => {
    if (!task || busy) return;

    Alert.alert(
    'Eliminar tarea',
    `¿Seguro que quieres eliminar "${task.title}"?`,
    [
        { text: 'Cancelar', style: 'cancel' },
        {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
            setBusy(true);

            try {
            await removeTask(task.id);

            router.replace('/(tabs)/tareas');
            } catch (error) {
            Alert.alert(
                'Error',
                error instanceof Error
                ? error.message
                : 'No se pudo eliminar la tarea.'
            );
            } finally {
            setBusy(false);
            }
        },
        },
    ]
    );
};

const handleToggle = async () => {
    if (!task || busy) return;

    setBusy(true);

    try {
    await toggleTask(task);
    } catch (error) {
    Alert.alert(
        'Error',
        error instanceof Error
        ? error.message
        : 'No se pudo actualizar la tarea.'
    );
    } finally {
    setBusy(false);
    }
};

if (loading && !task) {
    return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF9FF]">
        <ActivityIndicator size="large" color="#7957DC" />
    </SafeAreaView>
    );
}

if (!task) {
    return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF9FF] px-6">
        <Text className="text-[17px] font-bold text-[#292342]">
        No encontramos esta tarea.
        </Text>

        <Pressable
        onPress={() => router.replace('/(tabs)/tareas')}
        className="mt-5 rounded-2xl bg-[#7957DC] px-6 py-4"
        >
        <Text className="font-bold text-white">
            Volver a tareas
        </Text>
        </Pressable>
    </SafeAreaView>
    );
}

const completed = task.status === 'completed';

const priorityLabel =
    task.priority === 'high'
    ? 'Alta'
    : task.priority === 'medium'
        ? 'Media'
        : 'Baja';

return (
    <SafeAreaView
    className="flex-1 bg-[#FAF9FF]"
    edges={['top', 'bottom']}
    >
    <ScrollView
        contentContainerStyle={{
        padding: 24,
        paddingBottom: 50,
        }}
    >
        <Pressable
        onPress={() => router.back()}
        className="mb-7 flex-row items-center"
        >
        <Ionicons
            name="arrow-back"
            size={24}
            color="#292342"
        />
        <Text className="ml-3 font-semibold text-[#292342]">
            Volver
        </Text>
        </Pressable>

        <Text className="text-[28px] font-extrabold text-[#292342]">
        Detalle de tarea
        </Text>

        <Text className="mb-7 mt-2 text-[#817995]">
        Consulta y administra tu actividad.
        </Text>

        <View className="rounded-3xl bg-white p-6">
        <View className="mb-5 flex-row items-center justify-between">
            <View className="rounded-full bg-[#EDE6FF] px-4 py-2">
            <Text className="font-semibold text-[#7957DC]">
                {completed ? 'Completada' : 'Pendiente'}
            </Text>
            </View>

            <View className="rounded-full bg-[#FAF1DC] px-4 py-2">
            <Text className="font-semibold text-[#A66C14]">
                Prioridad {priorityLabel}
            </Text>
            </View>
        </View>

        <Text className="text-[23px] font-extrabold text-[#292342]">
            {task.title}
        </Text>

        <Text className="mt-3 text-[14px] text-[#817995]">
            {subject?.subject ?? 'Tarea general'}
        </Text>

        <View className="my-6 h-px bg-[#EEEAF5]" />

        <Text className="mb-2 font-bold text-[#292342]">
            Descripción
        </Text>

        <Text className="text-[14px] leading-6 text-[#817995]">
            {task.description?.trim() ||
            'Esta tarea no tiene descripción.'}
        </Text>

        <View className="my-6 h-px bg-[#EEEAF5]" />

        <View className="flex-row items-center">
            <Ionicons
            name="calendar-outline"
            size={21}
            color="#7957DC"
            />

            <View className="ml-3">
            <Text className="font-bold text-[#292342]">
                Fecha de entrega
            </Text>

            <Text className="mt-1 text-[#817995]">
                {formatDate(task.due_date)}
            </Text>
            </View>
        </View>

        {task.due_time && (
            <View className="mt-5 flex-row items-center">
            <Ionicons
                name="time-outline"
                size={21}
                color="#7957DC"
            />

            <View className="ml-3">
                <Text className="font-bold text-[#292342]">
                Hora de entrega
                </Text>

                <Text className="mt-1 text-[#817995]">
                {task.due_time.slice(0, 5)}
                </Text>
            </View>
            </View>
        )}
        </View>

        <Pressable
        onPress={() => void handleToggle()}
        disabled={busy}
        className="mt-7 min-h-[55px] flex-row items-center justify-center rounded-2xl bg-[#EDE6FF]"
        >
        <Ionicons
            name={
            completed
                ? 'arrow-undo-outline'
                : 'checkmark-circle-outline'
            }
            size={22}
            color="#7957DC"
        />

        <Text className="ml-2 font-bold text-[#7957DC]">
            {completed
            ? 'Marcar como pendiente'
            : 'Marcar como completada'}
        </Text>
        </Pressable>

        <Pressable
        onPress={() =>
            router.push({
            pathname: '/tareas/editar',
            params: { id: task.id },
            })
        }
        disabled={busy}
        className="mt-3 min-h-[55px] flex-row items-center justify-center rounded-2xl bg-[#7957DC]"
        >
        <Ionicons
            name="create-outline"
            size={22}
            color="#FFFFFF"
        />

        <Text className="ml-2 font-bold text-white">
            Editar tarea
        </Text>
        </Pressable>

        <Pressable
        onPress={handleDelete}
        disabled={busy}
        className="mt-3 min-h-[55px] flex-row items-center justify-center rounded-2xl bg-red-50"
        >
        <Ionicons
            name="trash-outline"
            size={22}
            color="#DC2626"
        />

        <Text className="ml-2 font-bold text-red-600">
            Eliminar tarea
        </Text>
        </Pressable>
    </ScrollView>
    </SafeAreaView>
);
}
