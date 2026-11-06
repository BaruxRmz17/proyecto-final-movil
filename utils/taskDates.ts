import type { TaskRecord } from '@/types/tasks';

type TaskDateFields = Pick<TaskRecord, 'due_date' | 'due_time'>;

export function getTaskDueDate(task: TaskDateFields): Date {
const [year, month, day] = task.due_date.split('-').map(Number);
  const time = task.due_time?.slice(0, 5) ?? '';
  const hasValidTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const [hours, minutes] = hasValidTime
    ? time.split(':').map(Number)
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
