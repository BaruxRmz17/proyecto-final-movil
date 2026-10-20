
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import type { WeekDay } from '@/types/schedule';
import type { ScheduleClassRecord } from '@/services/scheduleClassesService';
import { isClassActiveOnDate } from '@/utils/scheduleDates';

interface ScheduleClassListProps {
activeDay: WeekDay;
selectedDate: string;
classes: ScheduleClassRecord[];
}

const dayNames: Record<WeekDay, string> = {
0: 'Domingo',
1: 'Lunes',
2: 'Martes',
3: 'Miércoles',
4: 'Jueves',
5: 'Viernes',
6: 'Sábado',
};

export function ScheduleClassList({
activeDay,
selectedDate,
classes,
}: ScheduleClassListProps) {
const router = useRouter();

const [year, month, day] = selectedDate
    .split('-')
    .map(Number);

const date = new Date(year, month - 1, day);

const dailyClasses = classes
    .filter((item) => isClassActiveOnDate(item, date))
    .sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
    );

const dateLabel = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
}).format(date);

return (
    <View className="mt-9">
    <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1">
        <Text className="text-[20px] font-bold text-[#292342]">
            {dayNames[activeDay]}
        </Text>

        <Text className="mt-1 text-[13px] text-[#817995]">
            {dateLabel}
        </Text>
        </View>

        <Text className="text-[13px] text-[#817995]">
        {dailyClasses.length}{' '}
        {dailyClasses.length === 1 ? 'clase' : 'clases'}
        </Text>
    </View>

    {dailyClasses.length === 0 ? (
        <View className="items-center rounded-3xl bg-white px-6 py-12">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE6FF]">
            <Ionicons
            name="calendar-outline"
            size={30}
            color="#7957DC"
            />
        </View>

        <Text className="mt-5 text-center text-[19px] font-bold text-[#292342]">
            No tienes clases este día
        </Text>

        <Text className="mt-3 text-center text-[14px] leading-6 text-[#817995]">
            No hay materias programadas para esta fecha.
            Puedes consultar otra semana o agregar una clase.
        </Text>
        </View>
    ) : (
        dailyClasses.map((item) => (
        <Pressable
            key={item.id}
            onPress={() => {
            router.push({
                pathname: '/horario/[id]',
                params: { id: item.id },
            });
            }}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalles de ${item.subject}`}
            className="mb-4 flex-row overflow-hidden rounded-2xl bg-white"
        >
            <View
            style={{ backgroundColor: item.color }}
            className="w-2"
            />

            <View className="flex-1 p-5">
            <View className="flex-row items-center justify-between">
                <Text className="mr-3 flex-1 text-[17px] font-bold text-[#292342]">
                {item.subject}
                </Text>

                <Ionicons
                name="chevron-forward"
                size={20}
                color="#7957DC"
                />
            </View>

            <View className="mt-3 flex-row items-center">
                <Ionicons
                name="time-outline"
                size={17}
                color="#7957DC"
                />

                <Text className="ml-2 text-[14px] text-[#817995]">
                {item.start_time.slice(0, 5)} -{' '}
                {item.end_time.slice(0, 5)}
                </Text>
            </View>

            <View className="mt-2 flex-row items-center">
                <Ionicons
                name="person-outline"
                size={17}
                color="#7957DC"
                />

                <Text className="ml-2 text-[14px] text-[#817995]">
                {item.teacher || 'Profesor no especificado'}
                </Text>
            </View>

            <View className="mt-2 flex-row items-center">
                <Ionicons
                name="location-outline"
                size={17}
                color="#7957DC"
                />

                <Text className="ml-2 text-[14px] text-[#817995]">
                {item.classroom || 'Aula no especificada'}
                </Text>
            </View>

            <Text className="mt-4 text-[12px] font-semibold text-[#7957DC]">
                Ver detalles de clase →
            </Text>
            </View>
        </Pressable>
        ))
    )}
    </View>
);
}
