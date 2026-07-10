import { useApp } from "@/contexts/AppContext";
import { dbService } from "@/utils/db";
import { SymbolView } from "expo-symbols";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import DeliveryTrackerModal from "../DeliveryTrackerModal";
import CoopSelectorModal from "../CoopSelectorModal";

export default function CitizenPortal() {
  const {
    activeUser,
    products,
    orders,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    checkout,
    applyReferralCode,
  } = useApp();

  const [subTab, setSubTab] = useState(0); // 0: Belanja, 1: Pesanan, 2: Kartu & Poin
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedFulfillment, setSelectedFulfillment] = useState<
    "PICKUP_AT_COOP" | "DELIVERY_TO_HOME"
  >("DELIVERY_TO_HOME");
  const [usePoints, setUsePoints] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [detailOrder, setDetailOrder] = useState<any | null>(null);
  const [ptHistory, setPtHistory] = useState<any[]>([]);
  const [activeDeliveryOrderId, setActiveDeliveryOrderId] = useState<
    string | null
  >(null);
  const [activeCooperativeId, setActiveCooperativeId] = useState<string>('tenant-1');
  const [coopSelectorVisible, setCoopSelectorVisible] = useState(false);

  // Synchronize cooperative ID with active user
  React.useEffect(() => {
    if (activeUser?.cooperative_id) {
      const syncTask = setTimeout(() => {
        setActiveCooperativeId(activeUser.cooperative_id);
      }, 0);

      return () => clearTimeout(syncTask);
    }
  }, [activeUser]);

  // Fetch point history for active user
  React.useEffect(() => {
    if (activeUser) {
      dbService
        .getAll(
          "SELECT * FROM point_transactions WHERE user_id = ? ORDER BY created_at DESC",
          [activeUser.id],
        )
        .then(setPtHistory)
        .catch(console.error);
    }
  }, [activeUser, orders, subTab]);

  // Filter products
  const filteredProducts = products
    .filter(p => p.cooperative_id === activeCooperativeId)
    .filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (selectedCategory === "Semua") return matchesSearch;
      if (selectedCategory === "Produk Lokal")
        return p.is_local === 1 && matchesSearch;
      if (selectedCategory === "Paket Hemat")
        return p.name.toLowerCase().includes("paket") && matchesSearch;
      if (selectedCategory === "Sembako")
        return (
          !p.is_local && !p.name.toLowerCase().includes("paket") && matchesSearch
        );
      return matchesSearch;
    });

  // Calculate cart totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const maxPointsToUse = Math.floor((subtotal * 0.2) / 1000); // Max 20% discount, 1 point = Rp1,000
  const pointsToRedeem = usePoints
    ? Math.min(maxPointsToUse, activeUser?.points || 0)
    : 0;
  const discount = pointsToRedeem * 1000;
  const isCrossCoop = activeCooperativeId !== (activeUser?.cooperative_id || 'tenant-1');
  const logisticsSurcharge = activeCooperativeId === 'tenant-4'
    ? 15000
    : activeCooperativeId === 'tenant-5' || activeCooperativeId === 'tenant-6'
      ? 25000
      : isCrossCoop
        ? 5000
        : 0;
  const deliveryFee = selectedFulfillment === "DELIVERY_TO_HOME"
    ? Math.max(logisticsSurcharge, 7000)
    : logisticsSurcharge;
  const total = subtotal - discount + deliveryFee;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const res = await checkout(
      selectedFulfillment,
      "SELF_ORDER",
      pointsToRedeem,
      null,
    );

    if (res.success) {
      setCheckoutModalOpen(false);
      setIsCartOpen(false);
      setUsePoints(false);
      setSubTab(1); // Switch to orders tab

      if (selectedFulfillment === "DELIVERY_TO_HOME") {
        setActiveDeliveryOrderId(res.orderId || null);
      } else {
        Alert.alert("Sukses", "Pesanan berhasil dibuat!");
      }
    } else {
      Alert.alert("Gagal", res.error || "Gagal melakukan checkout.");
    }
  };

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return;
    const res = await applyReferralCode(referralInput);
    if (res.success) {
      Alert.alert("Sukses", "Kode referral berhasil diterapkan!");
      setReferralInput("");
    } else {
      Alert.alert("Gagal", res.error || "Gagal menerapkan kode referral.");
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "Menunggu Pembayaran";
      case "PAID":
        return "Sudah Dibayar";
      case "CONFIRMED":
        return "Dikonfirmasi Koperasi";
      case "PACKED":
        return "Sedang Dikemas";
      case "READY_FOR_PICKUP":
        return "Siap Diambil";
      case "DELIVERED_TO_RT":
        return "Tiba di Balai RT";
      case "PICKED_UP":
        return "Sudah Diambil";
      case "COMPLETED":
        return "Selesai";
      default:
        return "Dibatalkan";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "DELIVERED_TO_RT":
      case "READY_FOR_PICKUP":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PENDING_PAYMENT":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const getCoopName = (id: string) => {
    switch (id) {
      case 'tenant-1': return 'Koperasi Merah Putih Sukamaju';
      case 'tenant-2': return 'Koperasi Sukasari (Tetangga)';
      case 'tenant-3': return 'Koperasi Sukamukti (Tetangga)';
      case 'tenant-4': return 'Koperasi Jaya Makmur (Jawa Timur)';
      case 'tenant-5': return 'Koperasi Danau Toba (Sumatera Utara)';
      case 'tenant-6': return 'Koperasi Bunaken Lestari (Sulawesi Utara)';
      default: return 'Koperasi Desa';
    }
  };

  const getCoopWarningText = (id: string) => {
    switch (id) {
      case 'tenant-2':
        return '⚠️ Anda sedang belanja di Koperasi Sukasari (Tetangga). Pengiriman +1 hari & biaya kurir tambahan Rp5.000 berlaku.';
      case 'tenant-3':
        return '⚠️ Anda sedang belanja di Koperasi Sukamukti (Tetangga). Pengiriman +1 hari & biaya kurir tambahan Rp5.000 berlaku.';
      case 'tenant-4':
        return '⚠️ Anda sedang belanja di Koperasi Jaya Makmur (Jawa Timur - Luar Pulau). Pengiriman +3 hari & biaya logistik tambahan Rp15.000 berlaku.';
      case 'tenant-5':
        return '⚠️ Anda sedang belanja di Koperasi Danau Toba (Sumatera Utara - Luar Pulau). Pengiriman +5 hari & biaya logistik tambahan Rp25.000 berlaku.';
      case 'tenant-6':
        return '⚠️ Anda sedang belanja di Koperasi Bunaken Lestari (Sulawesi Utara - Luar Pulau). Pengiriman +4 hari & biaya logistik tambahan Rp25.000 berlaku.';
      default:
        return '';
    }
  };

  // Render Belanja
  const renderBelanja = () => (
    <View className="flex-1 pb-16">
      {/* Search Bar */}
      <View className="bg-white p-3 border-b border-stone-200 flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center bg-stone-100 rounded-full px-3 py-1.5 gap-2">
          <SymbolView name="magnifyingglass" size={14} tintColor="#777" />
          <TextInput
            placeholder="Cari beras, minyak, telur..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-xs text-stone-800 py-0"
          />
        </View>
        <Pressable
          onPress={() => setIsCartOpen(true)}
          className="relative bg-emerald-50 w-9 h-9 rounded-full items-center justify-center border border-emerald-100"
        >
          <SymbolView name="cart" size={16} tintColor="#0f5132" />
          {cart.length > 0 && (
            <View className="absolute -top-1 -right-1 bg-amber-500 rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-[9px] text-emerald-950 font-black">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
      {/* Cooperative Store Selector */}
      <View style={{ backgroundColor: '#064e3b', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#047857' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <SymbolView name="storefront.fill" size={14} tintColor="#a7f3d0" />
          <View>
            <Text style={{ fontSize: 8, color: '#a7f3d0', fontWeight: 'bold', textTransform: 'uppercase' }}>Lokasi Belanja Koperasi</Text>
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>
              {getCoopName(activeCooperativeId)}
            </Text>
          </View>
        </View>
        
        {/* Switch button */}
        <Pressable
          onPress={() => setCoopSelectorVisible(true)}
          style={{
            backgroundColor: '#047857',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 6,
            borderWidth: 0.5,
            borderColor: '#a7f3d0'
          }}
        >
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>Ganti Toko</Text>
        </Pressable>
      </View>

      {/* Neighboring Cooperative Warning Banner */}
      {isCrossCoop && (
        <View style={{ backgroundColor: '#fffbeb', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#fef3c7', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <SymbolView name="exclamationmark.triangle.fill" size={12} tintColor="#d97706" />
          <Text style={{ fontSize: 9, color: '#b45309', fontWeight: '600', flex: 1, lineHeight: 12 }}>
            {getCoopWarningText(activeCooperativeId)}
          </Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-stone-50 border-b border-stone-200 h-12 flex-none"
        contentContainerClassName="px-3 flex-row items-center"
      >
        {["Semua", "Sembako", "Produk Lokal", "Paket Hemat"].map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            className={`mr-2.5 px-4 py-1.5 rounded-full border ${
              selectedCategory === cat
                ? "bg-emerald-700 border-emerald-800"
                : "bg-white border-stone-300"
            }`}
          >
            <Text
              className={
                selectedCategory === cat
                  ? "text-white font-bold text-xs"
                  : "text-stone-600 text-xs font-medium"
              }
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Product List */}
      <ScrollView className="flex-1" contentContainerClassName="p-3 pb-28">
        <View className="flex-row flex-wrap justify-between">
          {filteredProducts.map((p) => (
            <View
              key={p.id}
              className="w-[48%] bg-white border border-stone-200 rounded-xl mb-4 overflow-hidden shadow-sm"
            >
              <Image
                source={{ uri: p.image_url }}
                className="w-full h-32 bg-stone-100"
                resizeMode="cover"
              />

              {p.is_local === 1 && (
                <View className="absolute top-2 left-2 bg-amber-500 border border-amber-600 rounded px-1.5 py-0.5">
                  <Text className="text-[8px] text-emerald-950 font-bold">
                    PRODUK LOKAL (2x POIN)
                  </Text>
                </View>
              )}

              <View className="p-3">
                <Text
                  className="text-stone-900 font-bold text-xs h-8"
                  numberOfLines={2}
                >
                  {p.name}
                </Text>
                <Text className="text-[10px] text-stone-500 mt-1">
                  Stok: {p.stock} {p.unit}
                </Text>

                <View className="flex-row justify-between items-center mt-2.5">
                  <Text className="text-emerald-800 font-extrabold text-sm">
                    Rp{p.price.toLocaleString("id-ID")}
                  </Text>

                  {p.stock > 0 ? (
                    <Pressable
                      onPress={() => addToCart(p, 1)}
                      className="bg-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-800 active:bg-emerald-900"
                    >
                      <Text className="text-white text-[10px] font-bold">
                        +
                      </Text>
                    </Pressable>
                  ) : (
                    <View className="bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                      <Text className="text-stone-400 text-[10px]">Habis</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Cart Quick Bar */}
      {cart.length > 0 && (
        <View className="absolute bottom-16 left-0 right-0 bg-white border-t border-stone-200 p-3 shadow-lg flex-row justify-between items-center px-4">
          <View>
            <Text className="text-stone-500 text-[10px]">Total Belanja</Text>
            <Text className="text-emerald-800 font-black text-base">
              Rp{subtotal.toLocaleString("id-ID")}
            </Text>
          </View>
          <Pressable
            onPress={() => setIsCartOpen(true)}
            className="bg-amber-500 border border-amber-600 px-5 py-2.5 rounded-xl active:bg-amber-600"
          >
            <Text className="text-emerald-950 font-bold text-xs">
              Lihat Keranjang ({cart.reduce((s, i) => s + i.quantity, 0)})
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  // Render Pesanan Saya
  const renderPesanan = () => {
    // Filter orders matching active user
    const myOrders = orders.filter((o) => o.user_id === activeUser?.id);

    return (
      <ScrollView
        className="flex-1 bg-stone-50"
        contentContainerClassName="p-3 pb-28"
      >
        <Text className="text-stone-900 font-black text-lg mb-3">
          Pesanan Aktif & Riwayat
        </Text>

        {myOrders.length === 0 ? (
          <View className="bg-white p-8 rounded-xl border border-stone-200 items-center justify-center mt-4">
            <SymbolView name="doc.text" size={32} tintColor="#ccc" />
            <Text className="text-stone-500 text-xs mt-2 font-medium">
              Belum ada transaksi belanja
            </Text>
            <Pressable
              onPress={() => setSubTab(0)}
              className="mt-4 bg-emerald-700 px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-xs font-bold">
                Mulai Belanja Koperasi
              </Text>
            </Pressable>
          </View>
        ) : (
          myOrders.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => setDetailOrder(o)}
              className="bg-white p-4 rounded-xl border border-stone-200 mb-3 shadow-sm active:bg-stone-100"
            >
              <View className="flex-row justify-between items-center border-b border-stone-100 pb-2 mb-2">
                <View>
                  <Text className="text-stone-400 text-[10px]">
                    {new Date(o.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text className="text-[10px] text-emerald-950 font-bold mt-0.5">
                    ID: {o.id.substring(0, 12)}...
                  </Text>
                </View>
                <View
                  className={`px-2.5 py-0.5 rounded-full border ${getOrderStatusColor(o.order_status)}`}
                >
                  <Text className="text-[8px] font-bold">
                    {getOrderStatusLabel(o.order_status)}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center mt-1">
                <View>
                  <Text className="text-stone-700 text-xs font-semibold">
                    {o.channel === "CARD_PURCHASE"
                      ? "Kartu Kopdes"
                      : "Belanja Mandiri"}
                  </Text>
                  <Text className="text-stone-500 text-[10px] mt-0.5">
                    Fulfillment:{" "}
                    {o.fulfillment === "DELIVERY_TO_HOME"
                      ? "Kirim ke Rumah"
                      : "Ambil di Koperasi"}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-stone-500 text-[10px]">
                    Total Bayar
                  </Text>
                  <Text className="text-emerald-900 font-extrabold text-sm">
                    Rp{o.total.toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>



              {o.fulfillment === "DELIVERY_TO_HOME" && (
                <Pressable
                  onPress={() => setActiveDeliveryOrderId(o.id)}
                  style={{
                    backgroundColor: "#ecfdf5",
                    borderWidth: 1,
                    borderColor: "#a7f3d0",
                    borderRadius: 8,
                    paddingVertical: 6,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                  }}
                >
                  <SymbolView name="bicycle" size={12} tintColor="#047857" />
                  <Text
                    style={{
                      color: "#047857",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  >
                    Lacak Pengiriman
                  </Text>
                </Pressable>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>
    );
  };

  // Render Kartu & Poin
  const renderKartuPoin = () => {
    // Get point history
    // Since points are inside SQLite/mock, let's fetch point transactions or mock. We will query it or mock
    return (
      <ScrollView
        className="flex-1 bg-stone-50"
        contentContainerClassName="p-4 pb-28"
      >
        {/* Beautiful Physical Card design */}
        <View className="bg-emerald-900 rounded-2xl p-5 shadow-lg border border-emerald-700 relative overflow-hidden mb-6">
          {/* Decorative gradients */}
          <View className="absolute right-0 bottom-0 top-0 w-32 bg-amber-400 opacity-15 rounded-r-2xl transform rotate-12 translate-x-12" />
          <View className="absolute left-4 top-4 w-12 h-12 bg-white/5 rounded-full" />

          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-amber-400 text-[9px] font-bold tracking-widest uppercase">
                KARTU KOPDES / ANGGOTA
              </Text>
              <Text className="text-white font-extrabold text-base mt-1">
                Koperasi Merah Putih
              </Text>
              <Text className="text-emerald-100 text-[10px]">
                Desa Sukamaju, Kelurahan Merah Putih
              </Text>
            </View>
            <View className="bg-amber-400 px-2.5 py-1 rounded-lg">
              <Text className="text-emerald-950 font-black text-[9px]">
                SIMKOPDES
              </Text>
            </View>
          </View>

          <View className="mt-8 flex-row justify-between items-end">
            <View>
              <Text className="text-white font-black text-sm tracking-wide">
                {activeUser?.name}
              </Text>
              <Text className="text-emerald-200 text-[9px] mt-0.5">
                MEMBER ID: {activeUser?.member_id || activeUser?.referral_code || "MEMBER-ID"}
              </Text>
              <Text className="text-emerald-300 text-[8px]">
                NIK: {activeUser?.nik_masked || "3275**********01"}{" "}
                {activeUser?.rt_id ? `• ${activeUser.rt_id}` : ""}
              </Text>
              {activeUser?.card_token && (
                <Text className="text-emerald-300 text-[7px] mt-0.5 max-w-[190px]" numberOfLines={1}>
                  QR token: {activeUser.card_token}
                </Text>
              )}
            </View>
            {/* Simulation barcode / QR */}
            <View className="bg-white p-1 rounded-lg">
              <SymbolView name="qrcode" size={40} tintColor="#111" />
            </View>
          </View>
        </View>

        {/* Loyalty Wallet Info */}
        <View className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex-row justify-between items-center mb-5">
          <View className="flex-row items-center gap-3">
            <View className="bg-amber-100 p-2.5 rounded-full">
              <SymbolView name="gift.fill" size={18} tintColor="#d97706" />
            </View>
            <View>
              <Text className="text-stone-500 text-[10px]">
                Poin Gotong Royong (Loyalitas)
              </Text>
              <Text className="text-stone-900 font-black text-xl">
                {activeUser?.points || 0}{" "}
                <Text className="text-stone-500 text-xs font-semibold">
                  Poin
                </Text>
              </Text>
              <Text className="text-stone-400 text-[8px] mt-0.5">
                Nilai Tukar: 1 Poin = Potongan Rp1.000
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setSubTab(0)}
            className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 active:bg-emerald-100"
          >
            <Text className="text-emerald-800 text-[10px] font-bold">
              Pakai Poin
            </Text>
          </Pressable>
        </View>

        {/* Referral program card */}
        <View className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-5">
          <View className="flex-row items-center gap-2 mb-2">
            <SymbolView name="person.3.fill" size={14} tintColor="#0f5132" />
            <Text className="text-emerald-900 font-bold text-xs">
              Program KopAjak (Referral Warga)
            </Text>
          </View>
          <Text className="text-stone-500 text-[10px] mb-3">
            Ajak tetangga berbelanja di koperasi. Anda berdua akan mendapat
            bonus{" "}
            <Text className="text-emerald-700 font-bold">
              100 Poin (Rp100.000)
            </Text>{" "}
            setelah mereka menyelesaikan transaksi pertama mereka.
          </Text>

          <View className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 flex-row justify-between items-center mb-3">
            <Text className="text-stone-500 text-[10px]">
              Kode Referral Anda
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-emerald-950 font-black text-xs tracking-wider">
                {activeUser?.referral_code}
              </Text>
              <SymbolView name="doc.on.doc" size={10} tintColor="#777" />
            </View>
          </View>

          {/* If the current user has referred_by, show who referred them */}
          {activeUser?.referred_by ? (
            <View className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 flex-row justify-between items-center">
              <Text className="text-emerald-800 text-[10px] font-semibold">
                Diundang oleh Tetangga
              </Text>
              <Text className="text-emerald-950 font-black text-[10px]">
                {activeUser.referred_by}
              </Text>
            </View>
          ) : (
            <View className="flex-row gap-2 mt-2">
              <TextInput
                placeholder="Masukkan Kode Referral Tetangga"
                value={referralInput}
                onChangeText={setReferralInput}
                className="flex-1 bg-stone-100 rounded-lg px-3 py-1.5 text-[10px] border border-stone-200 h-9"
              />
              <Pressable
                onPress={handleApplyReferral}
                className="bg-emerald-700 border border-emerald-800 rounded-lg px-4 items-center justify-center active:bg-emerald-900 h-9"
              >
                <Text className="text-white text-[10px] font-bold">
                  Terapkan
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Ledger Point Transactions */}
        <Text className="text-stone-900 font-black text-xs mb-3">
          Riwayat Transaksi Poin
        </Text>
        {ptHistory.length === 0 ? (
          <Text className="text-stone-400 text-[10px] italic">
            Belum ada transaksi poin.
          </Text>
        ) : (
          ptHistory.map((pt, idx) => (
            <View
              key={pt.id || idx}
              className="bg-white p-3 rounded-xl border border-stone-100 mb-2 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-stone-800 text-xs font-semibold">
                  {pt.source === "ORDER"
                    ? "Belanja Koperasi"
                    : pt.source === "REFERRAL"
                      ? "Bonus Ajak Tetangga (KopAjak)"
                      : "Registrasi / Demo"}
                </Text>
                <Text className="text-stone-400 text-[8px] mt-0.5">
                  {new Date(pt.created_at).toLocaleDateString("id-ID")}
                </Text>
              </View>
              <Text
                className={`font-black text-xs ${pt.type === "EARN" ? "text-emerald-600" : "text-rose-600"}`}
              >
                {pt.type === "EARN" ? `+${pt.points}` : `-${pt.points}`} Poin
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-stone-100">
      {/* Tab Contents */}
      {subTab === 0 && renderBelanja()}
      {subTab === 1 && renderPesanan()}
      {subTab === 2 && renderKartuPoin()}

      {/* Sub Tabs Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 h-16 flex-row justify-around items-center">
        <Pressable
          onPress={() => setSubTab(0)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="cart.fill"
            size={18}
            tintColor={subTab === 0 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[10px] mt-1 font-bold ${subTab === 0 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Belanja
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSubTab(1)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="list.bullet.rectangle.portrait.fill"
            size={18}
            tintColor={subTab === 1 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[10px] mt-1 font-bold ${subTab === 1 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Pesanan Saya
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSubTab(2)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="creditcard.fill"
            size={18}
            tintColor={subTab === 2 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[10px] mt-1 font-bold ${subTab === 2 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Kartu & Poin
          </Text>
        </Pressable>
      </View>

      {/* Cart Drawer Modal */}
      <Modal
        visible={isCartOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCartOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl p-4 h-[70%]">
            <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-3">
              <Text className="text-emerald-950 font-black text-lg">
                Keranjang Belanja
              </Text>
              <Pressable
                onPress={() => setIsCartOpen(false)}
                className="p-1 rounded-full bg-stone-100"
              >
                <SymbolView name="xmark" size={16} tintColor="#555" />
              </Pressable>
            </View>

            {cart.length === 0 ? (
              <View className="py-12 items-center justify-center">
                <SymbolView name="cart" size={40} tintColor="#ccc" />
                <Text className="text-stone-400 mt-2 text-xs">
                  Keranjang Anda kosong
                </Text>
              </View>
            ) : (
              <View className="flex-1 justify-between">
                <ScrollView className="max-h-[350px]">
                  {cart.map((item) => (
                    <View
                      key={item.product.id}
                      className="flex-row justify-between items-center py-2.5 border-b border-stone-100"
                    >
                      <View className="flex-row items-center gap-3 flex-1">
                        <Image
                          source={{ uri: item.product.image_url }}
                          className="w-10 h-10 rounded-lg bg-stone-100"
                        />
                        <View className="flex-1">
                          <Text
                            className="text-stone-900 font-bold text-xs"
                            numberOfLines={1}
                          >
                            {item.product.name}
                          </Text>
                          <Text className="text-emerald-800 text-[10px] font-bold">
                            Rp{item.product.price.toLocaleString("id-ID")}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <Pressable
                          onPress={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.quantity - 1,
                            )
                          }
                          className="w-6 h-6 rounded-full border border-stone-300 items-center justify-center active:bg-stone-100"
                        >
                          <Text className="text-xs font-bold text-stone-700">
                            -
                          </Text>
                        </Pressable>
                        <Text className="text-xs font-bold text-stone-900 w-5 text-center">
                          {item.quantity}
                        </Text>
                        <Pressable
                          onPress={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.quantity + 1,
                            )
                          }
                          className="w-6 h-6 rounded-full border border-stone-300 items-center justify-center active:bg-stone-100"
                        >
                          <Text className="text-xs font-bold text-stone-700">
                            +
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => removeFromCart(item.product.id)}
                          className="ml-2"
                        >
                          <SymbolView
                            name="trash"
                            size={14}
                            tintColor="#ef4444"
                          />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/* Totals & Checkout */}
                <View className="border-t border-stone-200 pt-3 mt-3 bg-white">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-stone-500 text-xs">
                      Total Belanja:
                    </Text>
                    <Text className="text-emerald-900 font-black text-lg">
                      Rp{subtotal.toLocaleString("id-ID")}
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={clearCart}
                      className="border border-stone-300 px-4 py-2.5 rounded-xl items-center justify-center"
                    >
                      <Text className="text-stone-500 font-bold text-xs">
                        Kosongkan
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setIsCartOpen(false);
                        setCheckoutModalOpen(true);
                      }}
                      className="flex-1 bg-emerald-700 border border-emerald-800 py-2.5 rounded-xl items-center justify-center active:bg-emerald-950"
                    >
                      <Text className="text-white font-black text-xs">
                        Lanjut Pembayaran
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Checkout Screen Modal */}
      <Modal
        visible={checkoutModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCheckoutModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl p-5 h-[80%]">
            <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
              <Text className="text-emerald-950 font-black text-lg">
                Metode & Alamat Pengiriman
              </Text>
              <Pressable
                onPress={() => {
                  setCheckoutModalOpen(false);
                  setIsCartOpen(true);
                }}
                className="p-1 rounded-full bg-stone-100"
              >
                <SymbolView name="xmark" size={16} tintColor="#555" />
              </Pressable>
            </View>

            <ScrollView className="space-y-4">
              {/* Delivery method selection */}
              <Text className="text-stone-900 font-bold text-xs mb-1">
                Pilih Metode Pengiriman
              </Text>
              <View className="space-y-2 mb-3">
                {/* Self Pickup at Coop */}
                <Pressable
                  onPress={() => setSelectedFulfillment("PICKUP_AT_COOP")}
                  className={`p-3 rounded-xl border flex-row items-center gap-3 mb-2 ${
                    selectedFulfillment === "PICKUP_AT_COOP"
                      ? "bg-emerald-50 border-emerald-600"
                      : "bg-white border-stone-200"
                  }`}
                >
                  <View className="bg-stone-100 p-2 rounded-full">
                    <SymbolView
                      name="storefront.fill"
                      size={14}
                      tintColor="#555"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-stone-900 font-bold text-xs">
                      Ambil Mandiri di Koperasi
                    </Text>
                    <Text className="text-[10px] text-stone-500 mt-0.5">
                      Ambil pesanan Anda sendiri di kantor Koperasi.
                    </Text>
                  </View>
                  <SymbolView
                    name={
                      selectedFulfillment === "PICKUP_AT_COOP"
                        ? "checkmark.circle.fill"
                        : "circle"
                    }
                    size={18}
                    tintColor={
                      selectedFulfillment === "PICKUP_AT_COOP"
                        ? "#0f5132"
                        : "#ccc"
                    }
                  />
                </Pressable>

                {/* Home Delivery */}
                <Pressable
                  onPress={() => setSelectedFulfillment("DELIVERY_TO_HOME")}
                  className={`p-3 rounded-xl border flex-row items-center gap-3 mb-2 ${
                    selectedFulfillment === "DELIVERY_TO_HOME"
                      ? "bg-emerald-50 border-emerald-600"
                      : "bg-white border-stone-200"
                  }`}
                >
                  <View className="bg-stone-100 p-2 rounded-full">
                    <SymbolView
                      name="shippingbox.fill"
                      size={14}
                      tintColor="#555"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-stone-900 font-bold text-xs">
                      Kirim ke Rumah (Kurir Desa)
                    </Text>
                    <Text className="text-[10px] text-stone-500 mt-0.5">
                      Pesanan diantar langsung ke rumah (Tarif standard).
                    </Text>
                  </View>
                  <SymbolView
                    name={
                      selectedFulfillment === "DELIVERY_TO_HOME"
                        ? "checkmark.circle.fill"
                        : "circle"
                    }
                    size={18}
                    tintColor={
                      selectedFulfillment === "DELIVERY_TO_HOME"
                        ? "#0f5132"
                        : "#ccc"
                    }
                  />
                </Pressable>
              </View>

              {/* Point Loyalty Redeem Option */}
              <View className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl mb-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <SymbolView
                      name="gift.fill"
                      size={14}
                      tintColor="#d97706"
                    />
                    <Text className="text-stone-900 font-bold text-xs">
                      Gunakan Poin Gotong Royong
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      if (activeUser && activeUser.points > 0)
                        setUsePoints(!usePoints);
                    }}
                    className={`w-10 h-6 rounded-full p-0.5 flex-row ${usePoints ? "bg-emerald-600 justify-end" : "bg-stone-300 justify-start"}`}
                  >
                    <View className="w-5 h-5 bg-white rounded-full shadow" />
                  </Pressable>
                </View>

                {usePoints && (
                  <View className="mt-3 border-t border-stone-200 pt-2 flex-row justify-between items-center">
                    <View>
                      <Text className="text-stone-500 text-[10px]">
                        Tersedia: {activeUser?.points || 0} Poin
                      </Text>
                      <Text className="text-stone-400 text-[9px] max-w-[180px]">
                        Diskon maks. 20% total belanja (Rp
                        {maxPointsToUse * 1000})
                      </Text>
                    </View>
                    <Text className="text-emerald-800 font-extrabold text-xs">
                      -{pointsToRedeem} Poin (-Rp
                      {(pointsToRedeem * 1000).toLocaleString("id-ID")})
                    </Text>
                  </View>
                )}
              </View>

              {/* Financial checkout summary */}
              <View className="border-t border-stone-200 pt-3">
                <Text className="text-stone-900 font-bold text-xs mb-2">
                  Ringkasan Pembayaran
                </Text>

                <View className="flex-row justify-between py-1">
                  <Text className="text-stone-500 text-[10px]">
                    Subtotal Produk
                  </Text>
                  <Text className="text-stone-700 text-xs">
                    Rp{subtotal.toLocaleString("id-ID")}
                  </Text>
                </View>
                {discount > 0 && (
                  <View className="flex-row justify-between py-1">
                    <Text className="text-emerald-700 text-[10px]">
                      Diskon Poin
                    </Text>
                    <Text className="text-emerald-700 text-xs">
                      -Rp{discount.toLocaleString("id-ID")}
                    </Text>
                  </View>
                )}
                {deliveryFee > 0 && (
                  <View className="flex-row justify-between py-1">
                    <Text className="text-amber-700 text-[10px]">
                      {isCrossCoop ? "Biaya Logistik Lintas Koperasi" : "Biaya KopKurir Desa"}
                    </Text>
                    <Text className="text-amber-700 text-xs font-bold">
                      +Rp{deliveryFee.toLocaleString("id-ID")}
                    </Text>
                  </View>
                )}
                <View className="flex-row justify-between py-2 border-t border-stone-100 mt-1">
                  <Text className="text-stone-900 font-black text-xs">
                    Total Pembayaran
                  </Text>
                  <Text className="text-emerald-950 font-black text-sm">
                    Rp{total.toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>

              {/* Submit Checkout */}
              <Pressable
                onPress={handleCheckout}
                className="bg-emerald-700 border border-emerald-800 py-3 rounded-xl items-center justify-center mt-2 mb-4 active:bg-emerald-950"
              >
                <Text className="text-white font-black text-xs">
                  Konfirmasi & Buat Pesanan
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Order Detail Modal */}
      {detailOrder && (
        <Modal
          visible={!!detailOrder}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDetailOrder(null)}
        >
          <View className="flex-1 justify-center items-center bg-black/60 p-4">
            <View className="bg-white rounded-2xl p-5 w-full max-w-[340px]">
              <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
                <Text className="text-emerald-950 font-black text-sm">
                  Rincian Transaksi
                </Text>
                <Pressable
                  onPress={() => setDetailOrder(null)}
                  className="p-1 rounded-full bg-stone-100"
                >
                  <SymbolView name="xmark" size={14} tintColor="#555" />
                </Pressable>
              </View>

              <Text className="text-stone-400 text-[9px]">ID Pesanan</Text>
              <Text className="text-stone-800 font-mono text-[10px] mb-2">
                {detailOrder.id}
              </Text>

              <View className="flex-row justify-between py-1">
                <Text className="text-stone-500 text-[10px]">Tanggal</Text>
                <Text className="text-stone-700 text-[10px]">
                  {new Date(detailOrder.created_at).toLocaleDateString("id-ID")}
                </Text>
              </View>
              <View className="flex-row justify-between py-1">
                <Text className="text-stone-500 text-[10px]">Fulfillment</Text>
                <Text className="text-stone-700 text-[10px]">
                  {detailOrder.fulfillment === "DELIVERY_TO_HOME"
                    ? "Kirim ke Rumah"
                    : "Ambil Mandiri Koperasi"}
                </Text>
              </View>
              <View className="flex-row justify-between py-1 border-b border-stone-100 pb-2 mb-2">
                <Text className="text-stone-500 text-[10px]">
                  Status Pesanan
                </Text>
                <Text className="text-emerald-800 font-bold text-[10px]">
                  {getOrderStatusLabel(detailOrder.order_status)}
                </Text>
              </View>

              <Text className="text-stone-500 text-[10px] font-bold mb-1">
                Item:
              </Text>
              <View className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 mb-3 max-h-[120px] overflow-scroll">
                {/* Normally we query order items for this modal. Let's do a simple mockup or mock it based on orders details */}
                <Text className="text-[10px] text-stone-700">
                  • Keranjang belanja terisi
                </Text>
                <Text className="text-[10px] text-stone-400 italic">
                  Detail produk dapat dilihat di cetak struk RT.
                </Text>
              </View>

              <View className="flex-row justify-between py-1">
                <Text className="text-stone-500 text-[10px]">Subtotal</Text>
                <Text className="text-stone-700 text-[10px]">
                  Rp{detailOrder.subtotal.toLocaleString("id-ID")}
                </Text>
              </View>
              {detailOrder.discount > 0 && (
                <View className="flex-row justify-between py-1">
                  <Text className="text-emerald-700 text-[10px]">
                    Potongan Poin
                  </Text>
                  <Text className="text-emerald-700 text-[10px]">
                    -Rp{detailOrder.discount.toLocaleString("id-ID")}
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between py-2 border-t border-stone-200 mt-2">
                <Text className="text-stone-900 font-bold text-xs">
                  Total Akhir
                </Text>
                <Text className="text-emerald-950 font-black text-sm">
                  Rp{detailOrder.total.toLocaleString("id-ID")}
                </Text>
              </View>

              <View className="flex-row justify-between py-1">
                <Text className="text-stone-500 text-[10px]">
                  Status Pembayaran
                </Text>
                <Text className="text-stone-800 text-[10px] font-bold">
                  {detailOrder.payment_status}
                </Text>
              </View>

              {detailOrder.payment_status === "UNPAID" && (
                <View className="mt-3 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <Text className="text-[9px] text-amber-850 font-bold leading-tight">
                    💡 Silakan lakukan pembayaran tunai (COD) sebesar Rp
                    {detailOrder.total.toLocaleString("id-ID")} kepada RT Agent
                    Anda (Pak Budi) saat mengambil barang di Pos RT.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

      <DeliveryTrackerModal
        orderId={activeDeliveryOrderId}
        visible={!!activeDeliveryOrderId}
        onClose={() => setActiveDeliveryOrderId(null)}
      />

      <CoopSelectorModal
        visible={coopSelectorVisible}
        onClose={() => setCoopSelectorVisible(false)}
        activeCoopId={activeCooperativeId}
        onSelectCoop={(id) => {
          setActiveCooperativeId(id);
          clearCart();
        }}
      />
    </View>
  );
}
