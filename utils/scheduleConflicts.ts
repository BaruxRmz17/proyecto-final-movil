
import type {
CreateScheduleClassInput,
ScheduleClassRecord,
} from '@/services/scheduleClassesService';

import type { WeekDay } from '@/types/schedule';

export interface ScheduleConflict {
existingClass: ScheduleClassRecord;
sharedDays: WeekDay[];
overlapStart: string;
overlapEnd: string;
}

function toMinutes(time: string): number {
const [hours, minutes] = time.split(':').map(Number);
return hours * 60 + minutes;
}

function periodsOverlap(
firstStart: string | null | undefined,
firstEnd: string | null | undefined,
secondStart: string | null | undefined,
secondEnd: string | null | undefined
): boolean {
// Sin inicio o término significa un límite abierto.
if (firstEnd && secondStart && firstEnd < secondStart) {
    return false;
}

if (secondEnd && firstStart && secondEnd < firstStart) {
    return false;
}

return true;
}

function timesOverlap(
firstStart: string,
firstEnd: string,
secondStart: string,
secondEnd: string
): boolean {
return (
    toMinutes(firstStart) < toMinutes(secondEnd) &&
    toMinutes(secondStart) < toMinutes(firstEnd)
);
}

export function findScheduleConflicts(
newClass: CreateScheduleClassInput,
existingClasses: ScheduleClassRecord[],
excludeClassId?: string
): ScheduleConflict[] {
return existingClasses.flatMap((existingClass) => {
    // Al editar, ignorar la misma materia.
    if (existingClass.id === excludeClassId) {
    return [];
    }

    const sharedDays = newClass.days.filter((day) =>
    existingClass.days.includes(day)
    );

    if (sharedDays.length === 0) {
    return [];
    }

    if (
    !timesOverlap(
        newClass.start_time,
        newClass.end_time,
        existingClass.start_time,
        existingClass.end_time
    )
    ) {
    return [];
    }

    if (
    !periodsOverlap(
        newClass.start_date,
        newClass.end_date,
        existingClass.start_date,
        existingClass.end_date
    )
    ) {
    return [];
    }

    const overlapStartMinutes = Math.max(
    toMinutes(newClass.start_time),
    toMinutes(existingClass.start_time)
    );

    const overlapEndMinutes = Math.min(
    toMinutes(newClass.end_time),
    toMinutes(existingClass.end_time)
    );

    const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    return [
    {
        existingClass,
        sharedDays,
        overlapStart: formatTime(overlapStartMinutes),
        overlapEnd: formatTime(overlapEndMinutes),
    },
    ];
});
}
