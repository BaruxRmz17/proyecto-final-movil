export const PROFILE_AVATAR_COLORS = [
'#7957DC',
'#2563EB',
'#0F766E',
'#DB7C26',
'#D9468B',
] as const;

export type ProfileAvatarColor =
(typeof PROFILE_AVATAR_COLORS)[number];

export const PROFILE_AVATAR_EMOJIS = [
'🌟',
'🚀',
'🎨',
'📚',
'🎮',
'🧠',
'🌱',
'🔥',
] as const;

export type ProfileAvatarEmoji =
(typeof PROFILE_AVATAR_EMOJIS)[number];

export interface ProfileRecord {
id: string;
nombre_completo: string | null;
universidad: string | null;
carrera: string | null;
semestre: number | null;
avatar_color: ProfileAvatarColor;
avatar_emoji: ProfileAvatarEmoji | null;
created_at: string | null;
}

export interface UpdateProfileInput {
nombre_completo: string;
universidad: string;
carrera: string;
semestre: number | null;
avatar_color: ProfileAvatarColor;
avatar_emoji: ProfileAvatarEmoji | null;
}

export interface ProfilePayload {
profile: ProfileRecord | null;
email: string | null;
}
