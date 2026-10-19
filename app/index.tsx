
import { Image, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { FeatureCard } from '@/components/molecules/FeatureCard';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1 bg-[#FAF9FF]"
      edges={['top', 'bottom']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 32,
          paddingTop: 42,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO */}
        <View className="items-center">
          <Image
            source={require('../assets/images/campus-mind-logo.png')}
            resizeMode="contain"
            className="h-[310px] w-full"
          />
        </View>

        {/* DESCRIPCIÓN */}
        <Text className="mt-5 text-[18px] text-[#817995]">
          Tu vida universitaria, organizada.
        </Text>

        {/* TARJETA */}
        <View className="mt-5">
          <FeatureCard />
        </View>

        {/* ESPACIO FLEXIBLE */}
        <View className="min-h-[55px] flex-1" />

        {/* BOTONES */}

{/* BOTONES */}
<View className="gap-4">
  <PrimaryButton
    title="Comenzar"
    onPress={() => router.push('/register')}
  />

  <PrimaryButton
    title="Ya tengo cuenta"
    variant="secondary"
    onPress={() => router.push('/login')}
  />
</View>

      </ScrollView>
    </SafeAreaView>
  );
}
