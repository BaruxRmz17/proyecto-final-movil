
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ClassDetailRowProps {
icon: keyof typeof Ionicons.glyphMap;
label: string;
value: string;
color?: string;
}

export function ClassDetailRow({
icon,
label,
value,
color = '#7957DC',
}: ClassDetailRowProps) {
return (
    <View className="flex-row items-center border-b border-[#F0ECF7] py-4">
    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE6FF]">
        <Ionicons
        name={icon}
        size={22}
        color={color}
        />
    </View>

    <View className="ml-4 flex-1">
        <Text className="text-[12px] font-medium text-[#817995]">
        {label}
        </Text>

        <Text className="mt-1 text-[16px] font-semibold text-[#292342]">
        {value}
        </Text>
    </View>
    </View>
);
}
