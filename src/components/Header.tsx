import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { UserMenu } from '@/components/user-menu';

export default function Header() {
  return (
    <View className="bg-emerald-900 pt-12 pb-4 px-4 border-b border-emerald-800 rounded-b-2xl shadow-sm">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <View className="size-9 rounded-xl overflow-hidden bg-white">
            <Image
              source={require('../../kmp-mart-logo.png')}
              contentFit="contain"
              className="size-full"
              accessibilityLabel="Logo KMP Mart"
            />
          </View>
          <View>
            <Text className="text-white font-black text-xl">
              KMP <Text className="text-amber-400">Mart</Text>
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {/* User Menu Popover Block */}
          <UserMenu />
        </View>
      </View>

    </View>
  );
}
