import { useApp } from "@/contexts/AppContext";
import { DeliveryStatus, DeliveryTask } from "@/utils/db";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const statusMeta: Record<DeliveryStatus, { label: string; color: string }> = {
  PENDING_DISPATCH: { label: "Menunggu Dispatch", color: "bg-stone-100 text-stone-700 border-stone-200" },
  ASSIGNED: { label: "Ditugaskan", color: "bg-blue-50 text-blue-800 border-blue-200" },
  ACCEPTED: { label: "Diterima", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  REJECTED: { label: "Ditolak", color: "bg-rose-50 text-rose-700 border-rose-200" },
  PREPARING_PICKUP: { label: "Disiapkan", color: "bg-amber-50 text-amber-800 border-amber-200" },
  READY_FOR_PICKUP: { label: "Siap Pickup", color: "bg-amber-50 text-amber-800 border-amber-200" },
  PICKED_UP: { label: "Sudah Pickup", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  IN_TRANSIT: { label: "Dalam Perjalanan", color: "bg-cyan-50 text-cyan-800 border-cyan-200" },
  ARRIVED_AT_RT: { label: "Tiba di RT", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  ARRIVED_AT_USER: { label: "Tiba di Warga", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  DELIVERED: { label: "Selesai", color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
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
              <Text className="text-emerald-950 text-xs font-black">Scan Pickup QR</Text>
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
            placeholder={task.delivery_type === "RT_BATCH_DELIVERY" ? "Kode/PIN RT penerima" : "PIN warga / catatan bukti"}
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
              <Text className="text-white text-xs font-black">Selesaikan</Text>
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
                        {task.delivery_type === "RT_BATCH_DELIVERY" ? "Drop ke Pos RT" : "Kirim ke Rumah"}
                      </Text>
                      <View className={`px-2 py-0.5 rounded-full border ${meta.color}`}>
                        <Text className="text-[8px] font-black">{meta.label}</Text>
                      </View>
                    </View>
                    <Text className="text-stone-500 text-[10px] mt-1">
                      {task.recipient_name} • {task.recipient_phone || "kontak RT"}
                    </Text>
                  </View>
                  <View className="items-end">
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
    </View>
  );
}
