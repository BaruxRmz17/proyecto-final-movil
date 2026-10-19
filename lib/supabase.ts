// lib/supabase.ts
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey =
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
throw new Error(
    'Faltan las variables de entorno de Supabase.'
);
}

export const supabase = createClient(
supabaseUrl,
supabaseKey,
{
    auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    },
}
);

// Actualizar los tokens cuando la app está activa
if (Platform.OS !== 'web') {
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
    supabase.auth.startAutoRefresh();
    } else {
    supabase.auth.stopAutoRefresh();
    }
});
}
