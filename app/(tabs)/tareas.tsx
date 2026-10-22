
import {
Fragment,
useCallback,
useEffect,
useState,
} from 'react';
import {
ActivityIndicator,
Alert,
Pressable,
RefreshControl,
ScrollView,
Text,
TextInput,
View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useScheduleClasses } from '@/hooks/useScheduleClasses';
import { useTasks } from '@/hooks/useTasks';
import { getTaskDueDate } from '@/utils/taskDates';

import type {
TaskFilter,
TaskPriority,
TaskRecord,
} from '@/types/tasks';

const PRIORITIES: Record<
TaskPriority,
{ label: string; color: string; background: string }
> = {
high: {
    label: 'Alta',
    color: '#B45309',
    background: '#FEF3C7',
},
medium: {
    label: 'Media',
    color: '#7957DC',
    background: '#EDE6FF',
},
low: {
    label: 'Baja',
    color: '#047857',
    background: '#D1FAE5',
},
};

function formatDate(value: string): string {
const [year, month, day] = value.split('-').map(Number);

return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
}).format(new Date(year, month - 1, day));
}

function daysUntil(task: TaskRecord, now: Date): number {
const due = getTaskDueDate(task);

const current = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
);

return Math.round(
    (Date.UTC(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
    ) - current) /
    86400000
);
}

function isTaskOverdue(
task: TaskRecord,
now: Date
): boolean {
return (
    task.status === 'pending' &&
    getTaskDueDate(task).getTime() < now.getTime()
);
}

function formatDueLabel(task: TaskRecord, now: Date): string {
const days = daysUntil(task, now);
const time = task.due_time
    ? ` · ${task.due_time.slice(0, 5)}`
    : '';

if (isTaskOverdue(task, now)) {
    return `Vencida · ${formatDate(task.due_date)}${time}`;
}

if (days === 0) return `Hoy${time}`;
if (days === 1) return `Mañana${time}`;
if (days === 2) return `En 2 días${time}`;
if (days === 3) return `En 3 días${time}`;

return `Entrega · ${formatDate(task.due_date)}${time}`;
}

