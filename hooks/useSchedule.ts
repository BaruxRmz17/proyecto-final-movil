
import { useEffect, useState } from 'react';

import {
DEFAULT_DAYS,
ScheduleMode,
WeekDay,
WEEK_DAYS,
} from '@/types/schedule';

import {
getScheduleConfig,
saveScheduleConfig,
} from '@/services/scheduleStorage';

export function useSchedule() {
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [configured, setConfigured] = useState(false);

const [mode, setMode] = useState<ScheduleMode>('weekdays');

const [customDays, setCustomDays] =
    useState<WeekDay[]>(DEFAULT_DAYS);

const [selectedDays, setSelectedDays] =
    useState<WeekDay[]>([]);

const [activeDay, setActiveDay] = useState<WeekDay>(1);

const [error, setError] = useState<string | null>(null);

// Cargar configuración guardada
useEffect(() => {
    let cancelled = false;

    const initializeSchedule = async () => {
    try {
        const config = await getScheduleConfig();

        if (cancelled) return;

        if (config) {
        setSelectedDays(config.days);
        setCustomDays(config.days);
        setActiveDay(config.days[0]);
        setConfigured(true);
        }
    } catch (err) {
        if (!cancelled) {
        console.error('Error cargando horario:', err);
        setError('No se pudo cargar tu horario.');
        }
    } finally {
        if (!cancelled) {
        setLoading(false);
        }
    }
    };

    void initializeSchedule();

    return () => {
    cancelled = true;
    };
}, []);

// Seleccionar o quitar un día personalizado
const toggleCustomDay = (day: WeekDay) => {
    setCustomDays((current) =>
    current.includes(day)
        ? current.filter((id) => id !== day)
        : [...current, day]
    );
};

// Guardar los días seleccionados
const save = async (): Promise<boolean> => {
    if (saving) return false;

    let days: WeekDay[];

    if (mode === 'weekdays') {
    days = [1, 2, 3, 4, 5];
    } else if (mode === 'saturday') {
    days = [1, 2, 3, 4, 5, 6];
    } else {
    days = WEEK_DAYS
        .filter((day) => customDays.includes(day.id))
        .map((day) => day.id);
    }

    if (days.length === 0) {
    setError('Selecciona al menos un día.');
    return false;
    }

    setSaving(true);
    setError(null);

    try {
    await saveScheduleConfig({ days });

    setSelectedDays(days);
    setCustomDays(days);
    setActiveDay(days[0]);
    setConfigured(true);

    return true;
    } catch (err) {
    console.error('Error guardando horario:', err);

    setError('No se pudo guardar tu configuración.');
    return false;
    } finally {
    setSaving(false);
    }
};

// Volver a configurar los días
const editDays = () => {
    const matches = (days: WeekDay[]) =>
    days.length === selectedDays.length &&
    days.every((day) => selectedDays.includes(day));

    if (matches([1, 2, 3, 4, 5])) {
    setMode('weekdays');
    } else if (matches([1, 2, 3, 4, 5, 6])) {
    setMode('saturday');
    } else {
    setMode('custom');
    }

    setCustomDays([...selectedDays]);
    setError(null);
    setConfigured(false);
};

return {
    loading,
    saving,
    configured,
    mode,
    setMode,
    customDays,
    toggleCustomDay,
    selectedDays,
    activeDay,
    setActiveDay,
    error,
    save,
    editDays,
};
}
