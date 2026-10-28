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
import { getTasks } from '@/services/tasksService';
import type { TaskRecord } from '@/types/tasks';

const COLORS = {
  background: '#FAF9FF',
  text: '#292342',
  muted: '#817995',
  primary: '#7957DC',
  lavender: '#EDE6FF',
};

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="flex-1 rounded-3xl bg-white p-5">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EDE6FF]">
        <Ionicons name={icon} size={21} color={COLORS.primary} />
      </View>
      <Text className="mt-4 text-[27px] font-extrabold text-[#292342]">
        {value}
      </Text>
      <Text className="mt-1 text-[12px] text-[#817995]">{label}</Text>
    </View>
  );
}

export default function EstadisticasScreen() {
  const router = useRouter();
  const { classes } = useScheduleClasses();
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      setTasks(await getTasks());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar tus estadísticas.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadStatistics();
    }, [loadStatistics])
  );

  const completedTasks = tasks.filter(
    (task) => task.status === 'completed'
  ).length;
  const pendingTasks = tasks.length - completedTasks;
  const gradedTasks = tasks.filter((task) => task.grade !== null);
  const earnedPoints = gradedTasks.reduce(
    (total, task) => total + (task.grade ?? 0),
    0
  );
  const possiblePoints = gradedTasks.reduce(
    (total, task) => total + task.grade_max,
    0
  );
  const average = possiblePoints
    ? (earnedPoints / possiblePoints) * 100
    : null;
  const completionRate = tasks.length
    ? (completedTasks / tasks.length) * 100
    : 0;
  const performanceBySubject = classes.map((subject) => {
    const subjectTasks = gradedTasks.filter(
      (task) => task.class_id === subject.id
    );
    const earned = subjectTasks.reduce(
      (total, task) => total + (task.grade ?? 0),
      0
    );
    const possible = subjectTasks.reduce(
      (total, task) => total + task.grade_max,
      0
    );

    return {
      id: subject.id,
      name: subject.subject,
      color: subject.color || COLORS.primary,
      average: possible ? (earned / possible) * 100 : null,
    };
  });

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
            onRefresh={() => void loadStatistics(true)}
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
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </Pressable>

          <View className="flex-1">
            <Text className="text-[29px] font-extrabold text-[#292342]">
              Mis estadísticas
            </Text>
            <Text className="mt-1 text-[14px] text-[#817995]">
              Tu avance académico en un vistazo
            </Text>
          </View>

          <Pressable
            onPress={() => void loadStatistics(true)}
            accessibilityRole="button"
            accessibilityLabel="Actualizar estadísticas"
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
                Avance de tareas
              </Text>
              <Text className="mt-2 text-[42px] font-extrabold text-white">
                {formatScore(completionRate)}%
              </Text>
              <Text className="mt-1 text-[12px] text-white/75">
                tareas completadas
              </Text>
            </View>

            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Ionicons name="trending-up-outline" size={31} color="white" />
            </View>
          </View>

          <View className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
            <View
              className="h-full rounded-full bg-white"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </View>
        </View>

        {loading ? (
          <View className="items-center py-14">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="mt-4 text-[#817995]">
              Cargando estadísticas...
            </Text>
          </View>
        ) : error ? (
          <View className="mt-6 rounded-2xl bg-red-50 p-5">
            <Text className="text-red-600">{error}</Text>
            <Pressable
              onPress={() => void loadStatistics()}
              className="mt-4 self-start rounded-xl bg-white px-4 py-3"
            >
              <Text className="font-bold text-[#7957DC]">Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View className="mt-6 flex-row gap-3">
              <StatCard
                label="Tareas pendientes"
                value={String(pendingTasks)}
                icon="time-outline"
              />
              <StatCard
                label="Tareas completadas"
                value={String(completedTasks)}
                icon="checkmark-circle-outline"
              />
            </View>

            <View className="mt-3 flex-row gap-3">
              <StatCard
                label="Materias"
                value={String(classes.length)}
                icon="school-outline"
              />
              <StatCard
                label="Actividades calificadas"
                value={String(gradedTasks.length)}
                icon="bar-chart-outline"
              />
            </View>

            <View className="mt-6 rounded-3xl bg-white p-5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[16px] font-bold text-[#292342]">
                    Promedio actual
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#817995]">
                    Con base en tus actividades calificadas
                  </Text>
                </View>
                <Text className="text-[28px] font-extrabold text-[#7957DC]">
                  {average === null ? '--' : `${formatScore(average)}%`}
                </Text>
              </View>

              <View className="mt-5 h-2 overflow-hidden rounded-full bg-[#EDE6FF]">
                <View
                  className="h-full rounded-full bg-[#7957DC]"
                  style={{ width: `${Math.min(average ?? 0, 100)}%` }}
                />
              </View>
            </View>

            <View className="mt-6 rounded-3xl bg-white p-5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[18px] font-extrabold text-[#292342]">
                    Rendimiento por materia
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#817995]">
                    Promedio de actividades calificadas
                  </Text>
                </View>
                <Ionicons
                  name="bar-chart-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </View>

              {performanceBySubject.length === 0 ? (
                <Text className="mt-6 text-[14px] text-[#817995]">
                  Agrega materias a tu horario para ver su rendimiento.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-6"
                  contentContainerStyle={{
                    minWidth: Math.max(
                      performanceBySubject.length * 82,
                      280
                    ),
                  }}
                >
                  <View className="h-[190px] flex-row items-end border-b border-[#EAE6F3]">
                    {performanceBySubject.map((subject) => {
                      const barHeight = subject.average
                        ? Math.max(
                            (Math.min(subject.average, 100) / 100) * 140,
                            6
                          )
                        : 0;

                      return (
                        <View
                          key={subject.id}
                          className="h-full w-[82px] items-center justify-end px-2"
                        >
                          <Text className="mb-2 text-[11px] font-extrabold text-[#7957DC]">
                            {subject.average === null
                              ? '--'
                              : `${formatScore(subject.average)}%`}
                          </Text>
                          <View className="h-[140px] items-center justify-end">
                            <View
                              className="w-9 rounded-t-xl"
                              style={{
                                height: barHeight,
                                backgroundColor: subject.color,
                              }}
                            />
                          </View>
                          <Text
                            numberOfLines={1}
                            className="mt-2 w-full text-center text-[11px] font-bold text-[#292342]"
                          >
                            {subject.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
