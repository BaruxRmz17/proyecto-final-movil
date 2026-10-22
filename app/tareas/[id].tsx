
import { useCallback, useEffect, useState } from 'react';
import {
ActivityIndicator,
Alert,
Pressable,
ScrollView,
Text,
TextInput,
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
import { getTaskDueDate } from '@/utils/taskDates';

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
    notificationStatuses,
    refreshTasks,
    archiveTask,
    editTask,
    toggleTask,
    removeTask,
} = useTasks();

const { classes, refreshClasses } = useScheduleClasses();

const [busy, setBusy] = useState(false);
const [now, setNow] = useState(() => new Date());
const [editingGrade, setEditingGrade] = useState(false);
const [gradeInput, setGradeInput] = useState('');
const [gradeMaxInput, setGradeMaxInput] = useState('100');

useEffect(() => {
    const timer = setInterval(() => {
    setNow(new Date());
    }, 60_000);

    return () => clearInterval(timer);
}, []);

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

const handleArchive = () => {
    if (!task || busy || !completed) return;

    Alert.alert(
    'Archivar tarea',
    `¿Quieres ocultar "${task.title}" de tu lista?`,
    [
        { text: 'Cancelar', style: 'cancel' },
        {
        text: 'Archivar',
        onPress: async () => {
            setBusy(true);

            try {
            await archiveTask(task.id);
            router.replace('/(tabs)/tareas');
            } catch (error) {
            Alert.alert(
                'Error',
                error instanceof Error
                ? error.message
                : 'No se pudo archivar la tarea.'
            );
            } finally {
            setBusy(false);
            }
        },
        },
    ]
    );
};

const openGradeEditor = () => {
    if (!task) return;

    setGradeInput(
    task.grade === null ? '' : String(task.grade)
    );
    setGradeMaxInput(String(task.grade_max || 100));
    setEditingGrade(true);
};

