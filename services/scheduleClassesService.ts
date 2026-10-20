
import { supabase } from '@/lib/supabase';
import type { WeekDay } from '@/types/schedule';

export interface ScheduleClassRecord {
id: string;
user_id: string;
subject: string;
teacher: string;
classroom: string;
start_time: string;
end_time: string;
days: WeekDay[];
color: string;
notes: string;
start_date: string | null;
end_date: string | null;
created_at: string;
updated_at: string;
}

export interface CreateScheduleClassInput {
subject: string;
teacher: string;
classroom: string;
start_time: string;
end_time: string;
days: WeekDay[];
color?: string;
notes?: string;
start_date?: string | null;
end_date?: string | null;
}

export type UpdateScheduleClassInput =
Partial<CreateScheduleClassInput>;

async function getAuthenticatedUserId(): Promise<string> {
const {
    data: { user },
    error,
} = await supabase.auth.getUser();

if (error) {
    throw new Error(error.message);
}

if (!user) {
    throw new Error(
    'Debes iniciar sesión para gestionar tus clases.'
    );
}

return user.id;
}

function isValidDate(value: string): boolean {
if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
}

const [year, month, day] = value.split('-').map(Number);
const date = new Date(year, month - 1, day);

return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
);
}

function validateClass(input: CreateScheduleClassInput): void {
if (!input.subject.trim()) {
    throw new Error('El nombre de la materia es obligatorio.');
}

const timePattern =
    /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

if (
    !timePattern.test(input.start_time) ||
    !timePattern.test(input.end_time)
) {
    throw new Error(
    'El formato de hora no es válido.'
    );
}

if (input.end_time <= input.start_time) {
    throw new Error(
    'La hora de finalización debe ser posterior a la de inicio.'
    );
}

if (
    !input.days.length ||
    input.days.some(
    (day) =>
        !Number.isInteger(day) ||
        day < 0 ||
        day > 6
    )
) {
    throw new Error('Selecciona al menos un día válido.');
}

if (
    input.color &&
    !/^#[0-9A-Fa-f]{6}$/.test(input.color)
) {
    throw new Error('El color seleccionado no es válido.');
}

if (
    input.start_date &&
    !isValidDate(input.start_date)
) {
    throw new Error('La fecha de inicio no es válida.');
}

if (
    input.end_date &&
    !isValidDate(input.end_date)
) {
    throw new Error('La fecha de término no es válida.');
}

if (input.end_date && !input.start_date) {
    throw new Error(
    'Debes indicar una fecha de inicio.'
    );
}

if (
    input.start_date &&
    input.end_date &&
    input.end_date < input.start_date
) {
    throw new Error(
    'La fecha de término no puede ser anterior al inicio.'
    );
}
}

export async function createScheduleClass(
input: CreateScheduleClassInput
): Promise<ScheduleClassRecord> {
validateClass(input);

const userId = await getAuthenticatedUserId();

const { data, error } = await supabase
    .from('schedule_classes')
    .insert({
    user_id: userId,
    subject: input.subject.trim(),
    teacher: input.teacher.trim(),
    classroom: input.classroom.trim(),
    start_time: input.start_time,
    end_time: input.end_time,
    days: [...new Set(input.days)],
    color: input.color ?? '#7957DC',
    notes: input.notes?.trim() ?? '',
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    })
    .select()
    .single();

if (error) {
    throw new Error(error.message);
}

return data as ScheduleClassRecord;
}

export async function getScheduleClasses(): Promise<
ScheduleClassRecord[]
> {
const userId = await getAuthenticatedUserId();

const { data, error } = await supabase
    .from('schedule_classes')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true });

if (error) {
    throw new Error(error.message);
}

return (data ?? []) as ScheduleClassRecord[];
}

export async function getScheduleClassById(
classId: string
): Promise<ScheduleClassRecord> {
const userId = await getAuthenticatedUserId();

const { data, error } = await supabase
    .from('schedule_classes')
    .select('*')
    .eq('id', classId)
    .eq('user_id', userId)
    .single();

if (error) {
    throw new Error(error.message);
}

return data as ScheduleClassRecord;
}

export async function updateScheduleClass(
classId: string,
input: UpdateScheduleClassInput
): Promise<ScheduleClassRecord> {
const userId = await getAuthenticatedUserId();
const currentClass = await getScheduleClassById(classId);

const updatedClass: CreateScheduleClassInput = {
    subject: input.subject ?? currentClass.subject,
    teacher: input.teacher ?? currentClass.teacher,
    classroom: input.classroom ?? currentClass.classroom,
    start_time: input.start_time ?? currentClass.start_time,
    end_time: input.end_time ?? currentClass.end_time,
    days: input.days ?? currentClass.days,
    color: input.color ?? currentClass.color,
    notes: input.notes ?? currentClass.notes,
    start_date:
    input.start_date !== undefined
        ? input.start_date
        : currentClass.start_date,
    end_date:
    input.end_date !== undefined
        ? input.end_date
        : currentClass.end_date,
};

validateClass(updatedClass);

const { data, error } = await supabase
    .from('schedule_classes')
    .update({
    subject: updatedClass.subject.trim(),
    teacher: updatedClass.teacher.trim(),
    classroom: updatedClass.classroom.trim(),
    start_time: updatedClass.start_time,
    end_time: updatedClass.end_time,
    days: [...new Set(updatedClass.days)],
    color: updatedClass.color,
    notes: updatedClass.notes?.trim() ?? '',
    start_date: updatedClass.start_date ?? null,
    end_date: updatedClass.end_date ?? null,
    })
    .eq('id', classId)
    .eq('user_id', userId)
    .select()
    .single();

if (error) {
    throw new Error(error.message);
}

return data as ScheduleClassRecord;
}

export async function deleteScheduleClass(
classId: string
): Promise<void> {
const userId = await getAuthenticatedUserId();

const { data, error } = await supabase
    .from('schedule_classes')
    .delete()
    .eq('id', classId)
    .eq('user_id', userId)
    .select('id');

if (error) {
    throw new Error(error.message);
}

if (!data?.length) {
    throw new Error(
    'La clase no existe o no tienes permiso para eliminarla.'
    );
}
}
