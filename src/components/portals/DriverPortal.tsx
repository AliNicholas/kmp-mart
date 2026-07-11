import { useApp } from "@/contexts/AppContext";
import { DeliveryStatus, DeliveryTask } from "@/utils/db";
import { SymbolView } from "@/components/app-symbol";
import React from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View, Platform, Linking } from "react-native";
import { AppModal } from "@/components/app-modal";
import OpenStreetMapView from "../open-street-map";

// Conditional native maps import
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default || RNMaps;
    Marker = RNMaps.Marker;
    Polyline = RNMaps.Polyline;
  } catch {
    console.warn("react-native-maps not available in DriverPortal");
  }
}

const statusMeta: Record<DeliveryStatus, { label: string; color: string }> = {
  PENDING_DISPATCH: { label: "Menunggu Penugasan", color: "bg-stone-100 text-stone-700 border-stone-200" },
  ASSIGNED: { label: "Ditugaskan", color: "bg-blue-50 text-blue-800 border-blue-200" },
  ACCEPTED: { label: "Diterima", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  REJECTED: { label: "Ditolak", color: "bg-rose-50 text-rose-700 border-rose-200" },
  PREPARING_PICKUP: { label: "Disiapkan", color: "bg-amber-50 text-amber-800 border-amber-200" },
  READY_FOR_PICKUP: { label: "Siap Diambil Kurir", color: "bg-amber-50 text-amber-800 border-amber-200" },
  PICKED_UP: { label: "Telah Diambil Kurir", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  IN_TRANSIT: { label: "Dalam Perjalanan", color: "bg-cyan-50 text-cyan-800 border-cyan-200" },
  ARRIVED_AT_RT: { label: "Tiba di Titik Antar", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  ARRIVED_AT_USER: { label: "Tiba di Warga", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  DELIVERED: { label: "Pengiriman Selesai", color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  FAILED: { label: "Gagal", color: "bg-rose-100 text-rose-800 border-rose-200" },
  RETURNED: { label: "Dikembalikan", color: "bg-stone-100 text-stone-700 border-stone-200" },
  CANCELLED: { label: "Dibatalkan", color: "bg-stone-100 text-stone-500 border-stone-200" },
};

const formatRp = (value: number) => `Rp${value.toLocaleString("id-ID")}`;

export default function DriverPortal() {
  const {
    activeUser,
    driverProfiles,
    deliveryTasks,
    orders,
    cashCollections,
    acceptDeliveryTask,
    rejectDeliveryTask,
    confirmDeliveryPickup,
    startDeliveryTransit,
    completeDeliveryTask,
    failDeliveryTask,
  } = useApp();

  const [proofInputs, setProofInputs] = React.useState<Record<string, string>>({});
  const [codInputs, setCodInputs] = React.useState<Record<string, string>>({});
  const [packageInputs, setPackageInputs] = React.useState<Record<string, string>>({});
  const [reasonInputs, setReasonInputs] = React.useState<Record<string, string>>({});
  const [activeMapTask, setActiveMapTask] = React.useState<DeliveryTask | null>(null);
  const [mapProvider, setMapProvider] = React.useState<'google' | 'osm'>('google');

  const COOP_COORD = { latitude: -8.409512, longitude: 115.188912 };
  
  const getDestinationCoordinates = (task: DeliveryTask) => {
    if (task.delivery_type === "RT_BATCH_DELIVERY") {
      // Drop to Dropoff Hub
      return { latitude: -8.407500, longitude: 115.191500 };
    }
    // citizen home
    if (task.recipient_name?.toLowerCase().includes("dinda")) {
      return { latitude: -8.404000, longitude: 115.194800 };
    } else if (task.recipient_name?.toLowerCase().includes("rina")) {
      return { latitude: -8.404800, longitude: 115.195200 };
    } else if (task.recipient_name?.toLowerCase().includes("sari")) {
      return { latitude: -8.403500, longitude: 115.193900 };
    }
    // default
    return { latitude: -8.405000, longitude: 115.193400 };
  };

  const profile = driverProfiles.find((driver) => driver.user_id === activeUser?.id);
  const myTasks = deliveryTasks.filter((task) => task.driver_id === profile?.id);
  const openTasks = myTasks.filter((task) => !["DELIVERED", "FAILED", "RETURNED", "CANCELLED", "REJECTED"].includes(task.status));
  const completedTasks = myTasks.filter((task) => task.status === "DELIVERED");
  const payable = completedTasks.reduce((sum, task) => sum + task.driver_incentive, 0);
  const codOutstanding = cashCollections
    .filter((cash) => cash.collector_id === profile?.id && cash.status !== "SETTLED")
    .reduce((sum, cash) => sum + Math.max(cash.expected_amount - cash.collected_amount, 0), 0);

  const runAction = async (label: string, action: () => Promise<{ success: boolean; error?: string }>) => {
    const result = await action();
    if (!result.success) {
      Alert.alert("Gagal", result.error || `${label} gagal.`);
      return;
    }
    Alert.alert("Berhasil", label);
  };

  const getRelatedOrder = (task: DeliveryTask) => {
    if (!task.order_id) return null;
    return orders.find((order) => order.id === task.order_id) || null;
  };

  const updateInput = (
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    taskId: string,
    value: string,
  ) => {
    setter((prev) => ({ ...prev, [taskId]: value }));
  };

  const renderTaskActions = (task: DeliveryTask) => {
    const packageCount = parseInt(packageInputs[task.id] || String(task.package_count), 10) || task.package_count;
    const proof = proofInputs[task.id] || "";
    const cod = parseInt(codInputs[task.id] || String(task.cod_amount || 0), 10) || 0;
    const reason = reasonInputs[task.id] || "";

    if (task.status === "ASSIGNED") {
      return (
        <View className="flex-row gap-2 mt-3">
          <Pressable
            onPress={() => runAction("Tugas diterima.", () => acceptDeliveryTask(task.id))}
            className="flex-1 bg-emerald-700 border border-emerald-800 rounded-xl py-2.5 items-center"
          >
            <Text className="text-white text-xs font-black">Terima</Text>
          </Pressable>
          <Pressable
            onPress={() => runAction("Tugas ditolak.", () => rejectDeliveryTask(task.id, reason || "Bentrok jadwal"))}
            className="px-4 bg-white border border-rose-200 rounded-xl py-2.5 items-center"
          >
            <Text className="text-rose-700 text-xs font-black">Tolak</Text>
          </Pressable>
        </View>
      );
    }

    if (task.status === "ACCEPTED" || task.status === "READY_FOR_PICKUP" || task.status === "PREPARING_PICKUP") {
      return (
        <View className="mt-3 gap-2">
          <View className="flex-row gap-2">
            <TextInput
              value={packageInputs[task.id] || String(task.package_count)}
              onChangeText={(value) => updateInput(setPackageInputs, task.id, value)}
              keyboardType="numeric"
              className="w-24 bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold"
              placeholder="Paket"
            />
            <Pressable
              onPress={() => runAction("Pickup terkonfirmasi.", () => confirmDeliveryPickup(task.id, packageCount))}
              className="flex-1 bg-amber-400 border border-amber-500 rounded-xl py-2.5 items-center"
            >
              <Text className="text-emerald-950 text-xs font-black">Pindai Kode Pengambilan</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    if (task.status === "PICKED_UP") {
      return (
        <Pressable
          onPress={() => runAction("Pengiriman dimulai.", () => startDeliveryTransit(task.id))}
          className="mt-3 bg-blue-600 border border-blue-700 rounded-xl py-2.5 items-center"
        >
          <Text className="text-white text-xs font-black">Mulai Antar</Text>
        </Pressable>
      );
    }

    if (task.status === "IN_TRANSIT" || task.status === "ARRIVED_AT_RT" || task.status === "ARRIVED_AT_USER") {
      return (
        <View className="mt-3 gap-2">
          <TextInput
            value={proofInputs[task.id] || ""}
            onChangeText={(value) => updateInput(setProofInputs, task.id, value)}
            className="bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-xs"
            placeholder={task.delivery_type === "RT_BATCH_DELIVERY" ? "Kode/PIN penerima" : "PIN warga / catatan bukti"}
          />
          {task.cod_amount > 0 && (
            <TextInput
              value={codInputs[task.id] || String(task.cod_amount)}
              onChangeText={(value) => updateInput(setCodInputs, task.id, value)}
              keyboardType="numeric"
              className="bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold"
              placeholder="COD terkumpul"
            />
          )}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => runAction("Pengiriman selesai.", () => completeDeliveryTask(task.id, proof || "CONFIRMED", cod))}
              className="flex-1 bg-emerald-700 border border-emerald-800 rounded-xl py-2.5 items-center"
            >
              <Text className="text-white text-xs font-black">Selesaikan Pengiriman</Text>
            </Pressable>
            <Pressable
              onPress={() => runAction("Gagal antar dicatat.", () => failDeliveryTask(task.id, reason || "Penerima tidak dapat dihubungi"))}
              className="px-4 bg-white border border-rose-200 rounded-xl py-2.5 items-center"
            >
              <Text className="text-rose-700 text-xs font-black">Gagal</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return null;
  };

  if (!profile) {
    return (
      <View className="flex-1 bg-stone-100 items-center justify-center p-6">
        <SymbolView name="person.crop.circle.badge.exclamationmark" size={42} tintColor="#d97706" />
        <Text className="text-stone-900 font-black text-base mt-3">Profil KopKurir belum aktif</Text>
        <Text className="text-stone-500 text-xs text-center mt-1">
          Pilih akun driver demo seperti Mang Ujang atau Dewi Lestari dari menu akun.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-100">
      <View className="bg-white border-b border-stone-200 p-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-stone-900 font-black text-lg">KopKurir Hari Ini</Text>
            <Text className="text-stone-500 text-[10px] mt-0.5">
              {profile.name} • {profile.vehicle_type} • radius {profile.service_radius_km} km
            </Text>
          </View>
          <View className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 items-end">
            <Text className="text-emerald-700 text-[9px] font-black">Insentif</Text>
            <Text className="text-emerald-950 font-black text-sm">{formatRp(payable)}</Text>
          </View>
        </View>

        <View className="flex-row gap-2 mt-3">
          <View className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-3">
            <Text className="text-stone-400 text-[9px] font-bold uppercase">Tugas Aktif</Text>
            <Text className="text-stone-900 font-black text-lg">{openTasks.length}</Text>
          </View>
          <View className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <Text className="text-amber-700 text-[9px] font-bold uppercase">COD Belum Setor</Text>
            <Text className="text-amber-900 font-black text-lg">{formatRp(codOutstanding)}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-28">
        {myTasks.length === 0 ? (
          <View className="bg-white border border-stone-200 rounded-xl p-8 items-center mt-6">
            <SymbolView name="tray" size={32} tintColor="#a8a29e" />
            <Text className="text-stone-500 text-xs mt-2">Belum ada tugas pengiriman.</Text>
          </View>
        ) : (
          myTasks.map((task) => {
            const meta = statusMeta[task.status] || statusMeta.PENDING_DISPATCH;
            const relatedOrder = getRelatedOrder(task);
            return (
              <View key={task.id} className="bg-white border border-stone-200 rounded-2xl p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between gap-3">
                  <View className="flex-1">
                    <View className="flex-row gap-2 items-center flex-wrap">
                      <Text className="text-stone-900 font-black text-sm">
                        {task.delivery_type === "RT_BATCH_DELIVERY" ? "Drop ke Dropoff Hub" : "Kirim ke Rumah"}
                      </Text>
                      <View className={`px-2 py-0.5 rounded-full border ${meta.color}`}>
                        <Text className="text-[8px] font-black">{meta.label}</Text>
                      </View>
                    </View>
                    <Text className="text-stone-500 text-[10px] mt-1">
                      {task.recipient_name} • {task.recipient_phone || "kontak"}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Pressable
                      onPress={() => setActiveMapTask(task)}
                      className="bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg flex-row items-center gap-1 active:bg-emerald-100 mb-1"
                    >
                      <SymbolView name="map.fill" size={8} tintColor="#047857" />
                      <Text className="text-emerald-700 text-[8px] font-bold">Rute Peta</Text>
                    </Pressable>
                    <Text className="text-stone-400 text-[9px]">Insentif</Text>
                    <Text className="text-emerald-800 font-black text-xs">{formatRp(task.driver_incentive)}</Text>
                  </View>
                </View>

                <View className="mt-3 bg-stone-50 border border-stone-100 rounded-xl p-3 gap-1">
                  <Text className="text-stone-400 text-[9px] font-bold uppercase">Tujuan</Text>
                  <Text className="text-stone-800 text-xs font-semibold">{task.destination_address}</Text>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-stone-500 text-[10px]">Kode pickup</Text>
                    <Text className="text-stone-900 text-[10px] font-black">{task.pickup_code}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-stone-500 text-[10px]">Paket / COD</Text>
                    <Text className="text-stone-900 text-[10px] font-black">
                      {task.package_count} paket • {task.cod_amount > 0 ? formatRp(task.cod_amount) : "Non-COD"}
                    </Text>
                  </View>
                  {relatedOrder && (
                    <View className="flex-row justify-between">
                      <Text className="text-stone-500 text-[10px]">Order</Text>
                      <Text className="text-stone-900 text-[10px] font-black">{relatedOrder.id.substring(0, 14)}...</Text>
                    </View>
                  )}
                </View>

                {["ASSIGNED", "IN_TRANSIT"].includes(task.status) && (
                  <TextInput
                    value={reasonInputs[task.id] || ""}
                    onChangeText={(value) => updateInput(setReasonInputs, task.id, value)}
                    className="mt-3 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-xs"
                    placeholder="Catatan jika menolak/gagal antar"
                  />
                )}

                {renderTaskActions(task)}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Driver Map Modal */}
      {activeMapTask && (() => {
        const dest = getDestinationCoordinates(activeMapTask);
        const region = {
          latitude: (COOP_COORD.latitude + dest.latitude) / 2,
          longitude: (COOP_COORD.longitude + dest.longitude) / 2,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        };
        const markers = [
          { coordinate: COOP_COORD, title: "Koperasi Sukamaju", description: "Titik Pengambilan Paket", type: "cooperative" as const, color: "#059669" },
          { coordinate: dest, title: activeMapTask.recipient_name, description: activeMapTask.destination_address, type: "home" as const, color: "#dc2626" }
        ];
        const polylines = [
          { coordinates: [COOP_COORD, dest], color: "#059669", width: 5 }
        ];

        return (
          <AppModal
            visible={!!activeMapTask}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setActiveMapTask(null)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <View style={{ width: '100%', height: '70%', backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#e7e5e4' }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e7e5e4' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#064e3b' }}>Peta Rute Pengantaran</Text>
                    <Text style={{ fontSize: 10, color: '#78716c', marginTop: 2 }} numberOfLines={1}>{activeMapTask.recipient_name} • {activeMapTask.destination_address}</Text>
                  </View>
                  <Pressable onPress={() => setActiveMapTask(null)} style={{ padding: 6, borderRadius: 9999, backgroundColor: '#e7e5e4' }}>
                    <SymbolView name="xmark" size={12} tintColor="#555" />
                  </Pressable>
                </View>

                {/* Provider switcher */}
                <View style={{ flexDirection: 'row', backgroundColor: '#f5f5f4', padding: 4, borderBottomWidth: 1, borderBottomColor: '#e7e5e4' }}>
                  <Pressable
                    onPress={() => setMapProvider('google')}
                    style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: mapProvider === 'google' ? '#059669' : '#fff', borderWidth: 0.5, borderColor: '#d6d3d1', marginRight: 4 }}
                  >
                    <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: mapProvider === 'google' ? '#fff' : '#44403c' }}>Google / Apple Maps</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setMapProvider('osm')}
                    style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: mapProvider === 'osm' ? '#059669' : '#fff', borderWidth: 0.5, borderColor: '#d6d3d1' }}
                  >
                    <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: mapProvider === 'osm' ? '#fff' : '#44403c' }}>OpenStreetMap</Text>
                  </Pressable>
                </View>

                {/* Map Display area */}
                <View style={{ flex: 1, backgroundColor: '#cbd5e1' }}>
                  {mapProvider === 'osm' ? (
                    <OpenStreetMapView
                      region={region}
                      markers={markers}
                      polylines={polylines}
                    />
                  ) : (
                    Platform.OS === 'web' ? (
                      <iframe
                        src={`https://maps.google.com/maps?q=${dest.latitude},${dest.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        style={{ width: '100%', height: '100%', border: 0 }}
                      />
                    ) : (
                      MapView && Marker ? (
                        <MapView
                          style={{ flex: 1 }}
                          initialRegion={region}
                        >
                          <Marker coordinate={COOP_COORD} title="Koperasi Sukamaju" pinColor="green" />
                          <Marker coordinate={dest} title={activeMapTask.recipient_name} pinColor="red" />
                          {Polyline && <Polyline coordinates={[COOP_COORD, dest]} strokeColor="#059669" strokeWidth={5} />}
                        </MapView>
                      ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 12, color: '#666' }}>Peta tidak dapat dimuat</Text>
                        </View>
                      )
                    )
                  )}
                </View>

                {/* Footer action */}
                <View style={{ padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e7e5e4', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 9, color: '#78716c', fontWeight: 'bold' }}>Rute: 1.2 km dari Koperasi</Text>
                  <Pressable
                    onPress={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${dest.latitude},${dest.longitude}`;
                      Linking.openURL(url).catch(() => Alert.alert("Gagal", "Aplikasi peta tidak dapat dibuka"));
                    }}
                    style={{ backgroundColor: '#ea580c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  >
                    <SymbolView name="safari" size={10} tintColor="#fff" />
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>Buka Navigasi</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </AppModal>
        );
      })()}
    </View>
  );
}
