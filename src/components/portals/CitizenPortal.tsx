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
import CoopSelectorModal from "../CoopSelectorModal";
import DeliveryTrackerModal from "../DeliveryTrackerModal";

interface Mission {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  pointsReward: number;
  badgeReward?: string;
  isCompleted: boolean;
}

export default function CitizenPortal() {
  const {
    activeUser,
    products,
    orders,
    allUsers,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    checkout,
    applyReferralCode,
    refreshData,
  } = useApp();

  const [subTab, setSubTab] = useState(0); // 0: Belanja, 1: Pesanan, 2: Kartu & Poin, 3: Pos RT
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
  const [activeCooperativeId, setActiveCooperativeId] =
    useState<string>("tenant-1");
  const [coopSelectorVisible, setCoopSelectorVisible] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<
    any | null
  >(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailOrderItems, setDetailOrderItems] = useState<any[]>([]);

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

  // Calculate missions progress dynamically
  React.useEffect(() => {
    if (!activeUser) return;

    const calculateMissions = async () => {
      try {
        // 1. Transaction count
        const myOrders = orders.filter((o) => o.user_id === activeUser.id);
        const transactionCount = myOrders.length;

        // 2. Local products purchased
        const localProductsResult = await dbService.getAll(
          `SELECT SUM(oi.quantity) as count 
           FROM order_items oi 
           JOIN orders o ON oi.order_id = o.id 
           JOIN products p ON oi.product_id = p.id 
           WHERE o.user_id = ? AND p.is_local = 1`,
          [activeUser.id],
        );
        const localCount = localProductsResult[0]?.count || 0;

        // 3. Referral count (referred users with at least 1 order)
        const referredUsers = allUsers.filter(
          (u) => u.referred_by === activeUser.referral_code,
        );
        let activeReferralCount = 0;
        for (const refUser of referredUsers) {
          const refUserOrders = orders.filter((o) => o.user_id === refUser.id);
          if (refUserOrders.length > 0) {
            activeReferralCount++;
          }
        }

        setMissions([
          {
            id: "misi-1",
            title: "Warga Aktif Koperasi",
            description: "Lakukan belanja mandiri di Koperasi desa",
            targetValue: 3,
            currentValue: transactionCount,
            unit: "Transaksi",
            pointsReward: 25,
            isCompleted: transactionCount >= 3,
          },
          {
            id: "misi-2",
            title: "Cinta Produk Lokal",
            description:
              'Beli produk berlabel "PRODUK LOKAL" buatan warga desa',
            targetValue: 2,
            currentValue: localCount,
            unit: "Produk",
            pointsReward: 50,
            isCompleted: localCount >= 2,
          },
          {
            id: "misi-3",
            title: "KopAjak Tetangga",
            description: "Ajak tetangga berbelanja dengan kode referral Anda",
            targetValue: 1,
            currentValue: activeReferralCount,
            unit: "Warga",
            pointsReward: 100,
            badgeReward: "Sahabat Gotong Royong",
            isCompleted: activeReferralCount >= 1,
          },
        ]);
      } catch (err) {
        console.error("Error calculating missions:", err);
      }
    };

    calculateMissions();
  }, [activeUser, orders, allUsers]);

  // Load items for the selected order detail
  React.useEffect(() => {
    if (detailOrder) {
      dbService
        .getAll("SELECT * FROM order_items WHERE order_id = ?", [
          detailOrder.id,
        ])
        .then((items) => {
          setTimeout(() => {
            setDetailOrderItems(items);
          }, 0);
        })
        .catch(console.error);
    } else {
      setTimeout(() => {
        setDetailOrderItems((prev) => (prev.length > 0 ? [] : prev));
      }, 0);
    }
  }, [detailOrder]);

  // Handle reorder (buying previous basket items)
  const handleReorder = async (orderId: string) => {
    try {
      const items = await dbService.getAll<any>(
        "SELECT * FROM order_items WHERE order_id = ?",
        [orderId],
      );

      if (!items || items.length === 0) {
        Alert.alert("Gagal", "Tidak ada item dalam pesanan ini.");
        return;
      }

      let addedCount = 0;
      let outOfStockCount = 0;

      for (const item of items) {
        const prod = products.find((p) => p.id === item.product_id);
        if (prod && prod.stock > 0) {
          const qty = Math.min(prod.stock, item.quantity);
          addToCart(prod, qty);
          addedCount++;
        } else {
          outOfStockCount++;
        }
      }

      if (addedCount > 0) {
        if (outOfStockCount > 0) {
          Alert.alert(
            "Berhasil Reorder",
            `${addedCount} produk dimasukkan ke keranjang. ${outOfStockCount} produk tidak ditambahkan karena stok habis.`,
          );
        } else {
          Alert.alert(
            "Berhasil Reorder",
            "Semua produk berhasil dimasukkan ke keranjang.",
          );
        }
        setDetailOrder(null);
        setIsCartOpen(true);
        setSubTab(0);
      } else {
        Alert.alert(
          "Gagal",
          "Semua produk dalam pesanan ini sedang habis stok.",
        );
      }
    } catch (err) {
      console.error("Reorder failed", err);
      Alert.alert("Gagal", "Gagal mengulang pesanan ini.");
    }
  };

  // Filter products
  const filteredProducts = products
    .filter((p) => p.cooperative_id === activeCooperativeId)
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
          !p.is_local &&
          !p.name.toLowerCase().includes("paket") &&
          matchesSearch
        );
      return matchesSearch;
    });

  // Calculate cart totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const maxPointsToUse = Math.floor(subtotal * 0.2); // Max 20% discount
  const pointsToRedeem = usePoints
    ? Math.min(maxPointsToUse, activeUser?.points || 0)
    : 0;
  const discount = pointsToRedeem;
  const isCrossCoop =
    activeCooperativeId !== (activeUser?.cooperative_id || "tenant-1");
  const logisticsSurcharge =
    activeCooperativeId === "tenant-4"
      ? 15000
      : activeCooperativeId === "tenant-5" || activeCooperativeId === "tenant-6"
        ? 25000
        : isCrossCoop
          ? 5000
          : 0;
  const deliveryFee =
    selectedFulfillment === "DELIVERY_TO_HOME"
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
        return "Tiba di Agen Transit";
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
      case "tenant-1":
        return "Koperasi Merah Putih Sukamaju";
      case "tenant-2":
        return "Koperasi Sukasari (Tetangga)";
      case "tenant-3":
        return "Koperasi Sukamukti (Tetangga)";
      case "tenant-4":
        return "Koperasi Jaya Makmur (Jawa Timur)";
      case "tenant-5":
        return "Koperasi Danau Toba (Sumatera Utara)";
      case "tenant-6":
        return "Koperasi Bunaken Lestari (Sulawesi Utara)";
      default:
        return "Koperasi Desa";
    }
  };

  const getCoopWarningText = (id: string) => {
    switch (id) {
      case "tenant-2":
        return "⚠️ Anda sedang belanja di Koperasi Sukasari (Tetangga). Pengiriman +1 hari & biaya kurir tambahan Rp5.000 berlaku.";
      case "tenant-3":
        return "⚠️ Anda sedang belanja di Koperasi Sukamukti (Tetangga). Pengiriman +1 hari & biaya kurir tambahan Rp5.000 berlaku.";
      case "tenant-4":
        return "⚠️ Anda sedang belanja di Koperasi Jaya Makmur (Jawa Timur - Luar Pulau). Pengiriman +3 hari & biaya logistik tambahan Rp15.000 berlaku.";
      case "tenant-5":
        return "⚠️ Anda sedang belanja di Koperasi Danau Toba (Sumatera Utara - Luar Pulau). Pengiriman +5 hari & biaya logistik tambahan Rp25.000 berlaku.";
      case "tenant-6":
        return "⚠️ Anda sedang belanja di Koperasi Bunaken Lestari (Sulawesi Utara - Luar Pulau). Pengiriman +4 hari & biaya logistik tambahan Rp25.000 berlaku.";
      default:
        return "";
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
          onPress={() =>
            Alert.alert(
              "Layanan Layanan Bantuan Koperasi",
              "Butuh bantuan belanja, referral, atau pendaftaran?\n\nHubungi Petugas Layanan:\n• Pak Budi (Agen Transit): 0812-3456-7890\n• Koperasi Sukamaju: (021) 555-0199\n• Jam Operasional: 08:00 - 17:00 WIB",
              [{ text: "Tutup", style: "cancel" }],
            )
          }
          className="bg-stone-50 w-9 h-9 rounded-full items-center justify-center border border-stone-200 active:bg-stone-100"
        >
          <SymbolView
            name="questionmark.circle"
            size={16}
            tintColor="#0f5132"
          />
        </Pressable>
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
      <View
        style={{
          backgroundColor: "#064e3b",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#047857",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <SymbolView name="storefront.fill" size={14} tintColor="#a7f3d0" />
          <View>
            <Text
              style={{
                fontSize: 8,
                color: "#a7f3d0",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              Lokasi Belanja Koperasi
            </Text>
            <Text style={{ fontSize: 11, color: "#fff", fontWeight: "bold" }}>
              {getCoopName(activeCooperativeId)}
            </Text>
          </View>
        </View>

        {/* Switch button */}
        <Pressable
          onPress={() => setCoopSelectorVisible(true)}
          style={{
            backgroundColor: "#047857",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 6,
            borderWidth: 0.5,
            borderColor: "#a7f3d0",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold" }}>
            Ganti Toko
          </Text>
        </Pressable>
      </View>

      {/* Neighboring Cooperative Warning Banner */}
      {isCrossCoop && (
        <View
          style={{
            backgroundColor: "#fffbeb",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: "#fef3c7",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <SymbolView
            name="exclamationmark.triangle.fill"
            size={12}
            tintColor="#d97706"
          />
          <Text
            style={{
              fontSize: 9,
              color: "#b45309",
              fontWeight: "600",
              flex: 1,
              lineHeight: 12,
            }}
          >
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
        {/* Misi Gotong Royong Banner */}
        <Pressable
          onPress={() => setSubTab(2)} // Switch to Kartu & Poin tab where missions are listed
          className="bg-emerald-950 rounded-2xl p-4 mb-4 border border-emerald-900 shadow-sm relative overflow-hidden"
        >
          {/* Decorative Background */}
          <View className="absolute right-0 top-0 bottom-0 w-24 bg-amber-400 opacity-[0.08] rounded-r-2xl transform rotate-12 translate-x-6" />

          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center gap-1.5 mb-1">
                <SymbolView name="gift.fill" size={10} tintColor="#fbbf24" />
                <Text className="text-amber-400 text-[8px] font-black tracking-widest uppercase">
                  Misi Gotong Royong Warga
                </Text>
              </View>
              <Text className="text-white font-extrabold text-sm leading-tight">
                Merdeka Belanja Lokal
              </Text>
              <Text
                className="text-emerald-300 text-[9px] mt-0.5"
                numberOfLines={2}
              >
                Selesaikan misi belanja produk lokal desa & referral untuk klaim
                bonus hingga 175 Poin!
              </Text>
            </View>

            {/* Simple progress indicator */}
            <View className="items-center justify-center bg-emerald-900 border border-emerald-800 px-3 py-1.5 rounded-xl">
              <Text className="text-amber-400 font-black text-xs">
                {missions.filter((m) => m.isCompleted).length}/{missions.length}
              </Text>
              <Text className="text-white text-[7px] font-bold uppercase tracking-wider mt-0.5">
                Misi
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-emerald-400 text-[8px] font-bold">
                Progress Gotong Royong
              </Text>
              <Text className="text-emerald-400 text-[8px] font-bold">
                {Math.round(
                  (missions.filter((m) => m.isCompleted).length /
                    (missions.length || 1)) *
                    100,
                )}
                %
              </Text>
            </View>
            <View className="h-1.5 bg-emerald-900/60 rounded-full overflow-hidden">
              <View
                style={{
                  width: `${(missions.filter((m) => m.isCompleted).length / (missions.length || 1)) * 100}%`,
                }}
                className="h-full bg-amber-400 rounded-full"
              />
            </View>
          </View>
        </Pressable>

        <View className="flex-row flex-wrap justify-between">
          {filteredProducts.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => {
                setSelectedDetailProduct(p);
                setDetailQuantity(1);
              }}
              className="w-[48%] bg-white border border-stone-200 rounded-xl mb-4 overflow-hidden shadow-sm active:scale-[0.98]"
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
            </Pressable>
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
                MEMBER ID:{" "}
                {activeUser?.member_id ||
                  activeUser?.referral_code ||
                  "MEMBER-ID"}
              </Text>
              <Text className="text-emerald-300 text-[8px]">
                NIK: {activeUser?.nik_masked || "3275**********01"}{" "}
                {activeUser?.rt_id ? `• ${activeUser.rt_id}` : ""}
              </Text>
              {activeUser?.card_token && (
                <Text
                  className="text-emerald-300 text-[7px] mt-0.5 max-w-[190px]"
                  numberOfLines={1}
                >
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
                Nilai Tukar: 1 Poin = Rp1
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
              10.000 Poin (Rp10.000)
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

        {/* Misi Gotong Royong Section */}
        <View className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-5">
          <View className="flex-row items-center gap-2 mb-3">
            <SymbolView name="sparkles" size={14} tintColor="#b45309" />
            <Text className="text-amber-900 font-bold text-xs">
              Misi Gotong Royong Aktif
            </Text>
          </View>

          {missions.map((m) => (
            <View
              key={m.id}
              className="mb-3.5 border-b border-stone-150 pb-3 last:border-b-0 last:pb-0"
            >
              <View className="flex-row justify-between items-start mb-1.5">
                <View className="flex-1 mr-2">
                  <Text className="text-stone-900 font-bold text-[11px] flex-row items-center gap-1.5">
                    {m.title}{" "}
                    {m.isCompleted && (
                      <SymbolView
                        name="checkmark.seal.fill"
                        size={10}
                        tintColor="#0f5132"
                      />
                    )}
                  </Text>
                  <Text className="text-stone-500 text-[9px] mt-0.5 leading-tight">
                    {m.description}
                  </Text>
                </View>
                <View className="bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
                  <Text className="text-amber-800 font-black text-[8px]">
                    +{m.pointsReward} Poin
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View className="flex-row justify-between items-center mt-1 mb-1">
                <Text className="text-stone-400 text-[8px]">
                  Progress: {m.currentValue} / {m.targetValue} {m.unit}
                </Text>
                <Text className="text-stone-600 font-bold text-[8px]">
                  {Math.round(
                    Math.min(100, (m.currentValue / m.targetValue) * 100),
                  )}
                  %
                </Text>
              </View>
              <View className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <View
                  style={{
                    width: `${Math.min(100, (m.currentValue / m.targetValue) * 100)}%`,
                  }}
                  className={`h-full rounded-full ${m.isCompleted ? "bg-emerald-600" : "bg-amber-500"}`}
                />
              </View>
              {m.badgeReward && m.isCompleted && (
                <Text className="text-emerald-800 text-[8px] font-bold mt-1.5">
                  🏆 Lencana Didapat: {m.badgeReward}
                </Text>
              )}
            </View>
          ))}
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
        <Pressable
          onPress={() => setIsCartOpen(false)}
          className="flex-1 justify-end bg-black/60"
        >
          <Pressable
            onPress={() => {}}
            className="bg-white rounded-t-3xl p-4 h-[70%]"
          >
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
          </Pressable>
        </Pressable>
      </Modal>

      {/* Checkout Screen Modal */}
      <Modal
        visible={checkoutModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCheckoutModalOpen(false)}
      >
        <Pressable
          onPress={() => setCheckoutModalOpen(false)}
          className="flex-1 justify-end bg-black/60"
        >
          <Pressable
            onPress={() => {}}
            className="bg-white rounded-t-3xl p-5 h-[80%]"
          >
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
                        {maxPointsToUse.toLocaleString("id-ID")})
                      </Text>
                    </View>
                    <Text className="text-emerald-800 font-extrabold text-xs">
                      -{pointsToRedeem.toLocaleString("id-ID")} Poin (-Rp
                      {pointsToRedeem.toLocaleString("id-ID")})
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
                      {isCrossCoop
                        ? "Biaya Logistik Lintas Koperasi"
                        : "Biaya KopKurir Desa"}
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
          </Pressable>
        </Pressable>
      </Modal>

      {/* Order Detail Modal */}
      {detailOrder && (
        <Modal
          visible={!!detailOrder}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDetailOrder(null)}
        >
          <Pressable
            onPress={() => setDetailOrder(null)}
            className="flex-1 justify-center items-center bg-black/60 p-4"
          >
            <Pressable
              onPress={() => {}}
              className="bg-white rounded-2xl p-5 w-full max-w-[340px]"
            >
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
                Daftar Produk:
              </Text>
              <View className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 mb-3 max-h-[120px] overflow-scroll">
                {detailOrderItems.length === 0 ? (
                  <Text className="text-[10px] text-stone-400 italic">
                    Memuat daftar produk...
                  </Text>
                ) : (
                  detailOrderItems.map((item, idx) => (
                    <View
                      key={item.id || idx}
                      className="flex-row justify-between py-1 border-b border-stone-100 last:border-b-0"
                    >
                      <Text
                        className="text-[10px] text-stone-700 flex-1"
                        numberOfLines={1}
                      >
                        • {item.name}{" "}
                        <Text className="text-stone-400 font-normal">
                          x{item.quantity}
                        </Text>
                      </Text>
                      <Text className="text-[10px] text-stone-900 font-bold">
                        Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                      </Text>
                    </View>
                  ))
                )}
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
                    {detailOrder.total.toLocaleString("id-ID")} kepada Agen Transit
                    Anda (Pak Budi) saat mengambil barang.
                  </Text>
                </View>
              )}

              {(detailOrder.order_status === "DELIVERED_TO_RT" ||
                detailOrder.order_status === "READY_FOR_PICKUP") && (
                <Pressable
                  onPress={async () => {
                    try {
                      await dbService.run(
                        "UPDATE orders SET order_status = 'COMPLETED', payment_status = 'PAID' WHERE id = ?",
                        [detailOrder.id],
                      );
                      await dbService.run(
                        "INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)",
                        [
                          `log-${Date.now()}`,
                          activeUser?.name || "Warga",
                          "ORDER_RECEIVED_BY_CITIZEN",
                          `Citizen confirmed receipt of order ${detailOrder.id}`,
                          new Date().toISOString(),
                        ],
                      );
                      setDetailOrder({
                        ...detailOrder,
                        order_status: "COMPLETED",
                        payment_status: "PAID",
                      });
                      await refreshData();
                      Alert.alert(
                        "Berhasil",
                        "Terima kasih! Pesanan Anda telah ditandai sebagai Selesai.",
                      );
                    } catch (err) {
                      console.error("Failed to confirm receipt:", err);
                      Alert.alert("Error", "Gagal memperbarui status pesanan.");
                    }
                  }}
                  className="mt-3 bg-emerald-600 border border-emerald-700 py-2.5 rounded-xl items-center justify-center active:bg-emerald-850 flex-row gap-2"
                >
                  <SymbolView
                    name="checkmark.seal.fill"
                    size={12}
                    tintColor="#fff"
                  />
                  <Text className="text-white font-bold text-xs">
                    Pesanan Sudah Diterima
                  </Text>
                </Pressable>
              )}

              {/* Beli Lagi button */}
              <Pressable
                onPress={() => handleReorder(detailOrder.id)}
                className="mt-4 bg-emerald-700 border border-emerald-800 py-2.5 rounded-xl items-center justify-center active:bg-emerald-950 flex-row gap-2"
              >
                <SymbolView name="arrow.clockwise" size={12} tintColor="#fff" />
                <Text className="text-white font-bold text-xs">
                  Beli Lagi (Reorder)
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      <DeliveryTrackerModal
        orderId={activeDeliveryOrderId}
        visible={!!activeDeliveryOrderId}
        onClose={() => setActiveDeliveryOrderId(null)}
      />

      {/* Product Detail Modal */}
      {selectedDetailProduct && (
        <Modal
          visible={!!selectedDetailProduct}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedDetailProduct(null)}
        >
          <Pressable
            onPress={() => setSelectedDetailProduct(null)}
            className="flex-1 justify-end bg-black/60"
          >
            <Pressable
              onPress={() => {}}
              className="bg-white rounded-t-3xl p-5 w-full"
            >
              <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
                <Text className="text-emerald-950 font-black text-sm">
                  Detail Produk Koperasi
                </Text>
                <Pressable
                  onPress={() => setSelectedDetailProduct(null)}
                  className="p-1 rounded-full bg-stone-100"
                >
                  <SymbolView name="xmark" size={14} tintColor="#555" />
                </Pressable>
              </View>

              <Image
                source={{ uri: selectedDetailProduct.image_url }}
                className="w-full h-48 bg-stone-100 rounded-2xl mb-4"
                resizeMode="cover"
              />

              {selectedDetailProduct.is_local === 1 && (
                <View className="self-start bg-amber-500 border border-amber-600 rounded px-2 py-0.5 mb-2.5">
                  <Text className="text-[9px] text-emerald-950 font-black tracking-wider">
                    PRODUK LOKAL DESA (2x POIN)
                  </Text>
                </View>
              )}

              <Text className="text-stone-900 font-extrabold text-base mb-1">
                {selectedDetailProduct.name}
              </Text>

              <Text className="text-emerald-800 font-black text-lg mb-2">
                Rp{selectedDetailProduct.price.toLocaleString("id-ID")}
                <Text className="text-stone-400 text-xs font-semibold">
                  {" "}
                  / {selectedDetailProduct.unit}
                </Text>
              </Text>

              <View className="bg-stone-50 p-3 rounded-xl border border-stone-200 mb-4">
                <Text className="text-stone-600 text-[10px] leading-relaxed">
                  Stok tersedia:{" "}
                  <Text className="text-stone-900 font-bold">
                    {selectedDetailProduct.stock} {selectedDetailProduct.unit}
                  </Text>
                </Text>
                {selectedDetailProduct.is_local === 1 ? (
                  <Text className="text-emerald-800 text-[9px] font-bold mt-1.5 flex-row items-center gap-1">
                    💡 Produk Lokal Desa: Belanja produk ini membuat seluruh
                    transaksi Anda mendapatkan 2x lipat Poin Gotong Royong!
                  </Text>
                ) : (
                  <Text className="text-stone-500 text-[9px] mt-1.5">
                    💡 Setiap pembelanjaan kelipatan Rp10.000 akan mendapatkan 1
                    Poin Gotong Royong.
                  </Text>
                )}
              </View>

              {/* Quantity Selector */}
              {selectedDetailProduct.stock > 0 ? (
                <View className="flex-row justify-between items-center mb-5 bg-stone-100 p-2.5 rounded-xl border border-stone-200">
                  <Text className="text-stone-700 text-xs font-bold pl-1">
                    Jumlah
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={() =>
                        setDetailQuantity((q) => Math.max(1, q - 1))
                      }
                      className="bg-white border border-stone-300 w-8 h-8 rounded-lg items-center justify-center active:bg-stone-200"
                    >
                      <Text className="font-extrabold text-stone-850">-</Text>
                    </Pressable>
                    <Text className="text-stone-900 font-black text-sm w-6 text-center">
                      {detailQuantity}
                    </Text>
                    <Pressable
                      onPress={() =>
                        setDetailQuantity((q) =>
                          Math.min(selectedDetailProduct.stock, q + 1),
                        )
                      }
                      className="bg-white border border-stone-300 w-8 h-8 rounded-lg items-center justify-center active:bg-stone-200"
                    >
                      <Text className="font-extrabold text-stone-850">+</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View className="bg-stone-100 p-3 rounded-xl border border-stone-200 mb-5 items-center justify-center">
                  <Text className="text-stone-400 font-bold text-xs">
                    Stok produk sedang habis
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setSelectedDetailProduct(null)}
                  className="flex-1 bg-stone-100 border border-stone-300 py-3 rounded-xl items-center justify-center active:bg-stone-200"
                >
                  <Text className="text-stone-700 font-bold text-xs">
                    Kembali
                  </Text>
                </Pressable>
                {selectedDetailProduct.stock > 0 && (
                  <Pressable
                    onPress={() => {
                      addToCart(selectedDetailProduct, detailQuantity);
                      setSelectedDetailProduct(null);
                      Alert.alert(
                        "Sukses",
                        `${detailQuantity} ${selectedDetailProduct.unit} berhasil dimasukkan ke keranjang.`,
                      );
                    }}
                    className="flex-[2] bg-emerald-700 border border-emerald-800 py-3 rounded-xl items-center justify-center active:bg-emerald-950"
                  >
                    <Text className="text-white font-black text-xs">
                      Tambah ke Keranjang
                    </Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

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
