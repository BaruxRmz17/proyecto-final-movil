
import { Pressable, Text } from 'react-native';

type PrimaryButtonProps = {
title: string;
onPress: () => void;
variant?: 'primary' | 'secondary';
};

export function PrimaryButton({
title,
onPress,
variant = 'primary',
}: PrimaryButtonProps) {
const isPrimary = variant === 'primary';

return (
    <Pressable
    onPress={onPress}
    className={`h-[56px] w-full items-start justify-center rounded-[18px] px-5 ${
        isPrimary ? 'bg-[#7957DC]' : 'bg-[#ECE5FF]'
    }`}
    >
    <Text
        className={`text-[16px] font-bold ${
        isPrimary ? 'text-white' : 'text-[#7957DC]'
        }`}
    >
        {title}
    </Text>
    </Pressable>
);
}
