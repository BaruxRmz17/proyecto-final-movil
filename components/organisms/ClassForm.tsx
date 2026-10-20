
import { useState } from 'react';
import {
ActivityIndicator,
Pressable,
ScrollView,
Text,
TextInput,
View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
ColorChip,
CLASS_COLORS,
} from '@/components/atoms/ColorChip';
import { DayChip } from '@/components/atoms/DayChip';
import { WEEK_DAYS, type WeekDay } from '@/types/schedule';
import { DatePickerField } from '@/components/molecules/DatePickerField';

import type {
CreateScheduleClassInput,
ScheduleClassRecord,
} from '@/services/scheduleClassesService';

type DurationMode = 'weeks' | 'dates' | 'open';

interface ClassFormProps {
initialData?: ScheduleClassRecord;
availableDays: WeekDay[];
onSubmit: (data: CreateScheduleClassInput) => Promise<void>;
onCancel: () => void;
saving?: boolean;
}

function formatLocalDate(date: Date): string {
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');

return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string): Date | null {
if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
}

const [year, month, day] = value.split('-').map(Number);
const date = new Date(year, month - 1, day);

if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
) {
    return null;
}

return date;
}

function addWeeks(start: string, weeks: number): string | null {
const date = parseLocalDate(start);

if (!date || !Number.isInteger(weeks) || weeks < 1) {
    return null;
}

// Cuatro semanas incluyen el día de inicio:
// fecha final = inicio + 28 días - 1 día.
date.setDate(date.getDate() + weeks * 7 - 1);

return formatLocalDate(date);
}

