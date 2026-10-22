
export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'completed';

export type TaskFilter = 'all' | 'pending' | 'completed';

export interface TaskRecord {
id: string;
user_id: string;
class_id: string;
title: string;
description: string | null;
due_date: string;
due_time: string | null;
grade: number | null;
grade_max: number;
priority: TaskPriority;
status: TaskStatus;
archived: boolean;
created_at: string;
updated_at: string;
}

export interface CreateTaskInput {
class_id: string;
title: string;
description: string;
due_date: string;
due_time: string | null;
grade: number | null;
grade_max: number;
priority: TaskPriority;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
status?: TaskStatus;
archived?: boolean;
grade?: number | null;
grade_max?: number;
}
