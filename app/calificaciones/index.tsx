import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useScheduleClasses } from '@/hooks/useScheduleClasses';
import { getGradedTasks } from '@/services/tasksService';
import type { TaskRecord } from '@/types/tasks';

const COLORS = {
  text: '#292342',
  muted: '#817995',
  primary: '#7957DC',
};

interface SubjectSummary {
  classId: string;
  name: string;
  color: string;
  earned: number;
  possible: number;
  tasks: TaskRecord[];
}

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(year, month - 1, day));
}

export default function CalificacionesScreen() {
  const router = useRouter();
  const { classes } = useScheduleClasses();
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGrades = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      setTasks(await getGradedTasks());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar tus calificaciones.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadGrades();
    }, [loadGrades])
  );

  const subjects = new Map<string, SubjectSummary>();

  for (const task of tasks) {
    const subject = classes.find((item) => item.id === task.class_id);
    const current = subjects.get(task.class_id) ?? {
      classId: task.class_id,
      name: subject?.subject ?? 'Materia no disponible',
      color: subject?.color ?? COLORS.primary,
      earned: 0,
      possible: 0,
      tasks: [],
    };

    current.earned += task.grade ?? 0;
    current.possible += task.grade_max;
    current.tasks.push(task);
    subjects.set(task.class_id, current);
  }

  const subjectSummaries = Array.from(subjects.values());
  const totalEarned = tasks.reduce(
    (total, task) => total + (task.grade ?? 0),
    0
  );
  const totalPossible = tasks.reduce(
    (total, task) => total + task.grade_max,
    0
  );
  const generalAverage = totalPossible
    ? (totalEarned / totalPossible) * 100
    : null;

  return (
    <SafeAreaView
      className="flex-1 bg-[#FAF9FF]"
      edges={['top', 'bottom']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadGrades(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        <View className="mb-7 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-white"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.text}
            />
          </Pressable>

          <View className="flex-1">
            <Text className="text-[29px] font-extrabold text-[#292342]">
              Mis calificaciones
            </Text>
            <Text className="mt-1 text-[14px] text-[#817995]">
              Tu avance académico por materia
            </Text>
          </View>

          <Pressable
            onPress={() => void loadGrades(true)}
            accessibilityRole="button"
            accessibilityLabel="Actualizar calificaciones"
            className="h-11 w-11 items-center justify-center rounded-2xl bg-white"
          >
            <Ionicons
              name="refresh-outline"
              size={21}
              color={COLORS.primary}
            />
          </Pressable>
        </View>

        <View className="rounded-[28px] bg-[#7957DC] p-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[14px] font-semibold text-white/75">
                Promedio general
              </Text>
              <Text className="mt-2 text-[42px] font-extrabold text-white">
                {generalAverage === null
                  ? '--'
                  : formatScore(generalAverage)}
              </Text>
              <Text className="mt-1 text-[12px] text-white/75">
                sobre 100 · ponderado por puntos
              </Text>
            </View>

            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Ionicons
                name="bar-chart-outline"
                size={31}
                color="white"
              />
            </View>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-white/15 p-3">
              <Text className="text-[11px] text-white/75">
                Materias
              </Text>
              <Text className="mt-1 text-[19px] font-bold text-white">
                {subjectSummaries.length}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-white/15 p-3">
              <Text className="text-[11px] text-white/75">
                Actividades
              </Text>
              <Text className="mt-1 text-[19px] font-bold text-white">
                {tasks.length}
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View className="items-center py-14">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="mt-4 text-[#817995]">
              Cargando calificaciones...
            </Text>
          </View>
        ) : error ? (
          <View className="mt-6 rounded-2xl bg-red-50 p-5">
            <Text className="text-red-600">{error}</Text>
            <Pressable
              onPress={() => void loadGrades()}
              className="mt-4 self-start rounded-xl bg-white px-4 py-3"
            >
              <Text className="font-bold text-[#7957DC]">
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : subjectSummaries.length === 0 ? (
          <View className="mt-6 items-center rounded-3xl bg-white px-6 py-10">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE6FF]">
              <Ionicons
                name="school-outline"
                size={31}
                color={COLORS.primary}
              />
            </View>
            <Text className="mt-5 text-center text-[18px] font-bold text-[#292342]">
              Aún no hay calificaciones
            </Text>
            <Text className="mt-2 text-center text-[14px] leading-5 text-[#817995]">
              Registra la nota de una tarea desde su formulario para comenzar a calcular tus promedios.
            </Text>
            <Pressable
              onPress={() => router.replace('/(tabs)/tareas')}
              className="mt-5 rounded-xl bg-[#7957DC] px-5 py-3"
            >
              <Text className="font-bold text-white">
                Ir a mis tareas
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[22px] font-extrabold text-[#292342]">
                Por materia
              </Text>
              <Text className="text-[12px] text-[#817995]">
                {tasks.length} con nota
              </Text>
            </View>

            {subjectSummaries.map((subject) => {
              const average = subject.possible
                ? (subject.earned / subject.possible) * 100
                : 0;

              return (
                <View
                  key={subject.classId}
                  className="mb-4 rounded-3xl bg-white p-5"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <View
                        className="mr-3 h-10 w-2 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <View className="flex-1">
                        <Text className="text-[17px] font-bold text-[#292342]">
                          {subject.name}
                        </Text>
                        <Text className="mt-1 text-[12px] text-[#817995]">
                          {subject.tasks.length}{' '}
                          {subject.tasks.length === 1
                            ? 'actividad calificada'
                            : 'actividades calificadas'}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-[24px] font-extrabold text-[#7957DC]">
                      {formatScore(average)}
                    </Text>
                  </View>

                  <View className="mt-4 h-2 overflow-hidden rounded-full bg-[#EDE6FF]">
                    <View
                      className="h-full rounded-full bg-[#7957DC]"
                      style={{ width: `${Math.min(average, 100)}%` }}
                    />
                  </View>

                  <Text className="mt-2 text-[11px] text-[#817995]">
                    {formatScore(subject.earned)} de{' '}
                    {formatScore(subject.possible)} puntos
                  </Text>

                  <View className="mt-4 border-t border-[#F0EDF7] pt-3">
                    {subject.tasks.map((task) => (
                      <Pressable
                        key={task.id}
                        onPress={() =>
                          router.push({
                            pathname: '/tareas/[id]',
                            params: { id: task.id },
                          })
                        }
                        className="flex-row items-center py-2"
                      >
                        <View className="flex-1 pr-3">
                          <Text
                            numberOfLines={1}
                            className="text-[13px] font-semibold text-[#292342]"
                          >
                            {task.title}
                          </Text>
                          <Text className="mt-1 text-[11px] text-[#817995]">
                            {formatDate(task.due_date)}
                          </Text>
                        </View>
                        <Text className="font-bold text-[#292342]">
                          {formatScore(task.grade ?? 0)}/
                          {formatScore(task.grade_max)}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={COLORS.muted}
                          style={{ marginLeft: 6 }}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View className="mt-2 flex-row items-start rounded-2xl border border-[#EAE6F3] bg-white p-4">
          <Ionicons
            name="information-circle-outline"
            size={21}
            color={COLORS.primary}
          />
          <Text className="ml-3 flex-1 text-[13px] leading-5 text-[#817995]">
            Tu promedio se calcula con los puntos obtenidos entre los puntos posibles. Es una referencia personal, no una calificación oficial.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
