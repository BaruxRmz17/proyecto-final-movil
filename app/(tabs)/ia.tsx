import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  getScheduleClasses,
  type ScheduleClassRecord,
} from '@/services/scheduleClassesService';
import { getTasks } from '@/services/tasksService';
import type { TaskRecord } from '@/types/tasks';

const COLORS = {
  muted: '#817995',
  primary: '#7957DC',
};

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(year, month - 1, day));
}

function getLocalAnswer(
  question: string,
  tasks: TaskRecord[],
  classes: ScheduleClassRecord[]
): string {
  const normalized = question.toLocaleLowerCase('es-MX');
  const pending = tasks
    .filter((task) => task.status === 'pending')
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const graded = tasks.filter((task) => task.grade !== null);
  const possible = graded.reduce((sum, task) => sum + task.grade_max, 0);
  const earned = graded.reduce((sum, task) => sum + (task.grade ?? 0), 0);
  const average = possible ? (earned / possible) * 100 : null;

  if (/hola|buenas|hey|qué onda|que onda/.test(normalized)) {
    return '¡Qué onda! Soy tu asistente de Campus Mind. Puedo ayudarte a revisar pendientes, materias, calificaciones y tu avance.';
  }

  if (/pendiente|tarea|entrega|debo|debería|prioridad/.test(normalized)) {
    if (!pending.length) {
      return 'No tienes tareas pendientes registradas. ¡Buen trabajo!';
    }

    const preview = pending
      .slice(0, 3)
      .map(
        (task, index) =>
          `${index + 1}. ${task.title} — ${formatDate(task.due_date)}`
      )
      .join('\n');

    return `Tienes ${pending.length} tarea${pending.length === 1 ? '' : 's'} pendiente${pending.length === 1 ? '' : 's'}. Te recomiendo empezar por la entrega más cercana:\n\n${preview}`;
  }

  if (/calific|promedio|nota|rendimiento/.test(normalized)) {
    if (average === null) {
      return 'Todavía no tienes actividades calificadas. Cuando registres una nota podré ayudarte a analizar tu rendimiento.';
    }

    return `Tu promedio actual es de ${average.toFixed(1)}%. Tienes ${graded.length} actividad${graded.length === 1 ? '' : 'es'} calificada${graded.length === 1 ? '' : 's'}. Puedes preguntarme por una materia específica.`;
  }

  if (/materia|horario|clase/.test(normalized)) {
    if (!classes.length) {
      return 'Todavía no tienes materias registradas en tu horario.';
    }

    return `Tienes ${classes.length} materia${classes.length === 1 ? '' : 's'} registrada${classes.length === 1 ? '' : 's'}: ${classes.map((item) => item.subject).join(', ')}.`;
  }

  if (/estadística|estadistica|avance|progreso/.test(normalized)) {
    const completed = tasks.filter(
      (task) => task.status === 'completed'
    ).length;
    const progress = tasks.length ? (completed / tasks.length) * 100 : 0;

    return `Has completado ${completed} de ${tasks.length} tareas, un avance del ${progress.toFixed(0)}%.`;
  }

  return 'Por ahora puedo ayudarte con tus pendientes, materias, calificaciones y avance. Prueba preguntando: “¿Qué tareas tengo pendientes?”';
}

