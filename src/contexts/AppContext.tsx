import {
  AuditLog,
  CashCollection,
  dbService,
  DeliveryProof,
  DeliveryStatus,
  DeliveryTask,
  DriverProfile,
  KopRequest,
  Order,
  OrderItem,
  Product,
  PurchaseOrder,
  RTBatch,
  Settlement,
  Supplier,
  SupplierProduct,
  User,
} from "@/utils/db";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AppRole = "USER" | "ADMIN" | "DRIVER" | "AGENT" | "OPERASIONAL" | "SUPPLIER";

export interface RegisterCitizenInput {
  fullName: string;
  nik: string;
  phone: string;
  address: string;
  rt: string;
  rw: string;
  cooperativeId: string;
  referralCode?: string;
  otp: string;
  pin: string;
}

export const REGISTRATION_DEMO_OTP = "240826";

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  if (digits.startsWith("8")) return `0${digits}`;
  return digits;
};

const maskNik = (nik: string) => {
  const digits = nik.replace(/\D/g, "");
  if (digits.length < 16) return "";
  return `${digits.slice(0, 6)}********${digits.slice(-2)}`;
};

const buildReferralCode = (name: string, existingUsers: User[]) => {
  const firstWord =
    name
      .trim()
      .split(/\s+/)[0]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 8) || "WARGA";

  let code = `${firstWord}AJAK`;
  let suffix = 1;
  const existingCodes = new Set(
    existingUsers.map((user) => user.referral_code),
  );
  while (existingCodes.has(code)) {
    code = `${firstWord}${suffix}AJAK`;
    suffix += 1;
  }

  return code;
};

const buildMemberId = (rt: string) => {
  const cleanRt = rt.replace(/\D/g, "").padStart(2, "0").slice(-2);
  const suffix = Date.now().toString().slice(-6);
  return `KMP-RT${cleanRt}-${suffix}`;
};

interface AppContextType {
  activeRole: AppRole;
  activeUser: User | null;
  allUsers: User[];
  products: Product[];
  batches: RTBatch[];
  orders: Order[];
  driverProfiles: DriverProfile[];
  deliveryTasks: DeliveryTask[];
  deliveryProofs: DeliveryProof[];
  cashCollections: CashCollection[];
  cart: CartItem[];
  settlements: Settlement[];
  auditLogs: AuditLog[];
  suppliers: Supplier[];
  supplierProducts: SupplierProduct[];
  purchaseOrders: PurchaseOrder[];
  kopRequests: KopRequest[];
  isLoading: boolean;

