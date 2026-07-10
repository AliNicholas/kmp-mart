import { Platform } from 'react-native';

// Standard TypeScript types matching the database entities
export interface Tenant {
  id: string;
  name: string;
  code: string;
  village: string;
  status: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'USER' | 'RT_AGENT' | 'ADMIN';
  rt_id: string | null;
  cooperative_id: string;
  points: number;
  referral_code: string;
  referred_by: string | null;
  pin: string;
}

export interface Product {
  id: string;
  cooperative_id: string;
  name: string;
  price: number;
  cost_price: number;
  stock: number;
  unit: string;
  is_local: number; // 0 or 1
  image_url: string;
}

export interface RTBatch {
  id: string;
  rt_id: string;
  name: string;
  deadline: string;
  pickup_point: string;
  status: 'OPEN' | 'LOCKED' | 'SUBMITTED' | 'PROCESSING' | 'DELIVERED_TO_RT' | 'COMPLETED' | 'CANCELLED';
  total_orders: number;
  total_gmv: number;
}

export interface Order {
  id: string;
  user_id: string;
  rt_batch_id: string | null;
  channel: 'SELF_ORDER' | 'RT_ASSISTED' | 'CARD_PURCHASE';
  fulfillment: 'PICKUP_AT_COOP' | 'DELIVERY_TO_HOME' | 'RT_PICKUP_POINT';
  subtotal: number;
  discount: number;
  points_redeemed: number;
  total: number;
  payment_status: 'UNPAID' | 'PAID';
  order_status: 'PENDING_PAYMENT' | 'PAID' | 'CONFIRMED' | 'PACKED' | 'READY_FOR_PICKUP' | 'DELIVERED_TO_RT' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  type: 'EARN' | 'REDEEM' | 'REVERSE';
  points: number;
  source: 'ORDER' | 'REFERRAL' | 'SIGNUP';
  reference_id: string | null;
  created_at: string;
}

export interface Settlement {
  id: string;
  rt_batch_id: string;
  amount_expected: number;
  amount_submitted: number;
  status: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'DISPUTED';
  submitted_at: string | null;
  verified_at: string | null;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  details: string;
  created_at: string;
}

// ----------------------------------------------------
// DATABASE WEB FALLBACK IMPLEMENTATION (localStorage)
// ----------------------------------------------------

class WebDatabase {
  private getStorage(): { [table: string]: any[] } {
    const data = localStorage.getItem('kopmart_db');
    return data ? JSON.parse(data) : {};
  }

  private setStorage(data: { [table: string]: any[] }) {
    localStorage.setItem('kopmart_db', JSON.stringify(data));
  }

  constructor() {
    this.initSchemaIfNeeded();
  }

