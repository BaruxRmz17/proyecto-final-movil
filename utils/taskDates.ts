import type { TaskRecord } from '@/types/tasks';

type TaskDateFields = Pick<TaskRecord, 'due_date' | 'due_time'>;

export function getTaskDueDate(task: TaskDateFields): Date {
const [year, month, day] = task.due_date.split('-').map(Number);
const [hours, minutes] = task.due_time
    ? task.due_time.slice(0, 5).split(':').map(Number)
    : [23, 59];

return new Date(
    year,
    month - 1,
    day,
    Number.isFinite(hours) ? hours : 23,
    Number.isFinite(minutes) ? minutes : 59,
    0,
    0
);
}
