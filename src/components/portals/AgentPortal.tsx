import { SymbolView } from "@/components/app-symbol";
import { useApp } from "@/contexts/AppContext";
import { getOrderStatusLabel } from "@/lib/utils";
import { dbService, Order, OrderItem, Product } from "@/utils/db";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AppModal } from "@/components/app-modal";

// Pure wrapper helpers outside the React component to satisfy strict React purity lint rules
const generateUniqueId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};
const getIsoString = () => {
  return new Date().toISOString();
};

export default function AgentPortal() {
  const {
    activeUser,
    products,
    orders,
    kopRequests,
    refreshData,
    createKopRequest,
  } = useApp();

  const [subTab, setSubTab] = useState(0); // 0: B2B Belanja, 1: Pesanan B2B, 2: Kebutuhan Warga, 3: Keuangan

  // --- B2B Belanja States (Wholesale) ---
  const [b2bCart, setB2bCart] = useState<
    { product: Product; quantity: number }[]
  >([]);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "PICKUP_AT_COOP" | "DELIVERY_TO_HOME"
  >("PICKUP_AT_COOP");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "QRIS" | "INVOICE_TERM"
  >("CASH");
  const [showB2bCartModal, setShowB2bCartModal] = useState(false);
  const [isSubmittingB2b, setIsSubmittingB2b] = useState(false);
  const [showQrisB2bModal, setShowQrisB2bModal] = useState(false);

  // --- Discrepancy Modal States ---
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [selectedB2bOrder, setSelectedB2bOrder] = useState<Order | null>(null);
  const [b2bOrderItems, setB2bOrderItems] = useState<OrderItem[]>([]);
  const [discrepancyProduct, setDiscrepancyProduct] = useState("");
  const [discrepancyQty, setDiscrepancyQty] = useState("");
  const [discrepancyNotes, setDiscrepancyNotes] = useState("");
  const [isSubmittingDiscrepancy, setIsSubmittingDiscrepancy] = useState(false);

  // --- Request States ---
  const [reqProductName, setReqProductName] = useState("");
  const [reqQty, setReqQty] = useState("1");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // --- Dynamic Financial Calculations ---
  const getB2bPrice = (price: number) => Math.floor(price * 0.9);

  // Derived state: calculate outstanding B2B balance dynamically on the fly to avoid set-state-in-effect issues!
  const unpaidB2bOrdersList = orders.filter(
    (o) =>
      activeUser &&
      o.user_id === activeUser.id &&
      o.channel === "B2B_AGENT" &&
      o.payment_status === "UNPAID" &&
      o.order_status !== "CANCELLED",
  );
  const totalOutstanding = unpaidB2bOrdersList.reduce(
    (sum, o) => sum + o.total,
    0,
  );
  const creditLimitData = {
    limit: 5000000,
    outstanding: totalOutstanding,
    remaining: Math.max(0, 5000000 - totalOutstanding),
  };

  // (Kasir Warung functions removed)

  // --- B2B Wholesale Functions ---
  const addToB2bCart = (product: Product) => {
    setB2bCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          Alert.alert("Perhatian", "Stok koperasi tidak mencukupi.");
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateB2bQty = (productId: string, amount: number) => {
    setB2bCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + amount;
            if (nextQty > item.product.stock) {
              Alert.alert("Perhatian", "Stok koperasi tidak mencukupi.");
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const b2bSubtotal = b2bCart.reduce(
    (sum, item) => sum + getB2bPrice(item.product.price) * item.quantity,
    0,
  );
  const deliveryFee = fulfillmentMethod === "DELIVERY_TO_HOME" ? 10000 : 0;
  const b2bTotal = b2bSubtotal + deliveryFee;

  const handleCheckoutB2b = async () => {
    if (!activeUser) return;
    if (b2bCart.length === 0) {
      Alert.alert("Eror", "Keranjang belanja kosong.");
      return;
    }

    if (
      paymentMethod === "INVOICE_TERM" &&
      b2bTotal > creditLimitData.remaining
    ) {
      Alert.alert(
        "Kredit Ditolak",
        `Batas limit kredit Anda tidak mencukupi.\nLimit Tersisa: Rp${creditLimitData.remaining.toLocaleString(
          "id-ID",
        )}\nTotal Pesanan: Rp${b2bTotal.toLocaleString("id-ID")}`,
      );
      return;
    }

    setIsSubmittingB2b(true);
    try {
      const orderId = generateUniqueId("b2b");
      const nowStr = getIsoString();

      const initialPayStatus = paymentMethod === "QRIS" ? "PAID" : "UNPAID";
      const initialOrdStatus =
        paymentMethod === "QRIS" ? "CONFIRMED" : "PENDING_PAYMENT";

      // 1. Insert order
      await dbService.run(
        `INSERT INTO orders (id, user_id, channel, fulfillment, subtotal, discount, points_redeemed, total, payment_status, order_status, created_at)
         VALUES (?, ?, 'B2B_AGENT', ?, ?, 0, 0, ?, ?, ?, ?)`,
        [
          orderId,
          activeUser.id,
          fulfillmentMethod,
          b2bSubtotal,
          b2bTotal,
          initialPayStatus,
          initialOrdStatus,
          nowStr,
        ],
      );

      // 2. Insert items and deduct stock
      for (const item of b2bCart) {
        const itemB2bPrice = getB2bPrice(item.product.price);
        await dbService.run(
          `INSERT INTO order_items (id, order_id, product_id, name, price, quantity)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            `oi-${orderId}-${item.product.id}`,
            orderId,
            item.product.id,
            item.product.name,
            itemB2bPrice,
            item.quantity,
          ],
        );
        await dbService.run(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [item.quantity, item.product.id],
        );
      }

      // Audit Log
      await dbService.run(
        `INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)`,
        [
          generateUniqueId("audit"),
          activeUser.name,
          "B2B_ORDER_CREATED",
          `Placed wholesale B2B B2B order ${orderId} total Rp${b2bTotal.toLocaleString("id-ID")} with ${paymentMethod}`,
          nowStr,
        ],
      );

      setB2bCart([]);
      setShowB2bCartModal(false);

      if (paymentMethod === "QRIS") {
        setShowQrisB2bModal(true);
      } else {
        Alert.alert("Sukses", "Pesanan grosir B2B Anda berhasil dibuat.");
      }
      await refreshData();
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmittingB2b(false);
    }
  };

  // --- Confirm B2B Order Receipt ---
  const handleConfirmReceipt = async (orderId: string) => {
    try {
      await dbService.run(
        "UPDATE orders SET order_status = 'COMPLETED', payment_status = 'PAID' WHERE id = ?",
        [orderId],
      );
      // Log audit
      await dbService.run(
        `INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)`,
        [
          generateUniqueId("audit"),
          activeUser?.name || "Mitra",
          "B2B_ORDER_COMPLETED",
          `Confirmed goods receipt for wholesale order ${orderId}`,
          getIsoString(),
        ],
      );
      Alert.alert("Sukses", "Penerimaan barang telah dikonfirmasi.");
      await refreshData();
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Gagal memperbarui status penerimaan.");
    }
  };

  // --- Discrepancy Reporting ---
  const handleOpenDiscrepancy = async (order: Order) => {
    setSelectedB2bOrder(order);
    try {
      const items = await dbService.getAll<OrderItem>(
        "SELECT * FROM order_items WHERE order_id = ?",
        [order.id],
      );
      setB2bOrderItems(items);
      if (items.length > 0) {
        setDiscrepancyProduct(items[0].name);
      }
      setDiscrepancyQty("");
      setDiscrepancyNotes("");
      setShowDiscrepancyModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitDiscrepancy = async () => {
    if (!selectedB2bOrder) return;
    if (!discrepancyProduct || !discrepancyQty) {
      Alert.alert("Eror", "Harap isi nama produk dan jumlah selisih.");
      return;
    }

    setIsSubmittingDiscrepancy(true);
    try {
      const nowStr = getIsoString();
      const auditId = generateUniqueId("audit");
      const logDetails = `B2B DISCREPANCY REPORT on order ${selectedB2bOrder.id}: ${discrepancyQty}x ${discrepancyProduct} - Notes: ${discrepancyNotes}`;

      await dbService.run(
        `INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)`,
        [
          auditId,
          activeUser?.name || "Mitra",
          "B2B_DISCREPANCY_REPORTED",
          logDetails,
          nowStr,
        ],
      );

      Alert.alert(
        "Sukses",
        "Laporan selisih/kerusakan barang berhasil dikirim ke pengurus koperasi.",
      );
      setShowDiscrepancyModal(false);
      setSelectedB2bOrder(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Gagal mengirim laporan selisih.");
    } finally {
      setIsSubmittingDiscrepancy(false);
    }
  };

  // --- Citizen Demand Request Functions ---
  const handleCreateRequest = async () => {
    if (!reqProductName || !reqQty || isNaN(parseInt(reqQty))) {
      Alert.alert("Eror", "Harap isi nama produk dan jumlah dengan benar.");
      return;
    }
    if (!activeUser) return;

    setIsSubmittingRequest(true);
    try {
      await createKopRequest(activeUser.id, reqProductName, parseInt(reqQty));
      Alert.alert("Sukses", "Permintaan kebutuhan warga berhasil dicatat.");
      setReqProductName("");
      setReqQty("1");
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Gagal mengirim permintaan.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Filter agent's B2B orders
  const myB2bOrders = orders.filter(
    (o) => o.user_id === activeUser?.id && o.channel === "B2B_AGENT",
  );
  const activeB2bOrders = myB2bOrders.filter(
    (o) => o.order_status !== "COMPLETED" && o.order_status !== "CANCELLED",
  );
  const completedB2bOrders = myB2bOrders.filter(
    (o) => o.order_status === "COMPLETED" || o.order_status === "CANCELLED",
  );

  // Filter agent's product requests
  const myRequests = kopRequests.filter((r) => r.user_id === activeUser?.id);

  return (
    <View className="flex-1 bg-stone-100 flex-column">
      {/* Insentif & Credit Limit Dashboard Panel */}
      <View className="px-4 pt-3 pb-1 flex-row justify-between items-center gap-3">
        <View className="flex-1 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
          <View className="flex-row items-center gap-1.5 mb-1">
            <SymbolView name="creditcard.fill" size={12} tintColor="#0f5132" />
            <Text className="text-stone-500 text-[9px] font-bold uppercase tracking-wider">
              Batas Kredit (B2B)
            </Text>
          </View>
          <Text className="text-stone-900 font-black text-sm">
            Rp{creditLimitData.remaining.toLocaleString("id-ID")}
          </Text>
          <Text className="text-stone-400 text-[8px] mt-0.5 font-bold">
            Terpakai: Rp{creditLimitData.outstanding.toLocaleString("id-ID")}
          </Text>
        </View>

        <View className="flex-1 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
          <View className="flex-row items-center gap-1.5 mb-1">
            <SymbolView name="sparkles" size={12} tintColor="#eab308" />
            <Text className="text-stone-500 text-[9px] font-bold uppercase tracking-wider">
              Loyalty Poin
            </Text>
          </View>
          <Text className="text-stone-900 font-black text-sm">
            {activeUser?.points.toLocaleString("id-ID")} Poin
          </Text>
          <Text className="text-emerald-800 text-[8px] mt-0.5 font-extrabold uppercase tracking-wider">
            Mitra Agen Aktif
          </Text>
        </View>
      </View>

      {/* Main Tab View */}
      <View className="flex-1 px-4 pt-4">
        {subTab === 0 && (
          // --- TAB 1: B2B BELANJA GROSIR ---
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-stone-900 font-black text-xs">
                Katalog Grosir Koperasi
              </Text>
              <Pressable
                onPress={() => setShowB2bCartModal(true)}
                className="bg-emerald-800 border border-emerald-900 flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl active:bg-emerald-950"
              >
                <SymbolView name="cart.fill" size={11} tintColor="#fbbf24" />
                <Text className="text-white text-[9px] font-black uppercase tracking-wider">
                  Keranjang (
                  {b2bCart.reduce((sum, item) => sum + item.quantity, 0)})
                </Text>
              </Pressable>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {products.map((p) => {
                const partnerB2bPrice = getB2bPrice(p.price);
                return (
                  <View
                    key={p.id}
                    className="flex-row items-center justify-between p-3 mb-2.5 bg-white rounded-2xl border border-stone-200"
                  >
                    <View className="flex-1 mr-3">
                      <Text className="text-stone-950 font-black text-xs">
                        {p.name}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                          <Text className="text-stone-500 text-[8px] line-through font-bold">
                            Eceran: Rp{p.price.toLocaleString("id-ID")}
                          </Text>
                        </View>
                        <View className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <Text className="text-amber-900 text-[9px] font-black">
                            B2B: Rp{partnerB2bPrice.toLocaleString("id-ID")}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-stone-400 text-[8px] mt-1 font-bold">
                        Stok Koperasi: {p.stock}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => addToB2bCart(p)}
                      className="bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl active:bg-emerald-100 flex-row items-center gap-1"
                    >
                      <SymbolView
                        name="cart.badge.plus"
                        size={12}
                        tintColor="#0f5132"
                      />
                      <Text className="text-emerald-900 font-black text-[9px]">
                        + B2B
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {subTab === 1 && (
          // --- TAB 1: PESANAN B2B SAYA ---
          <View className="flex-1">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Active orders */}
              <Text className="text-stone-700 text-[10px] uppercase font-black tracking-wider mb-2">
                Pesanan Grosir Aktif ({activeB2bOrders.length})
              </Text>
              {activeB2bOrders.length === 0 ? (
                <View className="bg-white rounded-2xl p-6 border border-stone-200 items-center mb-4">
                  <Text className="text-stone-400 text-[10px] italic">
                    Tidak ada pesanan grosir aktif.
                  </Text>
                </View>
              ) : (
                activeB2bOrders.map((o) => (
                  <View
                    key={o.id}
                    className="bg-white p-3.5 rounded-2xl border border-stone-200 mb-3"
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-stone-900 font-extrabold text-[10px]">
                        ID: {o.id.substring(0, 14)}...
                      </Text>
                      <View className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        <Text className="text-blue-800 text-[8px] font-black uppercase">
                          {getOrderStatusLabel(o.order_status)}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between mb-2.5 pb-2 border-b border-stone-50">
                      <View>
                        <Text className="text-[9px] text-stone-500">
                          Total B2B
                        </Text>
                        <Text className="text-emerald-950 font-black text-xs mt-0.5">
                          Rp{o.total.toLocaleString("id-ID")}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-[9px] text-stone-500">
                          Metode
                        </Text>
                        <Text className="text-stone-800 font-bold text-[9px] mt-0.5">
                          {o.fulfillment === "DELIVERY_TO_HOME"
                            ? "Dikirim ke Warung"
                            : "Ambil Sendiri"}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleConfirmReceipt(o.id)}
                        className="flex-1 bg-emerald-700 py-2 rounded-xl items-center active:bg-emerald-900 justify-center"
                      >
                        <Text className="text-white font-black text-[10px]">
                          Konfirmasi Terima
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleOpenDiscrepancy(o)}
                        className="flex-1 bg-stone-100 border border-stone-300 py-2 rounded-xl items-center active:bg-stone-200 justify-center"
                      >
                        <Text className="text-stone-700 font-black text-[10px]">
                          Laporkan Selisih
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}

              {/* Completed history */}
              <Text className="text-stone-700 text-[10px] uppercase font-black tracking-wider mt-2 mb-2">
                Riwayat Selesai ({completedB2bOrders.length})
              </Text>
              {completedB2bOrders.map((o) => (
                <View
                  key={o.id}
                  className="bg-white p-3 rounded-2xl border border-stone-200 mb-2 opacity-80"
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-stone-900 font-bold text-[10px]">
                        ID: {o.id.substring(0, 14)}...
                      </Text>
                      <Text className="text-stone-400 text-[8px] mt-0.5">
                        {new Date(o.created_at).toLocaleDateString("id-ID")} •
                        Rp{o.total.toLocaleString("id-ID")}
                      </Text>
                    </View>
                    <View className="bg-stone-100 px-2 py-0.5 rounded-full">
                      <Text className="text-stone-600 text-[8px] font-bold uppercase">
                        {getOrderStatusLabel(o.order_status)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {subTab === 2 && (
          // --- TAB 2: KEBUTUHAN WARGA ---
          <View className="flex-1">
            <View className="bg-white p-4 rounded-2xl border border-stone-200 mb-4">
              <Text className="text-stone-900 font-black text-xs mb-3">
                Laporkan Barang yang Dibutuhkan Warga
              </Text>

              <View className="mb-3">
                <Text className="text-stone-600 text-[9px] uppercase font-bold tracking-wider mb-1">
                  Nama Barang / Produk
                </Text>
                <TextInput
                  value={reqProductName}
                  onChangeText={setReqProductName}
                  placeholder="Contoh: Kecap Manis Sedaap 250ml"
                  placeholderTextColor="#bbb"
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 text-xs font-semibold"
                />
              </View>

              <View className="mb-4">
                <Text className="text-stone-600 text-[9px] uppercase font-bold tracking-wider mb-1">
                  Jumlah Dibutuhkan (Estimasi)
                </Text>
                <TextInput
                  value={reqQty}
                  onChangeText={setReqQty}
                  keyboardType="number-pad"
                  placeholder="Contoh: 10"
                  placeholderTextColor="#bbb"
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 text-xs font-semibold"
                />
              </View>

              <Pressable
                onPress={handleCreateRequest}
                disabled={isSubmittingRequest}
                className="bg-emerald-700 py-3 rounded-xl items-center active:bg-emerald-900"
              >
                {isSubmittingRequest ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-black text-xs">
                    Kirim Permintaan
                  </Text>
                )}
              </Pressable>
            </View>

            <Text className="text-stone-700 text-[10px] uppercase font-black tracking-wider mb-2">
              Daftar Permintaan Saya ({myRequests.length})
            </Text>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {myRequests.length === 0 ? (
                <View className="bg-white rounded-2xl p-6 border border-stone-200 items-center">
                  <Text className="text-stone-400 text-[10px] italic">
                    Belum ada permintaan yang diajukan.
                  </Text>
                </View>
              ) : (
                myRequests.map((r) => (
                  <View
                    key={r.id}
                    className="bg-white p-3 rounded-2xl border border-stone-200 mb-2"
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 mr-2">
                        <Text className="text-stone-900 font-bold text-xs">
                          {r.product_name}
                        </Text>
                        <Text className="text-stone-500 text-[9px] mt-0.5">
                          Jumlah: {r.quantity}
                        </Text>
                      </View>
                      <View
                        className={`px-2 py-0.5 rounded-full ${
                          r.status === "NOTIFIED"
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-amber-50 border border-amber-200 text-amber-800"
                        }`}
                      >
                        <Text className="text-[8px] font-black uppercase">
                          {r.status === "NOTIFIED" ? "Tersedia" : "Diproses"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {subTab === 3 && (
          // --- TAB 3: KEUANGAN & TEMPO INVOICES ---
          <View className="flex-1">
            <View className="bg-white p-4 rounded-2xl border border-stone-200 mb-4">
              <View className="flex-row justify-between items-center pb-2 border-b border-stone-100 mb-3">
                <Text className="text-stone-955 font-black text-xs">
                  Outstanding Kredit Tempo
                </Text>
                <Text className="text-[8px] font-black uppercase tracking-wider text-amber-500">
                  Sari Warung
                </Text>
              </View>

              <View className="gap-2.5">
                <View className="flex-row justify-between">
                  <Text className="text-stone-500 text-xs">
                    Total Limit Kredit
                  </Text>
                  <Text className="text-stone-900 font-black text-xs">
                    Rp5.000.000
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-stone-500 text-xs">
                    Kredit Digunakan
                  </Text>
                  <Text className="text-rose-700 font-black text-xs">
                    Rp{creditLimitData.outstanding.toLocaleString("id-ID")}
                  </Text>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-stone-50">
                  <Text className="text-stone-900 font-black text-xs">
                    Sisa Limit Kredit
                  </Text>
                  <Text className="text-emerald-700 font-extrabold text-sm">
                    Rp{creditLimitData.remaining.toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-stone-700 text-[10px] uppercase font-black tracking-wider mb-2">
              Daftar Tagihan Tempo (B2B Invoices)
            </Text>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {myB2bOrders.filter((o) => o.payment_status === "UNPAID")
                .length === 0 ? (
                <View className="bg-white rounded-2xl p-6 border border-stone-200 items-center">
                  <Text className="text-stone-400 text-[10px] italic">
                    Tidak ada tagihan tertunggak.
                  </Text>
                </View>
              ) : (
                myB2bOrders
                  .filter((o) => o.payment_status === "UNPAID")
                  .map((o) => (
                    <View
                      key={o.id}
                      className="bg-white p-3.5 rounded-2xl border border-stone-200 mb-2"
                    >
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-stone-900 font-bold text-[10px]">
                          Invoice ID: INV-{o.id.substring(0, 10).toUpperCase()}
                        </Text>
                        <View className="bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <Text className="text-rose-700 text-[8px] font-black uppercase">
                            Belum Lunas
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-stone-50">
                        <View>
                          <Text className="text-stone-400 text-[8px]">
                            TANGGAL ORDER
                          </Text>
                          <Text className="text-stone-700 font-bold text-[9px]">
                            {new Date(o.created_at).toLocaleDateString("id-ID")}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-stone-400 text-[8px]">
                            TOTAL TAGIHAN
                          </Text>
                          <Text className="text-rose-700 font-black text-xs">
                            Rp{o.total.toLocaleString("id-ID")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Footer Navigation Bar */}
      <View className="bg-white border-t border-stone-200 h-16 flex-row items-center justify-around pb-2 px-1">
        <Pressable
          onPress={() => setSubTab(0)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="cart.fill"
            size={16}
            tintColor={subTab === 0 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[8px] mt-0.5 font-bold ${subTab === 0 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Belanja B2B
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSubTab(1)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="list.bullet.rectangle.fill"
            size={16}
            tintColor={subTab === 1 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[8px] mt-0.5 font-bold ${subTab === 1 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Pesanan B2B
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSubTab(2)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="info.circle.fill"
            size={16}
            tintColor={subTab === 2 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[8px] mt-0.5 font-bold ${subTab === 2 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Kebutuhan Warga
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSubTab(3)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="banknote.fill"
            size={16}
            tintColor={subTab === 3 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[8px] mt-0.5 font-bold ${subTab === 3 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Keuangan
          </Text>
        </Pressable>
      </View>

      {/* (B2C Citizen select modal removed) */}

      {/* --- MODAL CART B2B (WHOLESALE CHECKOUT) --- */}
      <AppModal
        visible={showB2bCartModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-end">
          <Pressable
            onPress={() => setShowB2bCartModal(false)}
            className="absolute inset-0 bg-black/60"
          />
          <View className="bg-white rounded-t-3xl p-5 max-h-[85%] border-t border-stone-200 w-full z-10">
            <View className="flex-row justify-between items-center border-b border-stone-100 pb-3 mb-3">
              <Text className="text-stone-900 font-black text-sm">
                Keranjang Grosir B2B
              </Text>
              <Pressable
                onPress={() => setShowB2bCartModal(false)}
                className="p-1"
              >
                <SymbolView name="xmark" size={16} tintColor="#777" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[300px] mb-3">
              {b2bCart.length === 0 ? (
                <Text className="text-stone-400 text-xs italic text-center py-6">
                  Keranjang grosir kosong.
                </Text>
              ) : (
                b2bCart.map((item) => {
                  const b2bItemPrice = getB2bPrice(item.product.price);
                  return (
                    <View
                      key={item.product.id}
                      className="flex-row justify-between items-center p-3 mb-2 bg-stone-50 rounded-xl border border-stone-200"
                    >
                      <View className="flex-1 mr-2">
                        <Text className="text-stone-900 font-bold text-xs">
                          {item.product.name}
                        </Text>
                        <Text className="text-amber-700 text-[9px] font-bold">
                          Rp{b2bItemPrice.toLocaleString("id-ID")} /{" "}
                          {item.product.unit}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2.5">
                        <Pressable
                          onPress={() => updateB2bQty(item.product.id, -1)}
                          className="size-6 bg-stone-200 rounded-lg items-center justify-center active:bg-stone-300"
                        >
                          <Text className="text-stone-900 font-black">-</Text>
                        </Pressable>
                        <Text className="text-stone-950 font-black text-xs">
                          {item.quantity}
                        </Text>
                        <Pressable
                          onPress={() => updateB2bQty(item.product.id, 1)}
                          className="size-6 bg-stone-200 rounded-lg items-center justify-center active:bg-stone-300"
                        >
                          <Text className="text-stone-900 font-black">+</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {b2bCart.length > 0 && (
              <View className="gap-3 border-t border-stone-100 pt-3">
                {/* Fulfillment option */}
                <View>
                  <Text className="text-stone-600 text-[9px] uppercase font-bold tracking-wider mb-1.5">
                    Metode Pengiriman
                  </Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setFulfillmentMethod("PICKUP_AT_COOP")}
                      className={`flex-1 p-2.5 rounded-xl border items-center justify-center ${
                        fulfillmentMethod === "PICKUP_AT_COOP"
                          ? "bg-emerald-50 border-emerald-800"
                          : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-black ${fulfillmentMethod === "PICKUP_AT_COOP" ? "text-emerald-900" : "text-stone-600"}`}
                      >
                        Ambil Sendiri
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setFulfillmentMethod("DELIVERY_TO_HOME")}
                      className={`flex-1 p-2.5 rounded-xl border items-center justify-center ${
                        fulfillmentMethod === "DELIVERY_TO_HOME"
                          ? "bg-emerald-50 border-emerald-800"
                          : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-black ${fulfillmentMethod === "DELIVERY_TO_HOME" ? "text-emerald-900" : "text-stone-600"}`}
                      >
                        Kirim ke Warung (+Rp10k)
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Payment Option */}
                <View>
                  <Text className="text-stone-600 text-[9px] uppercase font-bold tracking-wider mb-1.5">
                    Metode Pembayaran B2B
                  </Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setPaymentMethod("CASH")}
                      className={`flex-1 p-2 rounded-xl border items-center justify-center ${
                        paymentMethod === "CASH"
                          ? "bg-emerald-50 border-emerald-800"
                          : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <Text
                        className={`text-[9px] font-black ${paymentMethod === "CASH" ? "text-emerald-900" : "text-stone-600"}`}
                      >
                        Tunai / COD
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPaymentMethod("QRIS")}
                      className={`flex-1 p-2 rounded-xl border items-center justify-center ${
                        paymentMethod === "QRIS"
                          ? "bg-emerald-50 border-emerald-800"
                          : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <Text
                        className={`text-[9px] font-black ${paymentMethod === "QRIS" ? "text-emerald-900" : "text-stone-600"}`}
                      >
                        QRIS Digital
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPaymentMethod("INVOICE_TERM")}
                      className={`flex-1 p-2 rounded-xl border items-center justify-center ${
                        paymentMethod === "INVOICE_TERM"
                          ? "bg-emerald-50 border-emerald-800"
                          : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <Text
                        className={`text-[9px] font-black ${paymentMethod === "INVOICE_TERM" ? "text-emerald-900" : "text-stone-600"}`}
                      >
                        Bayar Tempo
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View className="bg-stone-50 p-3 rounded-xl border border-stone-200 gap-1 mt-1">
                  <View className="flex-row justify-between">
                    <Text className="text-stone-500 text-[10px]">
                      Subtotal Grosir
                    </Text>
                    <Text className="text-stone-900 font-bold text-xs">
                      Rp{b2bSubtotal.toLocaleString("id-ID")}
                    </Text>
                  </View>
                  {deliveryFee > 0 && (
                    <View className="flex-row justify-between">
                      <Text className="text-stone-500 text-[10px]">
                        Ongkos Kirim
                      </Text>
                      <Text className="text-stone-900 font-bold text-xs">
                        Rp{deliveryFee.toLocaleString("id-ID")}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row justify-between pt-1 border-t border-stone-200 mt-1">
                    <Text className="text-stone-900 font-black text-xs">
                      Total Pembayaran
                    </Text>
                    <Text className="text-emerald-950 font-extrabold text-sm">
                      Rp{b2bTotal.toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleCheckoutB2b}
                  disabled={isSubmittingB2b}
                  className="bg-emerald-700 py-3 rounded-xl items-center justify-center active:bg-emerald-900 mt-1"
                >
                  {isSubmittingB2b ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white font-black text-xs">
                      {paymentMethod === "INVOICE_TERM"
                        ? "Konfirmasi Bayar Tempo"
                        : "Pesan Sekarang"}
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </AppModal>

      {/* --- MODAL MOCKUP QRIS B2B --- */}
      <AppModal visible={showQrisB2bModal} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center p-5">
          <Pressable
            onPress={() => setShowQrisB2bModal(false)}
            className="absolute inset-0 bg-black/75"
          />
          <View className="bg-white rounded-3xl p-5 items-center w-full max-w-sm z-10">
            <View className="flex-row justify-between items-center w-full border-b border-stone-100 pb-2 mb-3">
              <Text className="text-stone-900 font-black text-sm">
                QRIS Lintas Koperasi (B2B)
              </Text>
              <Pressable
                onPress={() => setShowQrisB2bModal(false)}
                className="p-1"
              >
                <SymbolView name="xmark" size={16} tintColor="#777" />
              </Pressable>
            </View>

            <View className="border border-stone-250 p-2.5 rounded-2xl bg-white shadow-sm my-3 items-center">
              <View className="border-t-2 border-l-2 border-emerald-800 w-4 h-4 absolute top-2.5 left-2.5" />
              <View className="border-t-2 border-r-2 border-emerald-800 w-4 h-4 absolute top-2.5 right-2.5" />
              <View className="border-b-2 border-l-2 border-emerald-800 w-4 h-4 absolute bottom-2.5 left-2.5" />
              <View className="border-b-2 border-r-2 border-emerald-800 w-4 h-4 absolute bottom-2.5 right-2.5" />
              <View className="w-40 h-40 flex-wrap flex-row gap-0.5 justify-center items-center opacity-85">
                {Array.from({ length: 9 }).map((_, i) => (
                  <View
                    key={i}
                    className={`w-11 h-11 rounded ${
                      i % 3 === 0
                        ? "bg-emerald-950"
                        : i % 2 === 0
                          ? "bg-stone-900"
                          : "bg-emerald-850/15"
                    }`}
                  />
                ))}
              </View>
            </View>

            <Text className="text-stone-700 text-xs font-bold uppercase tracking-wider text-center mt-1">
              GPN QRIS - PILAR KOPERASI DESA
            </Text>
            <Text className="text-[10px] text-stone-400 text-center mt-0.5">
              Nilai Tagihan B2B: Rp{b2bTotal.toLocaleString("id-ID")}
            </Text>

            <Pressable
              onPress={() => {
                setShowQrisB2bModal(false);
                Alert.alert(
                  "Pembayaran Sukses",
                  "Pembayaran QRIS B2B Anda terverifikasi!",
                );
              }}
              className="bg-emerald-800 py-2.5 rounded-xl w-full items-center justify-center mt-4 active:bg-emerald-900"
            >
              <Text className="text-white font-black text-xs">
                Simulasi Pembayaran Sukses
              </Text>
            </Pressable>
          </View>
        </View>
      </AppModal>

      {/* --- MODAL REPORT DISCREPANCY (LAPOR SELISIH) --- */}
      <AppModal
        visible={showDiscrepancyModal}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-end">
          <Pressable
            onPress={() => setShowDiscrepancyModal(false)}
            className="absolute inset-0 bg-black/60"
          />
          <View className="bg-white rounded-t-3xl p-5 border-t border-stone-200 w-full max-h-[85%] z-10">
            <View className="flex-row justify-between items-center border-b border-stone-100 pb-3 mb-3">
              <Text className="text-stone-955 font-black text-sm">
                Lapor Selisih & Kerusakan Barang
              </Text>
              <Pressable
                onPress={() => setShowDiscrepancyModal(false)}
                className="p-1"
              >
                <SymbolView name="xmark" size={16} tintColor="#777" />
              </Pressable>
            </View>

            <ScrollView className="mb-4">
              <View className="mb-3">
                <Text className="text-stone-600 text-[9px] uppercase font-bold tracking-wider mb-1">
                  Pilih Produk Bermasalah
                </Text>
                <View className="bg-stone-50 border border-stone-200 rounded-xl p-1">
                  {b2bOrderItems.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => setDiscrepancyProduct(item.name)}
                      className={`p-2.5 mb-1 rounded-lg ${
                        discrepancyProduct === item.name
                          ? "bg-emerald-50 border border-emerald-100"
                          : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${discrepancyProduct === item.name ? "text-emerald-900" : "text-stone-700"}`}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-stone-600 text-[9px] uppercase font-bold tracking-wider mb-1">
                  Jumlah Selisih / Rusak (Unit)
                </Text>
                <TextInput
                  value={discrepancyQty}
                  onChangeText={setDiscrepancyQty}
                  keyboardType="number-pad"
                  placeholder="Contoh: 2"
                  placeholderTextColor="#bbb"
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 text-xs font-semibold"
                />
              </View>

              <View className="mb-4">
                <Text className="text-stone-600 text-[9px] uppercase font-bold tracking-wider mb-1">
                  Catatan Kerusakan / Keterangan
                </Text>
                <TextInput
                  value={discrepancyNotes}
                  onChangeText={setDiscrepancyNotes}
                  placeholder="Keterangan (misal: bocor, kemasan sobek, dll)"
                  placeholderTextColor="#bbb"
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 text-xs font-semibold"
                />
              </View>

              <Pressable
                onPress={handleSubmitDiscrepancy}
                disabled={isSubmittingDiscrepancy}
                className="bg-emerald-700 py-3 rounded-xl items-center active:bg-emerald-900"
              >
                {isSubmittingDiscrepancy ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-black text-xs">
                    Kirim Laporan
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </AppModal>
    </View>
  );
}
