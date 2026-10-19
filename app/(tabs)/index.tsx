
import { useCallback, useState } from 'react';
import {
ActivityIndicator,
Image,
ScrollView,
Text,
View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase';

const COLORS = {
background: '#FAF9FF',
text: '#292342',
muted: '#817995',
primary: '#7957DC',
lavender: '#EDE6FF',
};

export default function HomeScreen() {
const [nombre, setNombre] = useState('');
const [loading, setLoading] = useState(true);

useFocusEffect(
    useCallback(() => {
    let active = true;

    const loadUser = async () => {
        setLoading(true);

        const {
        data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
        if (active) setLoading(false);
        return;
        }

        const { data: profile, error } = await supabase
        .from('profiles')
        .select('nombre_completo')
        .eq('id', user.id)
        .maybeSingle();

        if (error) {
        console.warn('No se pudo cargar el perfil:', error.message);
        }

        const fullName =
        profile?.nombre_completo ||
        user.user_metadata?.nombre_completo ||
        '';

        const firstName = String(fullName).trim().split(/\s+/)[0];

        if (active) {
        setNombre(firstName || 'estudiante');
        setLoading(false);
        }
    };

    loadUser();

    return () => {
        active = false;
    };
    }, [])
);

const fecha = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
}).format(new Date());

return (
    <SafeAreaView
    className="flex-1 bg-[#FAF9FF]"
    edges={['top']}
    >
    <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
        paddingHorizontal: 25,
        paddingTop: 30,
        paddingBottom: 45,
        }}
    >
        {/* SALUDO */}
        <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
            {loading ? (
            <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ alignSelf: 'flex-start' }}
            />
            ) : (
            <Text
                className="text-[29px] font-extrabold text-[#292342]"
                numberOfLines={2}
            >
                Hola, {nombre}
            </Text>
            )}

            <Text className="mt-3 text-[15px] text-[#817995]">
            {fecha.charAt(0).toUpperCase() + fecha.slice(1)}
            </Text>
        </View>

        <Image
            source={require('../../assets/images/campus-mind-logo.png')}
            resizeMode="contain"
            className="h-[105px] w-[115px]"
        />
        </View>

        {/* RESUMEN DEL DÍA */}
        <View className="mt-9 rounded-[26px] bg-[#EDE6FF] px-6 py-7">
        <View className="flex-row items-center">
            <Ionicons
            name="sparkles-outline"
            size={22}
            color={COLORS.primary}
            />

            <Text className="ml-3 text-[20px] font-extrabold text-[#292342]">
            Tu día de un vistazo
            </Text>
        </View>

        <Text className="mt-5 text-[16px] text-[#7957DC]">
            Tu información académica aparecerá aquí.
        </Text>
        </View>

        {/* PRÓXIMAS CLASES */}
        <View className="mt-12">
        <Text className="text-[24px] font-extrabold text-[#292342]">
            Próximas clases
        </Text>

        <View className="mt-5 rounded-[23px] bg-white p-6">
            <View className="flex-row items-center">
            <Ionicons
                name="school-outline"
                size={23}
                color={COLORS.primary}
            />

            <Text className="ml-3 text-[17px] font-bold text-[#292342]">
                Sin clases registradas
            </Text>
            </View>

            <Text className="mt-3 text-[14px] text-[#817995]">
            Cuando agregues tus materias y horarios,
            aparecerán tus próximas clases.
            </Text>
        </View>
        </View>

        {/* MIS PENDIENTES */}
        <View className="mt-12">
        <Text className="text-[24px] font-extrabold text-[#292342]">
            Mis pendientes
        </Text>

        <View className="mt-5 rounded-[23px] bg-white p-6">
            <View className="flex-row items-center">
            <Ionicons
                name="document-text-outline"
                size={23}
                color={COLORS.primary}
            />

            <Text className="ml-3 text-[17px] font-bold text-[#292342]">
                Sin tareas pendientes
            </Text>
            </View>

            <Text className="mt-3 text-[14px] text-[#817995]">
            Tus próximas entregas aparecerán aquí.
            </Text>
        </View>
        </View>
    </ScrollView>
    </SafeAreaView>
);
}
