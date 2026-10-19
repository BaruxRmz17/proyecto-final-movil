
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TareasScreen() {
return (
    <SafeAreaView className="flex-1 bg-[#FAF9FF] px-7 pt-8">
    <Text className="text-[30px] font-extrabold text-[#292342]">
        Mis tareas
    </Text>
    <Text className="mt-3 text-[#817995]">
        Aquí administraremos tus tareas y entregas.
    </Text>
    </SafeAreaView>
);
}
