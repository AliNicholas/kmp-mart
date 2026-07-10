import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import type { TriggerRef } from '@rn-primitives/popover';
import * as React from 'react';
import { Alert, View } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { SymbolView } from 'expo-symbols';
import RegistrationModal from '@/components/registration-modal';

export function UserMenu() {
  const {
    activeRole,
    activeUser,
    logout,
    resetAllData,
    isLoading
  } = useApp();

  const popoverTriggerRef = React.useRef<TriggerRef>(null);
  const [registrationOpen, setRegistrationOpen] = React.useState(false);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin Koperasi';
      case 'DRIVER': return 'KopKurir';
      default: return 'Warga Digital';
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar dari akun?', 'Anda perlu login lagi untuk mengakses KopMart RT.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => {
          popoverTriggerRef.current?.close();
          logout();
        },
      },
    ]);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild ref={popoverTriggerRef}>
          <Button variant="ghost" className="flex-row items-center bg-emerald-800/60 active:bg-emerald-950 px-3 py-1.5 rounded-full border border-emerald-700/50 gap-2 h-auto">
            <Avatar alt={`${activeUser?.name || 'User'}'s avatar`} className="size-6 bg-amber-400 items-center justify-center rounded-full">
              <AvatarFallback className="bg-amber-400">
                <Text className="text-emerald-950 font-bold text-xs">
                  {activeUser?.name?.charAt(0) || 'U'}
                </Text>
              </AvatarFallback>
            </Avatar>
            <View className="items-start">
              <Text className="text-white text-xs font-bold leading-4 max-w-[80px]" numberOfLines={1}>
                {activeUser?.name || 'Loading'}
              </Text>
              <Text className="text-emerald-200 text-[9px] font-medium leading-3">
                {activeRole === 'ADMIN' ? 'Admin' : activeRole === 'DRIVER' ? 'KopKurir' : 'Warga'}
              </Text>
            </View>
            <SymbolView name="chevron.down" size={10} tintColor="#fbbf24" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="bottom" className="w-80 p-0 bg-white border border-stone-200 rounded-2xl shadow-xl mt-2">
          <View className="p-4 gap-3">
            <View className="flex-row items-center gap-3 border-b border-stone-150 pb-3">
              <Avatar alt={`${activeUser?.name || 'User'}'s avatar`} className="size-10 bg-amber-400 items-center justify-center rounded-full">
                <AvatarFallback className="bg-amber-400">
                  <Text className="text-emerald-950 font-bold text-sm">
                    {activeUser?.name?.charAt(0) || 'U'}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-1">
                <Text className="font-extrabold text-stone-900 text-sm leading-5">{activeUser?.name}</Text>
                <Text className="text-stone-500 text-[10px] font-normal leading-4 mt-0.5">
                  Role: {getRoleLabel(activeRole)} • {activeUser?.phone}
                </Text>
                {activeUser?.rt_id && (
                  <Text className="text-amber-600 text-[10px] font-bold mt-0.5">
                    Pos Wilayah: {activeUser.rt_id}
                  </Text>
                )}
                {activeUser?.member_id && (
                  <Text className="text-emerald-700 text-[10px] font-bold mt-0.5">
                    Kartu: {activeUser.member_id}
                  </Text>
                )}
              </View>
            </View>

            <Button
              size="sm"
              className="flex-row gap-2 bg-amber-400 active:bg-amber-500 border border-amber-500 w-full"
              onPress={() => {
                popoverTriggerRef.current?.close();
                setRegistrationOpen(true);
              }}
            >
              <SymbolView name="person.crop.circle.badge.plus" size={14} tintColor="#064e3b" />
              <Text className="text-emerald-950 font-black text-xs">Daftar Warga Baru</Text>
            </Button>

          <View className="border-t border-stone-200 pt-3 mt-1 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-row gap-1.5 border-rose-200 bg-rose-50 w-full"
              onPress={handleLogout}
            >
              <SymbolView name="rectangle.portrait.and.arrow.right" size={12} tintColor="#be123c" />
              <Text className="text-rose-700 font-bold text-xs">Keluar Akun</Text>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-row gap-1.5 border-stone-300 w-full"
              disabled={isLoading}
              onPress={resetAllData}
            >
              <SymbolView name="arrow.clockwise" size={12} tintColor="#d97706" />
              <Text className="text-stone-700 font-bold text-xs">Reset Demo Data</Text>
            </Button>
          </View>
          </View>
        </PopoverContent>
      </Popover>
      <RegistrationModal visible={registrationOpen} onClose={() => setRegistrationOpen(false)} />
    </>
  );
}
