import { View, ActivityIndicator, Text, Pressable, Modal, ScrollView, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { SymbolView } from '@/components/app-symbol';
import Header from '@/components/Header';
import AuthGateway from '@/components/auth-gateway';
import CitizenPortal from '@/components/portals/CitizenPortal';
import AdminPortal from '@/components/portals/AdminPortal';
import DriverPortal from '@/components/portals/DriverPortal';
import AgentPortal from '@/components/portals/AgentPortal';
import SupplierPortal from '@/components/portals/SupplierPortal';
import { dbService } from '@/utils/db';

export default function HomeScreen() {
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const { 
    activeRole, 
    activeUser, 
    isLoading, 
    allUsers, 
    setActiveUser, 
    setActiveRole, 
    resetAllData,
    refreshData
  } = useApp();

  const handleSwitchRole = async (userId: string, role: any, name: string) => {
    let user = allUsers.find(u => u.id === userId);
    if (!user) {
      try {
        await dbService.run(
          `INSERT OR IGNORE INTO users (id, name, phone, role, rt_id, cooperative_id, points, referral_code, pin)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            name,
            userId === 'user-slamet' ? '089988776655' : '081234567890',
            role,
            role === 'USER' ? 'RT 03' : null,
            'tenant-1',
            0,
            `${userId.toUpperCase()}AJAK`,
            '123456'
          ]
        );
        await refreshData();
        user = {
          id: userId,
          name: name,
          phone: userId === 'user-slamet' ? '089988776655' : '081234567890',
          role: role,
          rt_id: role === 'USER' ? 'RT 03' : null,
          cooperative_id: 'tenant-1',
          points: 0,
          referral_code: `${userId.toUpperCase()}AJAK`,
          referred_by: null,
          pin: '123456'
        };
      } catch (err) {
        console.error("Failed to auto-insert switcher user:", err);
      }
    }

    if (user) {
      setActiveUser(user);
      setActiveRole(role);
      setDevToolsOpen(false);
      Alert.alert("Identitas Berganti", `Masuk sebagai: ${name} (${role})`);
    } else {
      Alert.alert("Gagal", `Identitas ${name} tidak ditemukan di database.`);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset Data Demo",
      "Apakah Anda yakin ingin mengembalikan semua transaksi, stok, dan poin ke kondisi awal?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive", 
          onPress: async () => {
            await resetAllData();
            setDevToolsOpen(false);
            Alert.alert("Sukses", "Data demo berhasil di-reset.");
          } 
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-emerald-900 justify-center items-center">
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text className="text-white font-bold text-sm mt-4 tracking-wider">Memuat Database KMP Mart...</Text>
        <Text className="text-emerald-300 text-[10px] mt-1 font-semibold">SIMKOPDES Koperasi Inklusif 2026</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {activeUser ? (
        <View className="flex-1 bg-stone-100 flex-column">
          {/* Persistent top switcher bar */}
          <Header />
          
          {/* Role specific portals */}
          <View className="flex-1">
            {activeRole === 'USER' && <CitizenPortal />}
            {(activeRole === 'ADMIN' || activeRole === 'OPERASIONAL') && <AdminPortal />}
            {activeRole === 'DRIVER' && <DriverPortal />}
            {activeRole === 'AGENT' && <AgentPortal />}
            {activeRole === 'SUPPLIER' && <SupplierPortal />}
          </View>
        </View>
      ) : (
        <AuthGateway />
      )}

      {/* Floating DevTools Trigger Button */}
      <Pressable
        onPress={() => setDevToolsOpen(true)}
        style={{
          position: 'absolute',
          zIndex: 9999,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          ...(activeUser
            ? { top: Platform.OS === 'ios' ? 52 : 48, right: 145 }
            : { bottom: 24, right: 24 }
          )
        }}
        className={`${activeUser ? "bg-emerald-950/80 border-emerald-850" : "bg-stone-900 border-stone-800"} border flex-row items-center gap-1.5 px-3 py-1.5 rounded-full active:opacity-85`}
      >
        <SymbolView name="hammer.fill" size={10} tintColor="#fbbf24" />
        <Text className="text-white text-[9px] font-black uppercase tracking-wider">
          Demo
        </Text>
      </Pressable>

      {/* DevTools Modal Sheet */}
      <Modal
        visible={devToolsOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDevToolsOpen(false)}
      >
        <Pressable
          onPress={() => setDevToolsOpen(false)}
          className="flex-1 justify-end bg-black/60"
        >
          <Pressable onPress={() => {}} className="bg-stone-900 rounded-t-3xl p-5 w-full border-t border-stone-800">
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
                onPress={() => handleSwitchRole('user-dinda', 'USER', 'Dinda')}
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
                onPress={() => handleSwitchRole('user-arif', 'ADMIN', 'Mas Arif')}
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
                onPress={() => handleSwitchRole('user-rina', 'OPERASIONAL', 'Mbak Rina')}
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
                onPress={() => handleSwitchRole('user-ujang', 'DRIVER', 'Mang Ujang')}
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
                onPress={() => handleSwitchRole('user-sari', 'AGENT', 'Bu Sari')}
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
                onPress={() => handleSwitchRole('user-slamet', 'SUPPLIER', 'Pak Slamet')}
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
                onPress={handleResetData}
                className="flex-1 bg-stone-800 border border-stone-700 py-3 rounded-xl items-center justify-center active:bg-stone-700 flex-row gap-2"
              >
                <SymbolView name="arrow.clockwise" size={12} tintColor="#fbbf24" />
                <Text className="text-amber-400 font-bold text-xs">Reset Demo Data</Text>
              </Pressable>
              
              <Pressable
                onPress={() => setDevToolsOpen(false)}
                className="flex-1 bg-emerald-850 border border-emerald-900 py-3 rounded-xl items-center justify-center active:bg-emerald-900"
              >
                <Text className="text-white font-bold text-xs">Tutup</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
