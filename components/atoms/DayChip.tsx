
import { Pressable, Text, View } from 'react-native';

interface DayChipProps {
label: string;
selected: boolean;
onPress: () => void;
date?: number;
isToday?: boolean;
disabled?: boolean;
}

export function DayChip({
label,
selected,
onPress,
date,
isToday = false,
disabled = false,
}: DayChipProps) {
return (
    <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{
        selected,
        disabled,
    }}
    className={`min-h-[68px] min-w-[54px] items-center justify-center rounded-2xl px-3 py-3 ${
        selected ? 'bg-[#7957DC]' : 'bg-white'
    } ${disabled ? 'opacity-40' : ''}`}
    >
    <Text
        className={`text-[12px] font-semibold ${
        selected ? 'text-white' : 'text-[#817995]'
        }`}
    >
        {label}
    </Text>

    {date !== undefined ? (
        <Text
        className={`mt-1 text-[20px] font-extrabold ${
            selected ? 'text-white' : 'text-[#292342]'
        }`}
        >
        {date}
        </Text>
    ) : null}

    {isToday ? (
        <View
        className={`mt-1 h-[5px] w-[5px] rounded-full ${
            selected ? 'bg-white' : 'bg-[#7957DC]'
        }`}
        />
    ) : date !== undefined ? (
        <View className="mt-1 h-[5px] w-[5px]" />
    ) : null}
    </Pressable>
);
}
