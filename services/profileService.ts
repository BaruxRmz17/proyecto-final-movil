import { supabase } from '@/lib/supabase';

import type {
ProfilePayload,
ProfileRecord,
UpdateProfileInput,
} from '@/types/profile';

function getDatabaseErrorMessage(error: {
code?: string;
message?: string;
}): string {
if (
    error.code === '42703' &&
    (error.message?.includes('avatar_color') ||
    error.message?.includes('avatar_emoji'))
) {
    return 'Falta actualizar la tabla profiles en Supabase. Ejecuta la migración de personalización del perfil y vuelve a intentarlo.';
}

return error.message || 'No se pudo guardar el perfil.';
}

async function getCurrentUser() {
const {
    data: { user },
    error,
} = await supabase.auth.getUser();

if (error || !user) {
    throw new Error('Debes iniciar sesión para consultar tu perfil.');
}

return user;
}

export async function getProfile(): Promise<ProfilePayload> {
const user = await getCurrentUser();

const { data, error } = await supabase
    .from('profiles')
    .select(
    'id, nombre_completo, universidad, carrera, semestre, avatar_color, avatar_emoji, created_at'
    )
    .eq('id', user.id)
    .maybeSingle();

if (error) throw new Error(getDatabaseErrorMessage(error));

return {
    profile: (data as ProfileRecord | null) ?? null,
    email: user.email ?? null,
};
}

export async function updateProfile(
input: UpdateProfileInput
): Promise<ProfileRecord> {
const user = await getCurrentUser();

const { data, error } = await supabase
    .from('profiles')
    .upsert(
    {
        id: user.id,
        nombre_completo: input.nombre_completo.trim(),
        universidad: input.universidad.trim() || null,
        carrera: input.carrera.trim() || null,
        semestre: input.semestre,
        avatar_color: input.avatar_color,
        avatar_emoji: input.avatar_emoji,
    },
    { onConflict: 'id' }
    )
    .select(
    'id, nombre_completo, universidad, carrera, semestre, avatar_color, avatar_emoji, created_at'
    )
    .single();

if (error) throw new Error(getDatabaseErrorMessage(error));

return data as ProfileRecord;
}
