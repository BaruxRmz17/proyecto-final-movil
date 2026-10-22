import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY_PREFIX = 'campus-mind-auth';
const MAX_SECURE_VALUE_BYTES = 1800;

function getKeyName(key: string, suffix: string): string {
return `${KEY_PREFIX}-${encodeURIComponent(key).replace(
    /%/g,
    '_'
)}-${suffix}`;
}

function encodedByteLength(value: string): number {
return encodeURIComponent(value).length;
}

function splitIntoChunks(value: string): string[] {
const characters = Array.from(value);
const chunks: string[] = [];
let current = '';

for (const character of characters) {
    const next = current + character;

    if (
    current &&
    encodedByteLength(next) > MAX_SECURE_VALUE_BYTES
    ) {
    chunks.push(current);
    current = character;
    } else {
    current = next;
    }
}

if (current || chunks.length === 0) {
    chunks.push(current);
}

return chunks;
}

async function getChunkCount(key: string): Promise<number | null> {
const manifest = await SecureStore.getItemAsync(
    getKeyName(key, 'manifest')
);

if (!manifest) return null;

const count = Number(manifest);

return Number.isInteger(count) && count > 0 ? count : null;
}

async function writeSecureValue(
key: string,
value: string
): Promise<void> {
const previousCount = await getChunkCount(key);
const chunks = splitIntoChunks(value);

await Promise.all(
    chunks.map((chunk, index) =>
    SecureStore.setItemAsync(
        getKeyName(key, `chunk-${index}`),
        chunk
    )
    )
);

await SecureStore.setItemAsync(
    getKeyName(key, 'manifest'),
    String(chunks.length)
);

if (previousCount && previousCount > chunks.length) {
    await Promise.all(
    Array.from(
        { length: previousCount - chunks.length },
        (_, index) =>
        SecureStore.deleteItemAsync(
            getKeyName(
            key,
            `chunk-${chunks.length + index}`
            )
        )
    )
    );
}
}

async function readSecureValue(
key: string
): Promise<string | null> {
const count = await getChunkCount(key);

if (!count) return null;

const chunks = await Promise.all(
    Array.from(
    { length: count },
    (_, index) =>
        SecureStore.getItemAsync(
        getKeyName(key, `chunk-${index}`)
        )
    )
);

if (chunks.some((chunk) => chunk === null)) return null;

return chunks.join('');
}

async function removeSecureValue(key: string): Promise<void> {
const count = await getChunkCount(key);

if (count) {
    await Promise.all(
    Array.from(
        { length: count },
        (_, index) =>
        SecureStore.deleteItemAsync(
            getKeyName(key, `chunk-${index}`)
        )
    )
    );
}

await SecureStore.deleteItemAsync(
    getKeyName(key, 'manifest')
);
}

export const authStorage = {
async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
    }

    const secureValue = await readSecureValue(key);

    if (secureValue !== null) return secureValue;

    // Migrate a session saved by the previous AsyncStorage adapter.
    const legacyValue = await AsyncStorage.getItem(key);

    if (legacyValue === null) return null;

    try {
    await writeSecureValue(key, legacyValue);
    await AsyncStorage.removeItem(key);
    } catch {
    // If SecureStore is temporarily unavailable, keep the old session usable.
    }

    return legacyValue;
},

async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
    }

    await writeSecureValue(key, value);
    await AsyncStorage.removeItem(key);
},

async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
    }

    await removeSecureValue(key);
    await AsyncStorage.removeItem(key);
},
};
