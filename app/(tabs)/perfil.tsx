
import { Alert, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase';

export default function PerfilScreen() {
const router = useRouter();

const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
    Alert.alert('Error', 'No se pudo cerrar sesión.');
    return;
    }

    router.replace('/login');
};

return (
    <SafeAreaView className="flex-1 bg-[#FAF9FF] px-7 pt-8">
    <Text className="text-[30px] font-extrabold text-[#292342]">
        Mi perfil
    </Text>

    <Text className="mt-3 text-[#817995]">
        Administra tu cuenta de Campus Mind.
    </Text>

    <Pressable
        onPress={handleLogout}
        className="mt-10 flex-row items-center justify-center rounded-[18px] bg-[#EDE6FF] p-5"
    >
        <Ionicons
        name="log-out-outline"
        size={22}
        color="#7957DC"
        />

        <Text className="ml-3 font-bold text-[#7957DC]">
        Cerrar sesión
        </Text>
    </Pressable>
    </SafeAreaView>
);
}
