
import {
ActivityIndicator,
Alert,
Pressable,
ScrollView,
Text,
View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ClassDetailRow } from '@/components/molecules/ClassDetailRow';

import type { ScheduleClassRecord } from '@/services/scheduleClassesService';
import { WEEK_DAYS } from '@/types/schedule';

interface ClassDetailViewProps {
classData: ScheduleClassRecord;
onEdit: () => void;
onDelete: () => Promise<void>;
deleting?: boolean;
}

export function ClassDetailView({
classData,
onEdit,
onDelete,
deleting = false,
}: ClassDetailViewProps) {
const classDays = WEEK_DAYS
    .filter((day) => classData.days.includes(day.id))
    .map((day) => day.name)
    .join(', ');

const startTime = classData.start_time.slice(0, 5);
const endTime = classData.end_time.slice(0, 5);

const confirmDelete = () => {
    Alert.alert(
    'Eliminar clase',
    `¿Seguro que deseas eliminar "${classData.subject}"? Esta acción no se puede deshacer.`,
    [
        {
        text: 'Cancelar',
        style: 'cancel',
        },
        {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
            void onDelete().catch((error: unknown) => {
            Alert.alert(
                'Error al eliminar',
                error instanceof Error
                ? error.message
                : 'No se pudo eliminar la clase.'
            );
            });
        },
        },
    ]
    );
};

return (
    <ScrollView
    className="flex-1 bg-[#FAF9FF]"
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 45,
    }}
    >
    {/* Encabezado de la materia */}
    <View className="overflow-hidden rounded-3xl bg-white">
        <View
        style={{ backgroundColor: classData.color }}
        className="h-2"
        />

        <View className="p-6">
        <View
            style={{
            backgroundColor: `${classData.color}20`,
            }}
            className="mb-5 h-16 w-16 items-center justify-center rounded-2xl"
        >
            <Ionicons
            name="book-outline"
            size={30}
            color={classData.color}
            />
        </View>

        <Text className="text-[26px] font-extrabold text-[#292342]">
            {classData.subject}
        </Text>

        <Text className="mt-2 text-[14px] text-[#817995]">
            Información de tu clase
        </Text>
        </View>
    </View>

    {/* Información detallada */}
    <View className="mt-6 rounded-3xl bg-white px-5 py-2">
        <ClassDetailRow
        icon="person-outline"
        label="Profesor"
        value={classData.teacher || 'No especificado'}
        />

        <ClassDetailRow
        icon="location-outline"
        label="Aula o laboratorio"
        value={classData.classroom || 'No especificado'}
        />

        <ClassDetailRow
        icon="time-outline"
        label="Horario"
        value={`${startTime} - ${endTime}`}
        />

        <ClassDetailRow
        icon="calendar-outline"
        label="Días de clase"
        value={classDays || 'No especificados'}
        />
    </View>

    {/* Notas adicionales */}
    <View className="mt-6 rounded-3xl bg-white p-5">
        <View className="flex-row items-center">
        <Ionicons
            name="document-text-outline"
            size={21}
            color="#7957DC"
        />

        <Text className="ml-3 text-[17px] font-bold text-[#292342]">
            Notas adicionales
        </Text>
        </View>

        <Text className="mt-4 text-[14px] leading-6 text-[#817995]">
        {classData.notes?.trim() ||
            'Todavía no has agregado notas a esta materia.'}
        </Text>
    </View>

    {/* Acciones */}
    <View className="mt-8 gap-4">
        <Pressable
        onPress={onEdit}
        disabled={deleting}
        accessibilityRole="button"
        className="min-h-[56px] flex-row items-center justify-center rounded-2xl bg-[#7957DC]"
        >
        <Ionicons
            name="create-outline"
            size={21}
            color="#FFFFFF"
        />

        <Text className="ml-2 text-[16px] font-bold text-white">
            Editar clase
        </Text>
        </Pressable>

        <Pressable
        onPress={confirmDelete}
        disabled={deleting}
        accessibilityRole="button"
        className="min-h-[56px] flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50"
        >
        {deleting ? (
            <ActivityIndicator color="#DC2626" />
        ) : (
            <>
            <Ionicons
                name="trash-outline"
                size={21}
                color="#DC2626"
            />

            <Text className="ml-2 text-[16px] font-bold text-red-600">
                Eliminar clase
            </Text>
            </>
        )}
        </Pressable>
    </View>
    </ScrollView>
);
}
