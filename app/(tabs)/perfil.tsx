import { useCallback, useState } from 'react';
import {
ActivityIndicator,
Alert,
KeyboardAvoidingView,
Platform,
Pressable,
ScrollView,
Text,
TextInput,
View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearAllTaskNotifications } from '@/services/taskNotificationsService';
import { supabase } from '@/lib/supabase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
clearProfile,
fetchProfile,
updateProfileAsync,
} from '@/store/slices/profileSlice';

import {
PROFILE_AVATAR_COLORS,
PROFILE_AVATAR_EMOJIS,
} from '@/types/profile';
import type { UpdateProfileInput } from '@/types/profile';

const EMPTY_FORM: UpdateProfileInput = {
nombre_completo: '',
universidad: '',
carrera: '',
semestre: null,
avatar_color: PROFILE_AVATAR_COLORS[0],
avatar_emoji: null,
};

function getInitials(name: string): string {
const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

return initials || 'CM';
}

export default function PerfilScreen() {
const router = useRouter();
const dispatch = useAppDispatch();

const {
    profile,
    email,
    loading,
    saving,
    error,
} = useAppSelector((state) => state.profile);

const [editing, setEditing] = useState(false);
const [loggingOut, setLoggingOut] = useState(false);
const [form, setForm] = useState<UpdateProfileInput>(
    EMPTY_FORM
);

useFocusEffect(
    useCallback(() => {
    void dispatch(fetchProfile());
    }, [dispatch])
);

const displayName =
    profile?.nombre_completo?.trim() || 'Estudiante';
const avatarColor =
    profile?.avatar_color || PROFILE_AVATAR_COLORS[0];
const avatarEmoji = profile?.avatar_emoji || null;
const previewColor = editing
    ? form.avatar_color
    : avatarColor;
const previewEmoji = editing
    ? form.avatar_emoji
    : avatarEmoji;
const university = profile?.universidad?.trim() || 'Sin universidad';
const career = profile?.carrera?.trim() || 'Sin carrera';
const semester = profile?.semestre
    ? `Semestre ${profile.semestre}`
    : 'Semestre no registrado';

const startEditing = () => {
    setForm({
    nombre_completo: profile?.nombre_completo ?? '',
    universidad: profile?.universidad ?? '',
    carrera: profile?.carrera ?? '',
    semestre: profile?.semestre ?? null,
    avatar_color:
        profile?.avatar_color || PROFILE_AVATAR_COLORS[0],
    avatar_emoji: profile?.avatar_emoji ?? null,
    });
    setEditing(true);
};

const updateField = <K extends keyof UpdateProfileInput>(
    field: K,
    value: UpdateProfileInput[K]
) => {
    setForm((current) => ({
    ...current,
    [field]: value,
    }));
};

const handleSave = async () => {
    const name = form.nombre_completo.trim();

    if (!name) {
    Alert.alert(
        'Nombre requerido',
        'Escribe tu nombre completo para guardar el perfil.'
    );
    return;
    }

    if (
    form.semestre !== null &&
    (form.semestre < 1 || form.semestre > 20)
    ) {
    Alert.alert(
        'Semestre inválido',
        'El semestre debe estar entre 1 y 20.'
    );
    return;
    }

    try {
    await dispatch(
        updateProfileAsync({
        ...form,
        nombre_completo: name,
        universidad: form.universidad.trim(),
        carrera: form.carrera.trim(),
        })
    ).unwrap();

    setEditing(false);
    Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.');
    } catch {
    // El error visible se mantiene en el estado global del perfil.
    }
};

const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error: logoutError } = await supabase.auth.signOut({
    scope: 'local',
    });

    if (logoutError) {
    setLoggingOut(false);
    Alert.alert('Error', 'No se pudo cerrar sesión.');
    return;
    }

    dispatch(clearProfile());
    await clearAllTaskNotifications();
    router.replace('/login');
};

if (loading && !profile) {
    return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF9FF]">
        <ActivityIndicator size="large" color="#7957DC" />
        <Text className="mt-4 text-[#817995]">
        Cargando tu perfil...
        </Text>
    </SafeAreaView>
    );
}