  private initSchemaIfNeeded() {
    const db = this.getStorage();
    let updated = false;

    const tables = [
      'tenants', 'users', 'products', 'rt_batches', 
      'orders', 'order_items', 'point_transactions', 
      'settlements', 'audit_logs', 'cart_items'
    ];

    tables.forEach(table => {
      if (!db[table]) {
        db[table] = [];
        updated = true;
      }
    });

    if (updated) {
      this.seedData(db);
    }

    // Ensure cooperative_id is on products in web db
    let changed = false;
    if (db['products']) {
      db['products'].forEach((p: any) => {
        if (!p.cooperative_id) {
          p.cooperative_id = 'tenant-1';
          changed = true;
        }
      });
      // Ensure Beras Premium 5kg is low stock in Sukamaju for demo
      const beras = db['products'].find((p: any) => p.id === 'prod-beras');
      if (beras && beras.stock > 2) {
        beras.stock = 2;
        changed = true;
      }
    }

    // Ensure Sukasari (tenant-2) exists
    if (db['tenants'] && !db['tenants'].some((t: any) => t.id === 'tenant-2')) {
      db['tenants'].push({
        id: 'tenant-2',
        name: 'Koperasi Sukasari (Tetangga)',
        code: 'KOP-SUKASARI',
        village: 'Sukasari',
        status: 'ACTIVE'
      });
      
      // Seed products for Sukasari
      db['products'].push(
        { id: 'prod-beras-2', cooperative_id: 'tenant-2', name: 'Beras Premium 5kg (Sukasari)', price: 73000, cost_price: 66000, stock: 90, unit: 'pcs', is_local: 0, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
        { id: 'prod-telur-2', cooperative_id: 'tenant-2', name: 'Telur Bebek Asin 10pcs', price: 35000, cost_price: 30000, stock: 50, unit: 'pack', is_local: 1, image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400' },
        { id: 'prod-minyak-2', cooperative_id: 'tenant-2', name: 'Minyak Kelapa Murni 1L', price: 32000, cost_price: 27000, stock: 25, unit: 'liter', is_local: 1, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
        { id: 'prod-gula-2', cooperative_id: 'tenant-2', name: 'Gula Merah Aren 1kg', price: 22000, cost_price: 18000, stock: 40, unit: 'kg', is_local: 1, image_url: 'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=400' },
        { id: 'prod-paket-2', cooperative_id: 'tenant-2', name: 'Paket Hemat Sukasari 75K', price: 75000, cost_price: 65000, stock: 15, unit: 'pack', is_local: 0, image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' }
      );
      changed = true;
    }

    // Ensure Sukamukti (tenant-3) exists
    if (db['tenants'] && !db['tenants'].some((t: any) => t.id === 'tenant-3')) {
      db['tenants'].push({
        id: 'tenant-3',
        name: 'Koperasi Sukamukti (Tetangga)',
        code: 'KOP-SUKAMUKTI',
        village: 'Sukamukti',
        status: 'ACTIVE'
      });
      
      // Seed products for Sukamukti
      db['products'].push(
        { id: 'prod-beras-3', cooperative_id: 'tenant-3', name: 'Beras Merah Organik 2kg', price: 45000, cost_price: 39000, stock: 35, unit: 'pcs', is_local: 1, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
        { id: 'prod-madu', cooperative_id: 'tenant-3', name: 'Madu Hutan Asli Sukamukti', price: 65000, cost_price: 55000, stock: 20, unit: 'pcs', is_local: 1, image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400' },
        { id: 'prod-kopi', cooperative_id: 'tenant-3', name: 'Kopi Bubuk Robusta 250g', price: 24000, cost_price: 19000, stock: 60, unit: 'pcs', is_local: 1, image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400' }
      );
      changed = true;
    }

    // Ensure Koperasi Jaya Makmur (tenant-4) exists
    if (db['tenants'] && !db['tenants'].some((t: any) => t.id === 'tenant-4')) {
      db['tenants'].push({ id: 'tenant-4', name: 'Koperasi Jaya Makmur (Jawa Timur)', code: 'KOP-JAYAMAKMUR', village: 'Surabaya', status: 'ACTIVE' });
      db['products'].push({ id: 'prod-apel', cooperative_id: 'tenant-4', name: 'Apel Malang Segar 1kg', price: 25000, cost_price: 20000, stock: 80, unit: 'kg', is_local: 1, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400' });
      changed = true;
    }

    // Ensure Koperasi Danau Toba (tenant-5) exists
    if (db['tenants'] && !db['tenants'].some((t: any) => t.id === 'tenant-5')) {
      db['tenants'].push({ id: 'tenant-5', name: 'Koperasi Danau Toba (Sumatera Utara)', code: 'KOP-DANAUTOBA', village: 'Balige', status: 'ACTIVE' });
      db['products'].push({ id: 'prod-kopi-lintong', cooperative_id: 'tenant-5', name: 'Kopi Lintong Premium 250g', price: 48000, cost_price: 40000, stock: 40, unit: 'pcs', is_local: 1, image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400' });
      changed = true;
    }

    // Ensure Koperasi Bunaken Lestari (tenant-6) exists
    if (db['tenants'] && !db['tenants'].some((t: any) => t.id === 'tenant-6')) {
      db['tenants'].push({ id: 'tenant-6', name: 'Koperasi Bunaken Lestari (Sulawesi Utara)', code: 'KOP-BUNAKEN', village: 'Manado', status: 'ACTIVE' });
      db['products'].push({ id: 'prod-roa', cooperative_id: 'tenant-6', name: 'Sambal Roa Manado', price: 22000, cost_price: 17000, stock: 50, unit: 'pcs', is_local: 1, image_url: 'https://images.unsplash.com/photo-1595124201382-742455b33db6?w=400' });
      changed = true;
    }

    if (updated || changed) {
      this.setStorage(db);
    }
  }

  private seedData(db: { [table: string]: any[] }) {
    console.log("Seeding Web Database...");

    // 1. Seed Tenants
    db['tenants'].push(
      { id: 'tenant-1', name: 'Koperasi Merah Putih Sukamaju', code: 'KOP-SUKAMAJU', village: 'Sukamaju', status: 'ACTIVE' },
      { id: 'tenant-2', name: 'Koperasi Sukasari (Tetangga)', code: 'KOP-SUKASARI', village: 'Sukasari', status: 'ACTIVE' }
    );

    // 2. Seed Users
    db['users'].push(
      { id: 'user-dinda', name: 'Dinda', phone: '081234567890', role: 'USER', rt_id: 'RT 03', cooperative_id: 'tenant-1', points: 120, referral_code: 'DINDAJAK', referred_by: null, pin: '123456' },
      { id: 'user-budi', name: 'Pak Budi', phone: '089876543210', role: 'RT_AGENT', rt_id: 'RT 03', cooperative_id: 'tenant-1', points: 250, referral_code: 'BUDIAJAK', referred_by: null, pin: '654321' },
      { id: 'user-arif', name: 'Mas Arif', phone: '081122334455', role: 'ADMIN', rt_id: null, cooperative_id: 'tenant-1', points: 0, referral_code: 'ARIFAJAK', referred_by: null, pin: '111222' },
      { id: 'user-sari', name: 'Bu Sari', phone: '085566778899', role: 'USER', rt_id: 'RT 03', cooperative_id: 'tenant-1', points: 50, referral_code: 'SARIAJAK', referred_by: 'DINDAJAK', pin: '000000' },
      { id: 'user-rina', name: 'Ibu Rina', phone: '087788990011', role: 'USER', rt_id: 'RT 03', cooperative_id: 'tenant-1', points: 80, referral_code: 'RINAJAK', referred_by: null, pin: '111111' }
    );

    // 3. Seed Products
    db['products'].push(
      // Sukamaju products (tenant-1)
      { id: 'prod-beras', cooperative_id: 'tenant-1', name: 'Beras Premium 5kg', price: 75000, cost_price: 68000, stock: 2, unit: 'pcs', is_local: 0, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { id: 'prod-telur', cooperative_id: 'tenant-1', name: 'Telur Ayam 1kg', price: 28000, cost_price: 24000, stock: 40, unit: 'kg', is_local: 0, image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400' },
      { id: 'prod-minyak', cooperative_id: 'tenant-1', name: 'Minyak Goreng 1L', price: 18000, cost_price: 15500, stock: 60, unit: 'liter', is_local: 0, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
      { id: 'prod-gula', cooperative_id: 'tenant-1', name: 'Gula Pasir 1kg', price: 15000, cost_price: 13000, stock: 100, unit: 'kg', is_local: 0, image_url: 'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=400' },
      { id: 'prod-paket', cooperative_id: 'tenant-1', name: 'Paket Sembako Dapur 50K', price: 50000, cost_price: 42000, stock: 30, unit: 'pack', is_local: 0, image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
      { id: 'prod-pisang', cooperative_id: 'tenant-1', name: 'Keripik Pisang Lokal', price: 12000, cost_price: 9000, stock: 25, unit: 'pcs', is_local: 1, image_url: 'https://images.unsplash.com/photo-1613967193490-1d17b930c1a1?w=400' },
      { id: 'prod-sambal', cooperative_id: 'tenant-1', name: 'Sambal Rumahan Ibu Rina', price: 15000, cost_price: 11000, stock: 20, unit: 'pcs', is_local: 1, image_url: 'https://images.unsplash.com/photo-1595124201382-742455b33db6?w=400' },
      { id: 'prod-kangkung', cooperative_id: 'tenant-1', name: 'Kangkung Segar RT 03', price: 4000, cost_price: 3000, stock: 15, unit: 'pcs', is_local: 1, image_url: 'https://images.unsplash.com/photo-1550346048-b472e399580b?w=400' },
      { id: 'prod-gas', cooperative_id: 'tenant-1', name: 'Gas LPG 3kg Melon', price: 22000, cost_price: 19000, stock: 12, unit: 'pcs', is_local: 0, image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400' },
      { id: 'prod-sabun', cooperative_id: 'tenant-1', name: 'Sabun Cuci Wangi', price: 14000, cost_price: 11500, stock: 35, unit: 'pcs', is_local: 0, image_url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400' },
      
      // Sukasari products (tenant-2)
      { id: 'prod-beras-2', cooperative_id: 'tenant-2', name: 'Beras Premium 5kg (Sukasari)', price: 73000, cost_price: 66000, stock: 90, unit: 'pcs', is_local: 0, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { id: 'prod-telur-2', cooperative_id: 'tenant-2', name: 'Telur Bebek Asin 10pcs', price: 35000, cost_price: 30000, stock: 50, unit: 'pack', is_local: 1, image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400' },
      { id: 'prod-minyak-2', cooperative_id: 'tenant-2', name: 'Minyak Kelapa Murni 1L', price: 32000, cost_price: 27000, stock: 25, unit: 'liter', is_local: 1, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
      { id: 'prod-gula-2', cooperative_id: 'tenant-2', name: 'Gula Merah Aren 1kg', price: 22000, cost_price: 18000, stock: 40, unit: 'kg', is_local: 1, image_url: 'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=400' },
      { id: 'prod-paket-2', cooperative_id: 'tenant-2', name: 'Paket Hemat Sukasari 75K', price: 75000, cost_price: 65000, stock: 15, unit: 'pack', is_local: 0, image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' }
    );

    // 4. Seed RT Batch
    const batchId = 'batch-demo-1';
    db['rt_batches'].push({
      id: batchId,
      rt_id: 'RT 03',
      name: 'Belanja Mingguan RT 03 (Juli)',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      pickup_point: 'Balai RT 03 / Pos Hansip',
      status: 'OPEN',
      total_orders: 2,
      total_gmv: 111000
    });

    // 5. Seed Pre-completed Orders
    const orderId1 = 'order-prev-1';
    db['orders'].push({
      id: orderId1,
      user_id: 'user-dinda',
      rt_batch_id: null,
      channel: 'SELF_ORDER',
      fulfillment: 'PICKUP_AT_COOP',
      subtotal: 75000,
      discount: 0,
      points_redeemed: 0,
      total: 75000,
      payment_status: 'PAID',
      order_status: 'COMPLETED',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    });
    db['order_items'].push({
      id: 'item-prev-1',
      order_id: orderId1,
      product_id: 'prod-beras',
      name: 'Beras Premium 5kg',
      price: 75000,
      quantity: 1
    });

    // Add points transaction for completed order
    db['point_transactions'].push({
      id: 'pt-1',
      user_id: 'user-dinda',
      type: 'EARN',
      points: 7, // 1 point per 10k
      source: 'ORDER',
      reference_id: orderId1,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Seed Active Order inside Batch
    const orderId2 = 'order-batch-1';
    db['orders'].push({
      id: orderId2,
      user_id: 'user-sari',
      rt_batch_id: batchId,
      channel: 'CARD_PURCHASE',
      fulfillment: 'RT_PICKUP_POINT',
      subtotal: 36000,
      discount: 0,
      points_redeemed: 0,
      total: 36000,
      payment_status: 'PAID',
      order_status: 'READY_FOR_PICKUP',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    });
    db['order_items'].push(
      { id: 'item-batch-1', order_id: orderId2, product_id: 'prod-minyak', name: 'Minyak Goreng 1L', price: 18000, quantity: 2 }
    );

    // Audit logs
    db['audit_logs'].push(
      { id: 'log-1', actor: 'Mas Arif (Admin)', action: 'SEED_DATA', details: 'Database initialized and preloaded with mock products and users.', created_at: new Date().toISOString() },
      { id: 'log-2', actor: 'Pak Budi (RT Agent)', action: 'CREATE_BATCH', details: 'Created weekly batch Belanja Mingguan RT 03 (Juli).', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'log-3', actor: 'Pak Budi (RT Agent)', action: 'CARD_PURCHASE', details: 'Registered assisted order for Bu Sari using QR Card.', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    );

    this.setStorage(db);
  }

  // A very simplified SQL parser-runner that handles the specific queries our application makes
  public async executeSql(query: string, params: any[] = []): Promise<any> {
    const db = this.getStorage();
    const cleanQuery = query.replace(/\s+/g, ' ').trim();

    // 1. SELECT queries
    if (cleanQuery.toUpperCase().startsWith('SELECT')) {
      // Determine table name
      const fromMatch = cleanQuery.match(/FROM\s+(\w+)/i);
      if (!fromMatch) return [];
      const tableName = fromMatch[1].toLowerCase();
      let rows = db[tableName] || [];

      // Simple WHERE clause parsing
      const whereMatch = cleanQuery.match(/WHERE\s+(.+)$/i);
      if (whereMatch) {
        const whereClause = whereMatch[1].split(/AND/i);
        let paramIdx = 0;

        whereClause.forEach(clause => {
          const parts = clause.trim().split(/\s*(=|LIKE|IS NULL|IS NOT NULL)\s*/i);
          if (parts.length >= 2) {
            const col = parts[0].trim();
            const operator = parts[1].toUpperCase();
            let val = parts[2] ? parts[2].trim() : '';

            if (val === '?') {
              val = params[paramIdx++];
            } else if (val.startsWith("'") && val.endsWith("'")) {
              val = val.substring(1, val.length - 1);
            }

            rows = rows.filter(row => {
              if (operator === '=') {
                return String(row[col]) === String(val);
              } else if (operator === 'LIKE') {
                const searchVal = String(val).replace(/%/g, '').toLowerCase();
                return String(row[col]).toLowerCase().includes(searchVal);
              } else if (operator === 'IS NULL') {
                return row[col] === null || row[col] === undefined;
              } else if (operator === 'IS NOT NULL') {
                return row[col] !== null && row[col] !== undefined;
              }
              return true;
            });
          }
        });
      }

      // Simple ORDER BY parsing
      const orderMatch = cleanQuery.match(/ORDER\s+BY\s+(\w+)\s*(ASC|DESC)?/i);
      if (orderMatch) {
        const col = orderMatch[1];
        const dir = (orderMatch[2] || 'ASC').toUpperCase();
        rows = [...rows].sort((a, b) => {
          if (a[col] < b[col]) return dir === 'ASC' ? -1 : 1;
          if (a[col] > b[col]) return dir === 'ASC' ? 1 : -1;
          return 0;
        });
      }

      // Simple LIMIT parsing
      const limitMatch = cleanQuery.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        const limitNum = parseInt(limitMatch[1], 10);
        rows = rows.slice(0, limitNum);
      }

      // Clone elements to prevent mutations
      return JSON.parse(JSON.stringify(rows));
    }

    // 2. INSERT queries
    if (cleanQuery.toUpperCase().startsWith('INSERT')) {
      const intoMatch = cleanQuery.match(/INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (!intoMatch) throw new Error("Unsupported INSERT statement: " + query);

      const tableName = intoMatch[1].toLowerCase();
      const cols = intoMatch[2].split(',').map(s => s.trim());
      const valPlaceholder = intoMatch[3].split(',').map(s => s.trim());

      const newRow: any = {};
      let paramIdx = 0;

      cols.forEach((col, idx) => {
        const placeholder = valPlaceholder[idx];
        if (placeholder === '?') {
          newRow[col] = params[paramIdx++];
        } else if (placeholder.startsWith("'") && placeholder.endsWith("'")) {
          newRow[col] = placeholder.substring(1, placeholder.length - 1);
        } else {
          newRow[col] = placeholder;
        }
      });

      if (!db[tableName]) db[tableName] = [];
      db[tableName].push(newRow);
      this.setStorage(db);

      return { insertId: newRow.id, rowsAffected: 1 };
    }

    // 3. UPDATE queries
    if (cleanQuery.toUpperCase().startsWith('UPDATE')) {
      const updateMatch = cleanQuery.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
      if (!updateMatch) throw new Error("Unsupported UPDATE statement: " + query);

      const tableName = updateMatch[1].toLowerCase();
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];

      let paramIdx = 0;
      const setStatements = setClause.split(',');
      const updates: { [col: string]: any } = {};

      setStatements.forEach(stmt => {
        const parts = stmt.split('=');
        const col = parts[0].trim();
        let val = parts[1].trim();
        if (val === '?') {
          updates[col] = params[paramIdx++];
        } else if (val.startsWith("'") && val.endsWith("'")) {
          updates[col] = val.substring(1, val.length - 1);
        } else {
          updates[col] = Number(val) || val;
        }
      });

      let rows = db[tableName] || [];
      let affectedCount = 0;

      if (whereClause) {
        const parts = whereClause.split('=');
        const whereCol = parts[0].trim();
        let whereVal = parts[1].trim();
        if (whereVal === '?') {
          whereVal = params[paramIdx++];
        } else if (whereVal.startsWith("'") && whereVal.endsWith("'")) {
          whereVal = whereVal.substring(1, whereVal.length - 1);
        }

        db[tableName] = rows.map(row => {
          if (String(row[whereCol]) === String(whereVal)) {
            affectedCount++;
            return { ...row, ...updates };
          }
          return row;
        });
      } else {
        db[tableName] = rows.map(row => {
          affectedCount++;
          return { ...row, ...updates };
        });
      }

      this.setStorage(db);
      return { rowsAffected: affectedCount };
    }

    // 4. DELETE queries
    if (cleanQuery.toUpperCase().startsWith('DELETE')) {
      const deleteMatch = cleanQuery.match(/FROM\s+(\w+)\s+WHERE\s+(.+)$/i);
      if (!deleteMatch) throw new Error("Unsupported DELETE statement: " + query);

      const tableName = deleteMatch[1].toLowerCase();
      const whereClause = deleteMatch[2];
      const parts = whereClause.split('=');
      const whereCol = parts[0].trim();
      let whereVal = parts[1].trim();
      if (whereVal === '?') {
        whereVal = params[0];
      } else if (whereVal.startsWith("'") && whereVal.endsWith("'")) {
        whereVal = whereVal.substring(1, whereVal.length - 1);
      }

      const beforeCount = db[tableName]?.length || 0;
      db[tableName] = (db[tableName] || []).filter(row => String(row[whereCol]) !== String(whereVal));
      const afterCount = db[tableName].length;

      this.setStorage(db);
      return { rowsAffected: beforeCount - afterCount };
    }

    throw new Error("Query not supported in Web mock SQL: " + query);
  }
}

// Global web database instance
let webDbInstance: WebDatabase | null = null;
const getWebDb = () => {
  if (!webDbInstance) {
    webDbInstance = new WebDatabase();
  }
  return webDbInstance;
};

// ----------------------------------------------------
// NATIVE SQLITE WRAPPER WITH EXPO-SQLITE
// ----------------------------------------------------

let sqliteDbInstance: any = null;

const getNativeDb = () => {
  if (!sqliteDbInstance) {
    const SQLite = require('expo-sqlite');
    sqliteDbInstance = SQLite.openDatabaseSync('kopmart.db');
    initNativeSchema(sqliteDbInstance);
  }
  return sqliteDbInstance;
};

const initNativeSchema = (db: any) => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT,
      code TEXT,
      village TEXT,
      status TEXT
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT UNIQUE,
      role TEXT,
      rt_id TEXT,
      cooperative_id TEXT,
      points INTEGER DEFAULT 0,
      referral_code TEXT UNIQUE,
      referred_by TEXT,
      pin TEXT DEFAULT '123456'
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      cooperative_id TEXT DEFAULT 'tenant-1',
      name TEXT,
      price REAL,
      cost_price REAL,
      stock INTEGER,
      unit TEXT,
      is_local INTEGER DEFAULT 0,
      image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS rt_batches (
      id TEXT PRIMARY KEY,
      rt_id TEXT,
      name TEXT,
      deadline TEXT,
      pickup_point TEXT,
      status TEXT,
      total_orders INTEGER DEFAULT 0,
      total_gmv REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      rt_batch_id TEXT,
      channel TEXT,
      fulfillment TEXT,
      subtotal REAL,
      discount REAL,
      points_redeemed INTEGER,
      total REAL,
      payment_status TEXT,
      order_status TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      product_id TEXT,
      name TEXT,
      price REAL,
      quantity INTEGER
    );
    CREATE TABLE IF NOT EXISTS point_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT,
      points INTEGER,
      source TEXT,
      reference_id TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS settlements (
      id TEXT PRIMARY KEY,
      rt_batch_id TEXT,
      amount_expected REAL,
      amount_submitted REAL,
      status TEXT,
      submitted_at TEXT,
      verified_at TEXT
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT,
      action TEXT,
      details TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      user_id TEXT,
      product_id TEXT,
      quantity INTEGER,
      PRIMARY KEY (user_id, product_id)
    );
  `);

  // Native database schema migrations for existing local sqlite files
  try {
    db.execSync("ALTER TABLE products ADD COLUMN cooperative_id TEXT DEFAULT 'tenant-1';");
    console.log("Database Migration: Added cooperative_id column to products table.");
  } catch (e) {
    // Ignore if column already exists
  }

  // Ensure Sukasari (tenant-2) and its products exist in the SQLite database
  try {
    const tenants = db.getAllSync(`SELECT * FROM tenants WHERE id = 'tenant-2'`);
    if (tenants.length === 0) {
      console.log("Database Migration: Seeding Sukasari (tenant-2) and items...");
      db.runSync(`INSERT OR IGNORE INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
        ['tenant-2', 'Koperasi Sukasari (Tetangga)', 'KOP-SUKASARI', 'Sukasari', 'ACTIVE']);
      
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-beras-2', 'tenant-2', 'Beras Premium 5kg (Sukasari)', 73000, 66000, 90, 'pcs', 0, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400']);
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-telur-2', 'tenant-2', 'Telur Bebek Asin 10pcs', 35000, 30000, 50, 'pack', 1, 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400']);
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-minyak-2', 'tenant-2', 'Minyak Kelapa Murni 1L', 32000, 27000, 25, 'liter', 1, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400']);
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-gula-2', 'tenant-2', 'Gula Merah Aren 1kg', 22000, 18000, 40, 'kg', 1, 'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=400']);
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-paket-2', 'tenant-2', 'Paket Hemat Sukasari 75K', 75000, 65000, 15, 'pack', 0, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400']);
    }

    const tenants3 = db.getAllSync(`SELECT * FROM tenants WHERE id = 'tenant-3'`);
    if (tenants3.length === 0) {
      console.log("Database Migration: Seeding Sukamukti (tenant-3) and items...");
      db.runSync(`INSERT OR IGNORE INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
        ['tenant-3', 'Koperasi Sukamukti (Tetangga)', 'KOP-SUKAMUKTI', 'Sukamukti', 'ACTIVE']);
      
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-beras-3', 'tenant-3', 'Beras Merah Organik 2kg', 45000, 39000, 35, 'pcs', 1, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400']);
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-madu', 'tenant-3', 'Madu Hutan Asli Sukamukti', 65000, 55000, 20, 'pcs', 1, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400']);
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-kopi', 'tenant-3', 'Kopi Bubuk Robusta 250g', 24000, 19000, 60, 'pcs', 1, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400']);
    }

    // Seed tenant-4 (Jawa Timur)
    const tenants4 = db.getAllSync(`SELECT * FROM tenants WHERE id = 'tenant-4'`);
    if (tenants4.length === 0) {
      console.log("Database Migration: Seeding tenant-4...");
      db.runSync(`INSERT OR IGNORE INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
        ['tenant-4', 'Koperasi Jaya Makmur (Jawa Timur)', 'KOP-JAYAMAKMUR', 'Surabaya', 'ACTIVE']);
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-apel', 'tenant-4', 'Apel Malang Segar 1kg', 25000, 20000, 80, 'kg', 1, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400']);
    }

    // Seed tenant-5 (Sumatera Utara)
    const tenants5 = db.getAllSync(`SELECT * FROM tenants WHERE id = 'tenant-5'`);
    if (tenants5.length === 0) {
      console.log("Database Migration: Seeding tenant-5...");
      db.runSync(`INSERT OR IGNORE INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
        ['tenant-5', 'Koperasi Danau Toba (Sumatera Utara)', 'KOP-DANAUTOBA', 'Balige', 'ACTIVE']);
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-kopi-lintong', 'tenant-5', 'Kopi Lintong Premium 250g', 48000, 40000, 40, 'pcs', 1, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400']);
    }

    // Seed tenant-6 (Sulawesi Utara)
    const tenants6 = db.getAllSync(`SELECT * FROM tenants WHERE id = 'tenant-6'`);
    if (tenants6.length === 0) {
      console.log("Database Migration: Seeding tenant-6...");
      db.runSync(`INSERT OR IGNORE INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
        ['tenant-6', 'Koperasi Bunaken Lestari (Sulawesi Utara)', 'KOP-BUNAKEN', 'Manado', 'ACTIVE']);
      db.runSync(`INSERT OR IGNORE INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['prod-roa', 'tenant-6', 'Sambal Roa Manado', 22000, 17000, 50, 'pcs', 1, 'https://images.unsplash.com/photo-1595124201382-742455b33db6?w=400']);
    }

    // Set Sukamaju beras stock to 2 for low stock demo
    db.runSync("UPDATE products SET stock = 2 WHERE id = 'prod-beras';");
  } catch (e) {
    console.error("Database Migration Error seeding tenants:", e);
  }

  // Check if seeded
  const users = db.getAllSync(`SELECT * FROM users`);
  if (users.length === 0) {
    console.log("Seeding Native SQLite database...");
    
    // Seed Cooperatives (Tenants)
    db.runSync(`INSERT INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
      ['tenant-1', 'Koperasi Merah Putih Sukamaju', 'KOP-SUKAMAJU', 'Sukamaju', 'ACTIVE']);
    db.runSync(`INSERT INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
      ['tenant-2', 'Koperasi Sukasari (Tetangga)', 'KOP-SUKASARI', 'Sukasari', 'ACTIVE']);
    db.runSync(`INSERT INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
      ['tenant-3', 'Koperasi Sukamukti (Tetangga)', 'KOP-SUKAMUKTI', 'Sukamukti', 'ACTIVE']);
    db.runSync(`INSERT INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
      ['tenant-4', 'Koperasi Jaya Makmur (Jawa Timur)', 'KOP-JAYAMAKMUR', 'Surabaya', 'ACTIVE']);
    db.runSync(`INSERT INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
      ['tenant-5', 'Koperasi Danau Toba (Sumatera Utara)', 'KOP-DANAUTOBA', 'Balige', 'ACTIVE']);
    db.runSync(`INSERT INTO tenants (id, name, code, village, status) VALUES (?, ?, ?, ?, ?)`, 
      ['tenant-6', 'Koperasi Bunaken Lestari (Sulawesi Utara)', 'KOP-BUNAKEN', 'Manado', 'ACTIVE']);

    // Seed Users
    db.runSync(`INSERT INTO users (id, name, phone, role, rt_id, cooperative_id, points, referral_code, referred_by, pin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['user-dinda', 'Dinda', '081234567890', 'USER', 'RT 03', 'tenant-1', 120, 'DINDAJAK', null, '123456']);
    db.runSync(`INSERT INTO users (id, name, phone, role, rt_id, cooperative_id, points, referral_code, referred_by, pin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['user-budi', 'Pak Budi', '089876543210', 'RT_AGENT', 'RT 03', 'tenant-1', 250, 'BUDIAJAK', null, '654321']);
    db.runSync(`INSERT INTO users (id, name, phone, role, rt_id, cooperative_id, points, referral_code, referred_by, pin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['user-arif', 'Mas Arif', '081122334455', 'ADMIN', null, 'tenant-1', 0, 'ARIFAJAK', null, '111222']);
    db.runSync(`INSERT INTO users (id, name, phone, role, rt_id, cooperative_id, points, referral_code, referred_by, pin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['user-sari', 'Bu Sari', '085566778899', 'USER', 'RT 03', 'tenant-1', 50, 'SARIAJAK', 'DINDAJAK', '000000']);
    db.runSync(`INSERT INTO users (id, name, phone, role, rt_id, cooperative_id, points, referral_code, referred_by, pin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['user-rina', 'Ibu Rina', '087788990011', 'USER', 'RT 03', 'tenant-1', 80, 'RINAJAK', null, '111111']);


    // Seed Products (Sukamaju - tenant-1)
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-beras', 'tenant-1', 'Beras Premium 5kg', 75000, 68000, 2, 'pcs', 0, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-telur', 'tenant-1', 'Telur Ayam 1kg', 28000, 24000, 40, 'kg', 0, 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-minyak', 'tenant-1', 'Minyak Goreng 1L', 18000, 15500, 60, 'liter', 0, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-gula', 'tenant-1', 'Gula Pasir 1kg', 15000, 13000, 100, 'kg', 0, 'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-paket', 'tenant-1', 'Paket Sembako Dapur 50K', 50000, 42000, 30, 'pack', 0, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-pisang', 'tenant-1', 'Keripik Pisang Lokal', 12000, 9000, 25, 'pcs', 1, 'https://images.unsplash.com/photo-1613967193490-1d17b930c1a1?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-sambal', 'tenant-1', 'Sambal Rumahan Ibu Rina', 15000, 11000, 20, 'pcs', 1, 'https://images.unsplash.com/photo-1595124201382-742455b33db6?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-kangkung', 'tenant-1', 'Kangkung Segar RT 03', 4000, 3000, 15, 'pcs', 1, 'https://images.unsplash.com/photo-1550346048-b472e399580b?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-gas', 'tenant-1', 'Gas LPG 3kg Melon', 22000, 19000, 12, 'pcs', 0, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-sabun', 'tenant-1', 'Sabun Cuci Wangi', 14000, 11500, 35, 'pcs', 0, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400']);

    // Seed Products (Sukasari - tenant-2)
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-beras-2', 'tenant-2', 'Beras Premium 5kg (Sukasari)', 73000, 66000, 90, 'pcs', 0, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-telur-2', 'tenant-2', 'Telur Bebek Asin 10pcs', 35000, 30000, 50, 'pack', 1, 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-minyak-2', 'tenant-2', 'Minyak Kelapa Murni 1L', 32000, 27000, 25, 'liter', 1, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-gula-2', 'tenant-2', 'Gula Merah Aren 1kg', 22000, 18000, 40, 'kg', 1, 'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=400']);
    db.runSync(`INSERT INTO products (id, cooperative_id, name, price, cost_price, stock, unit, is_local, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      ['prod-paket-2', 'tenant-2', 'Paket Hemat Sukasari 75K', 75000, 65000, 15, 'pack', 0, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400']);

    // Seed active batch
    const batchId = 'batch-demo-1';
    db.runSync(`INSERT INTO rt_batches (id, rt_id, name, deadline, pickup_point, status, total_orders, total_gmv) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [batchId, 'RT 03', 'Belanja Mingguan RT 03 (Juli)', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), 'Balai RT 03 / Pos Hansip', 'OPEN', 2, 111000]);

    // Seed pre-completed order
    const orderId1 = 'order-prev-1';
    db.runSync(`INSERT INTO orders (id, user_id, rt_batch_id, channel, fulfillment, subtotal, discount, points_redeemed, total, payment_status, order_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId1, 'user-dinda', null, 'SELF_ORDER', 'PICKUP_AT_COOP', 75000, 0, 0, 75000, 'PAID', 'COMPLETED', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()]);
    db.runSync(`INSERT INTO order_items (id, order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
      ['item-prev-1', orderId1, 'prod-beras', 'Beras Premium 5kg', 75000, 1]);
    db.runSync(`INSERT INTO point_transactions (id, user_id, type, points, source, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['pt-1', 'user-dinda', 'EARN', 7, 'ORDER', orderId1, new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()]);

    // Seed Active Order inside Batch
    const orderId2 = 'order-batch-1';
    db.runSync(`INSERT INTO orders (id, user_id, rt_batch_id, channel, fulfillment, subtotal, discount, points_redeemed, total, payment_status, order_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId2, 'user-sari', batchId, 'CARD_PURCHASE', 'RT_PICKUP_POINT', 36000, 0, 0, 36000, 'PAID', 'READY_FOR_PICKUP', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()]);
    db.runSync(`INSERT INTO order_items (id, order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
      ['item-batch-1', orderId2, 'prod-minyak', 'Minyak Goreng 1L', 18000, 2]);

    // Audit logs
    db.runSync(`INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['log-1', 'Mas Arif (Admin)', 'SEED_DATA', 'Database initialized and preloaded with mock products and users.', new Date().toISOString()]);
    db.runSync(`INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['log-2', 'Pak Budi (RT Agent)', 'CREATE_BATCH', 'Created weekly batch Belanja Mingguan RT 03 (Juli).', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()]);
    db.runSync(`INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['log-3', 'Pak Budi (RT Agent)', 'CARD_PURCHASE', 'Registered assisted order for Bu Sari using QR Card.', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()]);
  }
};

// ----------------------------------------------------
// UNIFIED DATABASE EXPORT
// ----------------------------------------------------

export const dbService = {
  /**
   * Run a raw query (mostly for batch creation or DDL commands)
   */
  async exec(query: string): Promise<void> {
    if (Platform.OS === 'web') {
      await getWebDb().executeSql(query);
    } else {
      getNativeDb().execSync(query);
    }
  },

  /**
   * Run a write query (INSERT, UPDATE, DELETE) and get feedback
   */
  async run(query: string, params: any[] = []): Promise<{ insertId?: string; rowsAffected: number }> {
    if (Platform.OS === 'web') {
      const res = await getWebDb().executeSql(query, params);
      return {
        insertId: res?.insertId,
        rowsAffected: res?.rowsAffected || 0
      };
    } else {
      const db = getNativeDb();
      const result = db.runSync(query, params);
      return {
        insertId: result.lastInsertRowId ? String(result.lastInsertRowId) : undefined,
        rowsAffected: result.changes || 0
      };
    }
  },

  /**
   * Fetch all records matching the query
   */
  async getAll<T = any>(query: string, params: any[] = []): Promise<T[]> {
    if (Platform.OS === 'web') {
      return (await getWebDb().executeSql(query, params)) as T[];
    } else {
      const db = getNativeDb();
      return db.getAllSync(query, params) as T[];
    }
  },

  /**
   * Fetch a single record matching the query, or null
   */
  async getFirst<T = any>(query: string, params: any[] = []): Promise<T | null> {
    if (Platform.OS === 'web') {
      const results = await getWebDb().executeSql(query, params);
      return results.length > 0 ? (results[0] as T) : null;
    } else {
      const db = getNativeDb();
      return (db.getFirstSync(query, params) as T) || null;
    }
  },

  /**
   * Reset database back to default seeded data state
   */
  async resetDatabase(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem('kopmart_db');
      getWebDb(); // This triggers re-initialization and seeding
    } else {
      const db = getNativeDb();
      db.execSync(`
        DROP TABLE IF EXISTS tenants;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS rt_batches;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS point_transactions;
        DROP TABLE IF EXISTS settlements;
        DROP TABLE IF EXISTS audit_logs;
        DROP TABLE IF EXISTS cart_items;
      `);
      initNativeSchema(db);
    }
  }
};
