
import { useState } from 'react';
import {
Alert,
Image,
KeyboardAvoidingView,
Platform,
Pressable,
ScrollView,
Text,
View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AuthInput } from '@/components/atoms/AuthInput';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';

export default function ForgotPasswordScreen() {
const router = useRouter();
const [correo, setCorreo] = useState('');

const handleRecoverPassword = () => {
    const email = correo.trim();

    if (!email) {
    Alert.alert(
        'Correo requerido',
        'Ingresa tu correo electrónico para continuar.'
    );
    return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
    Alert.alert(
        'Correo inválido',
        'Ingresa un correo electrónico válido.'
    );
    return;
    }

    Alert.alert(
    'Formulario validado',
    'Tu correo es válido. El envío del enlace estará disponible cuando conectemos Supabase.'
    );
};

return (
    <SafeAreaView
    className="flex-1 bg-[#FAF9FF]"
    edges={['top', 'bottom']}
    >
    <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <ScrollView
        className="flex-1"
        contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 30,
            paddingTop: 16,
            paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        >
        {/* LOGO */}
        <View className="items-center">
            <Image
            source={require('../assets/images/campus-mind-logo.png')}
            resizeMode="contain"
            className="h-[110px] w-[165px]"
            />
        </View>

        {/* ENCABEZADO */}
        <View className="mt-8">
            <Text className="text-[31px] font-extrabold text-[#292342]">
            ¿Olvidaste tu contraseña?
            </Text>

            <Text className="mt-4 text-[16px] leading-6 text-[#817995]">
            No te preocupes. Ingresa tu correo electrónico
            y te ayudaremos a recuperar el acceso a tu cuenta.
            </Text>
        </View>

        {/* FORMULARIO */}
        <View className="mt-16">
            <AuthInput
            label="Correo electrónico"
            placeholder="correo@universidad.edu"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            />
        </View>

        {/* INFORMACIÓN */}
        <View className="mt-7 rounded-[20px] bg-[#EFE9FF] p-5">
            <Text className="text-[14px] leading-6 text-[#7957DC]">
            Cuando habilitemos la recuperación, recibirás
            un enlace en tu correo para establecer una nueva
            contraseña.
            </Text>
        </View>

        {/* ESPACIO FLEXIBLE */}
        <View className="min-h-[60px] flex-1" />

        {/* BOTÓN PRINCIPAL */}
        <PrimaryButton
            title="Enviar enlace de recuperación"
            onPress={handleRecoverPassword}
        />

        {/* VOLVER AL LOGIN */}
        <Pressable
            onPress={() => router.replace('/login')}
            className="mt-6 items-center py-3"
        >
            <Text className="text-[15px] font-medium text-[#7957DC]">
            Volver a iniciar sesión
            </Text>
        </Pressable>

        <View className="h-8" />
        </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
);
}
