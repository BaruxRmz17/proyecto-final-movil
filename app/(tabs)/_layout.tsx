
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export default function TabsLayout() {
const [session, setSession] = useState<Session | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
    if (mounted) {
        setSession(data.session);
        setLoading(false);
    }
    });

    const { data: listener } =
    supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setLoading(false);
    });

    return () => {
    mounted = false;
    listener.subscription.unsubscribe();
    };
}, []);

if (loading) {
    return (
    <View className="flex-1 items-center justify-center bg-[#FAF9FF]">
        <ActivityIndicator size="large" color="#7957DC" />
    </View>
    );
}

if (!session) {
    return <Redirect href="/login" />;
}

return (
    <Tabs
    screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7957DC',
        tabBarInactiveTintColor: '#817995',
        tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0,
        height: 85,
        paddingTop: 10,
        paddingBottom: 22,
        },
        tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        },
    }}
    >
    <Tabs.Screen
        name="index"
        options={{
        title: 'Inicio',
        tabBarIcon: ({ color, focused }) => (
            <Ionicons
            name={focused ? 'home' : 'home-outline'}
            size={23}
            color={typeof color === 'string' ? color : '#7957DC'}
            />
        ),
        }}
    />

    <Tabs.Screen
        name="horario"
        options={{
        title: 'Horario',
        tabBarIcon: ({ color, focused }) => (
            <Ionicons
            name={focused ? 'calendar' : 'calendar-outline'}
            size={23}
            color={typeof color === 'string' ? color : '#7957DC'}
            />
        ),
        }}
    />

    <Tabs.Screen
        name="tareas"
        options={{
        title: 'Tareas',
        tabBarIcon: ({ color, focused }) => (
            <Ionicons
            name={focused ? 'checkbox' : 'checkbox-outline'}
            size={23}
            color={typeof color === 'string' ? color : '#7957DC'}
            />
        ),
        }}
    />

    <Tabs.Screen
        name="ia"
        options={{
        title: 'IA',
        tabBarIcon: ({ color, focused }) => (
            <Ionicons
            name={focused ? 'sparkles' : 'sparkles-outline'}
            size={23}
            color={typeof color === 'string' ? color : '#7957DC'}
            />
        ),
        }}
    />

    <Tabs.Screen
        name="perfil"
        options={{
        title: 'Perfil',
        tabBarIcon: ({ color, focused }) => (
            <Ionicons
            name={focused ? 'person' : 'person-outline'}
            size={23}
            color={typeof color === 'string' ? color : '#7957DC'}
            />
        ),
        }}
    />
    </Tabs>
);
}
