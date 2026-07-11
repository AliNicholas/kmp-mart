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
import { Alert, View, ScrollView, Pressable, Platform } from "react-native";
import { AppModal } from "@/components/app-modal";
import { useApp } from '@/contexts/AppContext';
import { SymbolView } from '@/components/app-symbol';
import RegistrationModal from '@/components/registration-modal';

export function UserMenu() {
  const {
    activeRole,
    activeUser,
    logout,
    resetAllData,
    isLoading,
    handleSwitchRole
  } = useApp();

  const popoverTriggerRef = React.useRef<TriggerRef>(null);
  const [registrationOpen, setRegistrationOpen] = React.useState(false);
  const [devToolsOpen, setDevToolsOpen] = React.useState(false);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Superadmin';
      case 'OPERASIONAL': return 'Operasional Koperasi';
      case 'DRIVER': return 'KopKurir';
      case 'AGENT': return 'Mitra Agen/Warung';
      case 'SUPPLIER': return 'Mitra Supplier';
      default: return 'Warga Digital';
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Keluar dari akun?\nAnda perlu login lagi untuk mengakses KMP Mart.");
      if (confirmLogout) {
        popoverTriggerRef.current?.close();
        logout();
      }
    } else {
      Alert.alert('Keluar dari akun?', 'Anda perlu login lagi untuk mengakses KMP Mart.', [
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
    }
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
                {getRoleLabel(activeRole)}
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
                setTimeout(() => setRegistrationOpen(true), 0);
              }}
            >
              <SymbolView name="person.crop.circle.badge.plus" size={14} tintColor="#064e3b" />
              <Text className="text-emerald-950 font-black text-xs">Daftar Warga Baru</Text>
            </Button>

            <Button
              size="sm"
              className="flex-row gap-2 bg-stone-900 active:bg-stone-850 border border-stone-800 w-full mt-2"
              onPress={() => {
                popoverTriggerRef.current?.close();
                setTimeout(() => setDevToolsOpen(true), 0);
              }}
            >
              <SymbolView name="hammer.fill" size={14} tintColor="#fbbf24" />
              <Text className="text-white font-black text-xs">Pilih Persona Demo (Juri)</Text>
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
      
      {/* DevTools Modal Sheet */}
      <AppModal
        visible={devToolsOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDevToolsOpen(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            onPress={() => setDevToolsOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <View className="bg-stone-900 rounded-t-3xl p-5 w-full border-t border-stone-800">
            <View className="flex-row justify-between items-center border-b border-stone-800 pb-3 mb-4">
              <View className="flex-row items-center gap-2">
                <SymbolView name="hammer.fill" size={14} tintColor="#fbbf24" />
                <Text className="text-white font-extrabold text-sm">
                  KMP Mart Demo DevTools
                </Text>
              </View>
              <Pressable
                onPress={() => setDevToolsOpen(false)}
                className="p-1 rounded-full bg-stone-800 active:bg-stone-700"
              >
                <SymbolView name="xmark" size={14} tintColor="#aaa" />
              </Pressable>
            </View>

            <Text className="text-stone-400 text-[10px] mb-3 uppercase tracking-wider font-bold">Pilih Identitas Demo (Juri Pitching):</Text>
            
            <ScrollView className="max-h-[320px] mb-4">
              {/* Dinda - USER */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole('user-dinda', 'USER', 'Dinda');
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-emerald-900/50 p-2 rounded-lg border border-emerald-800">
                  <SymbolView name="person.fill" size={16} tintColor="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">Dinda (Warga Digital)</Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">Role: USER • Sembako, gotong-royong, referral, poin.</Text>
                </View>
              </Pressable>

              {/* Mas Arif - ADMIN */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole('user-arif', 'ADMIN', 'Mas Arif');
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-rose-900/50 p-2 rounded-lg border border-rose-800">
                  <SymbolView name="lock.shield.fill" size={16} tintColor="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">Mas Arif (Superadmin)</Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">Role: ADMIN • Semua menu: Gudang, Kas, Sourcing, Dispatch, Layanan.</Text>
                </View>
              </Pressable>

              {/* Mbak Rina - OPERASIONAL */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole('user-rina', 'OPERASIONAL', 'Mbak Rina');
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-emerald-900/50 p-2 rounded-lg border border-emerald-800">
                  <SymbolView name="shippingbox.fill" size={16} tintColor="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">Mbak Rina (Operasional Koperasi)</Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">Role: OPERASIONAL • Gudang, Fulfillment, Dispatch, Layanan Warga.</Text>
                </View>
              </Pressable>

              {/* Mang Ujang - DRIVER */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole('user-ujang', 'DRIVER', 'Mang Ujang');
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-blue-900/50 p-2 rounded-lg border border-blue-800">
                  <SymbolView name="shippingbox.fill" size={16} tintColor="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">Mang Ujang (KopKurir/Driver)</Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">Role: DRIVER • Ambil kiriman koperasi, antar ke warga, COD.</Text>
                </View>
              </Pressable>

              {/* Bu Sari - AGENT */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole('user-sari', 'AGENT', 'Bu Sari');
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-amber-900/50 p-2 rounded-lg border border-amber-800">
                  <SymbolView name="cart.fill" size={16} tintColor="#fbbf24" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">Bu Sari (Mitra Agen/Warung)</Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">Role: AGENT • Belanja grosir B2B, terima pengiriman, catat demand warga.</Text>
                </View>
              </Pressable>

              {/* Pak Slamet - SUPPLIER */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole('user-slamet', 'SUPPLIER', 'Pak Slamet');
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-cyan-900/50 p-2 rounded-lg border border-cyan-800">
                  <SymbolView name="envelope.fill" size={16} tintColor="#22d3ee" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">Pak Slamet (Mitra Supplier)</Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">Role: SUPPLIER • Lihat PO masuk dari koperasi, konfirmasi pengiriman barang.</Text>
                </View>
              </Pressable>
            </ScrollView>

            <View className="border-t border-stone-800 pt-4 flex-row gap-2">
              <Pressable
                onPress={async () => {
                  await resetAllData();
                  setDevToolsOpen(false);
                  Alert.alert("Sukses", "Data demo berhasil di-reset.");
                }}
                className="flex-1 bg-stone-800 border border-stone-700 py-3 rounded-xl items-center justify-center active:bg-stone-700 flex-row gap-2"
              >
                <SymbolView name="arrow.clockwise" size={12} tintColor="#fbbf24" />
                <Text className="text-amber-400 font-bold text-xs">Reset Demo Data</Text>
              </Pressable>
              
              <Pressable
                onPress={() => setDevToolsOpen(false)}
                className="flex-1 bg-emerald-800 border border-emerald-900 py-3 rounded-xl items-center justify-center active:bg-emerald-900"
              >
                <Text className="text-white font-bold text-xs">Tutup</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </AppModal>
    </>
  );
}
