
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

export default function RegisterScreen() {
const router = useRouter();

// Estados del formulario
const [nombre, setNombre] = useState('');
const [correo, setCorreo] = useState('');
const [contrasena, setContrasena] = useState('');
const [loading, setLoading] = useState(false);

// Registrar usuario en Supabase
const handleRegister = async () => {
    if (loading) return;

    const nombreCompleto = nombre.trim();
    const email = correo.trim().toLowerCase();

    // Validar campos vacíos
    if (!nombreCompleto || !email || !contrasena) {
    Alert.alert(
        'Campos incompletos',
        'Por favor, completa todos los campos.'
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

    // Validar longitud de contraseña
    if (contrasena.length < 8) {
    Alert.alert(
        'Contraseña muy corta',
        'Utiliza al menos 8 caracteres.'
    );
    return;
    }

    setLoading(true);

    try {
    // Crear cuenta en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password: contrasena,
        options: {
        data: {
            nombre_completo: nombreCompleto,
        },
        },
    });

    if (error) {
        console.error('Error de registro:', error.message);

        Alert.alert(
        'Error al crear cuenta',
        error.message
        );
        return;
    }

    // Registro exitoso con sesión activa
    if (data.user && data.session) {
        console.log(
        'Usuario registrado correctamente:',
        data.user.id
        );

        setContrasena('');

        // Ir directamente al Home
        router.replace('../(tabs)');
        return;
    }

    // Si no se recibió una sesión
    if (data.user && !data.session) {
        Alert.alert(
        'Registro recibido',
        'Tu cuenta fue registrada, pero todavía no hay una sesión activa. Revisa la configuración de confirmación de correo en Supabase.',
        [
            {
            text: 'Ir a iniciar sesión',
            onPress: () => router.replace('/login'),
            },
        ]
        );
        return;
    }

    Alert.alert(
        'No se pudo completar el registro',
        'Inténtalo nuevamente.'
    );
    } catch (error) {
    console.error('Error de conexión:', error);

    Alert.alert(
        'Error de conexión',
        'No fue posible conectar con Supabase. Inténtalo nuevamente.'
    );
    } finally {
    setLoading(false);
    }
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
            Crea tu cuenta
            </Text>

            <Text className="mt-3 text-[16px] text-[#817995]">
            Empieza a organizar tu semestre.
            </Text>
        </View>

        {/* FORMULARIO */}
        <View className="mt-14 gap-7">
            <AuthInput
            label="Nombre completo"
            placeholder="Tu nombre"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            autoComplete="name"
            />

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
            placeholder="Mínimo 8 caracteres"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
            autoComplete="new-password"
            />
        </View>

        {/* ESPACIO FLEXIBLE */}
        <View className="min-h-[45px] flex-1" />

        {/* BOTÓN CREAR CUENTA */}
        <PrimaryButton
            title={
            loading
                ? 'Creando cuenta...'
                : 'Crear cuenta'
            }
            onPress={handleRegister}
        />

        {/* ENLACE A LOGIN */}
        <Pressable
            onPress={() => router.push('/login')}
            disabled={loading}
            className="mt-6 items-center py-3"
        >
            <Text className="text-center text-[15px] text-[#7957DC]">
            ¿Ya tienes cuenta? Inicia sesión
            </Text>
        </Pressable>

        <View className="h-8" />
        </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
);
}