  // Setters/Refreshers
  setActiveRole: (role: AppRole) => void;
  setActiveUser: (user: User) => void;
  login: (
    phone: string,
    pin: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshData: () => Promise<void>;
  resetAllData: () => Promise<void>;

  // Cart Actions
  addToCart: (product: Product, qty?: number) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Checkout & Order Actions
  checkout: (
    fulfillment: "PICKUP_AT_COOP" | "DELIVERY_TO_HOME" | "RT_PICKUP_POINT",
    channel: "SELF_ORDER" | "RT_ASSISTED" | "CARD_PURCHASE" | "B2B_AGENT",
    pointsRedeemed: number,
    rtBatchId: string | null,
    overrideUserId?: string, // used for assisted checkout
    isQris?: boolean,
  ) => Promise<{ success: boolean; error?: string; orderId?: string }>;


  // RT Batch Actions
  createBatch: (
    name: string,
    deadline: string,
    pickupPoint: string,
  ) => Promise<string>;
  lockBatch: (batchId: string) => Promise<void>;
  submitBatch: (batchId: string) => Promise<void>;
  markItemPickedUp: (orderId: string) => Promise<void>;
  submitSettlement: (
    settlementId: string,
    amountSubmitted: number,
  ) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;

  // Admin Actions
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  createOrUpdateProduct: (product: Partial<Product>) => Promise<void>;
  processBatchFulfillment: (
    batchId: string,
    newStatus: "PROCESSING" | "DELIVERED_TO_RT" | "COMPLETED",
  ) => Promise<void>;
  verifySettlement: (
    settlementId: string,
    isVerified: boolean,
  ) => Promise<void>;
  updateUserField: (userId: string, field: string, value: any) => Promise<void>;
  submitRFQ: (
    supplierId: string,
    productName: string,
    price: number,
    qty: number,
    total: number,
  ) => Promise<void>;
  receiveGoods: (poId: string, receivedQty: number) => Promise<void>;
  createKopRequest: (
    userId: string,
    productName: string,
    qty: number,
  ) => Promise<void>;
  resolveKopRequest: (requestId: string) => Promise<void>;

  // Driver & Dispatch Actions
  createDeliveryTaskFromOrder: (
    orderId: string,
  ) => Promise<{ success: boolean; error?: string; taskId?: string }>;
  createDeliveryTaskFromBatch: (
    batchId: string,
  ) => Promise<{ success: boolean; error?: string; taskId?: string }>;
  assignDeliveryTask: (
    taskId: string,
    driverId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  assignManualProvider: (
    taskId: string,
    providerName: string,
    trackingNumber: string,
    courierContact: string,
    fee: number,
  ) => Promise<{ success: boolean; error?: string }>;
  acceptDeliveryTask: (
    taskId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  rejectDeliveryTask: (
    taskId: string,
    reason: string,
  ) => Promise<{ success: boolean; error?: string }>;
  confirmDeliveryPickup: (
    taskId: string,
    packageCount: number,
  ) => Promise<{ success: boolean; error?: string }>;
  startDeliveryTransit: (
    taskId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  completeDeliveryTask: (
    taskId: string,
    proofValue: string,
    collectedAmount: number,
  ) => Promise<{ success: boolean; error?: string }>;
  failDeliveryTask: (
    taskId: string,
    reason: string,
  ) => Promise<{ success: boolean; error?: string }>;

  // Demo Switcher
  handleSwitchRole: (
    userId: string,
    role: AppRole,
    name: string,
  ) => Promise<void>;

  // Referral
  registerCitizen: (
    input: RegisterCitizenInput,
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  applyReferralCode: (
    code: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeRole, setActiveRoleState] = useState<AppRole>("USER");
  const [activeUser, setActiveUserState] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<RTBatch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [driverProfiles, setDriverProfiles] = useState<DriverProfile[]>([]);
  const [deliveryTasks, setDeliveryTasks] = useState<DeliveryTask[]>([]);
  const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>([]);
  const [cashCollections, setCashCollections] = useState<CashCollection[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>(
    [],
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [kopRequests, setKopRequests] = useState<KopRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize DB and load initial data
  useEffect(() => {
    const init = async () => {
      try {
        await refreshData();
      } catch (err) {
        console.error("Database initialization failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    // refreshData is intentionally called once for initial database hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the authenticated user in sync with changes in the database. A user is
  // deliberately not selected by default: the app should open at the login/register screen.
  useEffect(() => {
    if (allUsers.length > 0 && activeUser) {
      const syncTask = setTimeout(() => {
        setActiveUserState((prev) => {
          if (!prev) return null;
          return allUsers.find((user) => user.id === prev.id) || null;
        });
      }, 0);

      return () => clearTimeout(syncTask);
    }
  }, [activeUser, allUsers]);

  // Load user's cart from SQLite when activeUser changes
  useEffect(() => {
    const loadCart = async () => {
      if (!activeUser) {
        setCart([]);
        return;
      }
      try {
        const cartData = await dbService.getAll<any>(
          `SELECT ci.quantity, p.id as product_id, p.cooperative_id, p.name, p.price, p.cost_price, p.stock, p.unit, p.is_local, p.image_url 
           FROM cart_items ci
           JOIN products p ON ci.product_id = p.id
           WHERE ci.user_id = ?`,
          [activeUser.id],
        );
        const cartItems: CartItem[] = cartData.map((item: any) => ({
          product: {
            id: item.product_id,
            cooperative_id: item.cooperative_id,
            name: item.name,
            price: item.price,
            cost_price: item.cost_price,
            stock: item.stock,
            unit: item.unit,
            is_local: item.is_local,
            image_url: item.image_url,
          },
          quantity: item.quantity,
        }));
        setCart(cartItems);
      } catch (err) {
        console.error("Failed to load user cart:", err);
      }
    };
    loadCart();
  }, [activeUser]);

  async function refreshData() {
    try {
      // 1. Fetch Users
      const usersData = await dbService.getAll<User>("SELECT * FROM users");
      setAllUsers(usersData);

      // Keep activeUser in sync with database (e.g. updated points balance)
      if (activeUser) {
        const updatedMe = usersData.find((u) => u.id === activeUser.id);
        if (updatedMe) setActiveUserState(updatedMe);
      }

      // 2. Fetch Products
      const productsData = await dbService.getAll<Product>(
        "SELECT * FROM products",
      );
      setProducts(productsData);

      // 3. Fetch RT Batches for dispatch/RT pickup flows
      const batchData = await dbService.getAll<RTBatch>(
        "SELECT * FROM rt_batches",
      );
      setBatches(batchData);

      // 4. Fetch Orders
      const ordersData = await dbService.getAll<Order>(
        "SELECT * FROM orders ORDER BY created_at DESC",
      );
      setOrders(ordersData);

      // 5. Fetch driver/logistics records
      const driversData = await dbService.getAll<DriverProfile>(
        "SELECT * FROM driver_profiles",
      );
      setDriverProfiles(driversData);
      const taskData = await dbService.getAll<DeliveryTask>(
        "SELECT * FROM delivery_tasks",
      );
      setDeliveryTasks(
        [...taskData].sort((a, b) =>
          String(b.updated_at).localeCompare(String(a.updated_at)),
        ),
      );
      const proofData = await dbService.getAll<DeliveryProof>(
        "SELECT * FROM delivery_proofs",
      );
      setDeliveryProofs(proofData);
      const cashData = await dbService.getAll<CashCollection>(
        "SELECT * FROM cash_collections",
      );
      setCashCollections(cashData);

      // 6. Fetch Settlements
      const settlementsData = await dbService.getAll<Settlement>(
        "SELECT * FROM settlements",
      );
      setSettlements(settlementsData);

      // 7. Fetch Audit Logs
      const logsData = await dbService.getAll<AuditLog>(
        "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50",
      );
      setAuditLogs(logsData);

      // 8. Fetch Procurement & Sourcing records
      let suppliersData = await dbService.getAll<Supplier>(
        "SELECT * FROM suppliers",
      );
      if (suppliersData.length === 0) {
        try {
          await dbService.run(
            `INSERT OR IGNORE INTO suppliers (id, name, type, contact, status) VALUES ('sup-1', 'PT Agro Pangan Nusantara', 'Company', '08119876543', 'ACTIVE')`
          );
          await dbService.run(
            `INSERT OR IGNORE INTO suppliers (id, name, type, contact, status) VALUES ('sup-2', 'UMKM Berkah Jaya Mandiri', 'UMKM', '08551234567', 'ACTIVE')`
          );
          await dbService.run(
            `INSERT OR IGNORE INTO suppliers (id, name, type, contact, status) VALUES ('sup-3', 'Kelompok Tani Harapan Jaya', 'Producer', '08778899002', 'ACTIVE')`
          );

          await dbService.run(
            `INSERT OR IGNORE INTO supplier_products (id, supplier_id, name, price, moq, lead_time, unit) VALUES ('sp-beras-1', 'sup-1', 'Beras Premium 5kg', 62000, 20, '2 Hari', 'karung')`
          );
          await dbService.run(
            `INSERT OR IGNORE INTO supplier_products (id, supplier_id, name, price, moq, lead_time, unit) VALUES ('sp-minyak-1', 'sup-1', 'Minyak Goreng 1L', 13500, 50, '1 Hari', 'pcs')`
          );
          await dbService.run(
            `INSERT OR IGNORE INTO supplier_products (id, supplier_id, name, price, moq, lead_time, unit) VALUES ('sp-beras-2', 'sup-2', 'Beras Premium 5kg', 64000, 5, '1 Hari', 'karung')`
          );
          await dbService.run(
            `INSERT OR IGNORE INTO supplier_products (id, supplier_id, name, price, moq, lead_time, unit) VALUES ('sp-kopi-2', 'sup-2', 'Kopi Bubuk Lokal Desa 100g', 8000, 10, '1 Hari', 'pcs')`
          );
          await dbService.run(
            `INSERT OR IGNORE INTO supplier_products (id, supplier_id, name, price, moq, lead_time, unit) VALUES ('sp-beras-3', 'sup-3', 'Beras Premium 5kg', 60000, 50, '3 Hari', 'karung')`
          );
          suppliersData = await dbService.getAll<Supplier>("SELECT * FROM suppliers");
        } catch (e) {
          console.error("Auto-seed suppliers failed:", e);
        }
      }
      setSuppliers(suppliersData);

      const supplierProductsData = await dbService.getAll<SupplierProduct>(
        "SELECT * FROM supplier_products",
      );
      setSupplierProducts(supplierProductsData);

      const posData = await dbService.getAll<PurchaseOrder>(
        "SELECT * FROM purchase_orders ORDER BY created_at DESC",
      );
      setPurchaseOrders(posData);

      const requestsData = await dbService.getAll<KopRequest>(
        "SELECT * FROM kop_requests ORDER BY created_at DESC",
      );
      setKopRequests(requestsData);
    } catch (err) {
      console.error("Failed to query database:", err);
    }
  }

  const resetAllData = async () => {
    setIsLoading(true);
    try {
      await dbService.resetDatabase();
      setCart([]);
      await refreshData();
    } catch (err) {
      console.error("Failed to reset database", err);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveRole = (role: AppRole) => {
    setActiveRoleState(role);
    setCart([]); // Clear cart when switching roles
  };

  const setActiveUser = (user: User) => {
    setActiveUserState(user);
    setCart([]);
  };

  const login = async (phone: string, pin: string) => {
    const normalizedPhone = normalizePhone(phone);
    const normalizedPin = pin.replace(/\D/g, "");

    if (!normalizedPhone || !normalizedPin) {
      return {
        success: false,
        error: "Masukkan nomor HP dan PIN terlebih dahulu.",
      };
    }

    try {
      const user = await dbService.getFirst<User>(
        "SELECT * FROM users WHERE phone = ?",
        [normalizedPhone],
      );
      if (!user || user.pin !== normalizedPin) {
        return { success: false, error: "Nomor HP atau PIN belum sesuai." };
      }

      if (
        user.account_status === "SUSPENDED" ||
        user.account_status === "PENDING"
      ) {
        return {
          success: false,
          error: "Akun ini belum dapat digunakan. Hubungi koperasi.",
        };
      }

      const role: AppRole =
        user.role === "ADMIN" || user.role === "DRIVER" ? user.role : "USER";
      setActiveRoleState(role);
      setActiveUserState(user);
      setCart([]);
      return { success: true };
    } catch (err: any) {
      console.error("Login failed:", err);
      return {
        success: false,
        error: err.message || "Login gagal. Coba lagi.",
      };
    }
  };

  const logout = () => {
    setActiveUserState(null);
    setActiveRoleState("USER");
    setCart([]);
  };

  // Cart operations
  const addToCart = async (product: Product, qty: number = 1) => {
    if (!activeUser) return;
    try {
      const existing = cart.find((item) => item.product.id === product.id);
      const targetQty = existing
        ? Math.min(existing.quantity + qty, product.stock)
        : Math.min(qty, product.stock);

      if (targetQty <= 0) return;

      await dbService.run(
        `INSERT OR REPLACE INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)`,
        [activeUser.id, product.id, targetQty],
      );

      setCart((prev) => {
        const idx = prev.findIndex((item) => item.product.id === product.id);
        if (idx !== -1) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: targetQty }
              : item,
          );
        }
        return [...prev, { product, quantity: targetQty }];
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const updateCartQuantity = async (productId: string, qty: number) => {
    if (!activeUser) return;
    try {
      const item = cart.find((i) => i.product.id === productId);
      if (!item) return;
      const targetQty = Math.max(1, Math.min(qty, item.product.stock));

      await dbService.run(
        `UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [targetQty, activeUser.id, productId],
      );

      setCart((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: targetQty } : i,
        ),
      );
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!activeUser) return;
    try {
      await dbService.run(
        `DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`,
        [activeUser.id, productId],
      );
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  const clearCart = async () => {
    if (!activeUser) return;
    try {
      await dbService.run(`DELETE FROM cart_items WHERE user_id = ?`, [
        activeUser.id,
      ]);
      setCart([]);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  // Log audit action
  const logAudit = async (actor: string, action: string, details: string) => {
    const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await dbService.run(
      "INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)",
      [id, actor, action, details, new Date().toISOString()],
    );
  };

  async function createCashCollectionIfNeeded(
    taskId: string,
    collectorId: string | null,
    codAmount: number,
  ) {
    if (codAmount <= 0) return;

    const existing = await dbService.getFirst<CashCollection>(
      "SELECT * FROM cash_collections WHERE delivery_task_id = ?",
      [taskId],
    );
    if (existing) return;

    await dbService.run(
      `INSERT INTO cash_collections (
        id, delivery_task_id, collector_type, collector_id, expected_amount, collected_amount, status, settled_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `cash-${taskId}`,
        taskId,
        "DRIVER",
        collectorId || "",
        codAmount,
        0,
        "PENDING",
        null,
      ],
    );
  }

  async function getPackageCountForOrder(orderId: string) {
    const items = await dbService.getAll<OrderItem>(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId],
    );
    return items.reduce((sum, item) => sum + item.quantity, 0) || 1;
  }

  async function issueCompletionRewards(order: Order) {
    if (order.order_status === "COMPLETED") return 0;

    const orderItems = await dbService.getAll<OrderItem>(
      "SELECT * FROM order_items WHERE order_id = ?",
      [order.id],
    );
    let basePoints = Math.floor(order.total / 10000);
    const containsLocal = orderItems.some((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return product?.is_local === 1;
    });

    if (containsLocal) {
      basePoints *= 2;
    }

    const prevOrders = orders.filter(
      (o) =>
        o.user_id === order.user_id &&
        o.id !== order.id &&
        o.order_status === "COMPLETED",
    );
    const firstOrderBonus = prevOrders.length === 0 ? 100 : 0;
    const totalEarnedPoints = basePoints + firstOrderBonus;

    if (totalEarnedPoints > 0) {
      const user = allUsers.find((u) => u.id === order.user_id);
      if (user) {
        await dbService.run("UPDATE users SET points = ? WHERE id = ?", [
          user.points + totalEarnedPoints,
          order.user_id,
        ]);
        await dbService.run(
          `INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `pt-${Date.now()}-drv-earn`,
            order.user_id,
            "EARN",
            totalEarnedPoints,
            "ORDER",
            order.id,
            new Date().toISOString(),
          ],
        );
      }
    }

    const buyer = allUsers.find((u) => u.id === order.user_id);
    if (buyer?.referred_by && prevOrders.length === 0) {
      const referrer = allUsers.find(
        (u) => u.referral_code === buyer.referred_by,
      );
      if (referrer) {
        // Referrer points
        await dbService.run("UPDATE users SET points = ? WHERE id = ?", [
          referrer.points + 10000,
          referrer.id,
        ]);
        await dbService.run(
          `INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `pt-${Date.now()}-drv-ref`,
            referrer.id,
            "EARN",
            10000,
            "REFERRAL",
            order.id,
            new Date().toISOString(),
          ],
        );

        // Buyer points (referred user reward)
        await dbService.run("UPDATE users SET points = ? WHERE id = ?", [
          buyer.points + 10000,
          buyer.id,
        ]);
        await dbService.run(
          `INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `pt-${Date.now()}-drv-buyer-ref`,
            buyer.id,
            "EARN",
            10000,
            "REFERRAL",
            order.id,
            new Date().toISOString(),
          ],
        );
      }
    }

    return totalEarnedPoints;
  }

  async function createDeliveryTaskFromOrder(orderId: string) {
    const existing =
      deliveryTasks.find((task) => task.order_id === orderId) ||
      (await dbService.getFirst<DeliveryTask>(
        "SELECT * FROM delivery_tasks WHERE order_id = ?",
        [orderId],
      ));
    if (existing) {
      return { success: true, taskId: existing.id };
    }

    const order =
      orders.find((item) => item.id === orderId) ||
      (await dbService.getFirst<Order>("SELECT * FROM orders WHERE id = ?", [
        orderId,
      ]));
    if (!order) return { success: false, error: "Pesanan tidak ditemukan." };
    if (order.fulfillment !== "DELIVERY_TO_HOME") {
      return {
        success: false,
        error: "Hanya pesanan kirim ke rumah yang membutuhkan tugas KopKurir.",
      };
    }

    const buyer =
      allUsers.find((user) => user.id === order.user_id) ||
      (await dbService.getFirst<User>("SELECT * FROM users WHERE id = ?", [
        order.user_id,
      ]));
    if (!buyer) return { success: false, error: "Pembeli tidak ditemukan." };

    const nowStr = new Date().toISOString();
    const taskId = `task-${order.id}`;
    const deliveryFee = Math.max(
      0,
      order.total - order.subtotal + order.discount,
    );
    const driverIncentive = Math.max(6000, deliveryFee - 1000);
    const codAmount = order.payment_status === "UNPAID" ? order.total : 0;
    const packageCount = await getPackageCountForOrder(order.id);

    await dbService.run(
      `INSERT INTO delivery_tasks (
        id, cooperative_id, order_id, rt_batch_id, driver_id, provider_type, delivery_type,
        origin_address, destination_address, status, delivery_fee, driver_incentive, cod_amount,
        package_count, pickup_code, recipient_name, recipient_phone, manual_provider_name,
        tracking_number, courier_contact, eta, failed_reason, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        buyer.cooperative_id,
        order.id,
        null,
        null,
        "KOPKURIR",
        "HOME_DELIVERY",
        "Koperasi Merah Putih Sukamaju, Jl. Merdeka No. 12",
        buyer.address || `Alamat warga ${buyer.rt_id || "RT"}`,
        "PENDING_DISPATCH",
        deliveryFee,
        driverIncentive,
        codAmount,
        packageCount,
        `PU-${order.id.slice(-6).toUpperCase()}`,
        buyer.name,
        buyer.phone,
        null,
        null,
        null,
        "Hari ini",
        null,
        nowStr,
        nowStr,
      ],
    );

    await createCashCollectionIfNeeded(taskId, null, codAmount);
    await logAudit(
      "Sistem Dispatch",
      "CREATE_DELIVERY_TASK",
      `Created KopKurir task ${taskId} for order ${order.id}.`,
    );
    await refreshData();

    return { success: true, taskId };
  }

  async function createDeliveryTaskFromBatch(batchId: string) {
    const existing =
      deliveryTasks.find((task) => task.rt_batch_id === batchId) ||
      (await dbService.getFirst<DeliveryTask>(
        "SELECT * FROM delivery_tasks WHERE rt_batch_id = ?",
        [batchId],
      ));
    if (existing) {
      return { success: true, taskId: existing.id };
    }

    const batch =
      batches.find((item) => item.id === batchId) ||
      (await dbService.getFirst<RTBatch>(
        "SELECT * FROM rt_batches WHERE id = ?",
        [batchId],
      ));
    if (!batch) return { success: false, error: "Batch RT tidak ditemukan." };

    const batchOrders = await dbService.getAll<Order>(
      "SELECT * FROM orders WHERE rt_batch_id = ?",
      [batchId],
    );
    const codAmount = batchOrders
      .filter((order) => order.payment_status === "UNPAID")
      .reduce((sum, order) => sum + order.total, 0);
    const nowStr = new Date().toISOString();
    const taskId = `task-${batch.id}`;
    const packageCount = Math.max(batchOrders.length, batch.total_orders || 1);
    const driverIncentive = 5000 + packageCount * 1000;

    await dbService.run(
      `INSERT INTO delivery_tasks (
        id, cooperative_id, order_id, rt_batch_id, driver_id, provider_type, delivery_type,
        origin_address, destination_address, status, delivery_fee, driver_incentive, cod_amount,
        package_count, pickup_code, recipient_name, recipient_phone, manual_provider_name,
        tracking_number, courier_contact, eta, failed_reason, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        "tenant-1",
        null,
        batch.id,
        null,
        "KOPKURIR",
        "RT_BATCH_DELIVERY",
        "Koperasi Merah Putih Sukamaju, Jl. Merdeka No. 12",
        batch.pickup_point,
        "PENDING_DISPATCH",
        batch.total_gmv > 500000 ? 0 : 5000,
        driverIncentive,
        codAmount,
        packageCount,
        `PU-${batch.rt_id.replace(/\s/g, "")}-${batch.id.slice(-3).toUpperCase()}`,
        batch.rt_id,
        "RT Agent",
        null,
        null,
        null,
        "Hari ini",
        null,
        nowStr,
        nowStr,
      ],
    );

    await createCashCollectionIfNeeded(taskId, null, codAmount);
    await logAudit(
      "Sistem Dispatch",
      "CREATE_RT_DELIVERY_TASK",
      `Created RT pickup point task ${taskId} for ${batch.name}.`,
    );
    await refreshData();

    return { success: true, taskId };
  }

  async function assignDeliveryTask(taskId: string, driverId: string) {
    const task = deliveryTasks.find((item) => item.id === taskId);
    const driver = driverProfiles.find((item) => item.id === driverId);
    if (!task)
      return { success: false, error: "Tugas pengiriman tidak ditemukan." };
    if (!driver) return { success: false, error: "KopKurir tidak ditemukan." };

    const nowStr = new Date().toISOString();
    await dbService.run(
      `UPDATE delivery_tasks
       SET driver_id = ?, provider_type = ?, status = ?, courier_contact = ?, eta = ?, updated_at = ?
       WHERE id = ?`,
      [
        driver.id,
        "KOPKURIR",
        "ASSIGNED",
        driver.phone,
        "Hari ini",
        nowStr,
        taskId,
      ],
    );

    const cash = await dbService.getFirst<CashCollection>(
      "SELECT * FROM cash_collections WHERE delivery_task_id = ?",
      [taskId],
    );
    if (cash) {
      await dbService.run(
        "UPDATE cash_collections SET collector_id = ? WHERE id = ?",
        [driver.id, cash.id],
      );
    }

    await logAudit(
      activeUser?.name || "Admin",
      "DRIVER_ASSIGNED",
      `${driver.name} assigned to ${taskId}.`,
    );
    await refreshData();
    return { success: true };
  }

  async function assignManualProvider(
    taskId: string,
    providerName: string,
    trackingNumber: string,
    courierContact: string,
    fee: number,
  ) {
    const task = deliveryTasks.find((item) => item.id === taskId);
    if (!task)
      return { success: false, error: "Tugas pengiriman tidak ditemukan." };

    const nowStr = new Date().toISOString();
    await dbService.run(
      `UPDATE delivery_tasks
       SET driver_id = ?, provider_type = ?, status = ?, manual_provider_name = ?, tracking_number = ?,
           courier_contact = ?, delivery_fee = ?, eta = ?, updated_at = ?
       WHERE id = ?`,
      [
        null,
        "MANUAL",
        "IN_TRANSIT",
        providerName.trim() || "Kurir Manual",
        trackingNumber.trim(),
        courierContact.trim(),
        fee,
        "Menunggu update kurir",
        nowStr,
        taskId,
      ],
    );

    if (task.order_id) {
      await dbService.run(
        "UPDATE orders SET order_status = 'PICKED_UP' WHERE id = ?",
        [task.order_id],
      );
    }

    await logAudit(
      activeUser?.name || "Admin",
      "MANUAL_PROVIDER_ASSIGNED",
      `${providerName || "Kurir Manual"} assigned to ${taskId}, AWB ${trackingNumber || "-"}.`,
    );
    await refreshData();
    return { success: true };
  }

  async function updateDeliveryTaskStatus(
    taskId: string,
    status: DeliveryStatus,
    details: string,
  ) {
    const task = deliveryTasks.find((item) => item.id === taskId);
    if (!task)
      return { success: false, error: "Tugas pengiriman tidak ditemukan." };

    await dbService.run(
      "UPDATE delivery_tasks SET status = ?, updated_at = ? WHERE id = ?",
      [status, new Date().toISOString(), taskId],
    );
    await logAudit(
      activeUser?.name || "KopKurir",
      "DELIVERY_STATUS_CHANGED",
      `${taskId}: ${task.status} -> ${status}. ${details}`,
    );
    await refreshData();
    return { success: true };
  }

  async function acceptDeliveryTask(taskId: string) {
    return updateDeliveryTaskStatus(
      taskId,
      "ACCEPTED",
      "Driver accepted task.",
    );
  }

  async function rejectDeliveryTask(taskId: string, reason: string) {
    const task = deliveryTasks.find((item) => item.id === taskId);
    if (!task)
      return { success: false, error: "Tugas pengiriman tidak ditemukan." };

    await dbService.run(
      "UPDATE delivery_tasks SET status = ?, failed_reason = ?, updated_at = ? WHERE id = ?",
      [
        "REJECTED",
        reason || "Driver menolak tugas",
        new Date().toISOString(),
        taskId,
      ],
    );
    await logAudit(
      activeUser?.name || "KopKurir",
      "TASK_REJECTED",
      `${taskId} rejected. Reason: ${reason || "-"}`,
    );
    await refreshData();
    return { success: true };
  }

  async function confirmDeliveryPickup(taskId: string, packageCount: number) {
    const task = deliveryTasks.find((item) => item.id === taskId);
    if (!task)
      return { success: false, error: "Tugas pengiriman tidak ditemukan." };

    const nowStr = new Date().toISOString();
    await dbService.run(
      "UPDATE delivery_tasks SET status = ?, package_count = ?, updated_at = ? WHERE id = ?",
      [
        "PICKED_UP",
        Math.max(1, packageCount || task.package_count),
        nowStr,
        taskId,
      ],
    );
    await dbService.run(
      `INSERT INTO delivery_proofs (
        id, delivery_task_id, proof_type, proof_value, photo_url, latitude, longitude, confirmed_by_user_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `proof-pickup-${Date.now()}`,
        taskId,
        "QR",
        task.pickup_code,
        null,
        null,
        null,
        activeUser?.id || null,
        nowStr,
      ],
    );

    if (task.order_id) {
      await dbService.run(
        "UPDATE orders SET order_status = 'PICKED_UP' WHERE id = ?",
        [task.order_id],
      );
    } else if (task.rt_batch_id) {
      await dbService.run(
        "UPDATE rt_batches SET status = 'PROCESSING' WHERE id = ?",
        [task.rt_batch_id],
      );
    }

    await logAudit(
      activeUser?.name || "KopKurir",
      "PICKUP_CONFIRMED",
      `${taskId} pickup QR ${task.pickup_code}, packages: ${packageCount || task.package_count}.`,
    );
    await refreshData();
    return { success: true };
  }

  async function startDeliveryTransit(taskId: string) {
    const task = deliveryTasks.find((item) => item.id === taskId);
    if (task?.order_id) {
      await dbService.run(
        "UPDATE orders SET order_status = 'PICKED_UP' WHERE id = ?",
        [task.order_id],
      );
    }
    return updateDeliveryTaskStatus(
      taskId,
      "IN_TRANSIT",
      "Package is now in transit.",
    );
  }

  async function completeDeliveryTask(
    taskId: string,
    proofValue: string,
    collectedAmount: number,
  ) {
    const task = deliveryTasks.find((item) => item.id === taskId);
    if (!task)
      return { success: false, error: "Tugas pengiriman tidak ditemukan." };

    const nowStr = new Date().toISOString();
    const proofType =
      task.delivery_type === "RT_BATCH_DELIVERY" ? "RT_CONFIRMATION" : "PIN";
    await dbService.run(
      "UPDATE delivery_tasks SET status = ?, updated_at = ? WHERE id = ?",
      ["DELIVERED", nowStr, taskId],
    );
    await dbService.run(
      `INSERT INTO delivery_proofs (
        id, delivery_task_id, proof_type, proof_value, photo_url, latitude, longitude, confirmed_by_user_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `proof-delivery-${Date.now()}`,
        taskId,
        proofType,
        proofValue || "CONFIRMED",
        null,
        null,
        null,
        activeUser?.id || null,
        nowStr,
      ],
    );

    const cash = await dbService.getFirst<CashCollection>(
      "SELECT * FROM cash_collections WHERE delivery_task_id = ?",
      [taskId],
    );
    if (cash) {
      const amount = Math.max(0, collectedAmount || 0);
      const cashStatus =
        amount >= cash.expected_amount
          ? "COLLECTED"
          : amount > 0
            ? "SHORT"
            : "PENDING";
      await dbService.run(
        "UPDATE cash_collections SET collected_amount = ?, status = ? WHERE id = ?",
        [amount, cashStatus, cash.id],
      );
    }

    if (task.order_id) {
      const order =
        orders.find((item) => item.id === task.order_id) ||
        (await dbService.getFirst<Order>("SELECT * FROM orders WHERE id = ?", [
          task.order_id,
        ]));
      if (order) {
        const earned = await issueCompletionRewards(order);
        await dbService.run(
          "UPDATE orders SET order_status = 'COMPLETED', payment_status = 'PAID' WHERE id = ?",
          [order.id],
        );
        await logAudit(
          activeUser?.name || "KopKurir",
          "DELIVERY_COMPLETED",
          `${taskId} delivered to ${task.recipient_name}. Points awarded: ${earned}.`,
        );
      }
    } else if (task.rt_batch_id) {
      await dbService.run(
        "UPDATE rt_batches SET status = 'DELIVERED_TO_RT' WHERE id = ?",
        [task.rt_batch_id],
      );
      await dbService.run(
        "UPDATE orders SET order_status = 'DELIVERED_TO_RT' WHERE rt_batch_id = ?",
        [task.rt_batch_id],
      );
      await logAudit(
        activeUser?.name || "KopKurir",
        "RT_BATCH_DELIVERED",
        `${taskId} delivered to RT point with proof ${proofValue || "CONFIRMED"}.`,
      );
    }

    if (task.driver_id) {
      const driver = driverProfiles.find((item) => item.id === task.driver_id);
      if (driver) {
        await dbService.run(
          "UPDATE driver_profiles SET total_completed_deliveries = ? WHERE id = ?",
          [driver.total_completed_deliveries + 1, driver.id],
        );
      }
    }

    await refreshData();
    return { success: true };
  }

  async function failDeliveryTask(taskId: string, reason: string) {
    const task = deliveryTasks.find((item) => item.id === taskId);
    if (!task)
      return { success: false, error: "Tugas pengiriman tidak ditemukan." };

    await dbService.run(
      "UPDATE delivery_tasks SET status = ?, failed_reason = ?, updated_at = ? WHERE id = ?",
      [
        "FAILED",
        reason || "Alamat tidak ditemukan / penerima tidak dapat dihubungi",
        new Date().toISOString(),
        taskId,
      ],
    );
    await logAudit(
      activeUser?.name || "KopKurir",
      "FAILED_DELIVERY",
      `${taskId} failed. Reason: ${reason || "-"}`,
    );
    await refreshData();
    return { success: true };
  }

  const handleSwitchRole = async (userId: string, role: AppRole, name: string) => {
    let user = allUsers.find((u) => u.id === userId);
    if (!user) {
      try {
        await dbService.run(
          `INSERT OR IGNORE INTO users (id, name, phone, role, rt_id, cooperative_id, points, referral_code, pin)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            name,
            userId === 'user-slamet' ? '089988776655' : '081234567890',
            role,
            role === 'USER' ? 'RT 03' : null,
            'tenant-1',
            0,
            `${userId.toUpperCase()}AJAK`,
            '123456',
          ],
        );
        await refreshData();
        user = {
          id: userId,
          name: name,
          phone: userId === 'user-slamet' ? '089988776655' : '081234567890',
          role: role,
          rt_id: role === 'USER' ? 'RT 03' : null,
          cooperative_id: 'tenant-1',
          points: 0,
          referral_code: `${userId.toUpperCase()}AJAK`,
          referred_by: null,
          pin: '123456',
        };
      } catch (err) {
        console.error("Failed to auto-insert switcher user:", err);
      }
    }

    if (user) {
      setActiveUserState(user);
      setActiveRole(role);
      Alert.alert("Identitas Berganti", `Masuk sebagai: ${name} (${role})`);
    } else {
      Alert.alert("Gagal", `Identitas ${name} tidak ditemukan di database.`);
    }
  };

  const registerCitizen = async (input: RegisterCitizenInput) => {
    const fullName = input.fullName.trim();
    const phone = normalizePhone(input.phone);
    const nik = input.nik.replace(/\D/g, "");
    const rtNumber = input.rt
      ? input.rt.replace(/\D/g, "").padStart(2, "0").slice(-2)
      : "00";
    const rwNumber = input.rw.replace(/\D/g, "").padStart(2, "0").slice(-2);
    const address = input.address.trim();
    const cooperativeId = input.cooperativeId || "tenant-1";
    const cleanReferralCode = input.referralCode?.trim().toUpperCase() || null;
    const pin = input.pin.replace(/\D/g, "");

    if (fullName.length < 3) {
      return { success: false, error: "Nama sesuai KTP minimal 3 karakter." };
    }

    if (nik.length !== 16) {
      return { success: false, error: "NIK KTP harus 16 digit." };
    }

    if (phone.length < 10 || phone.length > 13 || !phone.startsWith("0")) {
      return {
        success: false,
        error: "Nomor HP harus memakai format Indonesia yang valid.",
      };
    }

    if (!address || !rwNumber) {
      return { success: false, error: "Alamat dan RW wajib diisi." };
    }

    if (input.otp.trim() !== REGISTRATION_DEMO_OTP) {
      return { success: false, error: "Kode OTP tidak sesuai." };
    }

    if (!/^\d{6}$/.test(pin)) {
      return { success: false, error: "PIN harus 6 digit angka." };
    }

    try {
      const duplicatePhone = await dbService.getFirst<User>(
        "SELECT * FROM users WHERE phone = ?",
        [phone],
      );
      if (duplicatePhone) {
        return {
          success: false,
          error: "Nomor HP sudah terdaftar. Pilih akun dari menu pengguna.",
        };
      }

      const cooperative = await dbService.getFirst(
        "SELECT * FROM tenants WHERE id = ?",
        [cooperativeId],
      );
      if (!cooperative) {
        return { success: false, error: "Koperasi tujuan tidak ditemukan." };
      }

      let referredBy: string | null = null;
      if (cleanReferralCode) {
        const referrer = allUsers.find(
          (u) => u.referral_code === cleanReferralCode,
        );
        if (!referrer) {
          return { success: false, error: "Kode KopAjak tidak ditemukan." };
        }
        referredBy = cleanReferralCode;
      }

      const nowStr = new Date().toISOString();
      const userId = `user-${phone.slice(-4)}-${Date.now()}`;
      const referralCode = buildReferralCode(fullName, allUsers);
      const memberId = buildMemberId(rtNumber);
      const cardToken = `KOPDES-${memberId}-${Math.floor(Math.random() * 9000 + 1000)}`;
      const rtId = `RT ${rtNumber}`;
      const fullAddress = `${address}, RT ${rtNumber}/RW ${rwNumber}`;

      const newUser: User = {
        id: userId,
        name: fullName,
        phone,
        role: "USER",
        rt_id: rtId,
        cooperative_id: cooperativeId,
        points: 0,
        referral_code: referralCode,
        referred_by: referredBy,
        pin,
        nik_masked: maskNik(nik),
        address: fullAddress,
        member_id: memberId,
        card_token: cardToken,
        account_status: "ACTIVE",
        created_at: nowStr,
      };

      await dbService.run(
        `INSERT INTO users (
          id, name, phone, role, rt_id, cooperative_id, points, referral_code, referred_by, pin,
          nik_masked, address, member_id, card_token, account_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUser.id,
          newUser.name,
          newUser.phone,
          newUser.role,
          newUser.rt_id,
          newUser.cooperative_id,
          newUser.points,
          newUser.referral_code,
          newUser.referred_by,
          newUser.pin,
          newUser.nik_masked,
          newUser.address,
          newUser.member_id,
          newUser.card_token,
          newUser.account_status,
          newUser.created_at,
        ],
      );

      await logAudit(
        "Sistem Registrasi",
        "USER_REGISTERED",
        `${fullName} aktif sebagai anggota ${memberId} di ${rtId}. NIK tersimpan sebagai ${newUser.nik_masked}.`,
      );

      setActiveRoleState("USER");
      setActiveUserState(newUser);
      setCart([]);
      await refreshData();

      return { success: true, user: newUser };
    } catch (err: any) {
      console.error("Registration failed:", err);
      return { success: false, error: err.message || "Registrasi gagal." };
    }
  };

  // Checkout
  const checkout = async (
    fulfillment: "PICKUP_AT_COOP" | "DELIVERY_TO_HOME" | "RT_PICKUP_POINT",
    channel: "SELF_ORDER" | "RT_ASSISTED" | "CARD_PURCHASE" | "B2B_AGENT",
    pointsRedeemed: number,
    rtBatchId: string | null,
    overrideUserId?: string,
    isQris?: boolean,
  ) => {
    const targetUserId = overrideUserId || activeUser?.id;
    if (!targetUserId)
      return { success: false, error: "No active user found." };
    if (cart.length === 0) return { success: false, error: "Cart is empty." };

    try {
      // Fetch target user's updated profile to check points
      const buyer = allUsers.find((u) => u.id === targetUserId);
      if (!buyer) return { success: false, error: "Buyer not found." };

      if (pointsRedeemed > buyer.points) {
        return { success: false, error: "Insufficient points." };
      }

      // 1. Calculate values
      let subtotal = 0;
      for (const item of cart) {
        // Validate stock
        const p = products.find((prod) => prod.id === item.product.id);
        if (!p || p.stock < item.quantity) {
          return {
            success: false,
            error: `Stok produk ${item.product.name} tidak mencukupi.`,
          };
        }
        subtotal += item.product.price * item.quantity;
      }

      // Points discount cap (20% of subtotal as per rules)
      const maxDiscountByPoints = Math.floor(subtotal * 0.2);
      // Let's say 1 point = Rp1,000 discount (or standard 1:1 format, let's use 1 point = Rp100 discount, or simply 1 point = Rp1,000)
      // Let's use 1 point = Rp1,000 discount for clear and visible demo values!
      const discount = Math.min(pointsRedeemed, maxDiscountByPoints);
      const pointsUsed = discount;

      // Check if any product is from a different cooperative (cross-cooperative shopping)
      let logisticsSurcharge = 0;
      for (const item of cart) {
        const prod = products.find((p) => p.id === item.product.id);
        if (prod && prod.cooperative_id !== buyer.cooperative_id) {
          if (
            prod.cooperative_id === "tenant-2" ||
            prod.cooperative_id === "tenant-3"
          ) {
            logisticsSurcharge = Math.max(logisticsSurcharge, 5000);
          } else if (prod.cooperative_id === "tenant-4") {
            logisticsSurcharge = Math.max(logisticsSurcharge, 15000);
          } else if (
            prod.cooperative_id === "tenant-5" ||
            prod.cooperative_id === "tenant-6"
          ) {
            logisticsSurcharge = Math.max(logisticsSurcharge, 25000);
          } else {
            logisticsSurcharge = Math.max(logisticsSurcharge, 5000);
          }
        }
      }
      const deliveryFee =
        fulfillment === "DELIVERY_TO_HOME"
          ? Math.max(logisticsSurcharge, 7000)
          : logisticsSurcharge;
      const total = subtotal - discount + deliveryFee;

      const orderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const nowStr = new Date().toISOString();

      // Determine initial status based on payment channel
      // Card purchase or RT assisted is often collected in cash at pickup, but since it's verified we mark it PAID on pickup, or UNPAID.
      // Let's mark card purchase and cash-payment channel as UNPAID initially, which updates to PAID on settlement, or PAID if paid upfront.
      // Let's mark it UNPAID, or PAID if simulation QRIS is used. Let's make it UNPAID to show the RT Settlement flow!
      const isPaidUpfront =
        isQris || (channel === "SELF_ORDER" && fulfillment === "PICKUP_AT_COOP");
      const paymentStatus = isPaidUpfront ? "PAID" : "UNPAID";
      const orderStatus = isPaidUpfront ? "CONFIRMED" : "PENDING_PAYMENT";

      // 2. Insert Order
      await dbService.run(
        `INSERT INTO orders (id, user_id, rt_batch_id, channel, fulfillment, subtotal, discount, points_redeemed, total, payment_status, order_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          targetUserId,
          rtBatchId,
          channel,
          fulfillment,
          subtotal,
          discount,
          pointsUsed,
          total,
          paymentStatus,
          orderStatus,
          nowStr,
        ],
      );

      // 3. Insert Order Items and Update Stock
      for (const item of cart) {
        const itemId = `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        // Insert order item
        await dbService.run(
          `INSERT INTO order_items (id, order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            orderId,
            item.product.id,
            item.product.name,
            item.product.price,
            item.quantity,
          ],
        );

        // Update product stock
        const newStock = item.product.stock - item.quantity;
        await dbService.run(`UPDATE products SET stock = ? WHERE id = ?`, [
          newStock,
          item.product.id,
        ]);
      }

      // 4. Update user points balance (subtract redeemed points)
      if (pointsUsed > 0) {
        const newUserPoints = buyer.points - pointsUsed;
        await dbService.run(`UPDATE users SET points = ? WHERE id = ?`, [
          newUserPoints,
          targetUserId,
        ]);

        // Log point transaction
        await dbService.run(
          `INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `pt-${Date.now()}-red`,
            targetUserId,
            "REDEEM",
            pointsUsed,
            "ORDER",
            orderId,
            nowStr,
          ],
        );
      }

      // 5. Update batch totals if order is linked to a batch
      if (rtBatchId) {
        const batch = batches.find((b) => b.id === rtBatchId);
        if (batch) {
          const newOrdersCount = batch.total_orders + 1;
          const newGmv = batch.total_gmv + total;
          await dbService.run(
            `UPDATE rt_batches SET total_orders = ?, total_gmv = ? WHERE id = ?`,
            [newOrdersCount, newGmv, rtBatchId],
          );
        }
      }

      // 6. Audit log
      const actorName = activeUser?.name || "System";
      const channelDesc =
        channel === "CARD_PURCHASE"
          ? "Kartu Kopdes"
          : channel === "RT_ASSISTED"
            ? "RT-Assisted"
            : "Self-Order";
      await logAudit(
        `${actorName} (${activeRole})`,
        "CHECKOUT",
        `Fulfillment: ${fulfillment}, Channel: ${channelDesc}, Total: Rp${total.toLocaleString("id-ID")}, Items: ${cart.length} SKUs for User: ${buyer.name}`,
      );

      if (fulfillment === "DELIVERY_TO_HOME") {
        await createDeliveryTaskFromOrder(orderId);
      }

      // Clear cart from database
      await dbService.run(`DELETE FROM cart_items WHERE user_id = ?`, [
        activeUser?.id || targetUserId,
      ]);
      setCart([]);
      await refreshData();
      return { success: true, orderId };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || "Checkout failed." };
    }
  };

  // RT Batch Management
  const createBatch = async (
    name: string,
    deadline: string,
    pickupPoint: string,
  ): Promise<string> => {
    const id = `batch-${Date.now()}`;
    const cleanDeadline = new Date(deadline).toISOString();
    await dbService.run(
      "INSERT INTO rt_batches (id, rt_id, name, deadline, pickup_point, status, total_orders, total_gmv) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        activeUser?.rt_id || "RT 03",
        name,
        cleanDeadline,
        pickupPoint,
        "OPEN",
        0,
        0,
      ],
    );

    await logAudit(
      `${activeUser?.name} (RT Agent)`,
      "CREATE_BATCH",
      `Created batch ${name} for ${activeUser?.rt_id || "RT 03"}, pickup: ${pickupPoint}`,
    );

    await refreshData();
    return id;
  };

  const lockBatch = async (batchId: string) => {
    await dbService.run(
      "UPDATE rt_batches SET status = 'LOCKED' WHERE id = ?",
      [batchId],
    );
    await logAudit(
      `${activeUser?.name} (RT Agent)`,
      "LOCK_BATCH",
      `Locked batch ${batchId}`,
    );
    await refreshData();
  };

  const submitBatch = async (batchId: string) => {
    // Lock and submit
    await dbService.run(
      "UPDATE rt_batches SET status = 'SUBMITTED' WHERE id = ?",
      [batchId],
    );

    // Get batch GMV to create Settlement
    const batch = batches.find((b) => b.id === batchId);
    if (batch) {
      // Create pending settlement
      const settlementId = `set-${Date.now()}`;
      await dbService.run(
        "INSERT INTO settlements (id, rt_batch_id, amount_expected, amount_submitted, status, submitted_at, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [settlementId, batchId, batch.total_gmv, 0, "PENDING", null, null],
      );
    }

    // Update all UNPAID orders in this batch to paymentStatus = 'WAITING_VERIFICATION' and orderStatus = 'CONFIRMED'
    await dbService.run(
      "UPDATE orders SET order_status = 'CONFIRMED' WHERE rt_batch_id = ? AND order_status = 'PENDING_PAYMENT'",
      [batchId],
    );

    await logAudit(
      `${activeUser?.name} (RT Agent)`,
      "SUBMIT_BATCH",
      `Submitted batch ${batchId} for fulfillment. Created settlement.`,
    );
    await createDeliveryTaskFromBatch(batchId);
    await refreshData();
  };

  const updateUserField = async (userId: string, field: string, value: any) => {
    const allowed = ["is_pickup_point", "points"];
    if (!allowed.includes(field)) throw new Error("Unsupported field");
    await dbService.run(`UPDATE users SET ${field} = ? WHERE id = ?`, [
      value,
      userId,
    ]);
    await refreshData();
  };

  const completeOrder = async (orderId: string) => {
    const order =
      orders.find((o) => o.id === orderId) ||
      (await dbService.getFirst<Order>("SELECT * FROM orders WHERE id = ?", [
        orderId,
      ]));
    if (!order) return;

    await dbService.run(
      "UPDATE orders SET order_status = 'COMPLETED', payment_status = 'PAID' WHERE id = ?",
      [orderId],
    );

    const orderItems = await dbService.getAll<OrderItem>(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId],
    );

    let basePoints = Math.floor(order.total / 10000);

    let containsLocal = false;
    for (const item of orderItems) {
      const p = products.find((prod) => prod.id === item.product_id);
      if (p && p.is_local === 1) {
        containsLocal = true;
      }
    }

    if (containsLocal) {
      basePoints = basePoints * 2;
    }

    const prevOrders = orders.filter(
      (o) => o.user_id === order.user_id && o.order_status === "COMPLETED",
    );
    const firstOrderBonus = prevOrders.length === 0 ? 100 : 0;

    const totalEarnedPoints = basePoints + firstOrderBonus;

    if (totalEarnedPoints > 0) {
      const user = allUsers.find((u) => u.id === order.user_id);
      if (user) {
        const newPoints = user.points + totalEarnedPoints;
        await dbService.run("UPDATE users SET points = ? WHERE id = ?", [
          newPoints,
          order.user_id,
        ]);

        await dbService.run(
          `INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `pt-${Date.now()}-earn`,
            order.user_id,
            "EARN",
            totalEarnedPoints,
            "ORDER",
            orderId,
            new Date().toISOString(),
          ],
        );
      }
    }

    const buyer = allUsers.find((u) => u.id === order.user_id);
    if (buyer && buyer.referred_by && prevOrders.length === 0) {
      const referrer = allUsers.find(
        (u) => u.referral_code === buyer.referred_by,
      );
      if (referrer) {
        // Award points to Referrer
        const newRefPoints = referrer.points + 10000;
        await dbService.run("UPDATE users SET points = ? WHERE id = ?", [
          newRefPoints,
          referrer.id,
        ]);

        await dbService.run(
          `INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `pt-${Date.now()}-ref`,
            referrer.id,
            "EARN",
            10000,
            "REFERRAL",
            orderId,
            new Date().toISOString(),
          ],
        );

        // Award points to Buyer (the newly registered user)
        const newBuyerPoints = buyer.points + 10000;
        await dbService.run("UPDATE users SET points = ? WHERE id = ?", [
          newBuyerPoints,
          buyer.id,
        ]);

        await dbService.run(
          `INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `pt-${Date.now()}-buyer-ref`,
            buyer.id,
            "EARN",
            10000,
            "REFERRAL",
            orderId,
            new Date().toISOString(),
          ],
        );
      }
    }

    await logAudit(
      "Sistem",
      "COMPLETE_ORDER",
      `Confirmed resident pickup/delivery & payment for order ${orderId}. Points awarded: +${totalEarnedPoints}.`,
    );

    await refreshData();
  };

  const markItemPickedUp = async (orderId: string) => {
    await completeOrder(orderId);
  };

  const submitSettlement = async (
    settlementId: string,
    amountSubmitted: number,
  ) => {
    await dbService.run(
      "UPDATE settlements SET status = 'SUBMITTED', amount_submitted = ?, submitted_at = ? WHERE id = ?",
      [amountSubmitted, new Date().toISOString(), settlementId],
    );

    await logAudit(
      `${activeUser?.name} (RT Agent)`,
      "SUBMIT_SETTLEMENT",
      `Submitted settlement of Rp${amountSubmitted.toLocaleString("id-ID")} for settlement ID ${settlementId}`,
    );
    await refreshData();
  };

  // Admin Koperasi features
  const updateProductStock = async (productId: string, newStock: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    await dbService.run("UPDATE products SET stock = ? WHERE id = ?", [
      newStock,
      productId,
    ]);

    await logAudit(
      `${activeUser?.name} (Admin)`,
      "UPDATE_STOCK",
      `Updated ${product.name} stock from ${product.stock} to ${newStock}`,
    );
    await refreshData();
  };

  const createOrUpdateProduct = async (productData: Partial<Product>) => {
    const isNew = !productData.id;
    const nowId = productData.id || `prod-${Date.now()}`;
    const name = productData.name || "";
    const price = productData.price || 0;
    const cost_price = productData.cost_price || 0;
    const stock = productData.stock || 0;
    const unit = productData.unit || "pcs";
    const is_local = productData.is_local || 0;
    const image_url =
      productData.image_url ||
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400";

    if (isNew) {
      await dbService.run(
        "INSERT INTO products (id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [nowId, name, price, cost_price, stock, unit, is_local, image_url],
      );
      await logAudit(
        `${activeUser?.name} (Admin)`,
        "CREATE_PRODUCT",
        `Added new product ${name}`,
      );
    } else {
      await dbService.run(
        "UPDATE products SET name = ?, price = ?, cost_price = ?, stock = ?, unit = ?, is_local = ?, image_url = ? WHERE id = ?",
        [name, price, cost_price, stock, unit, is_local, image_url, nowId],
      );
      await logAudit(
        `${activeUser?.name} (Admin)`,
        "UPDATE_PRODUCT",
        `Updated product ${name} (ID: ${nowId})`,
      );
    }
    await refreshData();
  };

  const processBatchFulfillment = async (
    batchId: string,
    newStatus: "PROCESSING" | "DELIVERED_TO_RT" | "COMPLETED",
  ) => {
    // Update batch status
    await dbService.run("UPDATE rt_batches SET status = ? WHERE id = ?", [
      newStatus,
      batchId,
    ]);

    // Map new status to order statuses
    const targetOrderStatus =
      newStatus === "PROCESSING"
        ? "PACKED"
        : newStatus === "DELIVERED_TO_RT"
          ? "DELIVERED_TO_RT"
          : "COMPLETED";

    // Update all orders linked to this batch
    await dbService.run(
      "UPDATE orders SET order_status = ? WHERE rt_batch_id = ?",
      [targetOrderStatus, batchId],
    );

    await logAudit(
      `${activeUser?.name} (Admin)`,
      "FULFILL_BATCH",
      `Updated batch ${batchId} status to ${newStatus}. All batch orders set to ${targetOrderStatus}`,
    );
    await refreshData();
  };

  const verifySettlement = async (
    settlementId: string,
    isVerified: boolean,
  ) => {
    const settlement = settlements.find((s) => s.id === settlementId);
    if (!settlement) return;

    const newStatus = isVerified ? "VERIFIED" : "DISPUTED";
    await dbService.run(
      "UPDATE settlements SET status = ?, verified_at = ? WHERE id = ?",
      [newStatus, new Date().toISOString(), settlementId],
    );

    await logAudit(
      `${activeUser?.name} (Admin)`,
      isVerified ? "VERIFY_SETTLEMENT" : "DISPUTE_SETTLEMENT",
      `${isVerified ? "Verified" : "Disputed"} settlement ID ${settlementId} from RT. Expected: Rp${settlement.amount_expected}, Submitted: Rp${settlement.amount_submitted}`,
    );
    await refreshData();
  };

  // Referral
  const applyReferralCode = async (code: string) => {
    if (!activeUser) return { success: false, error: "No active user." };
    const cleanCode = code.trim().toUpperCase();

    if (cleanCode === activeUser.referral_code) {
      return {
        success: false,
        error: "Tidak bisa menggunakan kode referral sendiri.",
      };
    }

    // Verify referrer code exists
    const referrer = allUsers.find((u) => u.referral_code === cleanCode);
    if (!referrer) {
      return {
        success: false,
        error: "Kode referral tidak valid / tidak ditemukan.",
      };
    }

    try {
      await dbService.run("UPDATE users SET referred_by = ? WHERE id = ?", [
        cleanCode,
        activeUser.id,
      ]);

      await logAudit(
        activeUser.name,
        "APPLY_REFERRAL",
        `Applied referral code ${cleanCode} from ${referrer.name}`,
      );
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Gagal menerapkan referral.",
      };
    }
  };

  const submitRFQ = async (
    supplierId: string,
    productName: string,
    price: number,
    qty: number,
    total: number,
  ) => {
    try {
      const id = `po-${Date.now()}`;
      await dbService.run(
        `INSERT INTO purchase_orders (id, supplier_id, product_name, price, quantity, total, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          supplierId,
          productName,
          price,
          qty,
          total,
          "PENDING",
          new Date().toISOString(),
        ],
      );

      const supplier = suppliers.find((s) => s.id === supplierId);
      await logAudit(
        activeUser?.name || "Admin",
        "RFQ_AWARDED",
        `Issued PO ${id} to ${supplier?.name || "Supplier"} for ${qty}x ${productName} (Total: Rp${total.toLocaleString("id-ID")})`,
      );
      await refreshData();
    } catch (err) {
      console.error("Failed to submit RFQ:", err);
    }
  };

  const receiveGoods = async (poId: string, receivedQty: number) => {
    try {
      const po =
        purchaseOrders.find((p) => p.id === poId) ||
        (await dbService.getFirst<PurchaseOrder>(
          "SELECT * FROM purchase_orders WHERE id = ?",
          [poId],
        ));
      if (!po) return;

      await dbService.run(
        `UPDATE purchase_orders SET status = 'RECEIVED' WHERE id = ?`,
        [poId],
      );

      const coopId = activeUser?.cooperative_id || "tenant-1";
      const prod = products.find(
        (p) =>
          p.name.toLowerCase() === po.product_name.toLowerCase() &&
          p.cooperative_id === coopId,
      );

      if (prod) {
        const newStock = prod.stock + receivedQty;
        await dbService.run(`UPDATE products SET stock = ? WHERE id = ?`, [
          newStock,
          prod.id,
        ]);
        await logAudit(
          activeUser?.name || "Admin",
          "GOODS_RECEIVED",
          `Received ${receivedQty} units for PO ${poId}. Stock for ${prod.name} updated to ${newStock}.`,
        );
      } else {
        const prodId = `prod-${Date.now()}`;
        await dbService.run(
          `INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            prodId,
            coopId,
            po.product_name,
            Math.round(po.price * 1.2),
            po.price,
            receivedQty,
            "pcs",
            0,
            "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
          ],
        );
        await logAudit(
          activeUser?.name || "Admin",
          "GOODS_RECEIVED",
          `Received ${receivedQty} units for PO ${poId}. Registered new product ${po.product_name} in catalog.`,
        );
      }
      await refreshData();
    } catch (err) {
      console.error("Failed to receive goods:", err);
    }
  };

  const createKopRequest = async (
    userId: string,
    productName: string,
    qty: number,
  ) => {
    try {
      const id = `req-${Date.now()}`;
      await dbService.run(
        `INSERT INTO kop_requests (id, user_id, product_name, quantity, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, userId, productName, qty, "PENDING", new Date().toISOString()],
      );

      const user = allUsers.find((u) => u.id === userId);
      await logAudit(
        activeUser?.name || "Admin",
        "KOP_REQUEST_CREATED",
        `Recorded demand request from ${user?.name || "Warga"} for ${qty}x ${productName}`,
      );
      await refreshData();
    } catch (err) {
      console.error("Failed to create KopRequest:", err);
    }
  };

  const resolveKopRequest = async (requestId: string) => {
    try {
      await dbService.run(
        `UPDATE kop_requests SET status = 'NOTIFIED' WHERE id = ?`,
        [requestId],
      );

      const req = kopRequests.find((r) => r.id === requestId);
      const user = allUsers.find((u) => u.id === req?.user_id);
      await logAudit(
        activeUser?.name || "Admin",
        "KOP_REQUEST_RESOLVED",
        `Notified ${user?.name || "Warga"} that requested product "${req?.product_name}" is now available.`,
      );
      await refreshData();
    } catch (err) {
      console.error("Failed to resolve KopRequest:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        activeUser,
        allUsers,
        products,
        batches,
        orders,
        driverProfiles,
        deliveryTasks,
        deliveryProofs,
        cashCollections,
        cart,
        settlements,
        auditLogs,
        suppliers,
        supplierProducts,
        purchaseOrders,
        kopRequests,
        isLoading,

        setActiveRole,
        setActiveUser,
        login,
        logout,
        refreshData,
        resetAllData,

        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,

        checkout,
        createBatch,
        lockBatch,
        submitBatch,
        markItemPickedUp,
        completeOrder,
        submitSettlement,

        updateProductStock,
        createOrUpdateProduct,
        processBatchFulfillment,
        verifySettlement,
        createDeliveryTaskFromOrder,
        createDeliveryTaskFromBatch,
        assignDeliveryTask,
        assignManualProvider,
        acceptDeliveryTask,
        rejectDeliveryTask,
        confirmDeliveryPickup,
        startDeliveryTransit,
        completeDeliveryTask,
        failDeliveryTask,
        handleSwitchRole,
        registerCitizen,
        applyReferralCode,
        updateUserField,
        submitRFQ,
        receiveGoods,
        createKopRequest,
        resolveKopRequest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
