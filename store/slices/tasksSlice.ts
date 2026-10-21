
import {
createAsyncThunk,
createSlice,
} from '@reduxjs/toolkit';

import {
createTask,
deleteTask,
getTasks,
updateTask,
updateTaskStatus,
} from '@/services/tasksService';

import type {
CreateTaskInput,
TaskRecord,
TaskStatus,
UpdateTaskInput,
} from '@/types/tasks';

interface TasksState {
items: TaskRecord[];
loading: boolean;
saving: boolean;
error: string | null;
}

const initialState: TasksState = {
items: [],
loading: false,
saving: false,
error: null,
};

function errorMessage(error: unknown): string {
return error instanceof Error
    ? error.message
    : 'Ocurrió un error inesperado.';
}

// Obtener todas las tareas
export const fetchTasks = createAsyncThunk(
'tasks/fetchTasks',
async () => {
    return await getTasks();
}
);

// Crear una tarea
export const addTaskAsync = createAsyncThunk(
'tasks/addTask',
async (input: CreateTaskInput) => {
    return await createTask(input);
}
);

// Editar una tarea
export const editTaskAsync = createAsyncThunk(
'tasks/editTask',
async ({
    id,
    input,
}: {
    id: string;
    input: UpdateTaskInput;
}) => {
    return await updateTask(id, input);
}
);

// Cambiar estado de una tarea
export const toggleTaskAsync = createAsyncThunk(
'tasks/toggleTask',
async (task: TaskRecord) => {
    const status: TaskStatus =
    task.status === 'completed'
        ? 'pending'
        : 'completed';

    return await updateTaskStatus(task.id, status);
}
);

// Eliminar una tarea
export const removeTaskAsync = createAsyncThunk(
'tasks/removeTask',
async (id: string) => {
    await deleteTask(id);
    return id;
}
);

const tasksSlice = createSlice({
name: 'tasks',
initialState,
reducers: {
    clearTasks: (state) => {
    state.items = [];
    state.loading = false;
    state.saving = false;
    state.error = null;
    },
},
extraReducers: (builder) => {
    builder
    .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
    })
    .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = errorMessage(action.error.message);
    })

    .addCase(addTaskAsync.pending, (state) => {
        state.saving = true;
        state.error = null;
    })
    .addCase(addTaskAsync.fulfilled, (state, action) => {
        state.saving = false;
        state.items.push(action.payload);
    })
    .addCase(addTaskAsync.rejected, (state, action) => {
        state.saving = false;
        state.error = errorMessage(action.error.message);
    })

    .addCase(editTaskAsync.pending, (state) => {
        state.saving = true;
        state.error = null;
    })
    .addCase(editTaskAsync.fulfilled, (state, action) => {
        state.saving = false;

        const index = state.items.findIndex(
        (task) => task.id === action.payload.id
        );

        if (index !== -1) {
        state.items[index] = action.payload;
        }
    })
    .addCase(editTaskAsync.rejected, (state, action) => {
        state.saving = false;
        state.error = errorMessage(action.error.message);
    })

    .addCase(toggleTaskAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(
        (task) => task.id === action.payload.id
        );

        if (index !== -1) {
        state.items[index] = action.payload;
        }
    })
    .addCase(toggleTaskAsync.rejected, (state, action) => {
        state.error = errorMessage(action.error.message);
    })

    .addCase(removeTaskAsync.pending, (state) => {
        state.saving = true;
        state.error = null;
    })
    .addCase(removeTaskAsync.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter(
        (task) => task.id !== action.payload
        );
    })
    .addCase(removeTaskAsync.rejected, (state, action) => {
        state.saving = false;
        state.error = errorMessage(action.error.message);
    });
},
});

export const { clearTasks } = tasksSlice.actions;

export default tasksSlice.reducer;
