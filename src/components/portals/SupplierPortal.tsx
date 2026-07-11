import { useApp } from "@/contexts/AppContext";
import { dbService } from "@/utils/db";
import { SymbolView } from "@/components/app-symbol";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View, Modal, TextInput } from "react-native";

const generateSupplierProductId = () => {
  return `sp-${Date.now()}`;
};

export default function SupplierPortal() {
  const {
    purchaseOrders,
    supplierProducts,
    refreshData,
  } = useApp();

  const [activeTab, setActiveTab] = useState(0); // 0: PO Masuk, 1: Katalog Produk

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newMoq, setNewMoq] = useState("");
  const [newUnit, setNewUnit] = useState("pcs");
  const [newLeadTime, setNewLeadTime] = useState("1 Hari");

  const handleAddProduct = async () => {
    if (!newName.trim() || !newPrice.trim() || !newMoq.trim()) {
      Alert.alert("Gagal", "Harap isi semua kolom wajib.");
      return;
    }

    const priceNum = parseFloat(newPrice);
    const moqNum = parseInt(newMoq);

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Gagal", "Harga kontrak harus berupa angka positif.");
      return;
    }
    if (isNaN(moqNum) || moqNum <= 0) {
      Alert.alert("Gagal", "MOQ harus berupa angka positif.");
      return;
    }

    try {
      const newId = generateSupplierProductId();
      await dbService.run(
        `INSERT INTO supplier_products (id, supplier_id, name, price, moq, lead_time, unit)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newId, supplierId, newName.trim(), priceNum, moqNum, newLeadTime, newUnit.trim()]
      );

      Alert.alert("Sukses", `Produk ${newName} telah ditambahkan ke katalog.`);
      setAddModalOpen(false);
      setNewName("");
      setNewPrice("");
      setNewMoq("");
      setNewUnit("pcs");
      setNewLeadTime("1 Hari");
      await refreshData();
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Gagal menambahkan produk.");
    }
  };

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
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-stone-900 font-extrabold text-xs">Daftar Produk Terdaftar</Text>
        <Pressable
          onPress={() => setAddModalOpen(true)}
          className="bg-emerald-800 active:bg-emerald-950 px-3 py-1.5 rounded-full flex-row items-center gap-1"
        >
          <SymbolView name="plus" size={10} tintColor="#fff" />
          <Text className="text-white text-[9px] font-black">Tambah Produk</Text>
        </Pressable>
      </View>
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

      {/* Add Product Modal */}
      <Modal
        visible={addModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddModalOpen(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            onPress={() => setAddModalOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <View className="bg-white rounded-t-3xl p-5 max-h-[85%]">
            <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
              <Text className="text-emerald-950 font-black text-lg">
                Tambah Produk Kontrak
              </Text>
              <Pressable
                onPress={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 items-center justify-center active:bg-stone-200"
              >
                <SymbolView name="xmark" size={14} tintColor="#1c1917" />
              </Pressable>
            </View>

            <ScrollView className="mb-4">
              <View className="mb-3">
                <Text className="text-stone-500 text-[10px] font-bold uppercase mb-1">
                  Nama Produk <Text className="text-rose-500">*</Text>
                </Text>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Contoh: Beras Premium 5kg"
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-950 font-bold"
                />
              </View>

              <View className="mb-3">
                <Text className="text-stone-500 text-[10px] font-bold uppercase mb-1">
                  Harga Kontrak (Rp) <Text className="text-rose-500">*</Text>
                </Text>
                <TextInput
                  value={newPrice}
                  onChangeText={setNewPrice}
                  placeholder="Contoh: 62000"
                  keyboardType="numeric"
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-950 font-bold"
                />
              </View>

              <View className="mb-3">
                <Text className="text-stone-500 text-[10px] font-bold uppercase mb-1">
                  Minimum Order Qty (MOQ) <Text className="text-rose-500">*</Text>
                </Text>
                <TextInput
                  value={newMoq}
                  onChangeText={setNewMoq}
                  placeholder="Contoh: 20"
                  keyboardType="numeric"
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-950 font-bold"
                />
              </View>

              <View className="mb-3">
                <Text className="text-stone-500 text-[10px] font-bold uppercase mb-1">
                  Satuan Unit
                </Text>
                <View className="flex-row flex-wrap gap-1.5 mt-1">
                  {["pcs", "kg", "liter", "karung", "pack", "dus"].map((u) => {
                    const isSelected = newUnit === u;
                    return (
                      <Pressable
                        key={u}
                        onPress={() => setNewUnit(u)}
                        className={`px-3 py-1.5 rounded-xl border ${
                          isSelected
                            ? "bg-emerald-800 border-emerald-950"
                            : "bg-stone-50 border-stone-200"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold ${
                            isSelected ? "text-white font-black" : "text-stone-600"
                          }`}
                        >
                          {u}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-stone-500 text-[10px] font-bold uppercase mb-1">
                  Estimasi Lead Time (Waktu Kirim)
                </Text>
                <TextInput
                  value={newLeadTime}
                  onChangeText={setNewLeadTime}
                  placeholder="Contoh: 2 Hari"
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-950 font-bold"
                />
              </View>
            </ScrollView>

            <Pressable
              onPress={handleAddProduct}
              className="bg-emerald-800 active:bg-emerald-950 py-3 rounded-2xl items-center mb-6"
            >
              <Text className="text-white text-xs font-black">
                Simpan & Daftarkan Produk
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
