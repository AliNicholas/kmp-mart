import { useApp } from "@/contexts/AppContext";
import { dbService } from "@/utils/db";
import { SymbolView } from "expo-symbols";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

export default function SupplierPortal() {
  const {
    purchaseOrders,
    supplierProducts,
    refreshData,
  } = useApp();

  const [activeTab, setActiveTab] = useState(0); // 0: PO Masuk, 1: Katalog Produk

  // Supplier ID for Agro Pangan (pre-seeded as sup-1)
  const supplierId = "sup-1";
  const supplierName = "PT Agro Pangan Nusantara";

  // Filter POs for this supplier
  const incomingPOs = purchaseOrders.filter((po) => po.supplier_id === supplierId);
  const myProducts = supplierProducts.filter((sp) => sp.supplier_id === supplierId);

  const handleShipGoods = async (poId: string) => {
    try {
      Alert.alert(
        "Kirim Pesanan",
        "Apakah Anda yakin ingin mengirim barang untuk PO ini?",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Kirim",
            onPress: async () => {
              await dbService.run(
                `UPDATE purchase_orders SET status = 'SHIPPED' WHERE id = ?`,
                [poId]
              );
              Alert.alert("Sukses", `Pesanan ${poId} telah dikirim.`);
              await refreshData();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Gagal memperbarui status PO.");
    }
  };

  const renderPOMasuk = () => (
    <ScrollView className="flex-1 px-4 pt-3 mb-16">
      <View className="bg-emerald-800 p-4 rounded-3xl mb-4 border border-emerald-900 shadow-sm">
        <Text className="text-white font-extrabold text-sm">{supplierName}</Text>
        <Text className="text-emerald-300 text-[10px] uppercase font-bold">Role: Mitra Supplier Utama</Text>
      </View>

      <Text className="text-stone-900 font-extrabold text-xs mb-3">Pesanan Masuk dari Koperasi (Purchase Orders)</Text>

      {incomingPOs.length === 0 ? (
        <View className="bg-white border border-stone-200 border-dashed rounded-3xl p-6 items-center">
          <Text className="text-stone-400 text-[11px] italic">Belum ada PO masuk dari koperasi.</Text>
        </View>
      ) : (
        incomingPOs.map((po) => (
          <View key={po.id} className="bg-white border border-stone-200 rounded-3xl p-4 mb-3 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-stone-500 text-[9px] font-bold">PO ID: {po.id}</Text>
              <View className={`px-2 py-0.5 rounded-full border ${
                po.status === "PENDING"
                  ? "bg-amber-50 border-amber-100 text-amber-800"
                  : po.status === "SHIPPED"
                  ? "bg-blue-50 border-blue-100 text-blue-800"
                  : "bg-emerald-50 border-emerald-100 text-emerald-800"
              }`}>
                <Text className="text-[8px] font-black">{po.status}</Text>
              </View>
            </View>

            <Text className="text-stone-950 font-black text-xs mb-1">{po.product_name}</Text>
            <Text className="text-stone-500 text-[10px] mb-2">Jumlah: {po.quantity} pcs • Total Tagihan: Rp{po.total.toLocaleString("id-ID")}</Text>

            {po.status === "PENDING" && (
              <Pressable
                onPress={() => handleShipGoods(po.id)}
                className="bg-emerald-700 active:bg-emerald-900 py-2.5 rounded-xl items-center mt-1"
              >
                <Text className="text-white text-[10px] font-black">Konfirmasi & Kirim Barang</Text>
              </Pressable>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderKatalog = () => (
    <ScrollView className="flex-1 px-4 pt-3 mb-16">
      <Text className="text-stone-900 font-extrabold text-xs mb-3">Daftar Produk Terdaftar</Text>
      {myProducts.length === 0 ? (
        <View className="bg-white border border-stone-200 border-dashed rounded-3xl p-6 items-center">
          <Text className="text-stone-400 text-[11px] italic">Belum ada produk terdaftar untuk supplier ini.</Text>
        </View>
      ) : (
        <View className="bg-white border border-stone-200 rounded-3xl p-4 shadow-sm">
          {myProducts.map((p, idx) => (
            <View key={p.id} className={`py-3 flex-row justify-between items-center ${idx > 0 ? "border-t border-stone-100" : ""}`}>
              <View>
                <Text className="text-stone-950 font-bold text-xs">{p.name}</Text>
                <Text className="text-stone-400 text-[9px]">Harga Kontrak: Rp{p.price.toLocaleString("id-ID")} • MOQ: {p.moq} {p.unit}</Text>
              </View>
              <View className="bg-emerald-50 px-2 py-1 rounded-lg">
                <Text className="text-emerald-800 font-bold text-[9px]">{p.lead_time}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-stone-100">
      {activeTab === 0 ? renderPOMasuk() : renderKatalog()}

      {/* Tabs Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 h-16 flex-row justify-around items-center">
        <Pressable
          onPress={() => setActiveTab(0)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="envelope.fill"
            size={18}
            tintColor={activeTab === 0 ? "#0f5132" : "#888"}
          />
          <Text className={`text-[10px] mt-1 font-bold ${activeTab === 0 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}>
            PO Masuk
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab(1)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="list.bullet.rectangle.fill"
            size={18}
            tintColor={activeTab === 1 ? "#0f5132" : "#888"}
          />
          <Text className={`text-[10px] mt-1 font-bold ${activeTab === 1 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}>
            Katalog Produk
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
