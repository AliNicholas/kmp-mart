import { useApp } from "@/contexts/AppContext";
import { formatWibDateTime, getOrderStatusLabel } from "@/lib/utils";
import {
  dbService,
  DeliveryTask,
  Order,
  OrderItem,
  OrderStatusHistory,
  Product,
  User,
} from "@/utils/db";
import { SymbolView } from "@/components/app-symbol";
import { OrderStatusHistoryCards } from "@/components/order-status-history-cards";
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
    activeRole,
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
    completeOrder,
    updateOrderStatus,
    suppliers,
    supplierProducts,
    purchaseOrders,
    kopRequests,
    submitRFQ,
    receiveGoods,
    createKopRequest,
    resolveKopRequest,
    addToCart,
    cart,
    clearCart,
    checkout,
  } = useApp();

  const [subTab, setSubTab] = useState(() => {
    return activeRole === "ADMIN" ? 2 : 0;
  });
  const [prevRole, setPrevRole] = useState(activeRole);

  if (activeRole !== prevRole) {
    setPrevRole(activeRole);
    setSubTab(activeRole === "ADMIN" ? 2 : 0);
  }

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

  const [activeSelfOrder, setActiveSelfOrder] = useState<Order | null>(null);
  const [selfOrderItems, setSelfOrderItems] = useState<OrderItem[]>([]);
  const [selfOrderStatusHistory, setSelfOrderStatusHistory] = useState<
    OrderStatusHistory[]
  >([]);

  // Tab 4 (Procurement) states
  const [selectedRfqProduct, setSelectedRfqProduct] = useState("Beras Premium 5kg");
  const [rfqQty, setRfqQty] = useState("50");

  // Tab 5 (Layanan Warga) states
  const [searchMemberQuery, setSearchMemberQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState("0");
  const [newRequestProductName, setNewRequestProductName] = useState("");
  const [newRequestQty, setNewRequestQty] = useState("1");

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
    setSelfOrderStatusHistory([]);
    try {
      const [items, history] = await Promise.all([
        dbService.getAll<OrderItem>(
          "SELECT * FROM order_items WHERE order_id = ?",
          [order.id],
        ),
        dbService.getAll<OrderStatusHistory>(
          "SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC",
          [order.id],
        ),
      ]);
      setSelfOrderItems(items);
      setSelfOrderStatusHistory(history);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (!activeSelfOrder?.id) return;

    let isCurrent = true;
    dbService
      .getAll<OrderStatusHistory>(
        "SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC",
        [activeSelfOrder.id],
      )
      .then((history) => {
        if (isCurrent) setSelfOrderStatusHistory(history);
      })
      .catch((error) => console.error("Failed to load order status history:", error));

    return () => {
      isCurrent = false;
    };
  }, [activeSelfOrder?.id, activeSelfOrder?.order_status]);

  const handleUpdateSelfOrderFulfillment = async (
    orderId: string,
    status: string,
  ) => {
    try {
      const isCompleted = status === "COMPLETED";
      if (isCompleted) {
        await completeOrder(orderId);
      } else {
        await updateOrderStatus(orderId, status as Order["order_status"]);
      }

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
      if (isCompleted) {
        await completeOrder(orderId);
      } else {
        await updateOrderStatus(orderId, status as Order["order_status"]);
      }

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
    ARRIVED_AT_RT: "Tiba di Dropoff",
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

    const completedOrders = orders.filter(
      (o) => o.order_status === "COMPLETED"
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
                        Mulai Kemas
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
                        Serahkan ke Kurir
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
                        Pesanan Diterima
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
                        Sudah Diambil
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
                        Siap Diambil
                      </Text>
                    </Button>
                  )}
                </View>
              </Pressable>
            );
          })
        )}

        {/* Riwayat Transaksi Selesai */}
        <Text className="text-stone-900 font-black text-lg mt-6 mb-3">
          Riwayat Transaksi Selesai (Selesai Pickup & Delivery)
        </Text>
        {completedOrders.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-stone-200 items-center justify-center mb-5">
            <SymbolView
              name="clock.fill"
              size={32}
              tintColor="#a8a29e"
            />
            <Text className="text-stone-500 text-xs mt-2 text-center">
              Belum ada riwayat transaksi selesai.
            </Text>
          </View>
        ) : (
          completedOrders.map((o) => {
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
                    <View className={`px-2 py-0.5 rounded border ${o.fulfillment === "DELIVERY_TO_HOME" ? "bg-blue-100 border-blue-200" : "bg-emerald-100 border-emerald-200"}`}>
                      <Text className={`${o.fulfillment === "DELIVERY_TO_HOME" ? "text-blue-800" : "text-emerald-800"} text-[8px] font-bold`}>
                        {o.fulfillment === "DELIVERY_TO_HOME" ? "KIRIM" : "MANDIRI"}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-stone-400 text-[10px] mt-0.5">
                    ID: {o.id.substring(0, 12)}... • Telp: {user?.phone || "—"}
                  </Text>
                  <Text className="text-stone-500 text-[10px] mt-1.5 font-bold">
                    Total: Rp{o.total.toLocaleString("id-ID")} • 💳 Lunas
                  </Text>
                </View>

                <View className="items-end gap-1">
                  <View className="bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex-row items-center gap-1">
                    <SymbolView name="checkmark.circle.fill" size={10} tintColor="#047857" />
                    <Text className="text-emerald-700 text-[8px] font-bold">SELESAI</Text>
                  </View>
                  <Text className="text-stone-400 text-[8px] mt-1">
                    {new Date(o.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                  </Text>
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
              Telah dipotong pemakaian poin
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
                  {member.member_id || member.referral_code} • {member.address || "Sukamaju"}
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
                <Text className="text-emerald-400 font-black text-[9px] mt-0.5">
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
                      {task.delivery_type === "RT_BATCH_DELIVERY" ? "Batch Delivery" : "Home Delivery"}
                    </Text>
                    <Badge variant="outline" className={getDeliveryStatusClass(task.status)}>
                      <Text className="text-stone-700 text-[8px] font-black">
                        {deliveryStatusLabels[task.status] || task.status}
                      </Text>
                    </Badge>
                  </View>
                  <Text className="text-stone-500 text-[10px] mt-1">
                    {task.recipient_name} • {task.recipient_phone || buyer?.phone || "Kontak"}
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

  const renderProcurement = () => {
    const rfqProducts = Array.from(
      new Set(supplierProducts.map((sp) => sp.name))
    );
    const activeRfqProduct = rfqProducts.includes(selectedRfqProduct)
      ? selectedRfqProduct
      : rfqProducts[0] || "";

    const matchingQuotes = supplierProducts.filter(
      (sp) => sp.name.toLowerCase() === activeRfqProduct.toLowerCase()
    );

    const qty = parseInt(rfqQty) || 1;

    const quotesWithLandedCost = matchingQuotes.map((q) => {
      const supplier = suppliers.find((s) => s.id === q.supplier_id);
      const isLocal = supplier?.type === "Producer" || supplier?.type === "UMKM";
      const shipping = isLocal ? 10000 : 20000;
      const subtotal = q.price * qty;
      const landedCost = subtotal + shipping;
      return { ...q, supplier, shipping, subtotal, landedCost };
    });

    let bestQuoteId = "";
    if (quotesWithLandedCost.length > 0) {
      const sorted = [...quotesWithLandedCost].sort((a, b) => a.landedCost - b.landedCost);
      bestQuoteId = sorted[0].id;
    }

    return (
      <ScrollView className="flex-1 px-4 pt-3 mb-16">
        <View className="flex-row items-center gap-2 mb-4 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
          <SymbolView name="cart.fill" size={16} tintColor="#0f5132" />
          <Text className="text-emerald-800 text-[11px] font-black uppercase tracking-wider">
            Pengadaan & Rantai Pasok (PRD 13)
          </Text>
        </View>

        <View className="bg-white border border-stone-200 rounded-3xl p-4 mb-4 shadow-sm">
          <Text className="text-stone-900 font-extrabold text-xs mb-3">Buat RFQ Baru (Sourcing)</Text>
          
          <Text className="text-stone-500 text-[9px] font-bold uppercase mb-1">Pilih Produk Kebutuhan:</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {rfqProducts.map((p) => (
              <Pressable
                key={p}
                onPress={() => setSelectedRfqProduct(p)}
                className={`px-3 py-2 rounded-xl border items-center min-w-[100px] ${
                  activeRfqProduct === p
                    ? "bg-emerald-50 border-emerald-600"
                    : "bg-stone-50 border-stone-200"
                }`}
              >
                <Text
                  className={`text-[10px] font-black ${
                    activeRfqProduct === p ? "text-emerald-800" : "text-stone-600"
                  }`}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mb-4">
            <Text className="text-stone-500 text-[9px] font-bold uppercase mb-1">Jumlah Kebutuhan (Quantity):</Text>
            <TextInput
              value={rfqQty}
              onChangeText={setRfqQty}
              keyboardType="numeric"
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-950 font-bold"
              placeholder="Masukkan jumlah..."
            />
          </View>

          <Text className="text-stone-900 font-extrabold text-xs mb-2">Perbandingan Penawaran Supplier</Text>
          
          {quotesWithLandedCost.length === 0 ? (
            <Text className="text-stone-400 text-[10px] italic py-2">Tidak ada penawaran untuk produk ini.</Text>
          ) : (
            quotesWithLandedCost.map((q) => {
              const isBest = q.id === bestQuoteId;
              const isLocal = q.supplier?.type === "Producer" || q.supplier?.type === "UMKM";
              
              return (
                <View
                  key={q.id}
                  className={`p-3 rounded-2xl border mb-3 ${
                    isBest ? "bg-emerald-50/50 border-emerald-600" : "bg-stone-50 border-stone-200"
                  }`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-stone-950 font-extrabold text-xs">{q.supplier?.name}</Text>
                      <Text className="text-stone-400 text-[9px] font-bold">
                        Tipe: {q.supplier?.type} • Lead Time: {q.lead_time} {isLocal && "• (Lokal)"}
                      </Text>
                    </View>
                    {isBest && (
                      <View className="bg-emerald-700 px-2 py-0.5 rounded-full">
                        <Text className="text-white text-[8px] font-black">Rekomendasi</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row justify-between border-t border-b border-stone-100 py-2 mb-2">
                    <View>
                      <Text className="text-stone-400 text-[8px] uppercase font-bold">Harga Unit</Text>
                      <Text className="text-stone-950 font-black text-xs">Rp{q.price.toLocaleString("id-ID")}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-stone-400 text-[8px] uppercase font-bold">MOQ</Text>
                      <Text className="text-stone-950 font-black text-xs">{q.moq} {q.unit}</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-stone-400 text-[8px] uppercase font-bold">Total Landed Cost</Text>
                      <Text className="text-emerald-800 font-extrabold text-xs">
                        Rp{q.landedCost.toLocaleString("id-ID")}{" "}
                        <Text className="text-stone-400 text-[9px] font-normal">(Ongkir Rp{q.shipping.toLocaleString("id-ID")})</Text>
                      </Text>
                    </View>

                    <Pressable
                      onPress={async () => {
                        if (qty < q.moq) {
                          Alert.alert("Error", `Jumlah order minimal untuk supplier ini adalah ${q.moq}`);
                          return;
                        }
                        await submitRFQ(q.supplier_id, q.name, q.price, qty, q.landedCost);
                        Alert.alert("Success", "PO telah sukses diterbitkan dan dikirim ke supplier!");
                      }}
                      className="bg-emerald-700 active:bg-emerald-900 px-3 py-2 rounded-xl"
                    >
                      <Text className="text-white text-[9px] font-black">Terbitkan PO</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View className="bg-white border border-stone-200 rounded-3xl p-4 mb-8 shadow-sm">
          <Text className="text-stone-900 font-extrabold text-xs mb-3">Daftar PO & Penerimaan Barang</Text>
          
          {purchaseOrders.length === 0 ? (
            <Text className="text-stone-400 text-[10px] italic py-3 text-center">Belum ada Purchase Order (PO) yang diterbitkan.</Text>
          ) : (
            purchaseOrders.map((po) => {
              const supplier = suppliers.find((s) => s.id === po.supplier_id);
              
              return (
                <View key={po.id} className="p-3 rounded-2xl border border-stone-200 mb-2 bg-stone-50">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-[10px] text-stone-500 font-bold">PO ID: {po.id}</Text>
                    <View className={`px-2 py-0.5 rounded-full ${
                      po.status === "RECEIVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      <Text className="text-[8px] font-black">
                        {po.status === "RECEIVED" ? "SUDAH DITERIMA" : "DALAM PENGIRIMAN"}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-stone-950 font-black text-xs mb-1">{po.product_name}</Text>
                  <Text className="text-stone-600 text-[10px] mb-2">
                    Supplier: {supplier?.name} • Qty: {po.quantity} • Total: Rp{po.total.toLocaleString("id-ID")}
                  </Text>

                  {po.status === "PENDING" && (
                    <Pressable
                      onPress={async () => {
                        await receiveGoods(po.id, po.quantity);
                        Alert.alert("Success", "Barang berhasil diterima! Stok gudang telah bertambah.");
                      }}
                      className="bg-emerald-700 active:bg-emerald-950 py-2 rounded-xl items-center"
                    >
                      <Text className="text-white text-[9px] font-black">Terima & Update Stok</Text>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    );
  };

  const renderAssistedLayanan = () => {
    const members = allUsers.filter((u) => u.role === "USER");
    
    const matchedMember = selectedMember || (searchMemberQuery 
      ? members.find(m => 
          m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) || 
          m.phone.includes(searchMemberQuery) ||
          m.card_token === searchMemberQuery
        )
      : null);

    return (
      <ScrollView className="flex-1 px-4 pt-3 mb-16">
        <View className="flex-row items-center gap-2 mb-4 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
          <SymbolView name="person.crop.circle.badge.checkmark" size={16} tintColor="#0f5132" />
          <Text className="text-emerald-800 text-[11px] font-black uppercase tracking-wider">
            Layanan Warga - Assisted Checkout (PRD 14)
          </Text>
        </View>

        <View className="bg-white border border-stone-200 rounded-3xl p-4 mb-4 shadow-sm">
          <Text className="text-stone-900 font-extrabold text-xs mb-2">Cari Anggota (Scan QR / Cari ID)</Text>
          
          <View className="flex-row gap-2 mb-3">
            <TextInput
              value={searchMemberQuery}
              onChangeText={(text) => {
                setSearchMemberQuery(text);
                setSelectedMember(null);
              }}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-950 font-bold"
              placeholder="Masukkan nomor HP, nama, atau scan QR..."
            />
            {searchMemberQuery ? (
              <Pressable
                onPress={() => {
                  setSearchMemberQuery("");
                  setSelectedMember(null);
                }}
                className="bg-stone-200 px-3 justify-center rounded-xl"
              >
                <Text className="text-stone-700 text-[10px] font-bold">Reset</Text>
              </Pressable>
            ) : null}
          </View>

          <Text className="text-stone-400 text-[9px] font-bold uppercase mb-2">Pilih Anggota Demo:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-4">
            {members.map((m) => (
              <Pressable
                key={m.id}
                onPress={() => {
                  setSelectedMember(m);
                  setSearchMemberQuery(m.card_token || m.name);
                }}
                className={`mr-2 px-3 py-1.5 rounded-full border ${
                  matchedMember?.id === m.id
                    ? "bg-emerald-900 border-emerald-950"
                    : "bg-stone-50 border-stone-200"
                }`}
              >
                <Text className={`text-[10px] font-bold ${matchedMember?.id === m.id ? "text-white" : "text-stone-600"}`}>
                  {m.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {matchedMember ? (
            <View className="bg-emerald-50/30 border border-emerald-600/30 p-3 rounded-2xl">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-stone-950 font-extrabold text-xs">{matchedMember.name}</Text>
                <Text className="text-emerald-800 text-[9px] font-black uppercase">TERIDENTIFIKASI</Text>
              </View>
              <Text className="text-stone-500 text-[10px]">ID Anggota: {matchedMember.member_id || "KOPDES-01"}</Text>
              <Text className="text-stone-500 text-[10px]">Alamat: {matchedMember.address || "-"}</Text>
              <Text className="text-emerald-800 text-[10px] font-black mt-1">Poin Gotong Royong: {matchedMember.points} Poin</Text>
            </View>
          ) : (
            <View className="bg-stone-50 border border-stone-200 border-dashed p-4 rounded-2xl items-center">
              <Text className="text-stone-400 text-[10px] italic">Warga belum teridentifikasi. Cari nama warga atau scan kartu.</Text>
            </View>
          )}
        </View>

        {matchedMember && (
          <>
            <View className="bg-white border border-stone-200 rounded-3xl p-4 mb-4 shadow-sm">
              <Text className="text-stone-900 font-extrabold text-xs mb-3">KopPaket Hemat (Predefined Bundles)</Text>
              
              <View className="border border-stone-200 rounded-2xl p-3 bg-stone-50 mb-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-stone-950 font-extrabold text-xs">Paket Dapur Mingguan</Text>
                  <Text className="text-emerald-800 font-black text-xs">Rp75.000</Text>
                </View>
                <Text className="text-stone-500 text-[10px] mb-3">Isi: Beras Premium 5kg + Minyak Goreng 1L</Text>
                
                <Pressable
                  onPress={() => {
                    const prodBeras = products.find(p => p.id === "prod-beras");
                    const prodMinyak = products.find(p => p.id === "prod-minyak");
                    if (prodBeras) addToCart(prodBeras, 1);
                    if (prodMinyak) addToCart(prodMinyak, 1);
                    Alert.alert("Success", "Isi Paket Dapur Mingguan dimasukkan ke dalam keranjang warga!");
                  }}
                  className="bg-emerald-700 active:bg-emerald-900 py-2 rounded-xl items-center"
                >
                  <Text className="text-white text-[9px] font-black">Tambahkan Paket</Text>
                </Pressable>
              </View>
            </View>

            <View className="bg-white border border-stone-200 rounded-3xl p-4 mb-4 shadow-sm">
              <Text className="text-stone-900 font-extrabold text-xs mb-3">Assisted Cart & Checkout</Text>

              <Text className="text-stone-400 text-[9px] font-bold uppercase mb-2">Daftar Produk Koperasi:</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {products.map((p) => {
                  const memberPrice = Math.round(p.price * 0.9);
                  return (
                    <View key={p.id} className="w-[48%] border border-stone-200 rounded-2xl p-2.5 bg-stone-50/50 justify-between mb-2">
                      <View className="mb-2">
                        <Text className="text-stone-950 font-extrabold text-[10px]" numberOfLines={1}>{p.name}</Text>
                        <Text className="text-stone-400 text-[9px]">Stok: {p.stock} {p.unit}</Text>
                        <Text className="text-stone-400 text-[9px] line-through mt-1">Reg: Rp{p.price.toLocaleString("id-ID")}</Text>
                        <Text className="text-emerald-800 text-[10px] font-black">Mem: Rp{memberPrice.toLocaleString("id-ID")}</Text>
                      </View>

                      <Pressable
                        onPress={() => {
                          const memberProduct = { ...p, price: memberPrice };
                          addToCart(memberProduct, 1);
                        }}
                        className="bg-emerald-700 active:bg-emerald-900 py-1.5 rounded-lg items-center"
                      >
                        <Text className="text-white text-[8px] font-black">+ Keranjang</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              <Text className="text-stone-400 text-[9px] font-bold uppercase border-t border-stone-100 pt-3 mb-2">Keranjang Saat Ini (Assisted):</Text>
              {cart.length === 0 ? (
                <Text className="text-stone-400 text-[10px] italic py-2 text-center">Keranjang kosong. Tambahkan item di atas.</Text>
              ) : (
                <>
                  {cart.map((item) => (
                    <View key={item.product.id} className="flex-row justify-between items-center mb-2 bg-stone-50 p-2 rounded-xl">
                      <View className="flex-1">
                        <Text className="text-stone-950 font-bold text-xs">{item.product.name}</Text>
                        <Text className="text-emerald-800 text-[10px] font-black">
                          {item.quantity}x Rp{item.product.price.toLocaleString("id-ID")}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <View className="border-t border-stone-100 pt-3 mt-2">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-stone-600 text-xs">Subtotal:</Text>
                      <Text className="text-stone-950 font-bold text-xs">
                        Rp{cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString("id-ID")}
                      </Text>
                    </View>

                    <View className="mb-3">
                      <Text className="text-stone-500 text-[9px] font-bold uppercase mb-1">Redeem Poin (Rp1,000/poin):</Text>
                      <TextInput
                        value={pointsToRedeem}
                        onChangeText={setPointsToRedeem}
                        keyboardType="numeric"
                        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-950"
                        placeholder="Redeem points..."
                      />
                    </View>

                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={async () => {
                          const pts = parseInt(pointsToRedeem) || 0;
                          const res = await checkout("PICKUP_AT_COOP", "CARD_PURCHASE", pts, null, matchedMember.id);
                          if (res.success) {
                            Alert.alert(
                              "Transaksi Berhasil!",
                              `Struk Transparan (PRD 14):\n\n` +
                              `• Member: ${matchedMember.name}\n` +
                              `• Tipe: Ambil Di Koperasi\n` +
                              `• Poin Terpakai: ${pts}\n` +
                              `• Kode Transaksi: ${res.orderId}\n\n` +
                              `Sebut. Scan. Selesai!`
                            );
                            clearCart();
                            setPointsToRedeem("0");
                          } else {
                            Alert.alert("Checkout Gagal", res.error);
                          }
                        }}
                        className="bg-emerald-700 active:bg-emerald-900 py-3 rounded-xl flex-1 items-center"
                      >
                        <Text className="text-white text-xs font-black">Ambil Sendiri (Rp0)</Text>
                      </Pressable>

                      <Pressable
                        onPress={async () => {
                          const pts = parseInt(pointsToRedeem) || 0;
                          const res = await checkout("DELIVERY_TO_HOME", "CARD_PURCHASE", pts, null, matchedMember.id);
                          if (res.success) {
                            Alert.alert(
                              "Transaksi & Pengiriman Dibuat!",
                              `Struk Transparan (PRD 14):\n\n` +
                              `• Member: ${matchedMember.name}\n` +
                              `• Tipe: Antar Kurir (KopKurir)\n` +
                              `• Poin Terpakai: ${pts}\n` +
                              `• Kode Transaksi: ${res.orderId}\n\n` +
                              `Selesai! Barang akan segera dikirim.`
                            );
                            clearCart();
                            setPointsToRedeem("0");
                          } else {
                            Alert.alert("Checkout Gagal", res.error);
                          }
                        }}
                        className="bg-emerald-900 active:bg-emerald-950 py-3 rounded-xl flex-1 items-center"
                      >
                        <Text className="text-white text-xs font-black">Antar ke Rumah</Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              )}
            </View>

            <View className="bg-white border border-stone-200 rounded-3xl p-4 mb-8 shadow-sm">
              <Text className="text-stone-900 font-extrabold text-xs mb-3">KopRequest (Catat Permintaan Warga)</Text>
              
              <View className="mb-2">
                <Text className="text-stone-500 text-[9px] font-bold uppercase mb-1">Nama Produk yang Kosong/Unik:</Text>
                <TextInput
                  value={newRequestProductName}
                  onChangeText={setNewRequestProductName}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-950"
                  placeholder="cth: Garam Beryodium"
                />
              </View>

              <View className="mb-3">
                <Text className="text-stone-500 text-[9px] font-bold uppercase mb-1">Jumlah Kebutuhan:</Text>
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
                  await createKopRequest(matchedMember.id, newRequestProductName, reqQty);
                  Alert.alert("Success", `KopRequest untuk ${matchedMember.name} berhasil disimpan!`);
                  setNewRequestProductName("");
                  setNewRequestQty("1");
                }}
                className="bg-emerald-700 active:bg-emerald-950 py-3 rounded-xl items-center mb-4"
              >
                <Text className="text-white text-xs font-black">Simpan Request Warga</Text>
              </Pressable>

              <Text className="text-stone-400 text-[9px] font-bold uppercase border-t border-stone-100 pt-3 mb-2">Daftar Permintaan Warga:</Text>
              {kopRequests.length === 0 ? (
                <Text className="text-stone-400 text-[10px] italic py-2 text-center">Belum ada request tercatat.</Text>
              ) : (
                kopRequests.map((req) => {
                  const reqUser = allUsers.find(u => u.id === req.user_id);
                  return (
                    <View key={req.id} className="p-3 rounded-2xl border border-stone-200 mb-2 bg-stone-50">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-[10px] text-stone-900 font-extrabold">{reqUser?.name || "Warga"}</Text>
                        <View className={`px-2 py-0.5 rounded-full ${
                          req.status === "NOTIFIED" ? "bg-stone-200 text-stone-700" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          <Text className="text-[8px] font-black">
                            {req.status === "NOTIFIED" ? "SELESAI (NOTIFIED)" : "MENUNGGU STOK"}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-stone-950 font-black text-xs">{req.quantity}x {req.product_name}</Text>
                      
                      {req.status === "PENDING" && (
                        <Pressable
                          onPress={async () => {
                            await resolveKopRequest(req.id);
                            Alert.alert("Success", "Request selesai dan warga telah diberikan notifikasi.");
                          }}
                          className="bg-emerald-700 active:bg-emerald-950 py-1.5 rounded-xl items-center mt-2"
                        >
                          <Text className="text-white text-[8px] font-black">Kabari Warga & Selesaikan</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-stone-100">
      {/* Sub tabs render */}
      {subTab === 0 && renderInventory()}
      {subTab === 1 && renderFulfillment()}
      {subTab === 2 && renderFinanceAudit()}
      {subTab === 3 && renderDispatch()}
      {subTab === 4 && renderProcurement()}
      {subTab === 5 && renderAssistedLayanan()}

      {/* Sub Tabs Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 h-16 flex-row justify-around items-center">
        {activeRole === "OPERASIONAL" && (
          <Pressable
            onPress={() => setSubTab(0)}
            className="items-center justify-center flex-1 h-full active:bg-stone-50"
          >
            <SymbolView
              name="cart.badge.plus"
              size={16}
              tintColor={subTab === 0 ? "#0f5132" : "#888"}
            />
            <Text
              className={`text-[8px] mt-0.5 font-bold ${subTab === 0 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
            >
              Stok Barang
            </Text>
          </Pressable>
        )}

        {activeRole === "OPERASIONAL" && (
          <Pressable
            onPress={() => setSubTab(1)}
            className="items-center justify-center flex-1 h-full active:bg-stone-50"
          >
            <SymbolView
              name="tray.and.arrow.down.fill"
              size={16}
              tintColor={subTab === 1 ? "#0f5132" : "#888"}
            />
            <Text
              className={`text-[8px] mt-0.5 font-bold ${subTab === 1 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
            >
              Fulfillment
            </Text>
          </Pressable>
        )}

        {activeRole === "ADMIN" && (
          <Pressable
            onPress={() => setSubTab(2)}
            className="items-center justify-center flex-1 h-full active:bg-stone-50"
          >
            <SymbolView
              name="chart.bar.xaxis"
              size={16}
              tintColor={subTab === 2 ? "#0f5132" : "#888"}
            />
            <Text
              className={`text-[8px] mt-0.5 font-bold ${subTab === 2 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
            >
              Keuangan
            </Text>
          </Pressable>
        )}

        {activeRole === "OPERASIONAL" && (
          <Pressable
            onPress={() => setSubTab(3)}
            className="items-center justify-center flex-1 h-full active:bg-stone-50"
          >
            <SymbolView
              name="shippingbox.fill"
              size={16}
              tintColor={subTab === 3 ? "#0f5132" : "#888"}
            />
            <Text
              className={`text-[8px] mt-0.5 font-bold ${subTab === 3 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
            >
              Dispatch
            </Text>
          </Pressable>
        )}

        {activeRole === "ADMIN" && (
          <Pressable
            onPress={() => setSubTab(4)}
            className="items-center justify-center flex-1 h-full active:bg-stone-50"
          >
            <SymbolView
              name="bag.fill"
              size={16}
              tintColor={subTab === 4 ? "#0f5132" : "#888"}
            />
            <Text
              className={`text-[8px] mt-0.5 font-bold ${subTab === 4 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
            >
              Pengadaan
            </Text>
          </Pressable>
        )}

        {activeRole === "OPERASIONAL" && (
          <Pressable
            onPress={() => setSubTab(5)}
            className="items-center justify-center flex-1 h-full active:bg-stone-50"
          >
            <SymbolView
              name="person.2.fill"
              size={16}
              tintColor={subTab === 5 ? "#0f5132" : "#888"}
            />
            <Text
              className={`text-[8px] mt-0.5 font-bold ${subTab === 5 ? "text-emerald-800 font-extrabold" : "text-stone-400"}`}
            >
              Layanan Warga
            </Text>
          </Pressable>
        )}
      </View>

      {/* Add / Edit Product Modal */}
      <Modal
        visible={productModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProductModalOpen(false)}
      >
        <Pressable
          onPress={() => setProductModalOpen(false)}
          className="flex-1 justify-end bg-black/60"
        >
          <Pressable onPress={() => {}} className="bg-white rounded-t-3xl p-5 max-h-[85%]">
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
                  <View className="flex-row flex-wrap gap-1 mt-1">
                    {["pcs", "kg", "liter", "karung", "pack", "dus"].map((u) => {
                      const isSelected = prodUnit === u;
                      return (
                        <Pressable
                          key={u}
                          onPress={() => setProdUnit(u)}
                          className={`px-2.5 py-1.5 rounded-xl border ${
                            isSelected
                              ? "bg-emerald-850 border-emerald-900"
                              : "bg-stone-100 border-stone-200"
                          }`}
                        >
                          <Text
                            className={`text-[9px] font-bold ${
                              isSelected ? "text-white font-extrabold" : "text-stone-600"
                            }`}
                          >
                            {u}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
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
          </Pressable>
        </Pressable>
      </Modal>

      {/* Self-Pickup details Modal */}
      {activeSelfOrder && (
        <Modal
          visible={!!activeSelfOrder}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setActiveSelfOrder(null)}
        >
          <Pressable
            onPress={() => setActiveSelfOrder(null)}
            className="flex-1 justify-end bg-black/60"
          >
            <Pressable onPress={() => {}} className="bg-white rounded-t-3xl p-5 max-h-[80%]">
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
                    {getOrderStatusLabel(activeSelfOrder.order_status)}
                  </Text>
                </View>

                <View className="bg-amber-50 border border-amber-100 p-3 rounded-xl mb-3">
                  <Text className="text-amber-800 text-[10px] font-bold">
                    Pesanan dibuat
                  </Text>
                  <Text className="text-stone-600 text-[10px] mt-0.5">
                    {formatWibDateTime(activeSelfOrder.created_at)}
                  </Text>
                </View>

                <OrderStatusHistoryCards history={selfOrderStatusHistory} />

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
                {!["COMPLETED", "CANCELLED"].includes(
                  activeSelfOrder.order_status,
                ) && (
                  <View className="mt-4 gap-2 mb-6">
                    {activeSelfOrder.fulfillment === "DELIVERY_TO_HOME" ? (
                      activeSelfOrder.order_status === "PENDING_PAYMENT" ||
                      activeSelfOrder.order_status === "PAID" ||
                      activeSelfOrder.order_status === "CONFIRMED" ? (
                        <Pressable
                          onPress={() =>
                            handleUpdateHomeDeliveryFulfillment(
                              activeSelfOrder.id,
                              "PACKED",
                            )
                          }
                          className="bg-amber-600 border border-amber-700 py-3.5 rounded-xl items-center justify-center active:bg-amber-700"
                        >
                          <Text className="text-white font-black text-xs">
                          Kemas Pesanan
                          </Text>
                        </Pressable>
                      ) : activeSelfOrder.order_status === "PACKED" ? (
                        <Pressable
                          onPress={() =>
                            handleUpdateHomeDeliveryFulfillment(
                              activeSelfOrder.id,
                              "PICKED_UP",
                            )
                          }
                          className="bg-blue-600 border border-blue-700 py-3.5 rounded-xl items-center justify-center active:bg-blue-850"
                        >
                          <Text className="text-white font-black text-xs">
                            Serahkan ke Kurir
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() =>
                            handleUpdateHomeDeliveryFulfillment(
                              activeSelfOrder.id,
                              "COMPLETED",
                            )
                          }
                          className="bg-emerald-700 border border-emerald-800 py-3.5 rounded-xl items-center justify-center active:bg-emerald-950"
                        >
                          <Text className="text-white font-black text-xs">
                            Pesanan Diterima
                          </Text>
                        </Pressable>
                      )
                    ) : activeSelfOrder.order_status === "READY_FOR_PICKUP" ? (
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
                          Sudah Diambil
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
                          Siap Diambil
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}


    </View>
  );
}
