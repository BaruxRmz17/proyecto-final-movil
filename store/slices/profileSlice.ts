import {
createAsyncThunk,
createSlice,
} from '@reduxjs/toolkit';

import {
getProfile,
updateProfile,
} from '@/services/profileService';

import type {
ProfilePayload,
ProfileRecord,
UpdateProfileInput,
} from '@/types/profile';

interface ProfileState {
profile: ProfileRecord | null;
email: string | null;
loading: boolean;
saving: boolean;
error: string | null;
fetchRequestId: string | null;
}

const initialState: ProfileState = {
profile: null,
email: null,
loading: false,
saving: false,
error: null,
fetchRequestId: null,
};

function errorMessage(error: unknown): string {
if (error instanceof Error && error.message) {
    return error.message;
}

if (typeof error === 'string' && error.trim()) {
    return error;
}

return 'Ocurrió un error inesperado.';
}

export const fetchProfile = createAsyncThunk<
ProfilePayload
>('profile/fetch', async () => getProfile());

export const updateProfileAsync = createAsyncThunk<
ProfileRecord,
UpdateProfileInput
>('profile/update', async (input) => updateProfile(input));

const profileSlice = createSlice({
name: 'profile',
initialState,
reducers: {
    clearProfile: (state) => {
    state.profile = null;
    state.email = null;
    state.loading = false;
    state.saving = false;
    state.error = null;
    state.fetchRequestId = null;
    },
},
extraReducers: (builder) => {
    builder
    .addCase(fetchProfile.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.fetchRequestId = action.meta.requestId;
    })
    .addCase(fetchProfile.fulfilled, (state, action) => {
        if (
        state.fetchRequestId !== action.meta.requestId
        ) {
        return;
        }

        state.loading = false;
        state.profile = action.payload.profile;
        state.email = action.payload.email;
        state.fetchRequestId = null;
    })
    .addCase(fetchProfile.rejected, (state, action) => {
        if (
        state.fetchRequestId !== action.meta.requestId
        ) {
        return;
        }

        state.loading = false;
        state.error = errorMessage(action.error.message);
        state.fetchRequestId = null;
    })
    .addCase(updateProfileAsync.pending, (state) => {
        state.saving = true;
        state.error = null;
    })
    .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload;
    })
    .addCase(updateProfileAsync.rejected, (state, action) => {
        state.saving = false;
        state.error = errorMessage(action.error.message);
    });
},
});

export const { clearProfile } = profileSlice.actions;

export default profileSlice.reducer;
