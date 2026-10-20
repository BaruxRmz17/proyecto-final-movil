
import { useState } from 'react';
import {
Modal,
Platform,
Pressable,
Text,
View,
} from 'react-native';
import DateTimePicker, {
DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerFieldProps {
label: string;
value: string;
onChange: (date: string) => void;
minimumDate?: string;
maximumDate?: string;
disabled?: boolean;
}

function parseDate(value: string): Date {
const parts = value.split('-').map(Number);

if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isFinite(part))
) {
    return new Date();
}

const [year, month, day] = parts;
const date = new Date(year, month - 1, day);

if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
) {
    return new Date();
}

return date;
}

function formatDate(date: Date): string {
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');

return `${year}-${month}-${day}`;
}

function displayDate(value: string): string {
if (!value) {
    return 'Seleccionar fecha';
}

return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(parseDate(value));
}

export function DatePickerField({
label,
value,
onChange,
minimumDate,
maximumDate,
disabled = false,
}: DatePickerFieldProps) {
const [visible, setVisible] = useState(false);
const [temporaryDate, setTemporaryDate] = useState(
    parseDate(value)
);

const min = minimumDate
    ? parseDate(minimumDate)
    : undefined;

const max = maximumDate
    ? parseDate(maximumDate)
    : undefined;

const openPicker = () => {
    setTemporaryDate(parseDate(value));
    setVisible(true);
};

const handleChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
) => {
    if (Platform.OS === 'android') {
    setVisible(false);

    if (event.type === 'set' && selectedDate) {
        onChange(formatDate(selectedDate));
    }

    return;
    }

    if (selectedDate) {
    setTemporaryDate(selectedDate);
    }
};

return (
    <View className="mb-5">
    <Text className="mb-2 text-[14px] font-semibold text-[#292342]">
        {label}
    </Text>

    <Pressable
        onPress={openPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Seleccionar ${label}`}
        className="min-h-[56px] flex-row items-center rounded-2xl border border-[#EAE6F3] bg-white px-4"
        style={{ opacity: disabled ? 0.5 : 1 }}
    >
        <Ionicons
        name="calendar-outline"
        size={21}
        color="#7957DC"
        />

        <Text className="ml-3 flex-1 text-[14px] font-medium text-[#292342]">
        {displayDate(value)}
        </Text>

        <Ionicons
        name="chevron-down"
        size={18}
        color="#817995"
        />
    </Pressable>

    {Platform.OS === 'android' && visible && (
        <DateTimePicker
        value={temporaryDate}
        mode="date"
        display="calendar"
        minimumDate={min}
        maximumDate={max}
        onChange={handleChange}
        />
    )}

    {Platform.OS === 'ios' && (
        <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
        >
        <View className="flex-1 justify-end bg-black/40">
            <Pressable
            className="flex-1"
            onPress={() => setVisible(false)}
            />

            <View className="rounded-t-3xl bg-white px-5 pb-10 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-[17px] font-bold text-[#292342]">
                {label}
                </Text>

                <Pressable
                onPress={() => {
                    onChange(formatDate(temporaryDate));
                    setVisible(false);
                }}
                className="rounded-xl bg-[#EDE6FF] px-4 py-2"
                >
                <Text className="font-bold text-[#7957DC]">
                    Listo
                </Text>
                </Pressable>
            </View>

            <DateTimePicker
            value={temporaryDate}
            mode="date"
            display="inline"
            locale="es-MX"
            themeVariant="light"
            accentColor="#7957DC"
            textColor="#292342"
            minimumDate={min}
            maximumDate={max}
            onChange={handleChange}
            style={{
                alignSelf: 'center',
                backgroundColor: '#FFFFFF',
            }}
            />
            </View>
        </View>
        </Modal>
    )}
    </View>
);
}
