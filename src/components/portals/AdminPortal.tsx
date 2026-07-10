import { useApp } from "@/contexts/AppContext";
import { dbService, Order, OrderItem, Product, RTBatch } from "@/utils/db";
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

export default function AdminPortal() {
  const {
    products,
    batches,
    orders,
    settlements,
    auditLogs,
    updateProductStock,
    createOrUpdateProduct,
    processBatchFulfillment,
    verifySettlement,
    refreshData,
    allUsers,
  } = useApp();

  const [subTab, setSubTab] = useState(0); // 0: Inventory, 1: Process Batch, 2: Finance & Audit

  // Tab 0: Inventory states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Partial<Product> | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCost, setProdCost] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodUnit, setProdUnit] = useState("pcs");
  const [prodLocal, setProdLocal] = useState(false);

  // Tab 1: Fulfillment details state
  const [activeFulfillBatch, setActiveFulfillBatch] = useState<RTBatch | null>(
    null,
  );
  const [batchItemsAggregate, setBatchItemsAggregate] = useState<any[]>([]);
  const [batchOrdersList, setBatchOrdersList] = useState<any[]>([]);

  // Tab 1: Self-pickup order details state
  const [activeSelfOrder, setActiveSelfOrder] = useState<Order | null>(null);
  const [selfOrderItems, setSelfOrderItems] = useState<OrderItem[]>([]);

  // Calculation helpers
  const lowStockProducts = products.filter((p) => p.stock < 15);

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setProdName(product.name);
      setProdPrice(String(product.price));
      setProdCost(String(product.cost_price));
      setProdStock(String(product.stock));
      setProdUnit(product.unit);
      setProdLocal(product.is_local === 1);
    } else {
      setSelectedProduct(null);
      setProdName("");
      setProdPrice("");
      setProdCost("");
      setProdStock("");
      setProdUnit("pcs");
      setProdLocal(false);
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!prodName.trim() || !prodPrice || !prodStock) {
      Alert.alert("Error", "Semua kolom utama harus diisi.");
      return;
    }

    try {
      await createOrUpdateProduct({
        id: selectedProduct?.id,
        name: prodName,
        price: parseFloat(prodPrice),
        cost_price: parseFloat(prodCost) || parseFloat(prodPrice) * 0.85,
        stock: parseInt(prodStock, 10),
        unit: prodUnit,
        is_local: prodLocal ? 1 : 0,
        image_url:
          selectedProduct?.image_url ||
          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
      });
      setProductModalOpen(false);
      Alert.alert("Sukses", "Produk berhasil disimpan!");
    } catch (err) {
      Alert.alert("Gagal", "Gagal menyimpan produk.");
    }
  };

  const handleQuickStockUpdate = async (
    productId: string,
    currentStock: number,
    change: number,
  ) => {
    const targetStock = Math.max(0, currentStock + change);
    await updateProductStock(productId, targetStock);
  };

  // Open Fulfillment Details
  const handleOpenFulfillmentDetails = async (batch: RTBatch) => {
    setActiveFulfillBatch(batch);

    try {
      // 1. Fetch all orders linked to this batch
      const batchOrders = await dbService.getAll<Order>(
        "SELECT * FROM orders WHERE rt_batch_id = ?",
        [batch.id],
      );
      setBatchOrdersList(batchOrders);

      // 2. Fetch aggregate items to package (sum of items)
      const aggItems = await dbService.getAll(
        `SELECT oi.product_id, oi.name, SUM(oi.quantity) as total_qty, p.unit
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.rt_batch_id = ?
         GROUP BY oi.product_id, oi.name`,
        [batch.id],
      );
      setBatchItemsAggregate(aggItems);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenSelfOrderDetails = async (order: Order) => {
    setActiveSelfOrder(order);
    try {
      const items = await dbService.getAll<OrderItem>(
        "SELECT * FROM order_items WHERE order_id = ?",
        [order.id],
      );
      setSelfOrderItems(items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSelfOrderFulfillment = async (
    orderId: string,
    status: string,
  ) => {
    try {
      const isCompleted = status === "COMPLETED";
      const sql = isCompleted
        ? `UPDATE orders SET order_status = 'COMPLETED', payment_status = 'PAID' WHERE id = ?`
        : `UPDATE orders SET order_status = ? WHERE id = ?`;
      const args = isCompleted ? [orderId] : [status, orderId];

      await dbService.run(sql, args);

      const logId = `log-${Date.now()}`;
      await dbService.run(
        "INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)",
        [
          logId,
          "Pegawai Koperasi",
          isCompleted ? "SELF_PICKUP_COMPLETE" : "SELF_PICKUP_READY",
          `Order ${orderId} updated to ${status}`,
          new Date().toISOString(),
        ],
      );

      if (activeSelfOrder && activeSelfOrder.id === orderId) {
        setActiveSelfOrder((prev) =>
          prev
            ? {
                ...prev,
                order_status: status as any,
                payment_status: isCompleted ? "PAID" : prev.payment_status,
              }
            : null,
        );
      }

      await refreshData();
      Alert.alert(
        "Sukses",
        `Status pesanan berhasil diperbarui menjadi: ${status === "COMPLETED" ? "Sudah Diambil" : "Siap Diambil"}`,
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Gagal memperbarui status pesanan.");
    }
  };

  const handleUpdateBatchFulfillment = async (
    batchId: string,
    status: "PROCESSING" | "DELIVERED_TO_RT",
  ) => {
    await processBatchFulfillment(batchId, status);

    // Update local modal state status
    if (activeFulfillBatch) {
      setActiveFulfillBatch((prev) => (prev ? { ...prev, status } : null));
    }

    Alert.alert(
      "Fulfillment Update",
      `Batch telah diupdate menjadi ${status === "PROCESSING" ? "Sedang Dikemas" : "Barang Dikirim ke RT"}`,
    );
  };

  const handleVerifySettlement = async (
    settlementId: string,
    verified: boolean,
  ) => {
    await verifySettlement(settlementId, verified);
    Alert.alert(
      "Settlement",
      verified
        ? "Setoran tunai berhasil terverifikasi dan masuk kasir!"
        : "Setoran bermasalah (Dispute) ditandai.",
    );
  };

  // Calculate Financial dashboard values
  const completedOrders = orders.filter((o) => o.order_status === "COMPLETED");
  const gmv = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = completedOrders.length;
  const aov = orderCount > 0 ? Math.round(gmv / orderCount) : 0;

  // Total cost of goods sold (COGS)
  // Let's compute actual COGS for each item sold in completed orders
  const [cogsVal, setCogsVal] = useState(0);
  const [totalRewardsUsed, setTotalRewardsUsed] = useState(0);

  React.useEffect(() => {
    let subCogs = 0;
    let subPointsRedeemed = 0;

    const compute = async () => {
      for (const o of completedOrders) {
        subPointsRedeemed += o.discount; // total value of points/vouchers redeemed

        const items = await dbService.getAll(
          "SELECT * FROM order_items WHERE order_id = ?",
          [o.id],
        );
        for (const it of items) {
          const p = products.find((prod) => prod.id === it.product_id);
          const itemCost = p ? p.cost_price : it.price * 0.85;
          subCogs += itemCost * it.quantity;
        }
      }
      setCogsVal(subCogs);
      setTotalRewardsUsed(subPointsRedeemed);
    };

    compute();
  }, [orders, products]);

  const grossProfit = gmv - cogsVal;
  // RT Incentive (1.5% of batch completed GMV as per rules)
  const rtIncentive = batches
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.total_gmv * 0.015, 0);
  const operatingProfit = grossProfit - totalRewardsUsed - rtIncentive;

  // Render Inventory Tab
  const renderInventory = () => (
    <View className="flex-1 pb-16">
      {/* Alert Banner for Low Stock */}
      {lowStockProducts.length > 0 && (
        <View className="bg-rose-50 border-b border-rose-200 p-3 flex-row items-center gap-2">
          <SymbolView
            name="exclamationmark.triangle.fill"
            size={14}
            tintColor="#ef4444"
          />
          <Text className="text-rose-800 text-[10px] font-bold flex-1">
            ⚠️ PERINGATAN STOK TIPIS: Terdapat {lowStockProducts.length} produk
            dengan stok kurang dari 15 unit!
          </Text>
        </View>
      )}

      <View className="bg-white p-3 border-b border-stone-200 flex-row justify-between items-center px-4">
        <Text className="text-stone-900 font-black text-lg">
          Katalog & Stok Gudang
        </Text>
        <Pressable
          onPress={() => handleOpenProductModal()}
          className="bg-emerald-700 px-4 py-2 rounded-xl flex-row items-center gap-1.5 active:bg-emerald-950"
        >
          <SymbolView name="plus" size={12} tintColor="#fff" />
          <Text className="text-white text-xs font-bold">Produk Baru</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-3 pb-28">
        {products.map((p) => {
          const isLow = p.stock < 15;
          return (
            <View
              key={p.id}
              className={`bg-white p-3 rounded-xl border mb-2 flex-row justify-between items-center shadow-sm ${
                isLow ? "border-rose-250 bg-rose-50/20" : "border-stone-200"
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <Image
                  source={{ uri: p.image_url }}
                  className="w-12 h-12 rounded-lg bg-stone-100"
                />
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-stone-900 font-bold text-xs"
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                    {p.is_local === 1 && (
                      <View className="bg-amber-100 px-1 rounded border border-amber-200">
                        <Text className="text-amber-800 text-[8px] font-bold">
                          LOKAL
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-stone-500 text-[10px] mt-0.5">
                    Jual: Rp{p.price.toLocaleString("id-ID")} • Modal: Rp
                    {p.cost_price.toLocaleString("id-ID")}
                  </Text>
                  <Text
                    className={`text-[10px] font-bold mt-1 ${isLow ? "text-rose-600" : "text-stone-500"}`}
                  >
                    Stok: {p.stock} {p.unit} {isLow ? "(Stok Kritis!)" : ""}
                  </Text>
                </View>
              </View>

              <View className="items-end gap-2">
                {/* Stock Editor */}
                <View className="items-center">
                  <Text className="text-[8px] text-stone-400 font-bold mb-1">
                    Stok Cepat
                  </Text>
                  <View className="flex-row items-center gap-1 bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                    <Pressable
                      onPress={() => handleQuickStockUpdate(p.id, p.stock, -5)}
                      className="px-2 py-0.5 items-center justify-center bg-white rounded border border-stone-200 active:bg-stone-100"
                    >
                      <Text className="text-stone-700 text-[10px] font-extrabold">
                        -5
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleQuickStockUpdate(p.id, p.stock, 5)}
                      className="px-2 py-0.5 items-center justify-center bg-white rounded border border-stone-200 active:bg-stone-100"
                    >
                      <Text className="text-stone-700 text-[10px] font-extrabold">
                        +5
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  onPress={() => handleOpenProductModal(p)}
                  className="bg-emerald-50 px-3 py-1 rounded border border-emerald-100 active:bg-emerald-100"
                >
                  <Text className="text-emerald-800 text-[10px] font-bold">
                    Edit Detail
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  // Render Fulfillment / Process Batch
  const renderFulfillment = () => {
    // Sort batches: submitted/processing first
    const activeBatches = batches.filter(
      (b) =>
        b.status === "SUBMITTED" ||
        b.status === "PROCESSING" ||
        b.status === "DELIVERED_TO_RT",
    );
    const inactiveBatches = batches.filter(
      (b) =>
        b.status === "COMPLETED" ||
        b.status === "LOCKED" ||
        b.status === "OPEN",
    );

    const selfPickupOrders = orders.filter(
      (o) =>
        o.fulfillment === "PICKUP_AT_COOP" &&
        o.order_status !== "COMPLETED" &&
        o.order_status !== "CANCELLED",
    );

    return (
      <ScrollView
        className="flex-1 bg-stone-50"
        contentContainerClassName="p-4 pb-28"
      >
        <Text className="text-stone-900 font-black text-lg mb-3">
          Antrean Batch Order RT (Kolektif)
        </Text>

        {activeBatches.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-stone-200 items-center justify-center mb-5">
            <SymbolView
              name="checkmark.seal.fill"
              size={32}
              tintColor="#10b981"
            />
            <Text className="text-stone-500 text-xs mt-2 text-center">
              Tidak ada antrean batch masuk dari RT.
            </Text>
          </View>
        ) : (
          activeBatches.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => handleOpenFulfillmentDetails(b)}
              className="bg-white p-4 rounded-xl border border-stone-200 mb-3 shadow-sm active:bg-stone-100 flex-row justify-between items-center"
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-stone-950 font-bold text-sm">
                    {b.name}
                  </Text>
                  <View className="bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    <Text className="text-emerald-800 text-[8px] font-bold">
                      {b.rt_id}
                    </Text>
                  </View>
                </View>
                <Text className="text-stone-400 text-[10px] mt-0.5">
                  Deadline: {new Date(b.deadline).toLocaleDateString("id-ID")} •
                  Poin Pickup: {b.pickup_point}
                </Text>
                <Text className="text-stone-500 text-[10px] mt-1.5 font-bold">
                  Total: {b.total_orders} Warga • GMV: Rp
                  {b.total_gmv.toLocaleString("id-ID")}
                </Text>
              </View>

              <View className="items-end gap-1.5">
                <View className="bg-amber-100 px-2 py-0.5 rounded border border-amber-250">
                  <Text className="text-amber-800 text-[8px] font-bold">
                    {b.status}
                  </Text>
                </View>
                <Text className="text-emerald-700 text-[10px] font-bold underline mt-1">
                  Proses Packing
                </Text>
              </View>
            </Pressable>
          ))
        )}

        {/* Antrean Ambil Mandiri */}
        <Text className="text-stone-900 font-black text-lg mt-6 mb-3">
          Antrean Ambil Mandiri di Koperasi
        </Text>
        {selfPickupOrders.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-stone-200 items-center justify-center mb-5">
            <SymbolView
              name="checkmark.seal.fill"
              size={32}
              tintColor="#10b981"
            />
            <Text className="text-stone-500 text-xs mt-2 text-center">
              Tidak ada antrean ambil mandiri saat ini.
            </Text>
          </View>
        ) : (
          selfPickupOrders.map((o) => {
            const user = allUsers.find((u) => u.id === o.user_id);
            return (
              <Pressable
                key={o.id}
                onPress={() => handleOpenSelfOrderDetails(o)}
                className="bg-white p-4 rounded-xl border border-stone-200 mb-3 shadow-sm active:bg-stone-100 flex-row justify-between items-center"
              >
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-stone-950 font-bold text-sm">
                      {user?.name || "Warga"}
                    </Text>
                    <View className="bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      <Text className="text-emerald-800 text-[8px] font-bold">
                        MANDIRI
                      </Text>
                    </View>
                  </View>
                  <Text className="text-stone-400 text-[10px] mt-0.5">
                    ID: {o.id.substring(0, 12)}... • Telp: {user?.phone || "—"}
                  </Text>
                  <Text className="text-stone-500 text-[10px] mt-1.5 font-bold">
                    Total: Rp{o.total.toLocaleString("id-ID")} •{" "}
                    {o.payment_status === "PAID"
                      ? "💳 Lunas"
                      : "💵 Siapkan Bayar COD"}
                  </Text>
                </View>

                <View className="items-end gap-2">
                  <View
                    className={`px-2 py-0.5 rounded border ${
                      o.order_status === "READY_FOR_PICKUP"
                        ? "bg-amber-100 border-amber-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <Text className="text-stone-700 text-[8px] font-bold">
                      {o.order_status === "READY_FOR_PICKUP"
                        ? "SIAP DIAMBIL"
                        : o.order_status}
                    </Text>
                  </View>

                  {o.order_status === "READY_FOR_PICKUP" ? (
                    <Pressable
                      onPress={() =>
                        handleUpdateSelfOrderFulfillment(o.id, "COMPLETED")
                      }
                      className="bg-emerald-700 px-3 py-1.5 rounded-lg active:bg-emerald-950"
                    >
                      <Text className="text-white text-[9px] font-bold">
                        Serahkan Barang
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() =>
                        handleUpdateSelfOrderFulfillment(
                          o.id,
                          "READY_FOR_PICKUP",
                        )
                      }
                      className="bg-blue-600 px-3 py-1.5 rounded-lg active:bg-blue-800"
                    >
                      <Text className="text-white text-[9px] font-bold">
                        Tandai Siap
                      </Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })
        )}

        <Text className="text-stone-900 font-black text-xs mt-6 mb-2">
          Riwayat Batch Kolektif Lainnya
        </Text>
        {inactiveBatches.map((b) => (
          <View
            key={b.id}
            className="bg-white p-3.5 rounded-xl border border-stone-150 mb-2 flex-row justify-between items-center"
          >
            <View>
              <Text className="text-stone-800 font-bold text-xs">
                {b.name} ({b.rt_id})
              </Text>
              <Text className="text-stone-400 text-[8px] mt-0.5">
                Status: {b.status} • Total: Rp
                {b.total_gmv.toLocaleString("id-ID")}
              </Text>
            </View>
            <Pressable
              onPress={() => handleOpenFulfillmentDetails(b)}
              className="px-2 py-1 rounded border border-stone-200 active:bg-stone-50"
            >
              <Text className="text-stone-500 text-[9px] font-bold">Lihat</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    );
  };

  // Render Finance Dashboard and Immutable Audit logs
  const renderFinanceAudit = () => {
    // Filter submitted settlements requiring verification
    const pendingSettlements = settlements.filter(
      (s) => s.status === "SUBMITTED" || s.status === "PENDING",
    );
    const verifiedSettlements = settlements.filter(
      (s) => s.status === "VERIFIED" || s.status === "DISPUTED",
    );

    return (
      <ScrollView
        className="flex-1 bg-stone-50"
        contentContainerClassName="p-4 pb-28"
      >
        <Text className="text-stone-900 font-black text-lg mb-3">
          Dashboard Keuangan Koperasi
        </Text>

        {/* Aggregate KPI grid */}
        <View className="flex-row flex-wrap justify-between mb-4">
          {/* GMV */}
          <View className="w-[48%] bg-white p-3.5 border border-stone-200 rounded-xl shadow-sm mb-3">
            <Text className="text-stone-400 text-[9px] font-bold uppercase tracking-wider">
              OMZET (GMV)
            </Text>
            <Text className="text-emerald-950 font-black text-base mt-1">
              Rp{gmv.toLocaleString("id-ID")}
            </Text>
            <Text className="text-[9px] text-stone-500 mt-1">
              Dari {orderCount} transaksi sukses
            </Text>
          </View>

          {/* AOV */}
          <View className="w-[48%] bg-white p-3.5 border border-stone-200 rounded-xl shadow-sm mb-3">
            <Text className="text-stone-400 text-[9px] font-bold uppercase tracking-wider">
              RATA BELANJA (AOV)
            </Text>
            <Text className="text-emerald-950 font-black text-base mt-1">
              Rp{aov.toLocaleString("id-ID")}
            </Text>
            <Text className="text-[9px] text-stone-500 mt-1">
              Per keranjang belanja
            </Text>
          </View>

          {/* Gross Margin */}
          <View className="w-[48%] bg-white p-3.5 border border-stone-200 rounded-xl shadow-sm mb-3">
            <Text className="text-stone-400 text-[9px] font-bold uppercase tracking-wider">
              LABA KOTOR
            </Text>
            <Text className="text-emerald-800 font-black text-base mt-1">
              Rp{grossProfit.toLocaleString("id-ID")}
            </Text>
            <Text className="text-[9px] text-stone-500 mt-1">
              Sisa setelah potong modal
            </Text>
          </View>

          {/* Operating Profit */}
          <View className="w-[48%] bg-white p-3.5 border border-stone-200 rounded-xl shadow-sm mb-3">
            <Text className="text-stone-400 text-[9px] font-bold uppercase tracking-wider">
              PROYEKSI SHU / LABA BERSIH
            </Text>
            <Text
              className={`font-black text-base mt-1 ${operatingProfit >= 0 ? "text-emerald-700" : "text-rose-600"}`}
            >
              Rp{operatingProfit.toLocaleString("id-ID")}
            </Text>
            <Text className="text-[9px] text-stone-500 mt-1">
              Telah dipotong poin & insentif RT
            </Text>
          </View>
        </View>

        {/* Detailed Profit/Loss Table */}
        <Text className="text-stone-900 font-black text-xs mb-2.5">
          Proyeksi Laba Rugi Program Pilot
        </Text>
        <View className="bg-white p-4 border border-stone-200 rounded-xl mb-5 shadow-sm">
          <View className="flex-row justify-between py-1 border-b border-stone-100">
            <Text className="text-stone-600 text-xs font-semibold">
              Omzet Penjualan (GMV)
            </Text>
            <Text className="text-stone-900 font-bold text-xs">
              Rp{gmv.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="flex-row justify-between py-1 border-b border-stone-100">
            <Text className="text-stone-600 text-xs">
              Harga Pokok Penjualan (HPP/Modal)
            </Text>
            <Text className="text-stone-700 text-xs">
              -Rp{cogsVal.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="flex-row justify-between py-1 border-b border-stone-100 bg-emerald-50/20 px-1 my-0.5">
            <Text className="text-emerald-800 text-xs font-bold">
              Laba Kotor Penjualan
            </Text>
            <Text className="text-emerald-800 font-bold text-xs">
              Rp{grossProfit.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="flex-row justify-between py-1 border-b border-stone-100">
            <Text className="text-stone-600 text-xs">
              Biaya Poin Gotong Royong (Loyalitas)
            </Text>
            <Text className="text-stone-700 text-xs">
              -Rp{totalRewardsUsed.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="flex-row justify-between py-1 border-b border-stone-100">
            <Text className="text-stone-600 text-xs">
              Insentif RT Agent (1.5% GMV Batch)
            </Text>
            <Text className="text-stone-700 text-xs">
              -Rp{rtIncentive.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="flex-row justify-between py-1.5 border-t border-stone-200 mt-1 bg-emerald-900 text-white px-2 rounded">
            <Text className="text-white text-xs font-black">
              Proyeksi SHU / Surplus Operasional
            </Text>
            <Text className="text-amber-400 font-black text-xs">
              Rp{operatingProfit.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        {/* Settlements verification */}
        <Text className="text-stone-900 font-black text-xs mb-2">
          3. Verifikasi Setoran Uang Tunai RT
        </Text>
        {pendingSettlements.length === 0 ? (
          <View className="bg-white p-4 rounded-xl border border-stone-200 mb-5 items-center justify-center">
            <Text className="text-stone-400 text-[10px] italic">
              Tidak ada setoran setelmen RT yang masuk.
            </Text>
          </View>
        ) : (
          pendingSettlements.map((s) => {
            const batch = batches.find((b) => b.id === s.rt_batch_id);
            return (
              <View
                key={s.id}
                className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm mb-3"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-stone-900 font-bold text-xs">
                      {batch?.name || "RT Batch"}
                    </Text>
                    <Text className="text-stone-400 text-[9px]">
                      Fulfillment RT: {batch?.rt_id || "RT 03"}
                    </Text>
                  </View>
                  <View
                    className={`px-2 py-0.5 rounded border ${s.status === "SUBMITTED" ? "bg-blue-150 border-blue-200" : "bg-rose-100 border-rose-250"}`}
                  >
                    <Text className="text-stone-700 text-[8px] font-bold">
                      {s.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between py-1 border-b border-stone-100">
                  <Text className="text-stone-500 text-[9px]">
                    Uang Seharusnya Disetor:
                  </Text>
                  <Text className="text-stone-800 font-bold text-xs">
                    Rp{s.amount_expected.toLocaleString("id-ID")}
                  </Text>
                </View>

                {s.status === "SUBMITTED" && (
                  <View className="flex-row justify-between py-1 border-b border-stone-100 mb-2">
                    <Text className="text-stone-500 text-[9px]">
                      Uang Fisik Diterima Kasir:
                    </Text>
                    <Text className="text-emerald-800 font-black text-xs">
                      Rp{s.amount_submitted.toLocaleString("id-ID")}
                    </Text>
                  </View>
                )}

                {s.status === "SUBMITTED" ? (
                  <View className="flex-row justify-end gap-2 mt-2.5">
                    <Pressable
                      onPress={() => handleVerifySettlement(s.id, false)}
                      className="bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-lg active:bg-rose-100"
                    >
                      <Text className="text-rose-700 text-[9px] font-bold">
                        Dispute / Selisih
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleVerifySettlement(s.id, true)}
                      className="bg-emerald-700 border border-emerald-800 px-3 py-1.5 rounded-lg active:bg-emerald-950"
                    >
                      <Text className="text-white text-[9px] font-bold">
                        Sesuai, Verifikasi
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text className="text-stone-400 text-[9px] italic mt-2">
                    Menunggu RT Budi mengumpulkan kas COD dari warga dan
                    menyetorkan.
                  </Text>
                )}
              </View>
            );
          })
        )}

        {/* Live Immutable Audit Logs */}
        <Text className="text-stone-900 font-black text-xs mb-2">
          4. Live System Audit Trail (Keamanan Program)
        </Text>
        <View className="bg-stone-900 p-3 rounded-xl border border-stone-800 mb-6 max-h-[250px]">
          <ScrollView>
            {auditLogs.map((log, idx) => (
              <View
                key={log.id || idx}
                className="border-b border-stone-800 py-2"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-amber-400 font-bold text-[9px]">
                    {log.actor}
                  </Text>
                  <Text className="text-stone-500 text-[8px]">
                    {new Date(log.created_at).toLocaleTimeString("id-ID")}
                  </Text>
                </View>
                <Text className="text-emerald-450 font-black text-[9px] mt-0.5">
                  {log.action}
                </Text>
                <Text className="text-stone-300 text-[9px] mt-0.5 leading-tight">
                  {log.details}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-stone-100">
      {/* Sub tabs render */}
      {subTab === 0 && renderInventory()}
      {subTab === 1 && renderFulfillment()}
      {subTab === 2 && renderFinanceAudit()}

      {/* Sub Tabs Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 h-16 flex-row justify-around items-center">
        <Pressable
          onPress={() => setSubTab(0)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="cart.badge.plus"
            size={18}
            tintColor={subTab === 0 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[10px] mt-1 font-bold ${subTab === 0 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Stok Barang
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSubTab(1)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="tray.and.arrow.down.fill"
            size={18}
            tintColor={subTab === 1 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[10px] mt-1 font-bold ${subTab === 1 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Fulfillment
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSubTab(2)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="chart.bar.xaxis"
            size={18}
            tintColor={subTab === 2 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[10px] mt-1 font-bold ${subTab === 2 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Keuangan & Audit
          </Text>
        </Pressable>
      </View>

      {/* Add / Edit Product Modal */}
      <Modal
        visible={productModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProductModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl p-5 max-h-[85%]">
            <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
              <Text className="text-emerald-950 font-black text-lg">
                {selectedProduct
                  ? "Edit Informasi Produk"
                  : "Tambah Produk Baru"}
              </Text>
              <Pressable
                onPress={() => setProductModalOpen(false)}
                className="p-1 rounded-full bg-stone-100"
              >
                <SymbolView name="xmark" size={16} tintColor="#555" />
              </Pressable>
            </View>

            <ScrollView className="space-y-4">
              <Text className="text-stone-700 text-xs font-bold mb-1">
                Nama Produk
              </Text>
              <TextInput
                value={prodName}
                onChangeText={setProdName}
                placeholder="cth: Beras Rojo Lele 5kg"
                className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 mb-3"
              />

              <View className="flex-row justify-between gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-stone-700 text-xs font-bold mb-1">
                    Harga Jual (Rp)
                  </Text>
                  <TextInput
                    value={prodPrice}
                    onChangeText={setProdPrice}
                    keyboardType="numeric"
                    placeholder="cth: 75000"
                    className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 font-bold"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-stone-700 text-xs font-bold mb-1">
                    Harga Modal/HPP (Rp)
                  </Text>
                  <TextInput
                    value={prodCost}
                    onChangeText={setProdCost}
                    keyboardType="numeric"
                    placeholder="cth: 65000"
                    className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 font-bold"
                  />
                </View>
              </View>

              <View className="flex-row justify-between gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-stone-700 text-xs font-bold mb-1">
                    Jumlah Stok Awal
                  </Text>
                  <TextInput
                    value={prodStock}
                    onChangeText={setProdStock}
                    keyboardType="numeric"
                    placeholder="cth: 100"
                    className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 font-bold"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-stone-700 text-xs font-bold mb-1">
                    Satuan Produk
                  </Text>
                  <TextInput
                    value={prodUnit}
                    onChangeText={setProdUnit}
                    placeholder="pcs / kg / liter / pack"
                    className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900"
                  />
                </View>
              </View>

              <Pressable
                onPress={() => setProdLocal(!prodLocal)}
                className="flex-row items-center gap-2 mb-4 bg-stone-50 border border-stone-200 p-3.5 rounded-xl"
              >
                <SymbolView
                  name={prodLocal ? "checkmark.square.fill" : "square"}
                  size={18}
                  tintColor={prodLocal ? "#0f5132" : "#777"}
                />
                <View className="flex-1">
                  <Text className="text-stone-900 font-bold text-xs">
                    Produk Titipan Warga (UMKM / Petani Lokal)
                  </Text>
                  <Text className="text-stone-400 text-[8px] mt-0.5">
                    Jika ditandai, pembeli akan mendapat bonus 2x lipat Poin
                    Gotong Royong.
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={handleSaveProduct}
                className="bg-emerald-700 border border-emerald-800 py-3.5 rounded-xl items-center justify-center active:bg-emerald-950 mb-6"
              >
                <Text className="text-white font-black text-xs">
                  Simpan Produk
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Fulfillment Aggregated details Modal */}
      {activeFulfillBatch && (
        <Modal
          visible={!!activeFulfillBatch}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setActiveFulfillBatch(null)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-white rounded-t-3xl p-5 max-h-[85%]">
              <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
                <View>
                  <Text className="text-emerald-955 font-black text-lg">
                    Detail Kemas & Pengiriman Batch
                  </Text>
                  <Text className="text-stone-400 text-[10px]">
                    {activeFulfillBatch.name} • {activeFulfillBatch.rt_id}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setActiveFulfillBatch(null)}
                  className="p-1 rounded-full bg-stone-100"
                >
                  <SymbolView name="xmark" size={16} tintColor="#555" />
                </Pressable>
              </View>

              <ScrollView className="space-y-4">
                {/* Visual Status Indicator */}
                <View className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex-row justify-between items-center mb-3">
                  <Text className="text-stone-500 text-[10px]">
                    Status Pengiriman Saat Ini:
                  </Text>
                  <Text className="text-emerald-800 font-extrabold text-xs">
                    {activeFulfillBatch.status}
                  </Text>
                </View>

                {/* Aggregate list (packing list of items to package) */}
                <Text className="text-stone-900 font-black text-xs mb-1.5">
                  1. Total Gabungan Produk yang Harus Dikemas Gudang
                </Text>
                <View className="bg-stone-100 border border-stone-200 rounded-xl p-3 mb-4">
                  {batchItemsAggregate.length === 0 ? (
                    <Text className="text-stone-400 text-[10px] italic text-center py-4">
                      Belum ada item pesanan dalam batch ini.
                    </Text>
                  ) : (
                    batchItemsAggregate.map((item, idx) => (
                      <View
                        key={item.product_id || idx}
                        className="flex-row justify-between py-1.5 border-b border-stone-100 last:border-0"
                      >
                        <Text className="text-stone-800 text-xs font-semibold">
                          {item.name}
                        </Text>
                        <Text className="text-emerald-900 font-black text-xs">
                          {item.total_qty} {item.unit || "pcs"}
                        </Text>
                      </View>
                    ))
                  )}
                </View>

                {/* Individual checklist (sorting by citizen) */}
                <Text className="text-stone-900 font-black text-xs mb-1.5">
                  2. Pengelompokan Kantong Belanja Per Rumah Tangga
                </Text>
                <View className="space-y-3 mb-5">
                  {batchOrdersList.length === 0 ? (
                    <Text className="text-stone-400 text-[10px] italic">
                      Tidak ada order terdaftar.
                    </Text>
                  ) : (
                    batchOrdersList.map((order, idx) => {
                      const user = allUsers.find((u) => u.id === order.user_id);
                      return (
                        <View
                          key={order.id || idx}
                          className="bg-stone-50 border border-stone-200 p-3 rounded-xl"
                        >
                          <View className="flex-row justify-between items-center border-b border-stone-150 pb-1.5 mb-1.5">
                            <Text className="text-stone-900 font-black text-xs">
                              Kantong: {user?.name || "Warga"}
                            </Text>
                            <Text className="text-[9px] text-stone-500 font-mono">
                              ID Order: {order.id.substring(0, 8)}
                            </Text>
                          </View>
                          {/* Inside actual app, order items are loaded, here we show total summary */}
                          <View className="flex-row justify-between items-center">
                            <Text className="text-stone-500 text-[10px]">
                              Nilai Belanja:{" "}
                              <Text className="font-bold text-emerald-800">
                                Rp{order.total.toLocaleString("id-ID")}
                              </Text>
                            </Text>
                            <Text className="text-stone-400 text-[9px]">
                              Status: {order.order_status}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>

                {/* Fulfillment Actions */}
                {activeFulfillBatch.status === "SUBMITTED" && (
                  <Pressable
                    onPress={() =>
                      handleUpdateBatchFulfillment(
                        activeFulfillBatch.id,
                        "PROCESSING",
                      )
                    }
                    className="bg-amber-500 border border-amber-600 py-3.5 rounded-xl items-center justify-center active:bg-amber-600 mb-3"
                  >
                    <Text className="text-emerald-950 font-black text-xs">
                      Mulai Kemas Batch (Tandai 'Packing')
                    </Text>
                  </Pressable>
                )}

                {(activeFulfillBatch.status === "PROCESSING" ||
                  activeFulfillBatch.status === "SUBMITTED") && (
                  <Pressable
                    onPress={() =>
                      handleUpdateBatchFulfillment(
                        activeFulfillBatch.id,
                        "DELIVERED_TO_RT",
                      )
                    }
                    className="bg-emerald-700 border border-emerald-800 py-3.5 rounded-xl items-center justify-center active:bg-emerald-950 mb-5"
                  >
                    <Text className="text-white font-black text-xs">
                      Kirim ke Pos RT (Tandai 'Tiba di RT')
                    </Text>
                  </Pressable>
                )}

                {activeFulfillBatch.status === "DELIVERED_TO_RT" && (
                  <View className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl mb-4 items-center">
                    <SymbolView
                      name="paperplane.fill"
                      size={16}
                      tintColor="#2563eb"
                    />
                    <Text className="text-blue-800 text-[10px] font-bold mt-1 text-center">
                      Barang telah dikirim dan tiba di RT Budi. Menunggu RT
                      Agent menyerahkan barang ke masing-masing warga dan
                      menyetorkan kas COD.
                    </Text>
                  </View>
                )}

                {activeFulfillBatch.status === "COMPLETED" && (
                  <View className="bg-stone-150 border border-stone-200 p-3.5 rounded-xl mb-4 items-center">
                    <SymbolView
                      name="checkmark.circle.fill"
                      size={16}
                      tintColor="#777"
                    />
                    <Text className="text-stone-500 text-[10px] text-center mt-1">
                      Fulfillment batch ini selesai. Seluruh barang telah
                      didistribusikan ke warga dan setoran tunai telah
                      diverifikasi lunas.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Self-Pickup details Modal */}
      {activeSelfOrder && (
        <Modal
          visible={!!activeSelfOrder}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setActiveSelfOrder(null)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
              <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
                <View>
                  <Text className="text-emerald-950 font-black text-lg">
                    Detail Pesanan Mandiri
                  </Text>
                  <Text className="text-stone-400 text-[10px]">
                    Pembeli:{" "}
                    {allUsers.find((u) => u.id === activeSelfOrder.user_id)
                      ?.name || "Warga"}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setActiveSelfOrder(null)}
                  className="p-1 rounded-full bg-stone-100"
                >
                  <SymbolView name="xmark" size={16} tintColor="#555" />
                </Pressable>
              </View>

              <ScrollView className="space-y-4">
                <View className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl flex-row justify-between items-center mb-3">
                  <Text className="text-stone-500 text-[10px]">
                    Status Pesanan:
                  </Text>
                  <Text className="text-emerald-800 font-extrabold text-xs">
                    {activeSelfOrder.order_status}
                  </Text>
                </View>

                <Text className="text-stone-900 font-black text-xs mb-1.5">
                  Daftar Barang Belanja
                </Text>
                <View className="bg-stone-100 border border-stone-200 rounded-xl p-3 mb-4">
                  {selfOrderItems.length === 0 ? (
                    <Text className="text-stone-400 text-[10px] italic text-center py-4">
                      Memuat detail barang...
                    </Text>
                  ) : (
                    selfOrderItems.map((item, idx) => (
                      <View
                        key={item.id || idx}
                        className="flex-row justify-between py-1.5 border-b border-stone-100 last:border-0"
                      >
                        <Text className="text-stone-800 text-xs font-semibold">
                          {item.name}
                        </Text>
                        <Text className="text-emerald-900 font-black text-xs">
                          {item.quantity} x Rp
                          {item.price.toLocaleString("id-ID")}
                        </Text>
                      </View>
                    ))
                  )}
                </View>

                {/* Financial Summary */}
                <View className="border-t border-stone-200 pt-3">
                  <View className="flex-row justify-between py-1">
                    <Text className="text-stone-500 text-[10px]">
                      Subtotal Produk
                    </Text>
                    <Text className="text-stone-700 text-xs">
                      Rp{activeSelfOrder.subtotal.toLocaleString("id-ID")}
                    </Text>
                  </View>
                  {activeSelfOrder.discount > 0 && (
                    <View className="flex-row justify-between py-1">
                      <Text className="text-emerald-700 text-[10px]">
                        Potongan Poin
                      </Text>
                      <Text className="text-emerald-700 text-xs">
                        -Rp{activeSelfOrder.discount.toLocaleString("id-ID")}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row justify-between py-2 border-t border-stone-100 mt-1">
                    <Text className="text-stone-900 font-black text-xs">
                      Total Pembayaran
                    </Text>
                    <Text className="text-emerald-950 font-black text-sm">
                      Rp{activeSelfOrder.total.toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="mt-4 gap-2 mb-6">
                  {activeSelfOrder.order_status === "READY_FOR_PICKUP" ? (
                    <Pressable
                      onPress={() => {
                        handleUpdateSelfOrderFulfillment(
                          activeSelfOrder.id,
                          "COMPLETED",
                        );
                        setActiveSelfOrder(null);
                      }}
                      className="bg-emerald-700 border border-emerald-800 py-3.5 rounded-xl items-center justify-center active:bg-emerald-950"
                    >
                      <Text className="text-white font-black text-xs">
                        Serahkan Barang (Selesai Pickup)
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => {
                        handleUpdateSelfOrderFulfillment(
                          activeSelfOrder.id,
                          "READY_FOR_PICKUP",
                        );
                      }}
                      className="bg-blue-600 border border-blue-700 py-3.5 rounded-xl items-center justify-center active:bg-blue-850"
                    >
                      <Text className="text-white font-black text-xs">
                        Tandai Barang Siap Diambil
                      </Text>
                    </Pressable>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
