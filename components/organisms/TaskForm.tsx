
import { useState } from 'react';

import {
ActivityIndicator,
Platform,
Pressable,
ScrollView,
Text,
TextInput,
View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import type { ScheduleClassRecord } from '@/services/scheduleClassesService';

import type {
CreateTaskInput,
TaskPriority,
TaskRecord,
} from '@/types/tasks';

interface TaskFormProps {
classes: ScheduleClassRecord[];
saving: boolean;
initialData?: TaskRecord;
onSubmit: (input: CreateTaskInput) => Promise<void>;
onCancel: () => void;
}

const PRIORITIES: {
value: TaskPriority;
label: string;
}[] = [
{ value: 'low', label: 'Baja' },
{ value: 'medium', label: 'Media' },
{ value: 'high', label: 'Alta' },
];

function toDateString(date: Date): string {
return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
].join('-');
}

function fromDateString(value: string): Date {
const [year, month, day] = value.split('-').map(Number);

return new Date(year, month - 1, day, 12);
}

function toTimeString(date: Date): string {
return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
].join(':');
}

function fromTimeString(value: string): Date {
const [hours, minutes] = value.split(':').map(Number);
const date = new Date();

date.setHours(
    Number.isFinite(hours) ? hours : 12,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0
);

return date;
}

export function TaskForm({
classes,
saving,
initialData,
onSubmit,
onCancel,
}: TaskFormProps) {
const editing = Boolean(initialData);

const [title, setTitle] = useState(
    initialData?.title ?? ''
);

const [description, setDescription] = useState(
    initialData?.description ?? ''
);

const [classId, setClassId] = useState<string | null>(
    initialData?.class_id ?? null
);

const [dueDate, setDueDate] = useState(
    initialData?.due_date ?? toDateString(new Date())
);

const [dueTime, setDueTime] = useState(
    initialData?.due_time?.slice(0, 5) ?? ''
);

const [priority, setPriority] = useState<TaskPriority>(
    initialData?.priority ?? 'medium'
);

const [showDatePicker, setShowDatePicker] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);
const [error, setError] = useState<string | null>(null);
const [submitting, setSubmitting] = useState(false);

const isBusy = saving || submitting;
const noClasses = classes.length === 0;

const handleSubmit = async () => {
    if (isBusy) return;

    setError(null);

    // Validar nombre de tarea
    if (!title.trim()) {
    setError('Escribe el nombre de la tarea.');
    return;
    }

    // La materia es obligatoria
    if (!classId) {
    setError('Debes seleccionar una materia para esta tarea.');
    return;
    }

    // Verificar que la materia exista en el horario
    const selectedClass = classes.find(
    (item) => item.id === classId
    );

    if (!selectedClass) {
    setError(
        'La materia seleccionada ya no está disponible en tu horario.'
    );
    return;
    }

    // Validar hora opcional
    const time = dueTime.trim();

    if (
    time &&
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    ) {
    setError('La hora debe tener el formato HH:MM.');
    return;
    }

    setSubmitting(true);

    try {
    await onSubmit({
        title: title.trim(),
        description: description.trim(),
        class_id: selectedClass.id,
        due_date: dueDate,
        due_time: time || null,
        priority,
    });
    } catch (err) {
    setError(
        err instanceof Error
        ? err.message
        : 'No se pudo guardar la tarea.'
    );
    } finally {
    setSubmitting(false);
    }
};

