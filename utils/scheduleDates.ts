
import type { ScheduleClassRecord } from '@/services/scheduleClassesService';
import type { WeekDay } from '@/types/schedule';

export function formatScheduleDate(date: Date): string {
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');

return `${year}-${month}-${day}`;
}

export function isClassActiveOnDate(
scheduleClass: ScheduleClassRecord,
date: Date
): boolean {
const selectedDate = formatScheduleDate(date);

// getDay() siempre devuelve un número del 0 al 6.
const weekDay = date.getDay() as WeekDay;

// Comprobar si la materia se cursa ese día.
if (!scheduleClass.days.includes(weekDay)) {
    return false;
}

// No mostrar materias que todavía no empiezan.
if (
    scheduleClass.start_date &&
    selectedDate < scheduleClass.start_date
) {
    return false;
}

// No mostrar materias que ya terminaron.
if (
    scheduleClass.end_date &&
    selectedDate > scheduleClass.end_date
) {
    return false;
}

return true;
}
