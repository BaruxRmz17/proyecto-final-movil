
export type ScheduleMode = 'weekdays' | 'saturday' | 'custom';

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ScheduleDay {
id: WeekDay;
short: string;
name: string;
}

export interface ScheduleConfig {
days: WeekDay[];
}

export interface ScheduleClass {
id: string;
subject: string;
teacher: string;
classroom: string;
startTime: string;
endTime: string;
days: WeekDay[];
}

export const WEEK_DAYS: ScheduleDay[] = [
{ id: 1, short: 'Lun', name: 'Lunes' },
{ id: 2, short: 'Mar', name: 'Martes' },
{ id: 3, short: 'Mié', name: 'Miércoles' },
{ id: 4, short: 'Jue', name: 'Jueves' },
{ id: 5, short: 'Vie', name: 'Viernes' },
{ id: 6, short: 'Sáb', name: 'Sábado' },
{ id: 0, short: 'Dom', name: 'Domingo' },
];

export const DEFAULT_DAYS: WeekDay[] = [1, 2, 3, 4, 5];