const handleSaveGrade = async () => {
    if (!task || busy) return;

    const grade = Number(gradeInput.trim().replace(',', '.'));
    const gradeMax = Number(
    gradeMaxInput.trim().replace(',', '.')
    );

    if (
    !Number.isFinite(grade) ||
    !Number.isFinite(gradeMax) ||
    grade < 0 ||
    gradeMax <= 0 ||
    grade > gradeMax
    ) {
    Alert.alert(
        'Calificación inválida',
        'Verifica que la nota esté entre 0 y la calificación máxima.'
    );
    return;
    }

    setBusy(true);

    try {
    await editTask(task.id, {
        grade,
        grade_max: gradeMax,
    });
    setEditingGrade(false);
    Alert.alert('Calificación guardada', 'La nota se actualizó correctamente.');
    } catch (error) {
    Alert.alert(
        'Error',
        error instanceof Error
        ? error.message
        : 'No se pudo guardar la calificación.'
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
const overdue =
    !completed && getTaskDueDate(task).getTime() < now.getTime();

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
            <View
            className="rounded-full px-4 py-2"
            style={{
                backgroundColor: completed
                ? '#D1FAE5'
                : overdue
                    ? '#FEE2E2'
                    : '#EDE6FF',
            }}
            >
            <Text
                className="font-semibold"
                style={{
                color: completed
                    ? '#047857'
                    : overdue
                    ? '#DC2626'
                    : '#7957DC',
                }}
            >
                {completed
                ? 'Completada'
                : overdue
                    ? 'Vencida'
                    : 'Pendiente'}
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

        <View className="mt-3 flex-row items-center">
            <View
            className="mr-2 h-2.5 w-2.5 rounded-full"
            style={{
                backgroundColor: subject?.color ?? '#7957DC',
            }}
            />
            <Text className="text-[14px] text-[#817995]">
            {subject?.subject ?? 'Tarea general'}
            </Text>
        </View>

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

        {task.grade !== null && (
            <View className="mt-5 flex-row items-center">
            <Ionicons
                name="ribbon-outline"
                size={21}
                color="#7957DC"
            />

            <View className="ml-3">
                <Text className="font-bold text-[#292342]">
                Calificación
                </Text>

                <Text className="mt-1 text-[#817995]">
                {task.grade} de {task.grade_max} puntos
                </Text>
            </View>
            </View>
        )}

        <View className="mt-5 rounded-2xl bg-[#FAF9FF] p-4">
            <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
                <Ionicons
                name="ribbon-outline"
                size={21}
                color="#7957DC"
                />
                <Text className="ml-3 font-bold text-[#292342]">
                Calificación
                </Text>
            </View>

            {!editingGrade && (
                <Pressable
                onPress={openGradeEditor}
                disabled={busy}
                className="rounded-xl bg-[#EDE6FF] px-3 py-2"
                >
                <Text className="text-[12px] font-bold text-[#7957DC]">
                    {task.grade === null ? 'Agregar' : 'Editar'}
                </Text>
                </Pressable>
            )}
            </View>

            {editingGrade ? (
            <View className="mt-4">
                <View className="flex-row gap-3">
                <View className="flex-1">
                    <Text className="mb-2 text-[12px] font-semibold text-[#817995]">
                    Obtenida
                    </Text>
                    <TextInput
                    value={gradeInput}
                    onChangeText={setGradeInput}
                    keyboardType="decimal-pad"
                    placeholder="85"
                    placeholderTextColor="#A9A2B9"
                    className="min-h-[48px] rounded-xl border border-[#EAE6F3] bg-white px-3 text-[#292342]"
                    />
                </View>

                <View className="flex-1">
                    <Text className="mb-2 text-[12px] font-semibold text-[#817995]">
                    De
                    </Text>
                    <TextInput
                    value={gradeMaxInput}
                    onChangeText={setGradeMaxInput}
                    keyboardType="decimal-pad"
                    placeholder="100"
                    placeholderTextColor="#A9A2B9"
                    className="min-h-[48px] rounded-xl border border-[#EAE6F3] bg-white px-3 text-[#292342]"
                    />
                </View>
                </View>

                <View className="mt-3 flex-row gap-2">
                <Pressable
                    onPress={() => setEditingGrade(false)}
                    disabled={busy}
                    className="flex-1 items-center rounded-xl bg-[#EDE6FF] px-3 py-3"
                >
                    <Text className="text-[12px] font-bold text-[#7957DC]">
                    Cancelar
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => void handleSaveGrade()}
                    disabled={busy}
                    className="flex-1 items-center rounded-xl bg-[#7957DC] px-3 py-3"
                    style={{ opacity: busy ? 0.6 : 1 }}
                >
                    <Text className="text-[12px] font-bold text-white">
                    {busy ? 'Guardando...' : 'Guardar'}
                    </Text>
                </Pressable>
                </View>
            </View>
            ) : (
            <Text className="mt-2 text-[13px] text-[#817995]">
                {task.grade === null
                ? 'Todavía no has registrado una nota.'
                : `${task.grade} de ${task.grade_max} puntos`}
            </Text>
            )}
        </View>

        {!completed && (
            <View className="mt-5 flex-row items-center">
            <Ionicons
                name={
                notificationStatuses[task.id]
                    ? 'notifications-outline'
                    : 'notifications-off-outline'
                }
                size={21}
                color={
                notificationStatuses[task.id]
                    ? '#7957DC'
                    : '#A9A2B9'
                }
            />

            <View className="ml-3">
                <Text className="font-bold text-[#292342]">
                Recordatorio
                </Text>
                <Text className="mt-1 text-[#817995]">
                {notificationStatuses[task.id]
                    ? 'Activo en este dispositivo'
                    : 'No programado'}
                </Text>
            </View>
            </View>
        )}
        </View>

        <View className="mt-7 flex-row flex-wrap justify-between">
        <DetailActionButton
            icon={completed ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
            label={completed ? 'Pendiente' : 'Completar'}
            onPress={() => void handleToggle()}
            disabled={busy}
            variant="lavender"
        />

        <DetailActionButton
            icon="create-outline"
            label="Editar"
            onPress={() =>
            router.push({
                pathname: '/tareas/editar',
                params: { id: task.id },
            })
            }
            disabled={busy}
            variant="primary"
        />

        {completed && (
            <DetailActionButton
            icon="archive-outline"
            label="Archivar"
            onPress={handleArchive}
            disabled={busy}
            variant="lavender"
            />
        )}

        <DetailActionButton
            icon="trash-outline"
            label="Eliminar"
            onPress={handleDelete}
            disabled={busy}
            variant="danger"
        />
        </View>
    </ScrollView>
    </SafeAreaView>
);
}

interface DetailActionButtonProps {
icon: keyof typeof Ionicons.glyphMap;
label: string;
onPress: () => void;
disabled: boolean;
variant: 'primary' | 'lavender' | 'danger';
}

function DetailActionButton({
icon,
label,
onPress,
disabled,
variant,
}: DetailActionButtonProps) {
const colors = {
    primary: { background: '#7957DC', foreground: '#FFFFFF' },
    lavender: { background: '#EDE6FF', foreground: '#7957DC' },
    danger: { background: '#FDECEC', foreground: '#DC2626' },
};
const current = colors[variant];

return (
    <Pressable
    onPress={onPress}
    disabled={disabled}
    className="mb-3 min-h-[58px] w-[48%] flex-row items-center justify-center rounded-2xl px-2"
    style={{
        backgroundColor: current.background,
        opacity: disabled ? 0.6 : 1,
    }}
    >
    <Ionicons name={icon} size={20} color={current.foreground} />
    <Text
        className="ml-2 text-center text-[13px] font-bold"
        style={{ color: current.foreground }}
    >
        {label}
    </Text>
    </Pressable>
);
}
