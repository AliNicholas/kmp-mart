import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dbService, User, Product, RTBatch, Order, OrderItem, PointTransaction, Settlement, AuditLog } from '@/utils/db';
import { Platform } from 'react-native';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  activeRole: 'USER' | 'RT_AGENT' | 'ADMIN';
  activeUser: User | null;
  allUsers: User[];
  products: Product[];
  batches: RTBatch[];
  orders: Order[];
  cart: CartItem[];
  settlements: Settlement[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  
  // Setters/Refreshers
  setActiveRole: (role: 'USER' | 'RT_AGENT' | 'ADMIN') => void;
  setActiveUser: (user: User) => void;
  refreshData: () => Promise<void>;
  resetAllData: () => Promise<void>;
  
  // Cart Actions
  addToCart: (product: Product, qty?: number) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Checkout & Order Actions
  checkout: (
    fulfillment: 'PICKUP_AT_COOP' | 'DELIVERY_TO_HOME' | 'RT_PICKUP_POINT',
    channel: 'SELF_ORDER' | 'RT_ASSISTED' | 'CARD_PURCHASE',
    pointsRedeemed: number,
    rtBatchId: string | null,
    overrideUserId?: string // used for assisted checkout
  ) => Promise<{ success: boolean; error?: string; orderId?: string }>;
  
  // RT Batch Actions
  createBatch: (name: string, deadline: string, pickupPoint: string) => Promise<string>;
  lockBatch: (batchId: string) => Promise<void>;
  submitBatch: (batchId: string) => Promise<void>;
  markItemPickedUp: (orderId: string) => Promise<void>;
  submitSettlement: (settlementId: string, amountSubmitted: number) => Promise<void>;
  
  // Admin Actions
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  createOrUpdateProduct: (product: Partial<Product>) => Promise<void>;
  processBatchFulfillment: (batchId: string, newStatus: 'PROCESSING' | 'DELIVERED_TO_RT' | 'COMPLETED') => Promise<void>;
  verifySettlement: (settlementId: string, isVerified: boolean) => Promise<void>;
  
  // Referral
  applyReferralCode: (code: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeRole, setActiveRoleState] = useState<'USER' | 'RT_AGENT' | 'ADMIN'>('USER');
  const [activeUser, setActiveUserState] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<RTBatch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
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
  }, []);

  // Update activeUser automatically when role changes
  useEffect(() => {
    if (allUsers.length > 0) {
      if (activeRole === 'USER') {
        const dinda = allUsers.find(u => u.id === 'user-dinda') || allUsers[0];
        setActiveUserState(dinda || null);
      } else if (activeRole === 'RT_AGENT') {
        const budi = allUsers.find(u => u.id === 'user-budi') || allUsers[0];
        setActiveUserState(budi || null);
      } else if (activeRole === 'ADMIN') {
        const arif = allUsers.find(u => u.id === 'user-arif') || allUsers[0];
        setActiveUserState(arif || null);
      }
    }
  }, [activeRole, allUsers]);

  // Load user's cart from SQLite when activeUser changes
  useEffect(() => {
    const loadCart = async () => {
      if (!activeUser) {
        setCart([]);
        return;
      }
      try {
        const cartData = await dbService.getAll<any>(
          `SELECT ci.quantity, p.id as product_id, p.name, p.price, p.cost_price, p.stock, p.unit, p.is_local, p.image_url 
           FROM cart_items ci
           JOIN products p ON ci.product_id = p.id
           WHERE ci.user_id = ?`,
          [activeUser.id]
        );
        const cartItems: CartItem[] = cartData.map((item: any) => ({
          product: {
            id: item.product_id,
            name: item.name,
            price: item.price,
            cost_price: item.cost_price,
            stock: item.stock,
            unit: item.unit,
            is_local: item.is_local,
            image_url: item.image_url
          },
          quantity: item.quantity
        }));
        setCart(cartItems);
      } catch (err) {
        console.error("Failed to load user cart:", err);
      }
    };
    loadCart();
  }, [activeUser]);

  const refreshData = async () => {
    try {
      // 1. Fetch Users
      const usersData = await dbService.getAll<User>('SELECT * FROM users');
      setAllUsers(usersData);

      // Keep activeUser in sync with database (e.g. updated points balance)
      if (activeUser) {
        const updatedMe = usersData.find(u => u.id === activeUser.id);
        if (updatedMe) setActiveUserState(updatedMe);
      }

      // 2. Fetch Products
      const productsData = await dbService.getAll<Product>('SELECT * FROM products');
      setProducts(productsData);

      // 3. Fetch Batches
      const batchesData = await dbService.getAll<RTBatch>('SELECT * FROM rt_batches ORDER BY deadline DESC');
      setBatches(batchesData);

      // 4. Fetch Orders
      const ordersData = await dbService.getAll<Order>('SELECT * FROM orders ORDER BY created_at DESC');
      setOrders(ordersData);

      // 5. Fetch Settlements
      const settlementsData = await dbService.getAll<Settlement>('SELECT * FROM settlements');
      setSettlements(settlementsData);

      // 6. Fetch Audit Logs
      const logsData = await dbService.getAll<AuditLog>('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50');
      setAuditLogs(logsData);
    } catch (err) {
      console.error("Failed to query database:", err);
    }
  };

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

  const setActiveRole = (role: 'USER' | 'RT_AGENT' | 'ADMIN') => {
    setActiveRoleState(role);
    setCart([]); // Clear cart when switching roles
  };

  const setActiveUser = (user: User) => {
    setActiveUserState(user);
    setCart([]);
  };

  // Cart operations
  const addToCart = async (product: Product, qty: number = 1) => {
    if (!activeUser) return;
    try {
      const existing = cart.find(item => item.product.id === product.id);
      const targetQty = existing 
        ? Math.min(existing.quantity + qty, product.stock)
        : Math.min(qty, product.stock);

      if (targetQty <= 0) return;

      await dbService.run(
        `INSERT OR REPLACE INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)`,
        [activeUser.id, product.id, targetQty]
      );
      
      setCart(prev => {
        const idx = prev.findIndex(item => item.product.id === product.id);
        if (idx !== -1) {
          return prev.map(item => item.product.id === product.id ? { ...item, quantity: targetQty } : item);
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
      const item = cart.find(i => i.product.id === productId);
      if (!item) return;
      const targetQty = Math.max(1, Math.min(qty, item.product.stock));

      await dbService.run(
        `UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [targetQty, activeUser.id, productId]
      );

      setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: targetQty } : i));
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!activeUser) return;
    try {
      await dbService.run(
        `DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`,
        [activeUser.id, productId]
      );
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  const clearCart = async () => {
    if (!activeUser) return;
    try {
      await dbService.run(
        `DELETE FROM cart_items WHERE user_id = ?`,
        [activeUser.id]
      );
      setCart([]);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  // Log audit action
  const logAudit = async (actor: string, action: string, details: string) => {
    const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await dbService.run(
      'INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, actor, action, details, new Date().toISOString()]
    );
  };

  // Checkout
  const checkout = async (
    fulfillment: 'PICKUP_AT_COOP' | 'DELIVERY_TO_HOME' | 'RT_PICKUP_POINT',
    channel: 'SELF_ORDER' | 'RT_ASSISTED' | 'CARD_PURCHASE',
    pointsRedeemed: number,
    rtBatchId: string | null,
    overrideUserId?: string
  ) => {
    const targetUserId = overrideUserId || activeUser?.id;
    if (!targetUserId) return { success: false, error: 'No active user found.' };
    if (cart.length === 0) return { success: false, error: 'Cart is empty.' };

    try {
      // Fetch target user's updated profile to check points
      const buyer = allUsers.find(u => u.id === targetUserId);
      if (!buyer) return { success: false, error: 'Buyer not found.' };

      if (pointsRedeemed > buyer.points) {
        return { success: false, error: 'Insufficient points.' };
      }

      // 1. Calculate values
      let subtotal = 0;
      for (const item of cart) {
        // Validate stock
        const p = products.find(prod => prod.id === item.product.id);
        if (!p || p.stock < item.quantity) {
          return { success: false, error: `Stok produk ${item.product.name} tidak mencukupi.` };
        }
        subtotal += item.product.price * item.quantity;
      }

      // Points discount cap (20% of subtotal as per rules)
      const maxDiscountByPoints = Math.floor(subtotal * 0.20);
      // Let's say 1 point = Rp1,000 discount (or standard 1:1 format, let's use 1 point = Rp100 discount, or simply 1 point = Rp1,000)
      // Let's use 1 point = Rp1,000 discount for clear and visible demo values!
      const discount = Math.min(pointsRedeemed * 1000, maxDiscountByPoints);
      const pointsUsed = Math.min(pointsRedeemed, Math.floor(discount / 1000));
      const total = subtotal - discount;

      const orderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const nowStr = new Date().toISOString();

      // Determine initial status based on payment channel
      // Card purchase or RT assisted is often collected in cash at pickup, but since it's verified we mark it PAID on pickup, or UNPAID.
      // Let's mark card purchase and cash-payment channel as UNPAID initially, which updates to PAID on settlement, or PAID if paid upfront.
      // Let's mark it UNPAID, or PAID if simulation QRIS is used. Let's make it UNPAID to show the RT Settlement flow!
      const isPaidUpfront = channel === 'SELF_ORDER' && fulfillment === 'PICKUP_AT_COOP'; 
      const paymentStatus = isPaidUpfront ? 'PAID' : 'UNPAID';
      const orderStatus = isPaidUpfront ? 'CONFIRMED' : 'PENDING_PAYMENT';

      // 2. Insert Order
      await dbService.run(
        `INSERT INTO orders (id, user_id, rt_batch_id, channel, fulfillment, subtotal, discount, points_redeemed, total, payment_status, order_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, targetUserId, rtBatchId, channel, fulfillment, subtotal, discount, pointsUsed, total, paymentStatus, orderStatus, nowStr]
      );

      // 3. Insert Order Items and Update Stock
      for (const item of cart) {
        const itemId = `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        // Insert order item
        await dbService.run(
          `INSERT INTO order_items (id, order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
          [itemId, orderId, item.product.id, item.product.name, item.product.price, item.quantity]
        );

        // Update product stock
        const newStock = item.product.stock - item.quantity;
        await dbService.run(
          `UPDATE products SET stock = ? WHERE id = ?`,
          [newStock, item.product.id]
        );
      }

      // 4. Update user points balance (subtract redeemed points)
      if (pointsUsed > 0) {
        const newUserPoints = buyer.points - pointsUsed;
        await dbService.run(
          `UPDATE users SET points = ? WHERE id = ?`,
          [newUserPoints, targetUserId]
        );

        // Log point transaction
        await dbService.run(
          `INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [`pt-${Date.now()}-red`, targetUserId, 'REDEEM', pointsUsed, 'ORDER', orderId, nowStr]
        );
      }

      // 5. Update batch totals if order is linked to a batch
      if (rtBatchId) {
        const batch = batches.find(b => b.id === rtBatchId);
        if (batch) {
          const newOrdersCount = batch.total_orders + 1;
          const newGmv = batch.total_gmv + total;
          await dbService.run(
            `UPDATE rt_batches SET total_orders = ?, total_gmv = ? WHERE id = ?`,
            [newOrdersCount, newGmv, rtBatchId]
          );
        }
      }

      // 6. Audit log
      const actorName = activeUser?.name || 'System';
      const channelDesc = channel === 'CARD_PURCHASE' ? 'Kartu Kopdes' : channel === 'RT_ASSISTED' ? 'RT-Assisted' : 'Self-Order';
      await logAudit(
        `${actorName} (${activeRole})`, 
        'CHECKOUT', 
        `Fulfillment: ${fulfillment}, Channel: ${channelDesc}, Total: Rp${total.toLocaleString('id-ID')}, Items: ${cart.length} SKUs for User: ${buyer.name}`
      );

      // Clear cart from database
      await dbService.run(
        `DELETE FROM cart_items WHERE user_id = ?`,
        [targetUserId]
      );
      setCart([]);
      await refreshData();
      return { success: true, orderId };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Checkout failed.' };
    }
  };

  // RT Batch Management
  const createBatch = async (name: string, deadline: string, pickupPoint: string): Promise<string> => {
    const id = `batch-${Date.now()}`;
    const cleanDeadline = new Date(deadline).toISOString();
    await dbService.run(
      'INSERT INTO rt_batches (id, rt_id, name, deadline, pickup_point, status, total_orders, total_gmv) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, activeUser?.rt_id || 'RT 03', name, cleanDeadline, pickupPoint, 'OPEN', 0, 0]
    );

    await logAudit(
      `${activeUser?.name} (RT Agent)`,
      'CREATE_BATCH',
      `Created batch ${name} for ${activeUser?.rt_id || 'RT 03'}, pickup: ${pickupPoint}`
    );

    await refreshData();
    return id;
  };

  const lockBatch = async (batchId: string) => {
    await dbService.run(
      "UPDATE rt_batches SET status = 'LOCKED' WHERE id = ?",
      [batchId]
    );
    await logAudit(
      `${activeUser?.name} (RT Agent)`,
      'LOCK_BATCH',
      `Locked batch ${batchId}`
    );
    await refreshData();
  };

  const submitBatch = async (batchId: string) => {
    // Lock and submit
    await dbService.run(
      "UPDATE rt_batches SET status = 'SUBMITTED' WHERE id = ?",
      [batchId]
    );

    // Get batch GMV to create Settlement
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      // Create pending settlement
      const settlementId = `set-${Date.now()}`;
      await dbService.run(
        'INSERT INTO settlements (id, rt_batch_id, amount_expected, amount_submitted, status, submitted_at, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [settlementId, batchId, batch.total_gmv, 0, 'PENDING', null, null]
      );
    }

    // Update all UNPAID orders in this batch to paymentStatus = 'WAITING_VERIFICATION' and orderStatus = 'CONFIRMED'
    await dbService.run(
      "UPDATE orders SET order_status = 'CONFIRMED' WHERE rt_batch_id = ? AND order_status = 'PENDING_PAYMENT'",
      [batchId]
    );

    await logAudit(
      `${activeUser?.name} (RT Agent)`,
      'SUBMIT_BATCH',
      `Submitted batch ${batchId} for fulfillment. Created settlement.`
    );
    await refreshData();
  };

  const markItemPickedUp = async (orderId: string) => {
    // Retrieve order to award points
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Update order status to COMPLETED and paid
    await dbService.run(
      "UPDATE orders SET order_status = 'COMPLETED', payment_status = 'PAID' WHERE id = ?",
      [orderId]
    );

    // 1. Calculate Poin Gotong Royong:
    // - Every Rp10.000 = 1 point
    // - Local product items = 2x points
    // - If inside RT batch = +25 points
    const orderItems = await dbService.getAll<OrderItem>('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    
    let basePoints = Math.floor(order.total / 10000);
    
    // Check if there are local products
    let containsLocal = false;
    for (const item of orderItems) {
      const p = products.find(prod => prod.id === item.product_id);
      if (p && p.is_local === 1) {
        containsLocal = true;
      }
    }

    // Multiplier for local product
    if (containsLocal) {
      basePoints = basePoints * 2;
    }

    // RT batch bonus
    let bonusPoints = order.rt_batch_id ? 25 : 0;
    
    // First order bonus check
    const prevOrders = orders.filter(o => o.user_id === order.user_id && o.order_status === 'COMPLETED');
    const firstOrderBonus = prevOrders.length === 0 ? 100 : 0;

    const totalEarnedPoints = basePoints + bonusPoints + firstOrderBonus;

    if (totalEarnedPoints > 0) {
      const user = allUsers.find(u => u.id === order.user_id);
      if (user) {
        const newPoints = user.points + totalEarnedPoints;
        await dbService.run('UPDATE users SET points = ? WHERE id = ?', [newPoints, order.user_id]);

        // Insert points transaction
        await dbService.run(
          `INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [`pt-${Date.now()}-earn`, order.user_id, 'EARN', totalEarnedPoints, 'ORDER', orderId, new Date().toISOString()]
        );
      }
    }

    // 2. Handle Referral reward if this is the user's first completed order
    const buyer = allUsers.find(u => u.id === order.user_id);
    if (buyer && buyer.referred_by && prevOrders.length === 0) {
      // Award referrer: +100 points
      const referrer = allUsers.find(u => u.referral_code === buyer.referred_by);
      if (referrer) {
        const newRefPoints = referrer.points + 100;
        await dbService.run('UPDATE users SET points = ? WHERE id = ?', [newRefPoints, referrer.id]);

        // Log points transaction for referrer
        await dbService.run(
          `INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [`pt-${Date.now()}-ref`, referrer.id, 'EARN', 100, 'REFERRAL', orderId, new Date().toISOString()]
        );
      }
    }

    await logAudit(
      `${activeUser?.name} (RT Agent)`,
      'CONFIRM_PICKUP',
      `Confirmed resident pickup & payment for order ${orderId}. Points awarded: +${totalEarnedPoints}.`
    );

    // Update active batch stats or complete batch if all orders completed
    if (order.rt_batch_id) {
      const batchOrders = await dbService.getAll<Order>('SELECT * FROM orders WHERE rt_batch_id = ?', [order.rt_batch_id]);
      const incomplete = batchOrders.filter(o => o.order_status !== 'COMPLETED' && o.order_status !== 'CANCELLED');
      if (incomplete.length === 0) {
        // Complete the batch!
        await dbService.run("UPDATE rt_batches SET status = 'COMPLETED' WHERE id = ?", [order.rt_batch_id]);
        
        // Auto-verify settlement if already submitted and amounts match
        const batchSettlement = settlements.find(s => s.rt_batch_id === order.rt_batch_id);
        if (batchSettlement && batchSettlement.status === 'SUBMITTED' && batchSettlement.amount_expected === batchSettlement.amount_submitted) {
          await dbService.run(
            "UPDATE settlements SET status = 'VERIFIED', verified_at = ? WHERE id = ?",
            [new Date().toISOString(), batchSettlement.id]
          );
        }
      }
    }

    await refreshData();
  };

  const submitSettlement = async (settlementId: string, amountSubmitted: number) => {
    await dbService.run(
      "UPDATE settlements SET status = 'SUBMITTED', amount_submitted = ?, submitted_at = ? WHERE id = ?",
      [amountSubmitted, new Date().toISOString(), settlementId]
    );

    await logAudit(
      `${activeUser?.name} (RT Agent)`,
      'SUBMIT_SETTLEMENT',
      `Submitted settlement of Rp${amountSubmitted.toLocaleString('id-ID')} for settlement ID ${settlementId}`
    );
    await refreshData();
  };

  // Admin Koperasi features
  const updateProductStock = async (productId: string, newStock: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    await dbService.run(
      'UPDATE products SET stock = ? WHERE id = ?',
      [newStock, productId]
    );

    await logAudit(
      `${activeUser?.name} (Admin)`,
      'UPDATE_STOCK',
      `Updated ${product.name} stock from ${product.stock} to ${newStock}`
    );
    await refreshData();
  };

  const createOrUpdateProduct = async (productData: Partial<Product>) => {
    const isNew = !productData.id;
    const nowId = productData.id || `prod-${Date.now()}`;
    const name = productData.name || '';
    const price = productData.price || 0;
    const cost_price = productData.cost_price || 0;
    const stock = productData.stock || 0;
    const unit = productData.unit || 'pcs';
    const is_local = productData.is_local || 0;
    const image_url = productData.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';

    if (isNew) {
      await dbService.run(
        'INSERT INTO products (id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nowId, name, price, cost_price, stock, unit, is_local, image_url]
      );
      await logAudit(`${activeUser?.name} (Admin)`, 'CREATE_PRODUCT', `Added new product ${name}`);
    } else {
      await dbService.run(
        'UPDATE products SET name = ?, price = ?, cost_price = ?, stock = ?, unit = ?, is_local = ?, image_url = ? WHERE id = ?',
        [name, price, cost_price, stock, unit, is_local, image_url, nowId]
      );
      await logAudit(`${activeUser?.name} (Admin)`, 'UPDATE_PRODUCT', `Updated product ${name} (ID: ${nowId})`);
    }
    await refreshData();
  };

  const processBatchFulfillment = async (batchId: string, newStatus: 'PROCESSING' | 'DELIVERED_TO_RT' | 'COMPLETED') => {
    // Update batch status
    await dbService.run(
      'UPDATE rt_batches SET status = ? WHERE id = ?',
      [newStatus, batchId]
    );

    // Map new status to order statuses
    const targetOrderStatus = newStatus === 'PROCESSING' 
      ? 'PACKED' 
      : newStatus === 'DELIVERED_TO_RT' 
        ? 'DELIVERED_TO_RT' 
        : 'COMPLETED';

    const targetPaymentStatus = newStatus === 'COMPLETED' ? 'PAID' : 'UNPAID';

    // Update all orders linked to this batch
    await dbService.run(
      'UPDATE orders SET order_status = ? WHERE rt_batch_id = ?',
      [targetOrderStatus, batchId]
    );

    await logAudit(
      `${activeUser?.name} (Admin)`,
      'FULFILL_BATCH',
      `Updated batch ${batchId} status to ${newStatus}. All batch orders set to ${targetOrderStatus}`
    );
    await refreshData();
  };

  const verifySettlement = async (settlementId: string, isVerified: boolean) => {
    const settlement = settlements.find(s => s.id === settlementId);
    if (!settlement) return;

    const newStatus = isVerified ? 'VERIFIED' : 'DISPUTED';
    await dbService.run(
      'UPDATE settlements SET status = ?, verified_at = ? WHERE id = ?',
      [newStatus, new Date().toISOString(), settlementId]
    );

    await logAudit(
      `${activeUser?.name} (Admin)`,
      isVerified ? 'VERIFY_SETTLEMENT' : 'DISPUTE_SETTLEMENT',
      `${isVerified ? 'Verified' : 'Disputed'} settlement ID ${settlementId} from RT. Expected: Rp${settlement.amount_expected}, Submitted: Rp${settlement.amount_submitted}`
    );
    await refreshData();
  };

  // Referral
  const applyReferralCode = async (code: string) => {
    if (!activeUser) return { success: false, error: 'No active user.' };
    const cleanCode = code.trim().toUpperCase();

    if (cleanCode === activeUser.referral_code) {
      return { success: false, error: 'Tidak bisa menggunakan kode referral sendiri.' };
    }

    // Verify referrer code exists
    const referrer = allUsers.find(u => u.referral_code === cleanCode);
    if (!referrer) {
      return { success: false, error: 'Kode referral tidak valid / tidak ditemukan.' };
    }

    try {
      await dbService.run(
        'UPDATE users SET referred_by = ? WHERE id = ?',
        [cleanCode, activeUser.id]
      );
      
      await logAudit(
        activeUser.name,
        'APPLY_REFERRAL',
        `Applied referral code ${cleanCode} from ${referrer.name}`
      );
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menerapkan referral.' };
    }
  };

  return (
    <AppContext.Provider value={{
      activeRole,
      activeUser,
      allUsers,
      products,
      batches,
      orders,
      cart,
      settlements,
      auditLogs,
      isLoading,
      
      setActiveRole,
      setActiveUser,
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
      submitSettlement,
      
      updateProductStock,
      createOrUpdateProduct,
      processBatchFulfillment,
      verifySettlement,
      applyReferralCode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
