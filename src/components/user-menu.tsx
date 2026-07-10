import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { TriggerRef } from '@rn-primitives/popover';
import * as React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useApp, type AppRole } from '@/contexts/AppContext';
import { SymbolView } from 'expo-symbols';
import RegistrationModal from '@/components/registration-modal';

export function UserMenu() {
  const {
    activeRole,
    activeUser,
    allUsers,
    setActiveRole,
    setActiveUser,
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

  const handleRoleSelect = (role: AppRole, user: any) => {
    setActiveRole(role);
    setActiveUser(user);
    popoverTriggerRef.current?.close();
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

            <View className="gap-2">
            <Text className="text-emerald-900 font-black text-xs uppercase tracking-wider mb-1">
              Beralih Akun (Demo Hackathon)
            </Text>
            <ScrollView className="max-h-60" showsVerticalScrollIndicator={true}>
              {allUsers.filter(u => u.role !== 'RT_AGENT').map((user) => {
                const isSelected = activeUser?.id === user.id;
                return (
                  <Pressable
                    key={user.id}
                    onPress={() => {
                      const nextRole: AppRole = user.role === 'ADMIN' || user.role === 'DRIVER' ? user.role : 'USER';
                      handleRoleSelect(nextRole, user);
                    }}
                    className={cn(
                      "flex-row justify-between items-center p-2.5 rounded-xl border mb-2 bg-white",
                      isSelected ? "border-emerald-500 bg-emerald-50/50" : "border-stone-200"
                    )}
                  >
                    <View className="flex-row items-center gap-2.5 flex-1">
                      <View className={cn(
                        "size-7 rounded-full items-center justify-center",
                        isSelected ? "bg-emerald-600" : "bg-stone-200"
                      )}>
                        <Text className={cn("font-bold text-xs", isSelected ? "text-white" : "text-stone-700")}>
                          {user.name.charAt(0)}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5 flex-wrap">
                          <Text className={cn("font-bold text-xs", isSelected ? "text-emerald-950" : "text-stone-900")}>
                            {user.name}
                          </Text>
                          <Badge variant={user.role === 'ADMIN' ? 'secondary' : user.role === 'DRIVER' ? 'outline' : 'default'} className="px-1.5 py-0 rounded-md">
                            <Text className="text-[8px] font-bold">
                              {getRoleLabel(user.role)}
                            </Text>
                          </Badge>
                        </View>
                        <Text className="text-[9px] text-stone-500">
                          {user.phone} {user.rt_id ? `• ${user.rt_id}` : ''}
                        </Text>
                        {user.member_id && (
                          <Text className="text-[8px] text-emerald-700 font-bold">
                            {user.member_id}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="justify-center items-center pr-1">
                      {isSelected ? (
                        <SymbolView name="checkmark.circle.fill" size={14} tintColor="#059669" />
                      ) : (
                        <SymbolView name="circle" size={14} tintColor="#d1d5db" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View className="border-t border-stone-200 pt-3 mt-1">
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