export default function TareasScreen() {
const router = useRouter();
const {
    tasks: items,
    loading,
    error,
    notificationStatuses,
    refreshTasks,
    toggleTask,
} = useTasks();

const { classes, refreshClasses } = useScheduleClasses();

const [filter, setFilter] = useState<TaskFilter>('all');
const [search, setSearch] = useState('');
const [showFilters, setShowFilters] = useState(false);
const [subjectFilter, setSubjectFilter] = useState<string | null>(
    null
);
const [priorityFilter, setPriorityFilter] =
    useState<TaskPriority | null>(null);
const [updatingId, setUpdatingId] = useState<string | null>(null);
const [now, setNow] = useState(() => new Date());

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

const pending = items.filter(
    (task) => task.status === 'pending'
).length;

const completed = items.filter(
    (task) => task.status === 'completed'
).length;

const upcoming = items.filter((task) => {
    const days = daysUntil(task, now);

    return (
    task.status === 'pending' &&
    getTaskDueDate(task).getTime() >= now.getTime() &&
    days >= 0 &&
    days <= 3
    );
}).length;

const filteredTasks = items
    .filter(
    (task) => {
        const matchesStatus =
        filter === 'all' || task.status === filter;
        const matchesSubject =
        !subjectFilter || task.class_id === subjectFilter;
        const matchesPriority =
        !priorityFilter || task.priority === priorityFilter;
        const subject = classes.find(
        (item) => item.id === task.class_id
        );
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch =
        !normalizedSearch ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description?.toLowerCase().includes(normalizedSearch) ||
        subject?.subject.toLowerCase().includes(normalizedSearch);

        return (
        matchesStatus &&
        matchesSubject &&
        matchesPriority &&
        matchesSearch
        );
    }
    )
    .sort((a, b) => {
    if (a.status !== b.status) {
        return a.status === 'pending' ? -1 : 1;
    }

    const dateOrder = a.due_date.localeCompare(b.due_date);

    return dateOrder !== 0
        ? dateOrder
        : (a.due_time ?? '').localeCompare(
            b.due_time ?? ''
        );
    });

const handleToggle = async (task: TaskRecord) => {
    if (updatingId) return;

    setUpdatingId(task.id);

    try {
    await toggleTask(task);
    } catch (err) {
    Alert.alert(
        'Error al actualizar',
        err instanceof Error
        ? err.message
        : 'Intenta nuevamente.'
    );
    } finally {
    setUpdatingId(null);
    }
};

return (
    <SafeAreaView
    className="flex-1 bg-[#FAF9FF]"
    edges={['top']}
    >
    <ScrollView
        className="flex-1"
        contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
        <RefreshControl
            refreshing={loading && items.length > 0}
            onRefresh={() => void refreshTasks()}
            tintColor="#7957DC"
            colors={['#7957DC']}
        />
        }
    >
        <View className="mb-7 flex-row items-center justify-between">
        <View className="flex-1">
            <Text className="text-[30px] font-extrabold text-[#292342]">
            Mis tareas
            </Text>

            <Text className="mt-2 text-[14px] text-[#817995]">
            Organiza tus entregas universitarias
            </Text>
        </View>

        <Pressable
            onPress={() => router.push('/tareas/nueva')}
            accessibilityRole="button"
            accessibilityLabel="Crear nueva tarea"
            className="h-14 w-14 items-center justify-center rounded-2xl bg-[#7957DC]"
        >
            <Ionicons name="add" size={29} color="white" />
        </Pressable>
        </View>

        <View className="mb-8 flex-row gap-3">
        <SummaryCard
            count={pending}
            label="Pendientes"
            icon="time-outline"
            color="#7957DC"
        />

        <SummaryCard
            count={upcoming}
            label="Por vencer"
            icon="alert-circle-outline"
            color="#D97706"
        />

        <SummaryCard
            count={completed}
            label="Completadas"
            icon="checkmark-circle-outline"
            color="#059669"
        />
        </View>

        <View className="mb-5 flex-row items-center rounded-2xl bg-white px-4">
        <Ionicons
            name="search-outline"
            size={21}
            color="#817995"
        />

        <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por tarea o materia"
            placeholderTextColor="#A9A2B9"
            returnKeyType="search"
            className="ml-3 min-h-[52px] flex-1 text-[14px] text-[#292342]"
        />

        {search ? (
            <Pressable
            onPress={() => setSearch('')}
            accessibilityLabel="Limpiar búsqueda"
            >
            <Ionicons
                name="close-circle"
                size={20}
                color="#A9A2B9"
            />
            </Pressable>
        ) : null}
        </View>

        <Text className="mb-4 text-[19px] font-bold text-[#292342]">
        Tus actividades
        </Text>

        <View className="mb-6 flex-row flex-wrap gap-2">
        <FilterButton
            label="Todas"
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
        />

        <FilterButton
            label="Pendientes"
            selected={filter === 'pending'}
            onPress={() => setFilter('pending')}
        />

        <FilterButton
            label="Completadas"
            selected={filter === 'completed'}
            onPress={() => setFilter('completed')}
        />

        <Pressable
            onPress={() => setShowFilters((current) => !current)}
            className={`flex-row items-center rounded-full px-4 py-3 ${
            showFilters || subjectFilter || priorityFilter
                ? 'bg-[#EDE6FF]'
                : 'bg-white'
            }`}
        >
            <Ionicons
            name="options-outline"
            size={16}
            color="#7957DC"
            />
            <Text className="ml-2 text-[13px] font-semibold text-[#7957DC]">
            Filtros
            </Text>
        </Pressable>
        </View>

        {showFilters && classes.length > 0 && (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
        >
            <FilterButton
            label="Todas las materias"
            selected={subjectFilter === null}
            onPress={() => setSubjectFilter(null)}
            />

            {classes.map((item) => (
            <FilterButton
                key={item.id}
                label={item.subject}
                selected={subjectFilter === item.id}
                onPress={() => setSubjectFilter(item.id)}
            />
            ))}
        </ScrollView>
        )}

        {showFilters && (
        <View className="mb-6 flex-row flex-wrap gap-2">
        <FilterButton
            label="Todas las prioridades"
            selected={priorityFilter === null}
            onPress={() => setPriorityFilter(null)}
        />

        {(['low', 'medium', 'high'] as TaskPriority[]).map(
        (priority) => (
            <FilterButton
            key={priority}
            label={PRIORITIES[priority].label}
            selected={priorityFilter === priority}
            onPress={() => setPriorityFilter(priority)}
            />
        )
        )}
        </View>
        )}

        {(subjectFilter || priorityFilter || search.trim()) && (
        <Pressable
            onPress={() => {
            setSubjectFilter(null);
            setPriorityFilter(null);
            setSearch('');
            }}
            className="mb-5 flex-row items-center self-start"
        >
            <Ionicons
            name="close-circle-outline"
            size={17}
            color="#7957DC"
            />
            <Text className="ml-2 text-[13px] font-bold text-[#7957DC]">
            Limpiar filtros
            </Text>
        </Pressable>
        )}

        {loading && items.length === 0 ? (
        <View className="items-center py-12">
            <ActivityIndicator
            size="large"
            color="#7957DC"
            />
            <Text className="mt-4 text-[#817995]">
            Cargando tareas...
            </Text>
        </View>
        ) : error && items.length === 0 ? (
        <View className="rounded-2xl bg-red-50 p-5">
            <Text className="text-red-600">{error}</Text>

            <Pressable
            onPress={() => void refreshTasks()}
            className="mt-4 rounded-xl bg-white p-3"
            >
            <Text className="text-center font-bold text-[#7957DC]">
                Reintentar
            </Text>
            </Pressable>
        </View>
        ) : filteredTasks.length === 0 ? (
        <View className="items-center rounded-3xl bg-white px-6 py-12">
            <Ionicons
            name="checkmark-done-outline"
            size={44}
            color="#7957DC"
            />

            <Text className="mt-4 text-[17px] font-bold text-[#292342]">
            No hay tareas aquí
            </Text>

            <Text className="mt-2 text-center text-[13px] text-[#817995]">
            {items.length === 0
                ? 'Crea tu primera tarea para comenzar.'
                : 'Prueba con otra búsqueda o limpia los filtros.'}
            </Text>

            {items.length === 0 && (
            <Pressable
                onPress={() => router.push('/tareas/nueva')}
                className="mt-5 rounded-xl bg-[#7957DC] px-5 py-3"
            >
                <Text className="font-bold text-white">
                Crear tarea
                </Text>
            </Pressable>
            )}
        </View>
        ) : (
        filteredTasks.map((task, index) => {
            const done = task.status === 'completed';
            const overdue = isTaskOverdue(task, now);
            const taskSection = done
            ? 'completed'
            : overdue
                ? 'overdue'
                : daysUntil(task, now) <= 3
                ? 'upcoming'
                : 'later';
            const previousTask = filteredTasks[index - 1];
            const previousSection = previousTask
            ? previousTask.status === 'completed'
                ? 'completed'
                : isTaskOverdue(previousTask, now)
                ? 'overdue'
                : daysUntil(previousTask, now) <= 3
                    ? 'upcoming'
                    : 'later'
            : null;
            const sectionLabel =
            taskSection === 'overdue'
                ? 'Vencidas'
                : taskSection === 'upcoming'
                ? 'Próximas entregas'
                : taskSection === 'later'
                    ? 'Más adelante'
                    : 'Completadas';

            const priority = PRIORITIES[task.priority];

            const subject = classes.find(
            (item) => item.id === task.class_id
            );

            return (
            <Fragment key={task.id}>
            {taskSection !== previousSection && (
                <Text className="mb-3 mt-2 text-[16px] font-bold text-[#292342]">
                {sectionLabel}
                </Text>
            )}

            <Pressable
                onPress={() =>
                router.push({
                    pathname: '/tareas/[id]',
                    params: { id: task.id },
                })
                }
                className="mb-4 overflow-hidden rounded-2xl bg-white"
            >
                <View className="flex-row">
                <View
                    className="w-[5px]"
                    style={{
                    backgroundColor:
                        subject?.color ?? '#7957DC',
                    }}
                />

                <View className="flex-1 p-4">
                    <View className="flex-row items-start">
                    <Pressable
                        onPress={(event) => {
                        event.stopPropagation();
                        void handleToggle(task);
                        }}
                        disabled={updatingId !== null}
                        accessibilityRole="checkbox"
                        accessibilityState={{
                        checked: done,
                        }}
                        className="mr-3 mt-1"
                    >
                        {updatingId === task.id ? (
                        <ActivityIndicator
                            size="small"
                            color="#7957DC"
                        />
                        ) : (
                        <Ionicons
                            name={
                            done
                                ? 'checkmark-circle'
                                : 'ellipse-outline'
                            }
                            size={25}
                            color="#7957DC"
                        />
                        )}
                    </Pressable>

                    <View className="flex-1">
                        <Text
                        className={`text-[16px] font-bold ${
                            done
                            ? 'text-[#A9A2B9] line-through'
                            : 'text-[#292342]'
                        }`}
                        >
                        {task.title}
                        </Text>

                        <Text className="mt-2 text-[13px] text-[#817995]">
                        {subject?.subject ?? 'Tarea general'}
                        </Text>

                        {task.description ? (
                        <Text
                            numberOfLines={2}
                            className="mt-2 text-[12px] text-[#817995]"
                        >
                            {task.description}
                        </Text>
                        ) : null}
                    </View>

                    <View
                        className="rounded-lg px-2 py-1"
                        style={{
                        backgroundColor: priority.background,
                        }}
                    >
                        <Text
                        className="text-[11px] font-semibold"
                        style={{ color: priority.color }}
                        >
                        {priority.label}
                        </Text>
                    </View>
                    </View>

                    <View className="ml-9 mt-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={
                            overdue ? '#DC2626' : '#817995'
                        }
                        />

                        <Text
                        className="ml-2 text-[12px]"
                        style={{
                            color: overdue
                            ? '#DC2626'
                            : '#817995',
                        }}
                        >
                        {formatDueLabel(task, now)}
                        </Text>
                    </View>

                    {task.grade !== null && (
                        <View className="mr-2 flex-row items-center">
                        <Ionicons
                            name="ribbon-outline"
                            size={15}
                            color="#7957DC"
                        />
                        <Text className="ml-1 text-[11px] font-bold text-[#7957DC]">
                            {task.grade}/{task.grade_max}
                        </Text>
                        </View>
                    )}

                    <View className="flex-row items-center">
                        {!done && (
                        <View className="mr-2 flex-row items-center">
                            <Ionicons
                            name={
                                notificationStatuses[task.id]
                                ? 'notifications-outline'
                                : 'notifications-off-outline'
                            }
                            size={14}
                            color={
                                notificationStatuses[task.id]
                                ? '#7957DC'
                                : '#A9A2B9'
                            }
                            />
                            <Text
                            className="ml-1 text-[10px]"
                            style={{
                                color:
                                notificationStatuses[task.id]
                                    ? '#7957DC'
                                    : '#A9A2B9',
                            }}
                            >
                            {notificationStatuses[task.id]
                                ? 'Aviso activo'
                                : 'Sin aviso'}
                            </Text>
                        </View>
                        )}

                        <Ionicons
                        name="chevron-forward"
                        size={17}
                        color="#817995"
                        />
                    </View>
                    </View>
                </View>
                </View>
            </Pressable>
            </Fragment>
            );
        })
        )}

    </ScrollView>
    </SafeAreaView>
);
}

interface SummaryCardProps {
count: number;
label: string;
icon: keyof typeof Ionicons.glyphMap;
color: string;
}

function SummaryCard({
count,
label,
icon,
color,
}: SummaryCardProps) {
return (
    <View className="flex-1 items-center rounded-2xl bg-white px-1 py-4">
    <Ionicons name={icon} size={22} color={color} />

    <Text
        className="mt-2 text-[23px] font-extrabold"
        style={{ color }}
    >
        {count}
    </Text>

    <Text className="mt-1 text-center text-[10px] text-[#817995]">
        {label}
    </Text>
    </View>
);
}

interface FilterButtonProps {
label: string;
selected: boolean;
onPress: () => void;
}

function FilterButton({
label,
selected,
onPress,
}: FilterButtonProps) {
return (
    <Pressable
    onPress={onPress}
    className={`rounded-full px-4 py-3 ${
        selected ? 'bg-[#7957DC]' : 'bg-white'
    }`}
    >
    <Text
        className={`text-[13px] font-semibold ${
        selected ? 'text-white' : 'text-[#817995]'
        }`}
    >
        {label}
    </Text>
    </Pressable>
);
}