return (
    <ScrollView
    className="flex-1 bg-[#FAF9FF]"
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 45,
    }}
    >
    {/* Encabezado */}
    <Text className="text-[28px] font-extrabold text-[#292342]">
        {editing ? 'Editar tarea' : 'Nueva tarea'}
    </Text>

    <Text className="mb-8 mt-2 text-[14px] text-[#817995]">
        {editing
        ? 'Actualiza los detalles de tu actividad.'
        : 'Organiza tus pendientes y fechas de entrega.'}
    </Text>

    {/* Nombre */}
    <Text className="mb-2 font-semibold text-[#292342]">
        Nombre de la tarea
    </Text>

    <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Ej. Entregar proyecto final"
        placeholderTextColor="#A9A2B9"
        maxLength={150}
        className="mb-6 min-h-[54px] rounded-2xl bg-white px-4 text-[15px] text-[#292342]"
    />

    {/* Descripción */}
    <Text className="mb-2 font-semibold text-[#292342]">
        Descripción
    </Text>

    <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="¿Qué necesitas realizar?"
        placeholderTextColor="#A9A2B9"
        multiline
        textAlignVertical="top"
        className="mb-7 min-h-[110px] rounded-2xl bg-white p-4 text-[15px] text-[#292342]"
    />

    {/* Materias registradas */}
    <View className="mb-7">
        <View className="mb-2 flex-row items-center">
        <Ionicons
            name="book-outline"
            size={22}
            color="#7957DC"
        />

        <Text className="ml-2 text-[17px] font-bold text-[#292342]">
            Materia
        </Text>

        <Text className="ml-1 text-red-500">*</Text>
        </View>

        <Text className="mb-4 text-[13px] leading-5 text-[#817995]">
        Selecciona una materia que hayas registrado en
        tu horario.
        </Text>

        {noClasses ? (
        <View className="items-center rounded-2xl border border-[#EAE6F3] bg-white p-6">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE6FF]">
            <Ionicons
                name="school-outline"
                size={32}
                color="#7957DC"
            />
            </View>

            <Text className="mt-4 text-center text-[16px] font-bold text-[#292342]">
            No tienes materias registradas
            </Text>

            <Text className="mt-2 text-center text-[13px] leading-5 text-[#817995]">
            Primero agrega tus materias en Horario.
            Después podrás crear tareas relacionadas
            con ellas.
            </Text>
        </View>
        ) : (
        <View className="gap-3">
            {classes.map((item) => {
            const selected = classId === item.id;

            return (
                <Pressable
                key={item.id}
                onPress={() => {
                    setClassId(item.id);
                    setError(null);
                }}
                disabled={isBusy}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`Materia ${item.subject}`}
                className={`flex-row items-center rounded-2xl border p-4 ${
                    selected
                    ? 'border-[#7957DC] bg-[#EDE6FF]'
                    : 'border-[#EAE6F3] bg-white'
                }`}
                >
                {/* Color de materia */}
                <View
                    className="mr-3 h-11 w-2 rounded-full"
                    style={{
                    backgroundColor:
                        item.color || '#7957DC',
                    }}
                />

                {/* Información de materia */}
                <View className="flex-1">
                    <Text className="text-[15px] font-bold text-[#292342]">
                    {item.subject}
                    </Text>

                    {item.teacher ? (
                    <Text className="mt-1 text-[12px] text-[#817995]">
                        {item.teacher}
                    </Text>
                    ) : null}

                    {item.classroom ? (
                    <Text className="mt-1 text-[12px] text-[#817995]">
                        Aula: {item.classroom}
                    </Text>
                    ) : null}
                </View>

                {/* Indicador de selección */}
                <Ionicons
                    name={
                    selected
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={23}
                    color={
                    selected ? '#7957DC' : '#B9B2C9'
                    }
                />
                </Pressable>
            );
            })}
        </View>
        )}
    </View>

    {/* Fecha y hora */}
    <View className="mb-6 rounded-3xl bg-white p-5">
        <View className="mb-4 flex-row items-center">
        <Ionicons
            name="calendar-outline"
            size={22}
            color="#7957DC"
        />

        <Text className="ml-3 text-[17px] font-bold text-[#292342]">
            Fecha de entrega
        </Text>
        </View>

        <Pressable
        onPress={() => setShowDatePicker(true)}
        disabled={isBusy}
        className="min-h-[54px] flex-row items-center justify-between rounded-2xl border border-[#EAE6F3] bg-[#FAF9FF] px-4"
        >
        <Text className="text-[#292342]">
            {new Intl.DateTimeFormat('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            }).format(fromDateString(dueDate))}
        </Text>

        <Ionicons
            name="calendar-outline"
            size={20}
            color="#7957DC"
        />
        </Pressable>

        {showDatePicker && (
        <View>
            <DateTimePicker
            value={fromDateString(dueDate)}
            mode="date"
            display={
                Platform.OS === 'ios'
                ? 'inline'
                : 'calendar'
            }
            locale="es-MX"
            themeVariant="light"
            accentColor="#7957DC"
            textColor="#292342"
            onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                setShowDatePicker(false);
                }

                if (
                event.type === 'set' &&
                selectedDate
                ) {
                setDueDate(
                    toDateString(selectedDate)
                );
                }
            }}
            />

            {Platform.OS === 'ios' && (
            <Pressable
                onPress={() => setShowDatePicker(false)}
                className="mt-2 self-end rounded-xl bg-[#EDE6FF] px-4 py-2"
            >
                <Text className="font-semibold text-[#7957DC]">
                Listo
                </Text>
            </Pressable>
            )}
        </View>
        )}

        <Text className="mb-2 mt-5 font-semibold text-[#292342]">
        Hora de entrega (opcional)
        </Text>

        <Pressable
        onPress={() => setShowTimePicker(true)}
        disabled={isBusy}
        className="min-h-[54px] flex-row items-center justify-between rounded-2xl border border-[#EAE6F3] bg-[#FAF9FF] px-4"
        >
        <Text
            className={
            dueTime
                ? 'text-[#292342]'
                : 'text-[#A9A2B9]'
            }
        >
            {dueTime || 'Seleccionar hora (opcional)'}
        </Text>

        <Ionicons
            name="time-outline"
            size={20}
            color="#7957DC"
        />
        </Pressable>

        {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
            value={fromTimeString(dueTime)}
            mode="time"
            display="clock"
            is24Hour
            onChange={(event, selectedTime) => {
            setShowTimePicker(false);

            if (
                event.type === 'set' &&
                selectedTime
            ) {
                setDueTime(toTimeString(selectedTime));
            }
            }}
        />
        )}

        {Platform.OS === 'ios' && showTimePicker && (
        <View>
            <DateTimePicker
            value={fromTimeString(dueTime)}
            mode="time"
            display="spinner"
            is24Hour
            themeVariant="light"
            accentColor="#7957DC"
            textColor="#292342"
            onChange={(_, selectedTime) => {
                if (selectedTime) {
                setDueTime(toTimeString(selectedTime));
                }
            }}
            />

            <Pressable
            onPress={() => setShowTimePicker(false)}
            className="mt-2 self-end rounded-xl bg-[#EDE6FF] px-4 py-2"
            >
            <Text className="font-semibold text-[#7957DC]">
                Listo
            </Text>
            </Pressable>
        </View>
        )}
    </View>

    {/* Prioridad */}
    <Text className="mb-4 text-[16px] font-bold text-[#292342]">
        Prioridad
    </Text>

    <View className="mb-8 flex-row gap-3">
        {PRIORITIES.map((item) => {
        const selected = priority === item.value;

        return (
            <Pressable
            key={item.value}
            onPress={() => setPriority(item.value)}
            disabled={isBusy}
            className={`flex-1 items-center rounded-2xl py-4 ${
                selected
                ? 'bg-[#7957DC]'
                : 'bg-white'
            }`}
            >
            <Text
                className={`font-bold ${
                selected
                    ? 'text-white'
                    : 'text-[#817995]'
                }`}
            >
                {item.label}
            </Text>
            </Pressable>
        );
        })}
    </View>

    {/* Errores */}
    {error && (
        <View className="mb-5 flex-row items-start rounded-2xl bg-red-50 p-4">
        <Ionicons
            name="alert-circle-outline"
            size={19}
            color="#DC2626"
        />

        <Text className="ml-2 flex-1 text-[13px] text-red-600">
            {error}
        </Text>
        </View>
    )}

    {/* Guardar */}
    <Pressable
        onPress={() => void handleSubmit()}
        disabled={isBusy || noClasses}
        className="min-h-[56px] flex-row items-center justify-center rounded-2xl bg-[#7957DC]"
        style={{
        opacity: isBusy || noClasses ? 0.5 : 1,
        }}
    >
        {isBusy ? (
        <ActivityIndicator color="#FFFFFF" />
        ) : (
        <>
            <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color="#FFFFFF"
            />

            <Text className="ml-2 text-[16px] font-bold text-white">
            {editing
                ? 'Guardar cambios'
                : 'Crear tarea'}
            </Text>
        </>
        )}
    </Pressable>

    {/* Cancelar */}
    <Pressable
        onPress={onCancel}
        disabled={isBusy}
        className="mt-4 min-h-[52px] items-center justify-center rounded-2xl bg-[#EDE6FF]"
    >
        <Text className="font-bold text-[#7957DC]">
        Cancelar
        </Text>
    </Pressable>
    </ScrollView>
);
}
