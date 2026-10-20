
import {
ActivityIndicator,
Pressable,
ScrollView,
Text,
View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { DayChip } from '@/components/atoms/DayChip';
import { SectionTitle } from '@/components/atoms/SectionTitle';
import { ScheduleModeCard } from '@/components/molecules/ScheduleModeCard';

import {
ScheduleMode,
WeekDay,
WEEK_DAYS,
} from '@/types/schedule';

interface ScheduleSetupFormProps {
mode: ScheduleMode;
onModeChange: (mode: ScheduleMode) => void;
customDays: WeekDay[];
onToggleDay: (day: WeekDay) => void;
onContinue: () => void;
saving: boolean;
error: string | null;
}

export function ScheduleSetupForm({
mode,
onModeChange,
customDays,
onToggleDay,
onContinue,
saving,
error,
}: ScheduleSetupFormProps) {
return (
    <ScrollView
    className="flex-1"
    contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingTop: 28,
        paddingBottom: 36,
    }}
    showsVerticalScrollIndicator={false}
    >
    <View className="mb-8">
        <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-[#EDE6FF]">
        <Ionicons
            name="calendar-outline"
            size={28}
            color="#7957DC"
        />
        </View>

        <SectionTitle
        title="Configura tu horario"
        subtitle="¿Cuántos días vienes a la universidad? Selecciona los días que tienes clases."
        />
    </View>

    <View className="gap-4">
        <ScheduleModeCard
        title="Lunes a viernes"
        description="5 días de clases por semana"
        icon="calendar-outline"
        selected={mode === 'weekdays'}
        onPress={() => onModeChange('weekdays')}
        />

        <ScheduleModeCard
        title="Lunes a sábado"
        description="6 días de clases por semana"
        icon="calendar-number-outline"
        selected={mode === 'saturday'}
        onPress={() => onModeChange('saturday')}
        />

        <ScheduleModeCard
        title="Personalizado"
        description="Elige exactamente qué días asistes"
        icon="options-outline"
        selected={mode === 'custom'}
        onPress={() => onModeChange('custom')}
        />
    </View>

    {mode === 'custom' && (
        <View className="mt-7">
        <Text className="mb-4 text-[17px] font-bold text-[#292342]">
            Selecciona tus días
        </Text>

        <View className="flex-row flex-wrap gap-2 rounded-2xl bg-[#EDE6FF] p-3">
            {WEEK_DAYS.map((day) => (
            <DayChip
                key={day.id}
                label={day.short}
                selected={customDays.includes(day.id)}
                onPress={() => onToggleDay(day.id)}
            />
            ))}
        </View>
        </View>
    )}

    {error && (
        <Text className="mt-5 text-[14px] text-red-600">
        {error}
        </Text>
    )}

    <View className="min-h-[40px] flex-1" />

    <Pressable
        onPress={onContinue}
        disabled={saving}
        className="min-h-[56px] flex-row items-center justify-center rounded-2xl bg-[#7957DC]"
    >
        {saving ? (
        <ActivityIndicator color="white" />
        ) : (
        <>
            <Text className="mr-2 text-[16px] font-bold text-white">
            Continuar
            </Text>

            <Ionicons
            name="arrow-forward"
            size={19}
            color="white"
            />
        </>
        )}
    </Pressable>
    </ScrollView>
);
}