return (
    <SafeAreaView
    className="flex-1 bg-[#FAF9FF]"
    edges={['top', 'bottom']}
    >
    <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <ScrollView
        className="flex-1"
        contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        >
        <View className="mb-7 flex-row items-center justify-between">
            <View>
            <Text className="text-[30px] font-extrabold text-[#292342]">
                Mi perfil
            </Text>

            <Text className="mt-2 text-[14px] text-[#817995]">
                Tu información universitaria
            </Text>
            </View>

            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#EDE6FF]">
            <Ionicons
                name="person-outline"
                size={27}
                color="#7957DC"
            />
            </View>
        </View>

        <View
        className="mb-6 rounded-3xl p-6"
        style={{ backgroundColor: previewColor }}
        >
            <View className="flex-row items-center">
            <View className="h-[70px] w-[70px] items-center justify-center rounded-full bg-white/20">
                <Text className="text-[24px] font-extrabold text-white">
                {previewEmoji || getInitials(displayName)}
                </Text>
            </View>

            <View className="ml-4 flex-1">
                <Text className="text-[21px] font-extrabold text-white">
                {displayName}
                </Text>

                <Text className="mt-1 text-[13px] text-white/80">
                {email || 'Correo no disponible'}
                </Text>
            </View>
            </View>

            <View className="mt-6 flex-row items-center rounded-2xl bg-white/15 p-3">
            <Ionicons
                name="school-outline"
                size={20}
                color="white"
            />

            <Text className="ml-3 flex-1 text-[13px] text-white">
                {university}
            </Text>
            </View>

            <Pressable
            onPress={startEditing}
            className="mt-4 flex-row items-center self-start rounded-xl bg-white/20 px-3 py-2"
            >
            <Ionicons
                name="color-palette-outline"
                size={16}
                color="white"
            />
            <Text className="ml-2 text-[12px] font-bold text-white">
                Personalizar tarjeta
            </Text>
            </Pressable>
        </View>

        {error && (
            <View className="mb-5 rounded-2xl bg-red-50 p-4">
            <Text className="text-[13px] leading-5 text-red-600">
                {error}
            </Text>

            <Pressable
                onPress={() => void dispatch(fetchProfile())}
                className="mt-3 self-start rounded-xl bg-white px-4 py-2"
            >
                <Text className="font-bold text-[#7957DC]">
                Reintentar
                </Text>
            </Pressable>
            </View>
        )}

        {!editing ? (
            <>
            <View className="mb-5 rounded-3xl bg-white p-5">
                <View className="mb-5 flex-row items-center justify-between">
                <Text className="text-[18px] font-bold text-[#292342]">
                    Información académica
                </Text>

                <Pressable
                    onPress={startEditing}
                    className="flex-row items-center rounded-xl bg-[#EDE6FF] px-3 py-2"
                >
                    <Ionicons
                    name="create-outline"
                    size={17}
                    color="#7957DC"
                    />
                    <Text className="ml-1 font-bold text-[#7957DC]">
                    Editar
                    </Text>
                </Pressable>
                </View>

                <ProfileRow
                icon="school-outline"
                label="Universidad"
                value={university}
                />
                <ProfileRow
                icon="book-outline"
                label="Carrera"
                value={career}
                />
                <ProfileRow
                icon="layers-outline"
                label="Semestre"
                value={semester}
                last
                />
            </View>

            <View className="mb-5 rounded-3xl bg-white p-5">
                <Text className="mb-4 text-[18px] font-bold text-[#292342]">
                Cuenta
                </Text>

                <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EDE6FF]">
                    <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#7957DC"
                    />
                </View>

                <View className="ml-3 flex-1">
                    <Text className="text-[12px] text-[#817995]">
                    Correo electrónico
                    </Text>
                    <Text className="mt-1 font-semibold text-[#292342]">
                    {email || 'No disponible'}
                    </Text>
                </View>
                </View>
            </View>
            </>
        ) : (
            <View className="mb-5 rounded-3xl bg-white p-5">
            <View className="mb-5 flex-row items-center justify-between">
                <Text className="text-[18px] font-bold text-[#292342]">
                Editar perfil
                </Text>

                <Pressable
                onPress={() => setEditing(false)}
                disabled={saving}
                >
                <Text className="font-semibold text-[#817995]">
                    Cancelar
                </Text>
                </Pressable>
            </View>

            <ProfileInput
                label="Nombre completo"
                value={form.nombre_completo}
                placeholder="Tu nombre completo"
                onChangeText={(value) =>
                updateField('nombre_completo', value)
                }
                autoCapitalize="words"
            />
            <ProfileInput
                label="Universidad"
                value={form.universidad}
                placeholder="Ej. Universidad Autónoma"
                onChangeText={(value) =>
                updateField('universidad', value)
                }
                autoCapitalize="words"
            />
            <ProfileInput
                label="Carrera"
                value={form.carrera}
                placeholder="Ej. Ingeniería de Software"
                onChangeText={(value) =>
                updateField('carrera', value)
                }
                autoCapitalize="words"
            />
            <ProfileInput
                label="Semestre"
                value={form.semestre?.toString() ?? ''}
                placeholder="Ej. 5"
                onChangeText={(value) => {
                const normalized = value.replace(/[^0-9]/g, '');
                updateField(
                    'semestre',
                    normalized ? Number(normalized) : null
                );
                }}
                keyboardType="number-pad"
                maxLength={2}
            />

            <Text className="mb-3 mt-2 text-[16px] font-bold text-[#292342]">
                Personaliza tu tarjeta
            </Text>

            <Text className="mb-2 text-[13px] text-[#817995]">
                Color
            </Text>

            <View className="mb-4 flex-row">
                {PROFILE_AVATAR_COLORS.map((color) => {
                const selected = form.avatar_color === color;

                return (
                    <Pressable
                    key={color}
                    accessibilityRole="button"
                    accessibilityLabel={`Color ${color}`}
                    onPress={() =>
                        updateField('avatar_color', color)
                    }
                    className="mr-3 h-11 w-11 items-center justify-center rounded-full border-2"
                    style={{
                        backgroundColor: color,
                        borderColor: selected
                        ? '#292342'
                        : 'transparent',
                    }}
                    >
                    {selected && (
                        <Ionicons
                        name="checkmark"
                        size={20}
                        color="white"
                        />
                    )}
                    </Pressable>
                );
                })}
            </View>

            <Text className="mb-2 text-[13px] text-[#817995]">
                Avatar
            </Text>

            <View className="mb-4 flex-row flex-wrap">
                <Pressable
                onPress={() => updateField('avatar_emoji', null)}
                className="mb-2 mr-2 h-11 w-11 items-center justify-center rounded-full border-2"
                style={{
                    backgroundColor: '#FAF9FF',
                    borderColor:
                    form.avatar_emoji === null
                        ? '#292342'
                        : '#EAE6F3',
                }}
                >
                <Text className="font-bold text-[#292342]">
                    Aa
                </Text>
                </Pressable>

                {PROFILE_AVATAR_EMOJIS.map((emoji) => {
                const selected = form.avatar_emoji === emoji;

                return (
                    <Pressable
                    key={emoji}
                    onPress={() =>
                        updateField('avatar_emoji', emoji)
                    }
                    className="mb-2 mr-2 h-11 w-11 items-center justify-center rounded-full border-2 bg-[#FAF9FF]"
                    style={{
                        borderColor: selected
                        ? '#292342'
                        : '#EAE6F3',
                    }}
                    >
                    <Text className="text-[21px]">
                        {emoji}
                    </Text>
                    </Pressable>
                );
                })}
            </View>

            <Pressable
                onPress={() => void handleSave()}
                disabled={saving}
                className="mt-2 min-h-[54px] flex-row items-center justify-center rounded-2xl bg-[#7957DC]"
                style={{ opacity: saving ? 0.6 : 1 }}
            >
                {saving ? (
                <ActivityIndicator color="#FFFFFF" />
                ) : (
                <>
                    <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="white"
                    />
                    <Text className="ml-2 font-bold text-white">
                    Guardar cambios
                    </Text>
                </>
                )}
            </Pressable>
            </View>
        )}

        <Pressable
            onPress={() => void handleLogout()}
            disabled={loggingOut}
            className="min-h-[54px] flex-row items-center justify-center rounded-2xl bg-[#FDECEC]"
            style={{ opacity: loggingOut ? 0.6 : 1 }}
        >
            {loggingOut ? (
            <ActivityIndicator color="#DC2626" />
            ) : (
            <>
                <Ionicons
                name="log-out-outline"
                size={22}
                color="#DC2626"
                />
                <Text className="ml-2 font-bold text-red-600">
                Cerrar sesión
                </Text>
            </>
            )}
        </Pressable>
        </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
);
}

