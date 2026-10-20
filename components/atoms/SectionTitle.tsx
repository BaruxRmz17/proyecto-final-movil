
import { Text, View } from 'react-native';

interface SectionTitleProps {
title: string;
subtitle?: string;
}

export function SectionTitle({
title,
subtitle,
}: SectionTitleProps) {
return (
    <View>
    <Text className="text-[30px] font-extrabold text-[#292342]">
        {title}
    </Text>

    {subtitle && (
        <Text className="mt-2 text-[15px] text-[#817995]">
        {subtitle}
        </Text>
    )}
    </View>
);
}
