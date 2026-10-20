
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScheduleModeCardProps {
title: string;
description: string;
icon: keyof typeof Ionicons.glyphMap;
selected: boolean;
onPress: () => void;
}

export function ScheduleModeCard({
title,
description,
icon,
selected,
onPress,
}: ScheduleModeCardProps) {
return (
    <Pressable
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ checked: selected }}
    className={`flex-row items-center rounded-2xl border p-5 ${
        selected
        ? 'border-[#7957DC] bg-[#F1ECFF]'
        : 'border-[#EAE6F3] bg-white'
    }`}
    >
    <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#EDE6FF]">
        <Ionicons
        name={icon}
        size={23}
        color="#7957DC"
        />
    </View>

    <View className="ml-4 flex-1">
        <Text className="text-[16px] font-bold text-[#292342]">
        {title}
        </Text>

        <Text className="mt-1 text-[13px] text-[#817995]">
        {description}
        </Text>
    </View>

    <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={23}
        color={selected ? '#7957DC' : '#C9C2D8'}
    />
    </Pressable>
);
}
