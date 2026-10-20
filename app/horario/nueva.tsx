
import { useEffect, useRef, useState } from 'react';

import {
ActivityIndicator,
Alert,
Pressable,
Text,
View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClassForm } from '@/components/organisms/ClassForm';
import { useScheduleClasses } from '@/hooks/useScheduleClasses';

import { getScheduleConfig } from '@/services/scheduleStorage';

import type { WeekDay } from '@/types/schedule';
import type { CreateScheduleClassInput } from '@/services/scheduleClassesService';

import {
findScheduleConflicts,
type ScheduleConflict,
} from '@/utils/scheduleConflicts';

const DAY_NAMES: Record<WeekDay, string> = {
0: 'domingo',
1: 'lunes',
2: 'martes',
3: 'miércoles',
4: 'jueves',
5: 'viernes',
6: 'sábado',
};

function buildConflictMessage(
conflicts: ScheduleConflict[]
): string {
const descriptions = conflicts.slice(0, 3).map((conflict) => {
    const days = conflict.sharedDays
    .map((day) => DAY_NAMES[day])
    .join(', ');

    return (
    `• ${conflict.existingClass.subject}\n` +
    `  Días: ${days}\n` +
    `  Horario: ${conflict.overlapStart} - ${conflict.overlapEnd}`
    );
});

const remaining = conflicts.length - descriptions.length;

if (remaining > 0) {
    descriptions.push(
    `Y ${remaining} conflicto${remaining === 1 ? '' : 's'} más.`
    );
}

return (
    'La materia que intentas agregar podría empalmarse ' +
    'con las siguientes clases:\n\n' +
    descriptions.join('\n\n') +
    '\n\n¿Quieres guardarla de todos modos?'
);
}

export default function NewClassScreen() {
const router = useRouter();

const {
    classes,
    loading: loadingClasses,
    error: classesError,
    addClass,
    saving,
    refreshClasses,
} = useScheduleClasses();

const [availableDays, setAvailableDays] = useState<WeekDay[]>([]);
const [loadingDays, setLoadingDays] = useState(true);

const [submitting, setSubmitting] = useState(false);
const submittingRef = useRef(false);

useEffect(() => {
    let active = true;

    const loadDays = async () => {
    try {
        const config = await getScheduleConfig();

        if (!active) return;

        if (!config) {
        Alert.alert(
            'Configura tu horario',
            'Primero selecciona los días que asistes a la universidad.',
            [
            {
                text: 'Entendido',
                onPress: () => router.replace('/(tabs)/horario'),
            },
            ]
        );
        return;
        }

        setAvailableDays(config.days);
    } catch {
        if (active) {
        Alert.alert(
            'Error',
            'No se pudo cargar la configuración del horario.'
        );
        }
    } finally {
        if (active) {
        setLoadingDays(false);
        }
    }
    };

    void loadDays();

    return () => {
    active = false;
    };
}, [router]);

const saveClass = async (data: CreateScheduleClassInput) => {
    if (submittingRef.current) {
    return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
    await addClass(data);

    Alert.alert(
        'Clase creada',
        'Tu clase se guardó correctamente.',
        [
        {
            text: 'Ver horario',
            onPress: () => {
            router.replace('/(tabs)/horario');
            },
        },
        ]
    );
    } catch (error) {
    throw error;
    } finally {
    submittingRef.current = false;
    setSubmitting(false);
    }
};

const handleSubmit = async (
    data: CreateScheduleClassInput
): Promise<void> => {
    if (submittingRef.current) {
    return;
    }

    // Verificar contra las clases guardadas.
    const conflicts = findScheduleConflicts(data, classes);

    if (conflicts.length === 0) {
    await saveClass(data);
    return;
    }

    // Alert.alert no devuelve una promesa.
    // La envolvemos para que el formulario espere
    // la decisión del usuario.
    await new Promise<void>((resolve, reject) => {
    Alert.alert(
        'Conflicto de horario',
        buildConflictMessage(conflicts),
        [
        {
            text: 'Revisar horario',
            style: 'cancel',
            onPress: () => resolve(),
        },
        {
            text: 'Guardar de todos modos',
            onPress: () => {
            void saveClass(data)
                .then(resolve)
                .catch(reject);
            },
        },
        ],
        {
        cancelable: true,
        onDismiss: () => resolve(),
        }
    );
    });
};

if (loadingDays || loadingClasses) {
    return (
    <SafeAreaView
        className="flex-1 items-center justify-center bg-[#FAF9FF]"
    >
        <ActivityIndicator size="large" color="#7957DC" />

        <Text className="mt-4 text-[14px] text-[#817995]">
        Preparando tu horario...
        </Text>
    </SafeAreaView>
    );
}

if (classesError) {
    return (
    <SafeAreaView className="flex-1 bg-[#FAF9FF] px-6">
        <View className="flex-1 items-center justify-center">
        <IoniconsPlaceholder />

        <Text className="mt-4 text-center text-[18px] font-bold text-[#292342]">
            No pudimos cargar tus materias
        </Text>

        <Text className="mt-2 text-center text-[14px] text-[#817995]">
            {classesError}
        </Text>

        <Pressable
            onPress={() => {
            void refreshClasses();
            }}
            className="mt-6 rounded-2xl bg-[#7957DC] px-8 py-4"
        >
            <Text className="font-bold text-white">
            Reintentar
            </Text>
        </Pressable>
        </View>
    </SafeAreaView>
    );
}

if (availableDays.length === 0) {
    return (
    <SafeAreaView
        className="flex-1 items-center justify-center bg-[#FAF9FF]"
    >
        <Text className="text-center text-[#817995]">
        No hay días de universidad configurados.
        </Text>
    </SafeAreaView>
    );
}

return (
    <SafeAreaView
    className="flex-1 bg-[#FAF9FF]"
    edges={['top', 'bottom']}
    >
    <View className="flex-1">
        <ClassForm
        availableDays={availableDays}
        saving={saving || submitting}
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
        />
    </View>
    </SafeAreaView>
);
}

// Icono del estado de error.
function IoniconsPlaceholder() {
return (
    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE6FF]">
    <Text className="text-[30px]">📚</Text>
    </View>
);
}
