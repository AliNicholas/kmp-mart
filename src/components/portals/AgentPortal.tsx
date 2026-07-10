import { useApp } from "@/contexts/AppContext";
import { dbService, Product } from "@/utils/db";
import { SymbolView } from "@/components/app-symbol";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AgentPortal() {
  const {
    activeUser,
    products,
    orders,
    createKopRequest,
    checkout,
    refreshData,
    addToCart,
    clearCart,
  } = useApp();

  const [activeTab, setActiveTab] = useState(0); // 0: Katalog & B2B, 1: Riwayat Order, 2: KopRequest
  const [b2bCart, setB2bCart] = useState<Record<string, number>>({});
  const [newRequestProductName, setNewRequestProductName] = useState("");
  const [newRequestQty, setNewRequestQty] = useState("1");

  // Filter B2B orders for current agent user
  const b2bOrders = orders.filter(
    (o) => o.user_id === activeUser?.id && o.channel === "B2B_AGENT",
  );

  // Predefined Partner prices (wholesale, approx 20-30% cheaper)
  const getPartnerPrice = (p: Product) => {
    if (p.name.includes("Beras")) return 55000;
    if (p.name.includes("Minyak")) return 13500;
    if (p.name.includes("Kopi")) return 6000;
    return Math.round(p.price * 0.75); // default 25% discount
  };

  const handleAddToCart = (productId: string) => {
    setB2bCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const handleUpdateCart = (productId: string, qty: number) => {
    if (qty <= 0) {
      const copy = { ...b2bCart };
      delete copy[productId];
      setB2bCart(copy);
    } else {
      setB2bCart((prev) => ({
        ...prev,
        [productId]: qty,
      }));
    }
  };

  const handleCheckoutB2B = async (
    fulfillment: "PICKUP_AT_COOP" | "DELIVERY_TO_HOME",
  ) => {
    const cartItems = Object.entries(b2bCart);
    if (cartItems.length === 0) {
      Alert.alert(
        "Keranjang Kosong",
        "Silakan tambahkan produk ke keranjang B2B.",
      );
      return;
    }

    try {
      Alert.alert(
        "Konfirmasi Order B2B",
        "Apakah Anda yakin ingin mengirim order B2B ke koperasi desa?",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Kirim",
            onPress: async () => {
              // 1. Clear current active cart
              clearCart();

              // 2. Populate cart with B2B Partner-priced products
              for (const [prodId, qty] of cartItems) {
                const p = products.find((prod) => prod.id === prodId);
                if (p) {
                  const partnerPrice = getPartnerPrice(p);
                  const partnerProduct = { ...p, price: partnerPrice };
                  addToCart(partnerProduct, qty);
                }
              }

              // 3. Checkout under B2B_AGENT channel
              const res = await checkout(fulfillment, "B2B_AGENT", 0, null);
              if (res.success) {
                Alert.alert(
                  "Sukses",
                  `Order B2B ${res.orderId} berhasil dikirim ke Koperasi Desa.`,
                );
                setB2bCart({});
                clearCart();
              } else {
                Alert.alert("Gagal", res.error || "Gagal membuat order B2B.");
              }
              await refreshData();
            },
          },
        ],
      );
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Gagal membuat order B2B.");
    }
  };

  const renderKatalog = () => (
    <ScrollView className="flex-1 px-4 pt-3 mb-16">
      <View className="bg-emerald-800 p-4 rounded-3xl mb-4 border border-emerald-900 shadow-sm">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-white font-extrabold text-sm">
              {activeUser?.name || "Warung Bu Sari"}
            </Text>
            <Text className="text-emerald-300 text-[10px] uppercase font-bold">
              Kemitraan: Mitra Agen Warung
            </Text>
          </View>
          <View className="bg-emerald-950 px-3 py-1 rounded-full">
            <Text className="text-amber-400 text-[9px] font-black">
              Limit Kredit: Rp5.000.000
            </Text>
          </View>
        </View>
        <Text className="text-emerald-100 text-[10px]">
          Alamat Pengiriman B2B: {activeUser?.address || "RT 03/RW 02"}
        </Text>
      </View>

      <Text className="text-stone-900 font-extrabold text-xs mb-3">
        Partner Catalog (Harga Grosir Agen)
      </Text>

      <View className="flex-row flex-wrap justify-between gap-y-3 mb-4">
        {products.map((p) => {
          const partnerPrice = getPartnerPrice(p);
          const inCart = b2bCart[p.id] || 0;

          return (
            <View
              key={p.id}
              className="w-[48%] bg-white border border-stone-200 rounded-3xl p-3 shadow-sm justify-between"
            >
              <View className="mb-2">
                <Text
                  className="text-stone-950 font-extrabold text-xs"
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
                <Text className="text-stone-400 text-[9px] mb-2">
                  Unit: {p.unit} • Stok Koperasi: {p.stock}
                </Text>

                <Text className="text-stone-400 text-[9px] line-through">
                  Harga Eceran: Rp{p.price.toLocaleString("id-ID")}
                </Text>
                <Text className="text-emerald-800 font-black text-xs">
                  Harga Mitra: Rp{partnerPrice.toLocaleString("id-ID")}
                </Text>
              </View>

              {inCart > 0 ? (
                <View className="flex-row items-center justify-between bg-stone-100 rounded-xl px-2 py-1">
                  <Pressable
                    onPress={() => handleUpdateCart(p.id, inCart - 1)}
                    className="p-1"
                  >
                    <Text className="text-stone-700 font-extrabold text-xs">
                      -
                    </Text>
                  </Pressable>
                  <Text className="text-stone-950 font-bold text-xs">
                    {inCart}
                  </Text>
                  <Pressable
                    onPress={() => handleUpdateCart(p.id, inCart + 1)}
                    className="p-1"
                  >
                    <Text className="text-stone-700 font-extrabold text-xs">
                      +
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => handleAddToCart(p.id)}
                  className="bg-emerald-700 active:bg-emerald-900 py-2 rounded-xl items-center"
                >
                  <Text className="text-white text-[10px] font-black">
                    + Tambah Order
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      {Object.keys(b2bCart).length > 0 && (
        <View className="bg-white border border-stone-200 rounded-3xl p-4 mb-8 shadow-sm">
          <Text className="text-stone-900 font-extrabold text-xs mb-3">
            Ringkasan Keranjang B2B
          </Text>

          {Object.entries(b2bCart).map(([prodId, qty]) => {
            const prod = products.find((p) => p.id === prodId);
            if (!prod) return null;
            const partnerPrice = getPartnerPrice(prod);
            return (
              <View
                key={prodId}
                className="flex-row justify-between items-center mb-2 pb-2 border-b border-stone-100"
              >
                <View>
                  <Text className="text-stone-950 font-bold text-xs">
                    {prod.name}
                  </Text>
                  <Text className="text-stone-500 text-[10px]">
                    {qty} x Rp{partnerPrice.toLocaleString("id-ID")}
                  </Text>
                </View>
                <Text className="text-stone-950 font-extrabold text-xs">
                  Rp{(partnerPrice * qty).toLocaleString("id-ID")}
                </Text>
              </View>
            );
          })}

          <View className="flex-row justify-between items-center mt-3 mb-4">
            <Text className="text-stone-600 text-xs">Total Pembelian:</Text>
            <Text className="text-emerald-800 font-black text-sm">
              Rp
              {Object.entries(b2bCart)
                .reduce((sum, [prodId, qty]) => {
                  const prod = products.find((p) => p.id === prodId);
                  return sum + (prod ? getPartnerPrice(prod) * qty : 0);
                }, 0)
                .toLocaleString("id-ID")}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <Pressable
              onPress={() => handleCheckoutB2B("PICKUP_AT_COOP")}
              className="bg-emerald-700 active:bg-emerald-900 py-3 rounded-xl flex-1 items-center"
            >
              <Text className="text-white text-xs font-black">
                Ambil Sendiri (Rp0)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleCheckoutB2B("DELIVERY_TO_HOME")}
              className="bg-emerald-900 active:bg-emerald-950 py-3 rounded-xl flex-1 items-center"
            >
              <Text className="text-white text-xs font-black">
                Kirim ke Warung (Rp10k)
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderRiwayat = () => (
    <ScrollView className="flex-1 px-4 pt-3 mb-16">
      <Text className="text-stone-900 font-extrabold text-xs mb-3">
        Riwayat Order Grosir B2B
      </Text>

      {b2bOrders.length === 0 ? (
        <View className="bg-white border border-stone-200 border-dashed rounded-3xl p-6 items-center">
          <Text className="text-stone-400 text-[11px] italic">
            Belum ada transaksi B2B terdaftar.
          </Text>
        </View>
      ) : (
        b2bOrders.map((o) => (
          <View
            key={o.id}
            className="bg-white border border-stone-200 rounded-3xl p-4 mb-3 shadow-sm"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-stone-500 text-[9px] font-bold">
                Order ID: {o.id}
              </Text>
              <View className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <Text className="text-emerald-800 text-[8px] font-black">
                  {o.order_status}
                </Text>
              </View>
            </View>

            <Text className="text-stone-950 font-black text-xs mb-1">
              Total Belanja: Rp{o.total.toLocaleString("id-ID")}
            </Text>
            <Text className="text-stone-400 text-[9px] mb-3">
              Tipe Fulfillment: {o.fulfillment}
            </Text>

            {o.order_status !== "COMPLETED" &&
              o.order_status !== "CANCELLED" && (
                <Pressable
                  onPress={async () => {
                    Alert.alert(
                      "Konfirmasi Barang Diterima",
                      "Apakah barang kiriman grosir sudah sampai dan sesuai di warung Anda?",
                      [
                        { text: "Belum", style: "cancel" },
                        {
                          text: "Sudah & Sesuai",
                          onPress: async () => {
                            await dbService.run(
                              `UPDATE orders SET order_status = 'COMPLETED', payment_status = 'PAID' WHERE id = ?`,
                              [o.id],
                            );
                            Alert.alert(
                              "Sukses",
                              "Terima kasih! Transaksi selesai.",
                            );
                            await refreshData();
                          },
                        },
                      ],
                    );
                  }}
                  className="bg-emerald-700 active:bg-emerald-950 py-2 rounded-xl items-center"
                >
                  <Text className="text-white text-[9px] font-black">
                    Konfirmasi Terima Barang
                  </Text>
                </Pressable>
              )}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderKopRequest = () => (
    <ScrollView className="flex-1 px-4 pt-3 mb-16">
      <View className="bg-white border border-stone-200 rounded-3xl p-4 mb-4 shadow-sm">
        <Text className="text-stone-900 font-extrabold text-xs mb-3">
          Catat Demand Warga (KopRequest)
        </Text>

        <View className="mb-2">
          <Text className="text-stone-500 text-[9px] font-bold uppercase mb-1">
            Nama Produk yang Warga Butuhkan:
          </Text>
          <TextInput
            value={newRequestProductName}
            onChangeText={setNewRequestProductName}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-950"
            placeholder="cth: Garam Beryodium"
          />
        </View>

        <View className="mb-3">
          <Text className="text-stone-500 text-[9px] font-bold uppercase mb-1">
            Jumlah Kebutuhan:
          </Text>
          <TextInput
            value={newRequestQty}
            onChangeText={setNewRequestQty}
            keyboardType="numeric"
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-950"
            placeholder="cth: 2"
          />
        </View>

        <Pressable
          onPress={async () => {
            if (!newRequestProductName.trim()) {
              Alert.alert("Error", "Nama produk wajib diisi.");
              return;
            }
            const reqQty = parseInt(newRequestQty) || 1;
            await createKopRequest(
              activeUser?.id || "user-sari",
              newRequestProductName,
              reqQty,
            );
            Alert.alert("Success", `KopRequest untuk warga berhasil disimpan!`);
            setNewRequestProductName("");
            setNewRequestQty("1");
          }}
          className="bg-emerald-700 active:bg-emerald-950 py-3 rounded-xl items-center"
        >
          <Text className="text-white text-xs font-black">
            Simpan Demand Warga
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-stone-100">
      {activeTab === 0 && renderKatalog()}
      {activeTab === 1 && renderRiwayat()}
      {activeTab === 2 && renderKopRequest()}

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 h-16 flex-row justify-around items-center">
        <Pressable
          onPress={() => setActiveTab(0)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="cart.fill"
            size={18}
            tintColor={activeTab === 0 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[10px] mt-1 font-bold ${activeTab === 0 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            B2B Catalog
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab(1)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="clock.fill"
            size={18}
            tintColor={activeTab === 1 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[10px] mt-1 font-bold ${activeTab === 1 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Riwayat B2B
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab(2)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="square.and.pencil"
            size={18}
            tintColor={activeTab === 2 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[10px] mt-1 font-bold ${activeTab === 2 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            KopRequest
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
