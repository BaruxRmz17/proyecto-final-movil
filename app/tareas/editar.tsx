
import { useCallback } from 'react';
import {
ActivityIndicator,
Alert,
Pressable,
Text,
View,
} from 'react-native';
import {
useFocusEffect,
useLocalSearchParams,
useRouter,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskForm } from '@/components/organisms/TaskForm';
import { useScheduleClasses } from '@/hooks/useScheduleClasses';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
editTaskAsync,
fetchTasks,
} from '@/store/slices/tasksSlice';

export default function EditTaskScreen() {
const router = useRouter();
const { id } = useLocalSearchParams<{ id: string }>();
const dispatch = useAppDispatch();

const { items, loading, saving } = useAppSelector(
    (state) => state.tasks
);

const {
    classes,
    loading: loadingClasses,
    refreshClasses,
} = useScheduleClasses();

useFocusEffect(
    useCallback(() => {
    void dispatch(fetchTasks());
    void refreshClasses();
    }, [dispatch, refreshClasses])
);

const task = items.find((item) => item.id === id);

if ((loading || loadingClasses) && !task) {
    return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF9FF]">
        <ActivityIndicator size="large" color="#7957DC" />
    </SafeAreaView>
    );
}

if (!task) {
    return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF9FF] px-6">
        <Text className="text-center font-bold text-[#292342]">
        No encontramos la tarea que quieres editar.
        </Text>

        <Pressable
        onPress={() => router.replace('/(tabs)/tareas')}
        className="mt-5 rounded-2xl bg-[#7957DC] px-6 py-4"
        >
        <Text className="font-bold text-white">
            Volver a tareas
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
        key={task.id}
        classes={classes}
        initialData={task}
        saving={saving}
        onCancel={() => router.back()}
        onSubmit={async (input) => {
            await dispatch(
            editTaskAsync({
                id: task.id,
                input,
            })
            ).unwrap();

            Alert.alert(
            'Cambios guardados',
            'La tarea se actualizó correctamente.',
            [
                {
                text: 'Aceptar',
                onPress: () =>
                    router.replace({
                    pathname: '/tareas/[id]',
                    params: { id: task.id },
                    }),
                },
            ]
            );
        }}
        />
    </View>
    </SafeAreaView>
);
}