export default function IaScreen() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [classes, setClasses] = useState<ScheduleClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([
    '¿Qué tareas tengo pendientes?',
    '¿Cuál es mi promedio?',
    '¿Cuántas materias tengo?',
  ]);
  const sendScale = useRef(new Animated.Value(1)).current;
  const typingPulse = useRef(new Animated.Value(0.45)).current;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '¡Hola! Soy tu asistente de Campus Mind. Pregúntame por tus tareas, materias, calificaciones o avance.',
    },
  ]);

  const loadContext = useCallback(async () => {
    setLoading(true);

    try {
      const [taskData, classData] = await Promise.all([
        getTasks(),
        getScheduleClasses(),
      ]);
      setTasks(taskData);
      setClasses(classData);
    } catch {
      // El chat puede funcionar con el contexto vacío.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  useEffect(() => {
    if (!sending) {
      typingPulse.stopAnimation();
      typingPulse.setValue(0.45);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(typingPulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(typingPulse, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [sending, typingPulse]);

  const removeUsedSuggestion = useCallback((question: string) => {
    const normalized = question.toLocaleLowerCase('es-MX');

    setSuggestions((current) =>
      current.filter((suggestion) => {
        const suggestionText = suggestion.toLocaleLowerCase('es-MX');

        if (normalized === suggestionText) return false;
        if (suggestionText.includes('tareas')) {
          return !/tarea|pendiente|entrega/.test(normalized);
        }
        if (suggestionText.includes('promedio')) {
          return !/promedio|calific|nota|rendimiento/.test(normalized);
        }
        if (suggestionText.includes('materias')) {
          return !/materia|clase|horario/.test(normalized);
        }

        return true;
      })
    );
  }, []);

  const sendMessage = useCallback(
    async (value = input) => {
      const question = value.trim();
      if (!question || sending) return;

      setInput('');
      setSending(true);
      removeUsedSuggestion(question);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Animated.sequence([
        Animated.timing(sendScale, {
          toValue: 0.82,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.spring(sendScale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
      setMessages((current) => [
        ...current,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          text: question,
        },
      ]);

      await new Promise((resolve) => setTimeout(resolve, 350));

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: getLocalAnswer(question, tasks, classes),
        },
      ]);
      setSending(false);
    },
    [classes, input, removeUsedSuggestion, sendScale, sending, tasks]
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAF9FF]" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="px-6 pb-4 pt-7">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[30px] font-extrabold text-[#292342]">
                Agente IA
              </Text>
              <Text className="mt-2 text-[14px] text-[#817995]">
                Tu asistente académico de Campus Mind
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE6FF]">
              <Ionicons name="sparkles" size={24} color={COLORS.primary} />
            </View>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="mt-4 text-[#817995]">
              Preparando tu contexto...
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <Animated.View
                key={message.id}
                className={`mb-4 max-w-[88%] rounded-3xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'self-end rounded-br-md bg-[#7957DC]'
                    : 'self-start rounded-bl-md bg-white'
                }`}
              >
                <Text
                  className={`text-[15px] leading-6 ${
                    message.role === 'user'
                      ? 'text-white'
                      : 'text-[#292342]'
                  }`}
                >
                  {message.text}
                </Text>
              </Animated.View>
            ))}

            {sending && (
              <Animated.View
                style={{
                  opacity: typingPulse,
                  transform: [
                    {
                      scale: typingPulse.interpolate({
                        inputRange: [0.45, 1],
                        outputRange: [0.94, 1],
                      }),
                    },
                  ],
                }}
                className="mb-4 self-start rounded-3xl rounded-bl-md bg-white px-5 py-4"
              >
                <View className="flex-row items-center gap-1">
                  <View className="h-2 w-2 rounded-full bg-[#7957DC]" />
                  <View className="h-2 w-2 rounded-full bg-[#A995EF]" />
                  <View className="h-2 w-2 rounded-full bg-[#D3C8FA]" />
                </View>
              </Animated.View>
            )}

            <Text className="mb-3 mt-2 text-[13px] font-bold text-[#817995]">
              Prueba preguntando
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => void sendMessage(suggestion)}
                  className="rounded-2xl bg-[#EDE6FF] px-4 py-3"
                >
                  <Text className="text-[12px] font-semibold text-[#7957DC]">
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}

        <View className="border-t border-[#EAE6F3] bg-[#FAF9FF] px-5 pb-3 pt-3">
          <View className="flex-row items-end rounded-3xl bg-white px-4 py-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor={COLORS.muted}
              multiline
              maxLength={500}
              onSubmitEditing={() => void sendMessage()}
              className="max-h-24 min-h-11 flex-1 py-2 text-[15px] text-[#292342]"
              editable={!loading && !sending}
            />
            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
            <Pressable
              onPress={() => void sendMessage()}
              disabled={!input.trim() || sending}
              accessibilityRole="button"
              accessibilityLabel="Enviar mensaje"
              className="ml-2 h-11 w-11 items-center justify-center rounded-2xl bg-[#7957DC] disabled:opacity-40"
            >
              <Ionicons name="arrow-up" size={21} color="white" />
            </Pressable>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
