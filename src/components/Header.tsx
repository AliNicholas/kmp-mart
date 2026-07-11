import { View, Text } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { SymbolView } from '@/components/app-symbol';
import { UserMenu } from '@/components/user-menu';

export default function Header() {
  const { 
    activeUser, 
  } = useApp();

  return (
    <View className="bg-emerald-900 pt-12 pb-4 px-4 border-b border-emerald-800 rounded-b-2xl shadow-sm">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <View className="bg-amber-400 p-2 rounded-xl">
            <SymbolView name="cart.fill" size={18} tintColor="#064e3b" />
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

      {/* Demo helper banner */}
      <View className="mt-3 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-950/20 flex-row justify-between items-center">
        <Text className="text-emerald-200 text-[10px]">
          Demo: <Text className="text-white font-bold">{activeUser?.cooperative_id === 'tenant-1' ? 'Kop. Merah Putih Sukamaju' : 'Koperasi Local'}</Text> 
          {activeUser?.rt_id ? ` • ${activeUser.rt_id}` : ''}
        </Text>
      </View>
    </View>
  );
}
