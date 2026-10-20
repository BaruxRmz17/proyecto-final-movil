
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
ScheduleConfig,
WeekDay,
WEEK_DAYS,
} from '@/types/schedule';

const STORAGE_KEY = '@campus_mind_schedule_config';

export async function getScheduleConfig(): Promise<ScheduleConfig | null> {
const stored = await AsyncStorage.getItem(STORAGE_KEY);

if (!stored) return null;

try {
    const parsed: unknown = JSON.parse(stored);

    if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('days' in parsed) ||
    !Array.isArray(parsed.days)
    ) {
    return null;
    }

    const validIds = WEEK_DAYS.map((day) => day.id);

    const days = parsed.days.filter(
    (day: unknown): day is WeekDay =>
        typeof day === 'number' &&
        validIds.includes(day as WeekDay)
    );

    if (!days.length) return null;

    return {
    days: [...new Set(days)],
    };
} catch {
    return null;
}
}

export async function saveScheduleConfig(
config: ScheduleConfig
): Promise<void> {
await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(config)
);
}
