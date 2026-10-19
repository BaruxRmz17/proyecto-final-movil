
import { Text, TextInput, View } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';

type AuthInputProps = {
label: string;
placeholder: string;
value: string;
onChangeText: (text: string) => void;
secureTextEntry?: boolean;
keyboardType?: KeyboardTypeOptions;
autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
autoComplete?: 'name' | 'email' | 'password' | 'new-password';
};

export function AuthInput({
label,
placeholder,
value,
onChangeText,
secureTextEntry = false,
keyboardType = 'default',
autoCapitalize = 'none',
autoComplete,
}: AuthInputProps) {
return (
    <View className="gap-3">
    <Text className="text-[15px] font-bold text-[#292342]">
        {label}
    </Text>

    <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A79DB8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={false}
        className="h-[58px] rounded-[16px] bg-white px-5 text-[16px] text-[#292342]"
    />
    </View>
);
}