export function ClassForm({
initialData,
availableDays,
onSubmit,
onCancel,
saving = false,
}: ClassFormProps) {
const [subject, setSubject] = useState(
    initialData?.subject ?? ''
);
const [teacher, setTeacher] = useState(
    initialData?.teacher ?? ''
);
const [classroom, setClassroom] = useState(
    initialData?.classroom ?? ''
);
const [startTime, setStartTime] = useState(
    initialData?.start_time?.slice(0, 5) ?? '09:00'
);
const [endTime, setEndTime] = useState(
    initialData?.end_time?.slice(0, 5) ?? '10:00'
);
const [selectedDays, setSelectedDays] = useState<WeekDay[]>(
    initialData?.days ?? []
);
const [color, setColor] = useState(
    initialData?.color ?? CLASS_COLORS[0]
);
const [notes, setNotes] = useState(
    initialData?.notes ?? ''
);

const [durationMode, setDurationMode] =
    useState<DurationMode>(
    initialData?.start_date
        ? initialData.end_date
        ? 'dates'
        : 'open'
        : 'weeks'
    );

const [startDate, setStartDate] = useState(
    initialData?.start_date ?? formatLocalDate(new Date())
);
const [endDate, setEndDate] = useState(
    initialData?.end_date ?? ''
);
const [weeks, setWeeks] = useState('4');
const [error, setError] = useState<string | null>(null);

const editing = Boolean(initialData);
const calculatedEndDate = addWeeks(startDate, Number(weeks));

const toggleDay = (day: WeekDay) => {
    setSelectedDays((current) =>
    current.includes(day)
        ? current.filter((id) => id !== day)
        : [...current, day]
    );
};

const handleSubmit = async () => {
    setError(null);

    if (!subject.trim()) {
    setError('Escribe el nombre de la materia.');
    return;
    }

    if (!selectedDays.length) {
    setError('Selecciona al menos un día.');
    return;
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (
    !timePattern.test(startTime) ||
    !timePattern.test(endTime)
    ) {
    setError('Utiliza el formato HH:MM, por ejemplo 09:30.');
    return;
    }

    if (endTime <= startTime) {
    setError(
        'La hora de salida debe ser posterior a la de entrada.'
    );
    return;
    }

    let finalStartDate: string | null = null;
    let finalEndDate: string | null = null;

    if (durationMode !== 'open') {
    if (!parseLocalDate(startDate)) {
        setError(
        'Escribe una fecha de inicio válida: AAAA-MM-DD.'
        );
        return;
    }

    finalStartDate = startDate;

    if (durationMode === 'weeks') {
        const weekCount = Number(weeks);

        if (
        !Number.isInteger(weekCount) ||
        weekCount < 1 ||
        weekCount > 104
        ) {
        setError('Selecciona entre 1 y 104 semanas.');
        return;
        }

        finalEndDate = addWeeks(startDate, weekCount);
    } else {
        if (!parseLocalDate(endDate)) {
        setError(
            'Escribe una fecha de término válida: AAAA-MM-DD.'
        );
        return;
        }

        if (endDate < startDate) {
        setError(
            'La fecha de término debe ser igual o posterior al inicio.'
        );
        return;
        }

        finalEndDate = endDate;
    }
    }

    try {
    await onSubmit({
        subject: subject.trim(),
        teacher: teacher.trim(),
        classroom: classroom.trim(),
        start_time: startTime,
        end_time: endTime,
        days: selectedDays,
        color,
        notes: notes.trim(),
        start_date: finalStartDate,
        end_date: finalEndDate,
    });
    } catch (err) {
    setError(
        err instanceof Error
        ? err.message
        : 'No se pudo guardar la clase.'
    );
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
    <Text className="text-[28px] font-extrabold text-[#292342]">
        {editing ? 'Editar clase' : 'Nueva clase'}
    </Text>

    <Text className="mb-8 mt-2 text-[14px] text-[#817995]">
        {editing
        ? 'Actualiza la información de tu materia.'
        : 'Agrega una materia a tu horario universitario.'}
    </Text>

    <FormField
        label="Nombre de la materia"
        value={subject}
        onChangeText={setSubject}
        placeholder="Ej. Inteligencia Artificial"
        icon="book-outline"
    />

    <FormField
        label="Profesor"
        value={teacher}
        onChangeText={setTeacher}
        placeholder="Ej. Dr. Juan Pérez"
        icon="person-outline"
    />

    <FormField
        label="Aula o laboratorio"
        value={classroom}
        onChangeText={setClassroom}
        placeholder="Ej. Laboratorio 204"
        icon="location-outline"
    />

    <Text className="mb-3 mt-2 text-[15px] font-bold text-[#292342]">
        Horario
    </Text>

    <View className="mb-6 flex-row gap-3">
        <View className="flex-1">
        <FormField
            label="Entrada"
            value={startTime}
            onChangeText={setStartTime}
            placeholder="09:00"
            icon="time-outline"
            compact
        />
        </View>

        <View className="flex-1">
        <FormField
            label="Salida"
            value={endTime}
            onChangeText={setEndTime}
            placeholder="10:00"
            icon="time-outline"
            compact
        />
        </View>
    </View>

    <Text className="mb-2 text-[15px] font-bold text-[#292342]">
        Días de clase
    </Text>

    <Text className="mb-4 text-[13px] text-[#817995]">
        Selecciona los días en los que cursas esta materia.
    </Text>

    <View className="mb-7 flex-row flex-wrap gap-2 rounded-2xl bg-[#EDE6FF] p-3">
        {WEEK_DAYS.filter((day) =>
        availableDays.includes(day.id)
        ).map((day) => (
        <DayChip
            key={day.id}
            label={day.short}
            selected={selectedDays.includes(day.id)}
            onPress={() => toggleDay(day.id)}
        />
        ))}
    </View>

    {/* Duración de la materia */}
    <View className="mb-7 rounded-3xl bg-white p-5">
        <View className="mb-2 flex-row items-center">
        <Ionicons
            name="calendar-outline"
            size={22}
            color="#7957DC"
        />

        <Text className="ml-3 text-[17px] font-bold text-[#292342]">
            Duración de la materia
        </Text>
        </View>

        <Text className="mb-5 text-[13px] leading-5 text-[#817995]">
        Define durante qué periodo aparecerá esta clase
        en tu calendario.
        </Text>

        <View className="mb-5 gap-2">
        <DurationOption
            label="Por semanas"
            description="Ideal para materias de 4 u 8 semanas."
            selected={durationMode === 'weeks'}
            onPress={() => setDurationMode('weeks')}
        />

        <DurationOption
            label="Fechas personalizadas"
            description="Elige exactamente cuándo inicia y termina."
            selected={durationMode === 'dates'}
            onPress={() => setDurationMode('dates')}
        />

        <DurationOption
            label="Sin fecha de término"
            description="La materia se repetirá sin un límite definido."
            selected={durationMode === 'open'}
            onPress={() => setDurationMode('open')}
        />
        </View>

        {durationMode !== 'open' && (
            <DatePickerField
                label="Fecha de inicio"
                value={startDate}
                onChange={(date) => {
                setStartDate(date);

                if (endDate && endDate < date) {
                    setEndDate(date);
                }
                }}
            />
            )}

        {durationMode === 'weeks' && (
        <>
            <Text className="mb-3 text-[14px] font-semibold text-[#292342]">
            Número de semanas
            </Text>

            <View className="mb-4 flex-row flex-wrap gap-2">
            {['4', '6', '8', '12'].map((option) => (
                <Pressable
                key={option}
                onPress={() => setWeeks(option)}
                className={`rounded-xl px-4 py-3 ${
                    weeks === option
                    ? 'bg-[#7957DC]'
                    : 'bg-[#EDE6FF]'
                }`}
                >
                <Text
                    className={`font-bold ${
                    weeks === option
                        ? 'text-white'
                        : 'text-[#7957DC]'
                    }`}
                >
                    {option}
                </Text>
                </Pressable>
            ))}
            </View>

            <FormField
            label="Semanas (puedes escribir otra cantidad)"
            value={weeks}
            onChangeText={setWeeks}
            placeholder="4"
            icon="calendar-number-outline"
            />

            <View className="rounded-2xl bg-[#EDE6FF] p-4">
            <Text className="text-[13px] text-[#7957DC]">
                {calculatedEndDate
                ? `La materia terminará el ${calculatedEndDate}.`
                : 'Ingresa una fecha y una duración válidas.'}
            </Text>
            </View>
        </>
        )}

        {durationMode === 'dates' && (
            <DatePickerField
                label="Fecha de término"
                value={endDate}
                minimumDate={startDate}
                onChange={setEndDate}
            />
            )}

        {durationMode === 'open' && (
        <View className="rounded-2xl bg-[#EDE6FF] p-4">
            <Text className="text-[13px] leading-5 text-[#7957DC]">
            Esta materia aparecerá todas las semanas,
            hasta que le asignes un periodo.
            </Text>
        </View>
        )}
    </View>

    <Text className="mb-2 text-[15px] font-bold text-[#292342]">
        Color de la materia
    </Text>

    <Text className="mb-4 text-[13px] text-[#817995]">
        Identifica fácilmente tus materias en el horario.
    </Text>

    <View className="mb-7 flex-row flex-wrap gap-2">
        {CLASS_COLORS.map((item) => (
        <ColorChip
            key={item}
            color={item}
            selected={color === item}
            onPress={() => setColor(item)}
        />
        ))}
    </View>

    <Text className="mb-3 text-[15px] font-bold text-[#292342]">
        Notas adicionales (opcional)
    </Text>

    <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Ej. Llevar laptop a clase"
        placeholderTextColor="#A9A2B9"
        multiline
        textAlignVertical="top"
        className="mb-7 min-h-[110px] rounded-2xl border border-[#EAE6F3] bg-white p-4 text-[15px] text-[#292342]"
    />

    {error && (
        <View className="mb-5 flex-row items-start rounded-xl bg-red-50 p-4">
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

    <Pressable
        onPress={() => {
        void handleSubmit();
        }}
        disabled={saving}
        className="min-h-[56px] flex-row items-center justify-center rounded-2xl bg-[#7957DC]"
        style={{ opacity: saving ? 0.6 : 1 }}
    >
        {saving ? (
        <ActivityIndicator color="#FFFFFF" />
        ) : (
        <>
            <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color="#FFFFFF"
            />

            <Text className="ml-2 text-[16px] font-bold text-white">
            {editing ? 'Guardar cambios' : 'Crear clase'}
            </Text>
        </>
        )}
    </Pressable>

    <Pressable
        onPress={onCancel}
        disabled={saving}
        className="mt-4 min-h-[52px] items-center justify-center rounded-2xl bg-[#EDE6FF]"
    >
        <Text className="text-[15px] font-bold text-[#7957DC]">
        Cancelar
        </Text>
    </Pressable>
    </ScrollView>
);
}

interface DurationOptionProps {
label: string;
description: string;
selected: boolean;
onPress: () => void;
}

function DurationOption({
label,
description,
selected,
onPress,
}: DurationOptionProps) {
return (
    <Pressable
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ checked: selected }}
    className={`flex-row items-center rounded-2xl border p-4 ${
        selected
        ? 'border-[#7957DC] bg-[#F4F0FF]'
        : 'border-[#EAE6F3] bg-white'
    }`}
    >
    <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={23}
        color={selected ? '#7957DC' : '#817995'}
    />

    <View className="ml-3 flex-1">
        <Text className="text-[14px] font-bold text-[#292342]">
        {label}
        </Text>

        <Text className="mt-1 text-[12px] text-[#817995]">
        {description}
        </Text>
    </View>
    </Pressable>
);
}

interface FormFieldProps {
label: string;
value: string;
onChangeText: (value: string) => void;
placeholder: string;
icon: keyof typeof Ionicons.glyphMap;
compact?: boolean;
}

function FormField({
label,
value,
onChangeText,
placeholder,
icon,
compact = false,
}: FormFieldProps) {
return (
    <View className={compact ? 'mb-0' : 'mb-5'}>
    <Text className="mb-2 text-[14px] font-semibold text-[#292342]">
        {label}
    </Text>

    <View className="min-h-[54px] flex-row items-center rounded-2xl border border-[#EAE6F3] bg-white px-4">
        <Ionicons
        name={icon}
        size={19}
        color="#817995"
        />

        <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A9A2B9"
        autoCapitalize="none"
        className="ml-3 flex-1 text-[14px] text-[#292342]"
        />
    </View>
    </View>
);
}
