
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
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
const router = useRouter();

// Estados del formulario
const [correo, setCorreo] = useState('');
const [contrasena, setContrasena] = useState('');
const [loading, setLoading] = useState(false);

// Iniciar sesión con Supabase
const handleLogin = async () => {
    if (loading) return;

    const email = correo.trim().toLowerCase();

    // Validar campos vacíos
    if (!email || !contrasena) {
    Alert.alert(
        'Campos incompletos',
        'Ingresa tu correo y contraseña.'
    );
    return;
    }

    // Validar formato del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
    Alert.alert(
        'Correo inválido',
        'Ingresa un correo electrónico válido.'
    );
    return;
    }

    setLoading(true);

    try {
    const { data, error } =
        await supabase.auth.signInWithPassword({
        email,
        password: contrasena,
        });

    // Error de autenticación
    if (error) {
        console.warn('Error de Supabase:', error.message);

        Alert.alert(
        'No se pudo iniciar sesión',
        'Verifica tu correo y contraseña e inténtalo nuevamente.'
        );
        return;
    }

    // Inicio de sesión exitoso
    if (data.session && data.user) {
        console.log(
        'Inicio de sesión exitoso:',
        data.user.id
        );

        // Limpiar contraseña del formulario
        setContrasena('');

        // Redirigir al Home
        router.replace('../(tabs)');
        return;
    }

    Alert.alert(
        'Error de sesión',
        'No se pudo obtener una sesión válida.'
    );
    } catch (error) {
    console.error('Error al iniciar sesión:', error);

    Alert.alert(
        'Error de conexión',
        'No fue posible conectar con Supabase. Inténtalo nuevamente.'
    );
    } finally {
    setLoading(false);
    }
};

// Navegar a recuperación de contraseña
const handleForgotPassword = () => {
    router.push('/forgot-password');
};

return (
    <SafeAreaView
    className="flex-1 bg-[#FAF9FF]"
    edges={['top', 'bottom']}
    >
    <KeyboardAvoidingView
        className="flex-1"
        behavior={
        Platform.OS === 'ios' ? 'padding' : undefined
        }
    >
        <ScrollView
        className="flex-1"
        contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 30,
            paddingTop: 8,
            paddingBottom: 36,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        >
        {/* LOGO SUPERIOR */}
        <View className="items-center">
            <Image
            source={require('../assets/images/campus-mind-logo.png')}
            resizeMode="contain"
            className="h-[100px] w-[155px]"
            />
        </View>

        {/* ENCABEZADO */}
        <View className="mt-2">
            <Text className="text-[32px] font-extrabold text-[#292342]">
            ¡Qué gusto verte!
            </Text>

            <Text className="mt-3 text-[16px] text-[#817995]">
            Continúa donde te quedaste.
            </Text>
        </View>

        {/* ESPACIO ENTRE ENCABEZADO Y FORMULARIO */}
        <View className="h-[76px]" />

        {/* FORMULARIO */}
        <View className="gap-7">
            <AuthInput
            label="Correo electrónico"
            placeholder="correo@universidad.edu"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            />

            <AuthInput
            label="Contraseña"
            placeholder="Tu contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
            autoComplete="password"
            />
        </View>

        {/* RECUPERAR CONTRASEÑA */}
        <Pressable
            onPress={handleForgotPassword}
            disabled={loading}
            className="mt-7 items-end py-2"
        >
            <Text className="text-[14px] text-[#7957DC]">
            ¿Olvidaste tu contraseña?
            </Text>
        </Pressable>

        {/* ESPACIO FLEXIBLE */}
        <View className="min-h-[55px] flex-1" />

        {/* BOTÓN DE INICIO DE SESIÓN */}
        <PrimaryButton
            title={
            loading
                ? 'Iniciando sesión...'
                : 'Iniciar sesión'
            }
            onPress={handleLogin}
        />

        {/* ENLACE A REGISTRO */}
        <Pressable
            onPress={() => router.push('/register')}
            disabled={loading}
            className="mt-6 items-center py-3"
        >
            <Text className="text-center text-[15px] text-[#7957DC]">
            ¿No tienes cuenta? Regístrate
            </Text>
        </Pressable>

        <View className="h-8" />
        </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
);
}
