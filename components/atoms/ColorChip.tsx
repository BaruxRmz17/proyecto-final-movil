
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ColorChipProps {
color: string;
selected: boolean;
onPress: () => void;
disabled?: boolean;
}

export function ColorChip({
color,
selected,
onPress,
disabled = false,
}: ColorChipProps) {
return (
    <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="radio"
    accessibilityLabel={`Color ${color}`}
    accessibilityState={{
        checked: selected,
        disabled,
    }}
    className="items-center justify-center p-1"
    >
    <View
        style={{
        backgroundColor: color,
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: selected ? 3 : 0,
        borderColor: '#292342',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        }}
    >
        {selected && (
        <Ionicons
            name="checkmark"
            size={23}
            color="#FFFFFF"
        />
        )}
    </View>
    </Pressable>
);
}

export const CLASS_COLORS = [
'#7957DC',
'#E879A0',
'#4F9FCE',
'#48A68A',
'#E7A64B',
'#8C80B8',
] as const;