interface ProfileRowProps {
icon: keyof typeof Ionicons.glyphMap;
label: string;
value: string;
last?: boolean;
}

function ProfileRow({
icon,
label,
value,
last = false,
}: ProfileRowProps) {
return (
    <View
    className={`flex-row items-center py-3 ${
        last ? '' : 'border-b border-[#F0EDF7]'
    }`}
    >
    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FAF9FF]">
        <Ionicons name={icon} size={20} color="#7957DC" />
    </View>

    <View className="ml-3 flex-1">
        <Text className="text-[12px] text-[#817995]">
        {label}
        </Text>
        <Text className="mt-1 font-semibold text-[#292342]">
        {value}
        </Text>
    </View>
    </View>
);
}

interface ProfileInputProps {
label: string;
value: string;
placeholder: string;
onChangeText: (value: string) => void;
autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
keyboardType?: 'default' | 'number-pad';
maxLength?: number;
}

function ProfileInput({
label,
value,
placeholder,
onChangeText,
autoCapitalize = 'sentences',
keyboardType = 'default',
maxLength,
}: ProfileInputProps) {
return (
    <View className="mb-4">
    <Text className="mb-2 font-semibold text-[#292342]">
        {label}
    </Text>

    <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A9A2B9"
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        className="min-h-[52px] rounded-2xl border border-[#EAE6F3] bg-[#FAF9FF] px-4 text-[#292342]"
    />
    </View>
);
}
