
import { useCallback } from 'react';
import {
ActivityIndicator,
Alert,
Pressable,
Text,
View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskForm } from '@/components/organisms/TaskForm';
import { useScheduleClasses } from '@/hooks/useScheduleClasses';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addTaskAsync } from '@/store/slices/tasksSlice';

export default function NewTaskScreen() {
const router = useRouter();
const dispatch = useAppDispatch();

const { saving } = useAppSelector(
    (state) => state.tasks
);

const {
    classes,
    loading,
    error,
    refreshClasses,
} = useScheduleClasses();

useFocusEffect(
    useCallback(() => {
    void refreshClasses();
    }, [refreshClasses])
);

if (loading) {
    return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF9FF]">
        <ActivityIndicator size="large" color="#7957DC" />
        <Text className="mt-4 text-[#817995]">
        Cargando materias...
        </Text>
    </SafeAreaView>
    );
}

if (error) {
    return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF9FF] px-6">
        <Text className="text-center text-red-600">
        {error}
        </Text>

        <Pressable
        onPress={() => void refreshClasses()}
        className="mt-5 rounded-2xl bg-[#7957DC] px-6 py-4"
        >
        <Text className="font-bold text-white">
            Reintentar
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
    <View className="flex-1">
        <TaskForm
        classes={classes}
        saving={saving}
        onCancel={() => router.back()}
        onSubmit={async (input) => {
            await dispatch(addTaskAsync(input)).unwrap();

            Alert.alert(
            'Tarea creada',
            'Tu tarea se guardó correctamente.',
            [
                {
                text: 'Ver tareas',
                onPress: () =>
                    router.replace('/(tabs)/tareas'),
                },
            ]
            );
        }}
        />
    </View>
    </SafeAreaView>
);
}
