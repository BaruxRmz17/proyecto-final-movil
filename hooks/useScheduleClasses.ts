
import { useCallback, useEffect, useState } from 'react';

import {
createScheduleClass,
deleteScheduleClass,
getScheduleClasses,
updateScheduleClass,
} from '@/services/scheduleClassesService';

import type {
CreateScheduleClassInput,
ScheduleClassRecord,
UpdateScheduleClassInput,
} from '@/services/scheduleClassesService';

export function useScheduleClasses() {
const [classes, setClasses] = useState<ScheduleClassRecord[]>([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [deleting, setDeleting] = useState(false);
const [error, setError] = useState<string | null>(null);

// Obtener las clases desde Supabase
const refreshClasses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
    const data = await getScheduleClasses();
    setClasses(data);
    } catch (err) {
    const message =
        err instanceof Error
        ? err.message
        : 'No se pudieron cargar tus clases.';

    setError(message);
    } finally {
    setLoading(false);
    }
}, []);

// Carga inicial
useEffect(() => {
    let active = true;

    const initialize = async () => {
    try {
        const data = await getScheduleClasses();

        if (active) {
        setClasses(data);
        setError(null);
        }
    } catch (err) {
        if (active) {
        setError(
            err instanceof Error
            ? err.message
            : 'No se pudieron cargar tus clases.'
        );
        }
    } finally {
        if (active) {
        setLoading(false);
        }
    }
    };

    void initialize();

    return () => {
    active = false;
    };
}, []);

// CREATE
const addClass = async (
    input: CreateScheduleClassInput
): Promise<ScheduleClassRecord> => {
    setSaving(true);
    setError(null);

    try {
    const created = await createScheduleClass(input);

    setClasses((current) =>
        [...current, created].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
        )
    );

    return created;
    } catch (err) {
    setError(
        err instanceof Error
        ? err.message
        : 'No se pudo crear la clase.'
    );

    throw err;
    } finally {
    setSaving(false);
    }
};

// UPDATE
const editClass = async (
    classId: string,
    input: UpdateScheduleClassInput
): Promise<ScheduleClassRecord> => {
    setSaving(true);
    setError(null);

    try {
    const updated = await updateScheduleClass(
        classId,
        input
    );

    setClasses((current) =>
        current
        .map((item) =>
            item.id === classId ? updated : item
        )
        .sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
        )
    );

    return updated;
    } catch (err) {
    setError(
        err instanceof Error
        ? err.message
        : 'No se pudo editar la clase.'
    );

    throw err;
    } finally {
    setSaving(false);
    }
};

// DELETE
const removeClass = async (
    classId: string
): Promise<void> => {
    setDeleting(true);
    setError(null);

    try {
    await deleteScheduleClass(classId);

    setClasses((current) =>
        current.filter((item) => item.id !== classId)
    );
    } catch (err) {
    setError(
        err instanceof Error
        ? err.message
        : 'No se pudo eliminar la clase.'
    );

    throw err;
    } finally {
    setDeleting(false);
    }
};

// Limpiar errores
const clearError = () => setError(null);

return {
    classes,
    loading,
    saving,
    deleting,
    error,
    refreshClasses,
    addClass,
    editClass,
    removeClass,
    clearError,
};
}
