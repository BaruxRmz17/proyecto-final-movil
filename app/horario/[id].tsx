
import { useEffect, useState } from 'react';
import {
ActivityIndicator,
Pressable,
Text,
View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClassDetailView } from '@/components/organisms/ClassDetailView';

import {
deleteScheduleClass,
getScheduleClassById,
} from '@/services/scheduleClassesService';

import type { ScheduleClassRecord } from '@/services/scheduleClassesService';

export default function ClassDetailScreen() {
const router = useRouter();
const { id } = useLocalSearchParams<{ id: string }>();

const [classData, setClassData] =
    useState<ScheduleClassRecord | null>(null);

const [loading, setLoading] = useState(true);
const [deleting, setDeleting] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    let active = true;

    async function loadClass() {
    try {
        if (!id || typeof id !== 'string') {
        throw new Error('ID de clase inválido.');
        }

        const data = await getScheduleClassById(id);

        if (active) {
        setClassData(data);
        }
    } catch (err) {
        if (active) {
        setError(
            err instanceof Error
            ? err.message
            : 'No se pudo cargar la clase.'
        );
        }
    } finally {
        if (active) {
        setLoading(false);
        }
    }
    }

    void loadClass();

    return () => {
    active = false;
    };
}, [id]);

const handleDelete = async () => {
    if (!id || typeof id !== 'string' || deleting) {
    return;
    }

    setDeleting(true);

    try {
    await deleteScheduleClass(id);

    router.replace('/(tabs)/horario');
    } catch (err) {
    throw err;
    } finally {
    setDeleting(false);
    }
};

if (loading) {
    return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF9FF]">
        <ActivityIndicator size="large" color="#7957DC" />
    </SafeAreaView>
    );
}

if (error || !classData) {
    return (
    <SafeAreaView className="flex-1 justify-center bg-[#FAF9FF] px-6">
        <Ionicons
        name="alert-circle-outline"
        size={48}
        color="#DC2626"
        />

        <Text className="mt-4 text-[20px] font-bold text-[#292342]">
        No se pudo abrir la clase
        </Text>

        <Text className="mt-2 text-[#817995]">
        {error ?? 'No encontramos esta clase.'}
        </Text>

        <Pressable
        onPress={() => router.replace('/(tabs)/horario')}
        className="mt-6 rounded-2xl bg-[#7957DC] p-4"
        >
        <Text className="text-center font-bold text-white">
            Volver al horario
        </Text>
        </Pressable>
    </SafeAreaView>
    );
}

return (
    <SafeAreaView
    className="flex-1 bg-[#FAF9FF]"
    edges={['top', 'bottom']}
    >
    <View className="flex-row items-center px-6 py-3">
        <Pressable
        onPress={() => router.back()}
        accessibilityLabel="Regresar"
        className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EDE6FF]"
        >
        <Ionicons
            name="arrow-back"
            size={22}
            color="#7957DC"
        />
        </Pressable>

        <Text className="ml-4 text-[18px] font-bold text-[#292342]">
        Detalles de clase
        </Text>
    </View>

    <ClassDetailView
        classData={classData}
        deleting={deleting}
        onDelete={handleDelete}
        onEdit={() => {
        // Conectaremos la edición en el Paso 6.4
        router.push({
            pathname: '/horario/nueva',
        });
        }}
    />
    </SafeAreaView>
);
}
