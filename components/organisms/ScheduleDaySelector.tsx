
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { DayChip } from '@/components/atoms/DayChip';
import { WEEK_DAYS, type WeekDay } from '@/types/schedule';
import { formatScheduleDate } from '@/utils/scheduleDates';

interface ScheduleDaySelectorProps {
selectedDays: WeekDay[];
activeDay: WeekDay;
onSelectDay: (day: WeekDay) => void;
onSelectDate: (date: string) => void;
}

function getMonday(reference: Date): Date {
const date = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate()
);

const daysSinceMonday = (date.getDay() + 6) % 7;
date.setDate(date.getDate() - daysSinceMonday);

return date;
}

function sameDate(a: Date, b: Date): boolean {
return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
);
}

export function ScheduleDaySelector({
selectedDays,
activeDay,
onSelectDay,
onSelectDate,
}: ScheduleDaySelectorProps) {
const [weekOffset, setWeekOffset] = useState(0);

const today = new Date();

const monday = getMonday(today);
monday.setDate(monday.getDate() + weekOffset * 7);

const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
});

const weekLabel = `${dateFormatter.format(monday)} - ${dateFormatter.format(sunday)} ${sunday.getFullYear()}`;

const availableDays = WEEK_DAYS.filter((day) =>
    selectedDays.includes(day.id)
);

const getDayDate = (day: WeekDay): Date => {
    const date = new Date(monday);
    date.setDate(date.getDate() + ((day + 6) % 7));
    return date;
};

const selectDay = (day: WeekDay) => {
    const date = getDayDate(day);

    onSelectDay(day);
    onSelectDate(formatScheduleDate(date));
};

const changeWeek = (direction: number) => {
    const nextOffset = weekOffset + direction;

    setWeekOffset(nextOffset);

    const nextMonday = getMonday(today);
    nextMonday.setDate(
    nextMonday.getDate() + nextOffset * 7
    );

    const selectedDate = new Date(nextMonday);
    selectedDate.setDate(
    selectedDate.getDate() + ((activeDay + 6) % 7)
    );

    onSelectDate(formatScheduleDate(selectedDate));
};

const goToToday = () => {
    setWeekOffset(0);

    const currentDay = today.getDay() as WeekDay;

    if (selectedDays.includes(currentDay)) {
    onSelectDay(currentDay);
    onSelectDate(formatScheduleDate(today));
    } else if (availableDays.length > 0) {
    const firstDay = availableDays[0].id;
    const currentMonday = getMonday(today);

    currentMonday.setDate(
        currentMonday.getDate() + ((firstDay + 6) % 7)
    );

    onSelectDay(firstDay);
    onSelectDate(formatScheduleDate(currentMonday));
    } else {
    onSelectDate(formatScheduleDate(today));
    }
};

return (
    <View className="mt-7">
    <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
        <Text className="text-[16px] font-bold text-[#292342]">
            {weekLabel}
        </Text>

        <Text className="mt-1 text-[12px] text-[#817995]">
            {weekOffset === 0
            ? 'Semana actual'
            : weekOffset > 0
                ? 'Próximas semanas'
                : 'Semanas anteriores'}
        </Text>
        </View>

        <View className="flex-row gap-2">
        <Pressable
            onPress={() => changeWeek(-1)}
            accessibilityRole="button"
            accessibilityLabel="Semana anterior"
            className="h-10 w-10 items-center justify-center rounded-xl bg-[#EDE6FF]"
        >
            <Ionicons
            name="chevron-back"
            size={20}
            color="#7957DC"
            />
        </Pressable>

        <Pressable
            onPress={() => changeWeek(1)}
            accessibilityRole="button"
            accessibilityLabel="Semana siguiente"
            className="h-10 w-10 items-center justify-center rounded-xl bg-[#EDE6FF]"
        >
            <Ionicons
            name="chevron-forward"
            size={20}
            color="#7957DC"
            />
        </Pressable>
        </View>
    </View>

    <View className="w-full flex-row justify-between">
        {availableDays.map((day) => {
        const dayDate = getDayDate(day.id);

        return (
            <View
            key={day.id}
            className="flex-1"
            style={{ marginHorizontal: 3 }}
            >
            <DayChip
                label={day.short}
                date={dayDate.getDate()}
                selected={activeDay === day.id}
                isToday={sameDate(dayDate, today)}
                onPress={() => selectDay(day.id)}
            />
            </View>
        );
        })}
    </View>

    {weekOffset !== 0 && (
        <Pressable
        onPress={goToToday}
        accessibilityRole="button"
        accessibilityLabel="Volver a hoy"
        className="mt-4 flex-row items-center justify-center rounded-xl bg-[#EDE6FF] px-4 py-3"
        >
        <Ionicons
            name="calendar-outline"
            size={18}
            color="#7957DC"
        />

        <Text className="ml-2 text-[13px] font-bold text-[#7957DC]">
            Volver a hoy
        </Text>
        </Pressable>
    )}
    </View>
);
}
