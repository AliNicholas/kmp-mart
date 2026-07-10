import { useApp } from "@/contexts/AppContext";
import { dbService, DeliveryTask, Order, OrderItem, Product } from "@/utils/db";
import { SymbolView } from "expo-symbols";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";

export default function AdminPortal() {
  const {
    products,
    orders,
    auditLogs,
    updateProductStock,
    createOrUpdateProduct,
    refreshData,
    allUsers,
    driverProfiles,
    deliveryTasks,
    cashCollections,
    createDeliveryTaskFromOrder,
    assignDeliveryTask,
    assignManualProvider,
  } = useApp();

  const [subTab, setSubTab] = useState(0); // 0: Inventory, 1: Fulfillment, 2: Finance, 3: Dispatch

  // Tab 0: Inventory states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Partial<Product> | null>(null);
  
  // Cetak Katalog States
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogPeriod, setCatalogPeriod] = useState("Periode: 10 - 17 Juli 2026");
  const [catalogDeadline, setCatalogDeadline] = useState("Order Terakhir: Kamis, 16 Juli 2026");
  const [selectedCatalogProducts, setSelectedCatalogProducts] = useState<string[]>([]);
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCost, setProdCost] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodUnit, setProdUnit] = useState("pcs");
  const [prodLocal, setProdLocal] = useState(false);

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

  const handleOpenCatalogModal = () => {
    setSelectedCatalogProducts(products.map(p => p.id));
    setIsCatalogModalOpen(true);
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
    } catch {
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

      const logId = `log-self-${orderId}-${status}`;
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

  const handleUpdateHomeDeliveryFulfillment = async (
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

      const logId = `log-delivery-${orderId}-${status}`;
      await dbService.run(
        "INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)",
        [
          logId,
          "Pegawai Koperasi",
          isCompleted ? "DELIVERY_COMPLETE" : "DELIVERY_STATUS_UPDATE",
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
        `Status pesanan berhasil diperbarui menjadi: ${
          status === "COMPLETED"
            ? "Selesai Dikirim"
            : status === "PICKED_UP"
              ? "Dalam Pengiriman"
              : "Sedang Dikemas"
        }`,
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Gagal memperbarui status pengiriman.");
    }
  };

  // Calculate Financial dashboard values
  const completedOrders = React.useMemo(
    () => orders.filter((o) => o.order_status === "COMPLETED"),
    [orders],
  );
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
  }, [completedOrders, products]);

  const grossProfit = gmv - cogsVal;
  const operatingProfit = grossProfit - totalRewardsUsed;
  const activeMembers = allUsers.filter(
    (user) => user.role === "USER" && (user.account_status || "ACTIVE") === "ACTIVE",
  );
  const latestMembers = [...activeMembers]
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
    .slice(0, 4);

  const formatCurrency = (value: number) => `Rp${value.toLocaleString("id-ID")}`;
  const terminalDeliveryStatuses = ["DELIVERED", "FAILED", "RETURNED", "CANCELLED", "REJECTED"];
  const activeDrivers = driverProfiles.filter((driver) => driver.status === "ACTIVE");
  const pendingDispatchTasks = deliveryTasks.filter((task) => task.status === "PENDING_DISPATCH");
  const activeDeliveryTasks = deliveryTasks.filter((task) => !terminalDeliveryStatuses.includes(task.status));
  const deliveredDeliveryTasks = deliveryTasks.filter((task) => task.status === "DELIVERED");
  const driverPayable = deliveredDeliveryTasks.reduce((sum, task) => sum + task.driver_incentive, 0);
  const codOutstanding = cashCollections
    .filter((cash) => cash.status !== "SETTLED")
    .reduce((sum, cash) => sum + (cash.collected_amount > 0 ? cash.collected_amount : cash.expected_amount), 0);
  const readyHomeOrdersWithoutTask = orders.filter(
    (order) =>
      order.fulfillment === "DELIVERY_TO_HOME" &&
      !["COMPLETED", "CANCELLED"].includes(order.order_status) &&
      !deliveryTasks.some((task) => task.order_id === order.id),
  );

  const deliveryStatusLabels: Record<string, string> = {
    PENDING_DISPATCH: "Menunggu Dispatch",
    ASSIGNED: "Ditugaskan",
    ACCEPTED: "Diterima",
    REJECTED: "Ditolak",
    PREPARING_PICKUP: "Disiapkan",
    READY_FOR_PICKUP: "Siap Pickup",
    PICKED_UP: "Sudah Pickup",
    IN_TRANSIT: "Dalam Perjalanan",
    ARRIVED_AT_RT: "Tiba di RT",
    ARRIVED_AT_USER: "Tiba di Warga",
    DELIVERED: "Selesai",
    FAILED: "Gagal",
    RETURNED: "Dikembalikan",
    CANCELLED: "Dibatalkan",
  };

  const getDeliveryStatusClass = (status: string) => {
    if (status === "DELIVERED") return "bg-emerald-100 border-emerald-200";
    if (status === "FAILED" || status === "REJECTED") return "bg-rose-100 border-rose-200";
    if (status === "PENDING_DISPATCH") return "bg-amber-100 border-amber-200";
    if (status === "IN_TRANSIT" || status === "PICKED_UP") return "bg-blue-100 border-blue-200";
    return "bg-stone-100 border-stone-200";
  };

  const getTaskAssignee = (task: DeliveryTask) => {
    if (task.provider_type === "MANUAL") {
      return task.manual_provider_name || "Kurir Manual";
    }

    const driver = driverProfiles.find((item) => item.id === task.driver_id);
    return driver?.name || "Belum ada KopKurir";
  };

  const runDispatchAction = async (
    successMessage: string,
    action: () => Promise<{ success: boolean; error?: string }>,
  ) => {
    const result = await action();
    if (!result.success) {
      Alert.alert("Gagal", result.error || "Aksi dispatch gagal.");
      return;
    }
    Alert.alert("Sukses", successMessage);
  };

  const handleCreateDeliveryTask = async (orderId: string) => {
    const result = await createDeliveryTaskFromOrder(orderId);
    if (!result.success) {
      Alert.alert("Gagal", result.error || "Gagal membuat tugas pengiriman.");
      return;
    }
    Alert.alert("Sukses", "Tugas KopKurir dibuat dan masuk antrean dispatch.");
  };

  const handleAssignManualProvider = (task: DeliveryTask) => {
    const trackingNumber = `MAN-${task.id.slice(-6).toUpperCase()}`;
    return runDispatchAction(
      "Tugas dialihkan ke kurir manual.",
      () => assignManualProvider(task.id, "Kurir Manual Desa", trackingNumber, "0811-8899-LOG", task.delivery_fee || 12000),
    );
  };

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
        <View className="flex-row gap-2">
          <Pressable
            onPress={handleOpenCatalogModal}
            className="bg-stone-900 px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 active:bg-stone-950 border border-stone-850"
          >
            <SymbolView name="printer.fill" size={12} tintColor="#fff" />
            <Text className="text-white text-xs font-bold">Cetak Katalog</Text>
          </Pressable>
          <Pressable
            onPress={() => handleOpenProductModal()}
            className="bg-emerald-700 px-4 py-2 rounded-xl flex-row items-center gap-1.5 active:bg-emerald-950"
          >
            <SymbolView name="plus" size={12} tintColor="#fff" />
            <Text className="text-white text-xs font-bold">Produk Baru</Text>
          </Pressable>
        </View>
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

  // Render Fulfillment / Process Orders
  const renderFulfillment = () => {
    const selfPickupOrders = orders.filter(
      (o) =>
        o.fulfillment === "PICKUP_AT_COOP" &&
        o.order_status !== "COMPLETED" &&
        o.order_status !== "CANCELLED",
    );

    const homeDeliveryOrders = orders.filter(
      (o) =>
        o.fulfillment === "DELIVERY_TO_HOME" &&
        o.order_status !== "COMPLETED" &&
        o.order_status !== "CANCELLED",
    );

    return (
      <ScrollView
        className="flex-1 bg-stone-50"
        contentContainerClassName="p-4 pb-28"
      >
        {/* Antrean Kirim ke Rumah */}
        <Text className="text-stone-900 font-black text-lg mb-3">
          Antrean Kirim ke Rumah (Home Delivery)
        </Text>
        {homeDeliveryOrders.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-stone-200 items-center justify-center mb-5">
            <SymbolView name="shippingbox.fill" size={32} tintColor="#10b981" />
            <Text className="text-stone-500 text-xs mt-2 text-center">
              Tidak ada antrean kirim ke rumah saat ini.
            </Text>
          </View>
        ) : (
          homeDeliveryOrders.map((o) => {
            const user = allUsers.find((u) => u.id === o.user_id);
            return (
              <Pressable
                key={o.id}
                onPress={() => handleOpenSelfOrderDetails(o)}
                className="bg-white p-4 rounded-xl border border-stone-200 mb-3 shadow-sm active:bg-stone-100 flex-row justify-between items-center"
              >
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-stone-955 font-bold text-sm">
                      {user?.name || "Warga"}
                    </Text>
                    <View className="bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                      <Text className="text-blue-800 text-[8px] font-bold">
                        KIRIM
                      </Text>
                    </View>
                  </View>
                  <Text className="text-stone-400 text-[10px] mt-0.5">
                    ID: {o.id.substring(0, 12)}... • Telp: {user?.phone || "—"}
                  </Text>
                  <Text className="text-stone-500 text-[10px] mt-1.5 font-bold">
                    Total: Rp{o.total.toLocaleString("id-ID")} •{" "}
                    {o.payment_status === "PAID" ? "💳 Lunas" : "💵 Bayar COD"}
                  </Text>
                </View>

                <View className="items-end gap-2">
                  <Badge
                    variant="outline"
                    className={
                      o.order_status === "PICKED_UP"
                        ? "bg-amber-100 border-amber-200"
                        : o.order_status === "PACKED"
                          ? "bg-emerald-100 border-emerald-250"
                          : "bg-blue-50 border-blue-200"
                    }
                  >
                    <Text className="text-stone-700 text-[8px] font-bold">
                      {o.order_status === "PICKED_UP"
                        ? "DI JALAN"
                        : o.order_status === "PACKED"
                          ? "SIAP KIRIM"
                          : o.order_status}
                    </Text>
                  </Badge>

                  {o.order_status === "PENDING_PAYMENT" || o.order_status === "PAID" || o.order_status === "CONFIRMED" ? (
                    <Button
                      onPress={() =>
                        handleUpdateHomeDeliveryFulfillment(o.id, "PACKED")
                      }
                      className="bg-emerald-700 active:bg-emerald-950 px-3 h-8"
                    >
                      <Text className="text-white text-[9px] font-bold">
                        Kemas Barang
                      </Text>
                    </Button>
                  ) : o.order_status === "PACKED" ? (
                    <Button
                      onPress={() =>
                        handleUpdateHomeDeliveryFulfillment(o.id, "PICKED_UP")
                      }
                      className="bg-blue-600 active:bg-blue-800 px-3 h-8"
                    >
                      <Text className="text-white text-[9px] font-bold">
                        Kirim Pesanan
                      </Text>
                    </Button>
                  ) : (
                    <Button
                      onPress={() =>
                        handleUpdateHomeDeliveryFulfillment(o.id, "COMPLETED")
                      }
                      className="bg-emerald-700 active:bg-emerald-950 px-3 h-8"
                    >
                      <Text className="text-white text-[9px] font-bold">
                        Tandai Selesai
                      </Text>
                    </Button>
                  )}
                </View>
              </Pressable>
            );
          })
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
                    <Text className="text-stone-955 font-bold text-sm">
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
                  <Badge
                    variant="outline"
                    className={
                      o.order_status === "READY_FOR_PICKUP"
                        ? "bg-amber-100 border-amber-200"
                        : "bg-blue-50 border-blue-200"
                    }
                  >
                    <Text className="text-stone-700 text-[8px] font-bold">
                      {o.order_status === "READY_FOR_PICKUP"
                        ? "SIAP DIAMBIL"
                        : o.order_status}
                    </Text>
                  </Badge>

                  {o.order_status === "READY_FOR_PICKUP" ? (
                    <Button
                      onPress={() =>
                        handleUpdateSelfOrderFulfillment(o.id, "COMPLETED")
                      }
                      className="bg-emerald-700 px-3 h-8 active:bg-emerald-950"
                    >
                      <Text className="text-white text-[9px] font-bold">
                        Serahkan Barang
                      </Text>
                    </Button>
                  ) : (
                    <Button
                      onPress={() =>
                        handleUpdateSelfOrderFulfillment(
                          o.id,
                          "READY_FOR_PICKUP",
                        )
                      }
                      className="bg-blue-600 px-3 h-8 active:bg-blue-800"
                    >
                      <Text className="text-white text-[9px] font-bold">
                        Tandai Siap
                      </Text>
                    </Button>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    );
  };

  // Render Finance Dashboard and Immutable Audit logs
  const renderFinanceAudit = () => {
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

        <Text className="text-stone-900 font-black text-xs mb-2.5">
          Anggota Terdaftar & Kartu Kopdes
        </Text>
        <View className="bg-white p-4 border border-stone-200 rounded-xl mb-5 shadow-sm">
          <View className="flex-row justify-between items-center pb-3 border-b border-stone-100 mb-2">
            <View>
              <Text className="text-stone-500 text-[9px] font-bold uppercase tracking-wider">
                Anggota aktif
              </Text>
              <Text className="text-emerald-950 font-black text-xl">
                {activeMembers.length}
              </Text>
            </View>
            <View className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <Text className="text-emerald-800 text-[9px] font-black">
                NIK tersamarkan
              </Text>
            </View>
          </View>

          {latestMembers.map((member) => (
            <View key={member.id} className="flex-row justify-between items-center py-2 border-b border-stone-100 last:border-0">
              <View className="flex-1 pr-2">
                <Text className="text-stone-900 font-bold text-xs" numberOfLines={1}>
                  {member.name}
                </Text>
                <Text className="text-stone-500 text-[9px]">
                  {member.member_id || member.referral_code} • {member.rt_id || "Tanpa RT"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-emerald-700 text-[9px] font-black">
                  {member.account_status || "ACTIVE"}
                </Text>
                <Text className="text-stone-400 text-[8px]">
                  {member.nik_masked || "NIK masked"}
                </Text>
              </View>
            </View>
          ))}
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

          <View className="flex-row justify-between py-1.5 border-t border-stone-200 mt-1 bg-emerald-900 text-white px-2 rounded">
            <Text className="text-white text-xs font-black">
              Proyeksi SHU / Surplus Operasional
            </Text>
            <Text className="text-amber-400 font-black text-xs">
              Rp{operatingProfit.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>



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

  const renderDispatch = () => (
    <ScrollView
      className="flex-1 bg-stone-50"
      contentContainerClassName="p-4 pb-28"
    >
      <View className="bg-emerald-950 rounded-2xl p-4 mb-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-amber-300 text-[10px] font-black uppercase tracking-wider">
              KopKurir Dispatch Center
            </Text>
            <Text className="text-white font-black text-lg mt-1">
              Kendali pengiriman desa
            </Text>
            <Text className="text-emerald-100 text-[10px] mt-1 leading-4">
              Assign manual KopKurir, pantau status pickup, bukti antar, dan COD dari satu antrean.
            </Text>
          </View>
          <SymbolView name="shippingbox.fill" size={34} tintColor="#fbbf24" />
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between mb-4">
        <View className="w-[48%] bg-white p-3.5 border border-stone-200 rounded-xl shadow-sm mb-3">
          <Text className="text-stone-400 text-[9px] font-bold uppercase tracking-wider">
            Menunggu Dispatch
          </Text>
          <Text className="text-amber-700 font-black text-xl mt-1">
            {pendingDispatchTasks.length}
          </Text>
        </View>
        <View className="w-[48%] bg-white p-3.5 border border-stone-200 rounded-xl shadow-sm mb-3">
          <Text className="text-stone-400 text-[9px] font-bold uppercase tracking-wider">
            Tugas Aktif
          </Text>
          <Text className="text-blue-700 font-black text-xl mt-1">
            {activeDeliveryTasks.length}
          </Text>
        </View>
        <View className="w-[48%] bg-white p-3.5 border border-stone-200 rounded-xl shadow-sm mb-3">
          <Text className="text-stone-400 text-[9px] font-bold uppercase tracking-wider">
            COD Belum Setor
          </Text>
          <Text className="text-rose-700 font-black text-base mt-1">
            {formatCurrency(codOutstanding)}
          </Text>
        </View>
        <View className="w-[48%] bg-white p-3.5 border border-stone-200 rounded-xl shadow-sm mb-3">
          <Text className="text-stone-400 text-[9px] font-bold uppercase tracking-wider">
            Insentif Driver
          </Text>
          <Text className="text-emerald-700 font-black text-base mt-1">
            {formatCurrency(driverPayable)}
          </Text>
        </View>
      </View>

      {readyHomeOrdersWithoutTask.length > 0 && (
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <Text className="text-amber-900 text-xs font-black mb-2">
            Order kirim rumah belum punya tugas KopKurir
          </Text>
          {readyHomeOrdersWithoutTask.map((order) => {
            const buyer = allUsers.find((user) => user.id === order.user_id);
            return (
              <View key={order.id} className="bg-white border border-amber-100 rounded-xl p-3 mb-2">
                <View className="flex-row justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-stone-900 text-xs font-black" numberOfLines={1}>
                      {buyer?.name || "Warga"} • {formatCurrency(order.total)}
                    </Text>
                    <Text className="text-stone-500 text-[9px] mt-0.5">
                      {buyer?.address || buyer?.rt_id || "Alamat warga"} • {order.payment_status === "UNPAID" ? "COD" : "Lunas"}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleCreateDeliveryTask(order.id)}
                    className="bg-amber-400 border border-amber-500 rounded-lg px-3 py-2 active:bg-amber-500"
                  >
                    <Text className="text-emerald-950 text-[9px] font-black">
                      Buat Task
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-stone-900 font-black text-lg">
          Antrean Pengiriman
        </Text>
        <View className="bg-white border border-stone-200 rounded-full px-3 py-1">
          <Text className="text-stone-500 text-[9px] font-bold">
            {activeDrivers.length} KopKurir aktif
          </Text>
        </View>
      </View>

      {deliveryTasks.length === 0 ? (
        <View className="bg-white p-8 rounded-xl border border-stone-200 items-center">
          <SymbolView name="tray" size={32} tintColor="#a8a29e" />
          <Text className="text-stone-500 text-xs mt-2 text-center">
            Belum ada tugas pengiriman.
          </Text>
        </View>
      ) : (
        deliveryTasks.map((task) => {
          const relatedOrder = task.order_id ? orders.find((order) => order.id === task.order_id) : null;
          const buyer = relatedOrder ? allUsers.find((user) => user.id === relatedOrder.user_id) : null;
          const cash = cashCollections.find((item) => item.delivery_task_id === task.id);
          const canAssign = ["PENDING_DISPATCH", "REJECTED", "FAILED"].includes(task.status);

          return (
            <View key={task.id} className="bg-white border border-stone-200 rounded-2xl p-4 mb-3 shadow-sm">
              <View className="flex-row justify-between gap-3">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Text className="text-stone-900 font-black text-sm">
                      {task.delivery_type === "RT_BATCH_DELIVERY" ? "RT Batch Delivery" : "Home Delivery"}
                    </Text>
                    <Badge variant="outline" className={getDeliveryStatusClass(task.status)}>
                      <Text className="text-stone-700 text-[8px] font-black">
                        {deliveryStatusLabels[task.status] || task.status}
                      </Text>
                    </Badge>
                  </View>
                  <Text className="text-stone-500 text-[10px] mt-1">
                    {task.recipient_name} • {task.recipient_phone || buyer?.phone || "Kontak RT"}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-stone-400 text-[9px]">Fee / Insentif</Text>
                  <Text className="text-emerald-800 font-black text-xs">
                    {formatCurrency(task.delivery_fee)} / {formatCurrency(task.driver_incentive)}
                  </Text>
                </View>
              </View>

              <View className="mt-3 bg-stone-50 border border-stone-100 rounded-xl p-3 gap-1">
                <Text className="text-stone-400 text-[9px] font-bold uppercase">
                  Tujuan
                </Text>
                <Text className="text-stone-800 text-xs font-semibold">
                  {task.destination_address}
                </Text>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-stone-500 text-[10px]">Penanggung jawab</Text>
                  <Text className="text-stone-900 text-[10px] font-black">
                    {getTaskAssignee(task)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-stone-500 text-[10px]">Pickup / Paket</Text>
                  <Text className="text-stone-900 text-[10px] font-black">
                    {task.pickup_code} • {task.package_count} paket
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-stone-500 text-[10px]">COD</Text>
                  <Text className="text-stone-900 text-[10px] font-black">
                    {task.cod_amount > 0 ? formatCurrency(task.cod_amount) : "Non-COD"}
                    {cash ? ` • ${cash.status}` : ""}
                  </Text>
                </View>
                {task.tracking_number && (
                  <View className="flex-row justify-between">
                    <Text className="text-stone-500 text-[10px]">AWB Manual</Text>
                    <Text className="text-stone-900 text-[10px] font-black">
                      {task.tracking_number}
                    </Text>
                  </View>
                )}
              </View>

              {canAssign && (
                <View className="mt-3">
                  <Text className="text-stone-500 text-[9px] font-black uppercase mb-2">
                    Assign KopKurir
                  </Text>
                  {activeDrivers.length === 0 ? (
                    <Text className="text-rose-600 text-xs font-bold">
                      Belum ada driver aktif.
                    </Text>
                  ) : (
                    <View className="flex-row flex-wrap gap-2">
                      {activeDrivers.map((driver) => (
                        <Pressable
                          key={driver.id}
                          onPress={() =>
                            runDispatchAction(
                              `${driver.name} menerima penugasan dispatch.`,
                              () => assignDeliveryTask(task.id, driver.id),
                            )
                          }
                          className="bg-emerald-700 border border-emerald-800 rounded-xl px-3 py-2 active:bg-emerald-950"
                        >
                          <Text className="text-white text-[10px] font-black">
                            {driver.name}
                          </Text>
                        </Pressable>
                      ))}
                      <Pressable
                        onPress={() => handleAssignManualProvider(task)}
                        className="bg-white border border-stone-300 rounded-xl px-3 py-2 active:bg-stone-100"
                      >
                        <Text className="text-stone-700 text-[10px] font-black">
                          Kurir Manual
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-stone-100">
      {/* Sub tabs render */}
      {subTab === 0 && renderInventory()}
      {subTab === 1 && renderFulfillment()}
      {subTab === 2 && renderFinanceAudit()}
      {subTab === 3 && renderDispatch()}

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

        <Pressable
          onPress={() => setSubTab(3)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView
            name="shippingbox.fill"
            size={18}
            tintColor={subTab === 3 ? "#0f5132" : "#888"}
          />
          <Text
            className={`text-[10px] mt-1 font-bold ${subTab === 3 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
          >
            Dispatch
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

      {/* Catalog Print Preview Modal */}
      {isCatalogModalOpen && (
        <Modal
          visible={isCatalogModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsCatalogModalOpen(false)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-white rounded-t-3xl p-5 max-h-[90%] flex-column">
              <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
                <View className="flex-row items-center gap-2">
                  <SymbolView name="printer.fill" size={16} tintColor="#0f5132" />
                  <Text className="text-emerald-950 font-black text-lg">
                    Cetak Katalog Kertas (PRD 06)
                  </Text>
                </View>
                <Pressable
                  onPress={() => setIsCatalogModalOpen(false)}
                  className="p-1 rounded-full bg-stone-100"
                >
                  <SymbolView name="xmark" size={16} tintColor="#555" />
                </Pressable>
              </View>

              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Inputs for period and deadline */}
                <View className="bg-stone-50 p-3.5 rounded-xl border border-stone-250 mb-4 gap-3">
                  <View>
                    <Text className="text-stone-700 text-[10px] font-bold uppercase mb-1">Masa Berlaku Katalog:</Text>
                    <TextInput
                      value={catalogPeriod}
                      onChangeText={setCatalogPeriod}
                      className="bg-white border border-stone-200 rounded-lg p-2 text-xs"
                      placeholder="cth: Periode 10 - 17 Juli 2026"
                    />
                  </View>
                  <View>
                    <Text className="text-stone-700 text-[10px] font-bold uppercase mb-1">Batas Pengumpulan Formulir:</Text>
                    <TextInput
                      value={catalogDeadline}
                      onChangeText={setCatalogDeadline}
                      className="bg-white border border-stone-200 rounded-lg p-2 text-xs"
                      placeholder="cth: Order Terakhir: Kamis, 16 Juli 2026"
                    />
                  </View>
                </View>

                {/* Printable Flyer Preview */}
                <Text className="text-stone-900 font-black text-xs mb-2">Preview Lembar Cetak Katalog Kertas:</Text>
                
                {/* Visual Flyer Sheet mockup */}
                <View className="bg-white border-2 border-stone-850 p-4 rounded-xl mb-4 shadow-sm">
                  {/* Header flyer */}
                  <View className="items-center border-b-2 border-stone-900 pb-2 mb-3">
                    <Text className="text-stone-950 font-black text-base tracking-wider">KMP KATALOG BELANJA RT</Text>
                    <Text className="text-stone-700 font-bold text-[9px] mt-0.5">{catalogPeriod}</Text>
                    <Text className="text-rose-700 font-black text-[9px] mt-0.5 uppercase">{catalogDeadline}</Text>
                  </View>

                  <Text className="text-[8px] text-stone-600 mb-2 leading-tight italic">
                    *Tulis Nama, NIK, dan Kode Produk beserta Jumlah di formulir pesanan. Serahkan ke Dropbox RT Agent terdekat.
                  </Text>

                  {/* Products table preview */}
                  <View className="border border-stone-900 rounded overflow-hidden">
                    <View className="bg-stone-100 flex-row border-b border-stone-900 py-1.5 px-2">
                      <Text className="text-[8px] font-bold text-stone-800 w-[25%]">KODE</Text>
                      <Text className="text-[8px] font-bold text-stone-800 w-[45%]">NAMA PRODUK</Text>
                      <Text className="text-[8px] font-bold text-stone-800 w-[15%]">SATUAN</Text>
                      <Text className="text-[8px] font-bold text-stone-800 w-[15%] text-right">HARGA</Text>
                    </View>

                    {products
                      .filter(p => !p.name.includes("Grosir") && selectedCatalogProducts.includes(p.id))
                      .map((p, idx) => {
                        // Generate product shortcode based on ID/name
                        let code = "P-";
                        if (p.id.includes("beras")) code += "BERAS";
                        else if (p.id.includes("telur")) code += "TELUR";
                        else if (p.id.includes("minyak")) code += "MINYAK";
                        else if (p.id.includes("gula")) code += "GULA";
                        else if (p.id.includes("paket")) code += "PAKET";
                        else if (p.id.includes("pisang")) code += "PISANG";
                        else if (p.id.includes("sambal")) code += "SAMBAL";
                        else if (p.id.includes("kangkung")) code += "KANGKUNG";
                        else if (p.id.includes("gas")) code += "GAS";
                        else if (p.id.includes("sabun")) code += "SABUN";
                        else code += String(idx + 1);

                        return (
                          <View key={p.id} className="flex-row border-b border-stone-200 py-1 px-2 last:border-b-0">
                            <Text className="text-[8px] font-bold text-emerald-900 w-[25%] font-mono">{code}</Text>
                            <Text className="text-[8px] text-stone-850 w-[45%] font-bold" numberOfLines={1}>{p.name}</Text>
                            <Text className="text-[8px] text-stone-600 w-[15%]">{p.unit}</Text>
                            <Text className="text-[8px] text-stone-900 w-[15%] text-right font-black">Rp{p.price.toLocaleString("id-ID")}</Text>
                          </View>
                        );
                      })}
                  </View>

                  {/* QR Code and footer */}
                  <View className="flex-row justify-between items-center mt-4 border-t border-stone-300 pt-3">
                    <View className="flex-1 pr-4">
                      <Text className="text-[8px] font-bold text-stone-950">Info Hubungi RT Agent Budi:</Text>
                      <Text className="text-[7px] text-stone-500 mt-0.5">WhatsApp: 0812-3456-7890</Text>
                    </View>
                    {/* Mock QR Card */}
                    <View className="border border-stone-400 p-1 bg-stone-50 rounded">
                      <SymbolView name="qrcode" size={24} tintColor="#555" />
                    </View>
                  </View>
                </View>

                {/* Print button */}
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Katalog Siap Cetak",
                      "Dokumen PDF katalog belanja telah diexport dan dikirim ke printer thermal/kantor Koperasi.",
                      [{ text: "OK", onPress: () => setIsCatalogModalOpen(false) }]
                    );
                  }}
                  className="bg-emerald-700 border border-emerald-800 py-3 rounded-xl items-center justify-center active:bg-emerald-950 mb-6 flex-row gap-2"
                >
                  <SymbolView name="printer.fill" size={14} tintColor="#fff" />
                  <Text className="text-white font-black text-xs">
                    Kirim ke Printer / Download PDF
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
