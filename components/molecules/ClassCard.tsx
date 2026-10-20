
import { Text, View } from 'react-native';

import { ScheduleClass } from '@/types/schedule';

interface ClassCardProps {
item: ScheduleClass;
accentColor?: string;
}

export function ClassCard({
item,
accentColor = '#7957DC',
}: ClassCardProps) {
return (
    <View className="mb-4 flex-row overflow-hidden rounded-2xl bg-white">
    <View
        style={{ backgroundColor: accentColor }}
        className="w-2"
    />

    <View className="flex-1 px-5 py-5">
        <Text className="text-[17px] font-bold text-[#292342]">
        {item.startTime} · {item.subject}
        </Text>

        <Text className="mt-3 text-[14px] text-[#817995]">
        {item.classroom} · {item.teacher}
        </Text>
    </View>
    </View>
);
}
