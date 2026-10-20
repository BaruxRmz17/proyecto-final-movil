
import { useCallback, useState } from 'react';

import {
ActivityIndicator,
Pressable,
ScrollView,
Text,
View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionTitle } from '@/components/atoms/SectionTitle';
import { ScheduleSetupForm } from '@/components/organisms/ScheduleSetupForm';
import { ScheduleDaySelector } from '@/components/organisms/ScheduleDaySelector';
import { ScheduleClassList } from '@/components/organisms/ScheduleClassList';

import { useSchedule } from '@/hooks/useSchedule';
import { useScheduleClasses } from '@/hooks/useScheduleClasses';

import { formatScheduleDate } from '@/utils/scheduleDates';
import type { WeekDay } from '@/types/schedule';

// Convertir una fecha YYYY-MM-DD a Date local.
function parseLocalDate(value: string): Date {
const [year, month, day] = value.split('-').map(Number);

return new Date(year, month - 1, day);
}

// Obtener el día solicitado dentro de la misma semana.
function getDateForDay(
referenceDate: string,
targetDay: WeekDay
): string {
const date = parseLocalDate(referenceDate);

const currentDay = date.getDay();
const daysDifference =
    ((targetDay + 6) % 7) -
    ((currentDay + 6) % 7);

date.setDate(date.getDate() + daysDifference);

return formatScheduleDate(date);
}

export function ScheduleTemplate() {
const router = useRouter();

// Configuración de días de universidad.
const {
    loading: loadingSchedule,
    saving: savingSchedule,
    configured,
    mode,
    setMode,
    customDays,
    toggleCustomDay,
    selectedDays,
    activeDay,
    setActiveDay,
    error: scheduleError,
    save,
    editDays,
} = useSchedule();

// Clases almacenadas en Supabase.
const {
    classes,
    loading: loadingClasses,
    error: classesError,
    refreshClasses,
} = useScheduleClasses();

// Fecha seleccionada en el calendario.
const [selectedDate, setSelectedDate] = useState(() =>
    formatScheduleDate(new Date())
);

// Asegurar que el día activo esté configurado.
const effectiveDay: WeekDay = selectedDays.includes(activeDay)
    ? activeDay
    : (selectedDays[0] ?? activeDay);

// Calcular la fecha efectiva sin modificar estado
// dentro de un useEffect.
const effectiveDate = getDateForDay(
    selectedDate,
    effectiveDay
);

// Seleccionar un día conservando la semana actual.
const handleSelectDay = (day: WeekDay) => {
    setActiveDay(day);

    setSelectedDate((previousDate) =>
    getDateForDay(previousDate, day)
    );
};

// Actualizar la fecha al navegar entre semanas.
const handleSelectDate = (date: string) => {
    setSelectedDate(date);
};

// Refrescar las clases al regresar al horario.
useFocusEffect(
    useCallback(() => {
    if (configured) {
        void refreshClasses();
    }
    }, [configured, refreshClasses])
);

// Pantalla de carga inicial.
if (loadingSchedule) {
    return (
    <SafeAreaView
        className="flex-1 items-center justify-center bg-[#FAF9FF]"
        edges={['top']}
    >
        <ActivityIndicator
        size="large"
        color="#7957DC"
        />
    </SafeAreaView>
    );
}

return (
    <SafeAreaView
    className="flex-1 bg-[#FAF9FF]"
    edges={['top']}
    >
    {!configured ? (
        // Primera vez: seleccionar días de universidad.
        <ScheduleSetupForm
        mode={mode}
        onModeChange={setMode}
        customDays={customDays}
        onToggleDay={toggleCustomDay}
        onContinue={() => {
            void save();
        }}
        saving={savingSchedule}
        error={scheduleError}
        />
    ) : (
        // Pantalla principal del horario.
        <View className="flex-1">
        <ScrollView
            className="flex-1"
            contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 35,
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Encabezado */}
            <View className="flex-row items-center justify-between">
            <View className="flex-1">
                <SectionTitle
                title="Mi horario"
                subtitle="Organiza tus clases de la semana"
                />
            </View>

            {/* Configuración de días */}
            <Pressable
                onPress={editDays}
                accessibilityRole="button"
                accessibilityLabel="Cambiar días de clases"
                className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EDE6FF]"
            >
                <Ionicons
                name="settings-outline"
                size={21}
                color="#7957DC"
                />
            </Pressable>
            </View>

            {/* Selector de días y semanas */}
            <ScheduleDaySelector
            selectedDays={selectedDays}
            activeDay={effectiveDay}
            onSelectDay={handleSelectDay}
            onSelectDate={handleSelectDate}
            />

            {/* Estado de carga de clases */}
            {loadingClasses ? (
            <View className="items-center py-12">
                <ActivityIndicator
                size="large"
                color="#7957DC"
                />

                <Text className="mt-4 text-[14px] text-[#817995]">
                Cargando tus clases...
                </Text>
            </View>
            ) : classesError ? (
            // Error al obtener clases.
            <View className="mt-8 rounded-2xl bg-red-50 p-5">
                <View className="flex-row items-center">
                <Ionicons
                    name="alert-circle-outline"
                    size={22}
                    color="#DC2626"
                />

                <Text className="ml-2 flex-1 text-[14px] text-red-600">
                    {classesError}
                </Text>
                </View>

                <Pressable
                onPress={() => {
                    void refreshClasses();
                }}
                accessibilityRole="button"
                accessibilityLabel="Reintentar cargar clases"
                className="mt-4 items-center rounded-xl bg-white p-3"
                >
                <Text className="font-bold text-[#7957DC]">
                    Reintentar
                </Text>
                </Pressable>
            </View>
            ) : (
            // Clases filtradas por fecha.
            <ScheduleClassList
                activeDay={effectiveDay}
                selectedDate={effectiveDate}
                classes={classes}
            />
            )}

            {/* Información del horario */}
            <View className="mt-6 rounded-2xl bg-[#EDE6FF] p-4">
            <Text className="text-[14px] text-[#7957DC]">
                Tu horario está configurado para{' '}
                {selectedDays.length} días por semana.
            </Text>

            <Text className="mt-2 text-[13px] text-[#817995]">
                Tienes {classes.length}{' '}
                {classes.length === 1
                ? 'materia registrada'
                : 'materias registradas'}.
            </Text>
            </View>

            {/* Botón para agregar clases */}
            <Pressable
            onPress={() => {
                router.push('/horario/nueva');
            }}
            accessibilityRole="button"
            accessibilityLabel="Agregar clase"
            className="mt-8 min-h-[56px] flex-row items-center justify-center rounded-2xl bg-[#7957DC]"
            >
            <Ionicons
                name="add"
                size={22}
                color="#FFFFFF"
            />

            <Text className="ml-2 text-[16px] font-bold text-white">
                Agregar clase
            </Text>
            </Pressable>
        </ScrollView>
        </View>
    )}
    </SafeAreaView>
);
}
