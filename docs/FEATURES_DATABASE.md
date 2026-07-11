# 🧠 Panduan Fitur & Teknis Basis Data (Database Specification)

Dokumen ini berisi spesifikasi teknis mengenai struktur basis data (SQLite), arsitektur state management aplikasi, serta implementasi logika algoritma fitur-fitur kompleks di KMP Mart.

---

## 🗄️ 1. Skema Relasional Basis Data (SQLite Tables)

Berikut adalah definisi struktur tabel basis data relasional yang dideklarasikan di `src/utils/db.ts` dan di-compile secara native oleh `expo-sqlite` / `localStorage`:

### A. Tabel Utama (Core Entities)
1. **`tenants`** (Koperasi Wilayah)
   * `id` (TEXT, PK) — ID unik koperasi (contoh: `tenant-1`, `tenant-2`)
   * `name` (TEXT) — Nama cabang Koperasi Merah Putih
   * `code` (TEXT) — Kode registrasi koperasi
   * `village` (TEXT) — Lokasi desa/kecamatan
   * `status` (TEXT) — Status operasional (`ACTIVE` / `INACTIVE`)

2. **`users`** (Pengguna & Petugas)
   * `id` (TEXT, PK) — ID pengguna
   * `name` (TEXT) — Nama lengkap
   * `phone` (TEXT, Unique) — Nomor handphone untuk login
   * `role` (TEXT) — Peran sistem (`USER` / `RT_AGENT` / `ADMIN` / `DRIVER` / `SUPPLIER`)
   * `cooperative_id` (TEXT, FK -> `tenants.id`) — Cabang tempat terdaftar
   * `points` (INTEGER) — Saldo Poin Gotong Royong
   * `referral_code` (TEXT) — Kode rujukan pribadi
   * `referred_by` (TEXT) — ID pengajak (jika ada)
   * `pin` (TEXT) — PIN 6 digit untuk otentikasi login & serah terima barang
   * `nik_masked` (TEXT) — NIK KTP yang disamarkan demi privasi data
   * `address` (TEXT) — Alamat tempat tinggal warga
   * `member_id` (TEXT) — Nomor Anggota Koperasi Nasional
   * `card_token` (TEXT) — Token RFID/QR Code kartu fisik Kopdes
   * `is_pickup_point` (INTEGER) — Flag RT Agent sebagai drop point (0 atau 1)

3. **`products`** (Katalog Barang)
   * `id` (TEXT, PK) — ID barang
   * `cooperative_id` (TEXT, FK -> `tenants.id`) — Pemilik stok barang
   * `name` (TEXT) — Nama barang eceran
   * `price` (INTEGER) — Harga jual warga (Rupiah)
   * `cost_price` (INTEGER) — Harga modal pokok pengadaan
   * `stock` (INTEGER) — Sisa stok fisik di rak
   * `unit` (TEXT) — Satuan barang (`pcs`, `kg`, `liter`, `pack`)
   * `is_local` (INTEGER) — Produk UMKM desa setempat (1) atau produk nasional (0)
   * `image_url` (TEXT) — Tautan foto produk

### B. Tabel Transaksi & Logistik (Transactions & Logistics)
4. **`orders`** (Pesanan Belanja)
   * `id` (TEXT, PK) — Nomor invoice
   * `user_id` (TEXT, FK -> `users.id`) — Pembeli
   * `rt_batch_id` (TEXT, FK -> `rt_batches.id`, Nullable) — ID Batch RT (jika kolektif)
   * `channel` (TEXT) — Jalur beli (`SELF_ORDER` / `CARD_PURCHASE` / `RT_ASSISTED`)
   * `fulfillment` (TEXT) — Metode serah barang (`PICKUP_AT_COOP` / `DELIVERY_TO_HOME` / `RT_PICKUP_POINT`)
   * `subtotal` (INTEGER) — Total harga produk sebelum diskon
   * `discount` (INTEGER) — Nilai potongan belanja
   * `points_redeemed` (INTEGER) — Koin poin yang ditukarkan
   * `total` (INTEGER) — Net bayar (termasuk pajak/surcharge jika ada)
   * `payment_status` (TEXT) — Status bayar (`UNPAID` / `PAID`)
   * `order_status` (TEXT) — Status pesanan (`PENDING_PAYMENT`, `PAID`, `PACKED`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`)
   * `created_at` (TEXT) — Waktu transaksi dibuat

5. **`order_items`** (Item Detail Belanja)
   * `id` (TEXT, PK) — ID item
   * `order_id` (TEXT, FK -> `orders.id`) — Nomor invoice
   * `product_id` (TEXT, FK -> `products.id`) — ID produk dibeli
   * `name` (TEXT) — Nama produk saat dibeli
   * `price` (INTEGER) — Harga satuan saat dibeli
   * `quantity` (INTEGER) — Kuantitas dibeli

6. **`delivery_tasks`** (Tugas Kurir Desa)
   * `id` (TEXT, PK) — ID tugas
   * `cooperative_id` (TEXT, FK -> `tenants.id`) — Asal barang pengiriman
   * `order_id` (TEXT, FK -> `orders.id`, Nullable) — Invoice pesanan warga
   * `rt_batch_id` (TEXT, FK -> `rt_batches.id`, Nullable) — Invoice pesanan kolektif RT
   * `driver_id` (TEXT, FK -> `users.id`, Nullable) — Kurir yang ditugaskan
   * `delivery_type` (TEXT) — Tipe pengantaran (`HOME_DELIVERY` / `RT_BATCH_DELIVERY`)
   * `status` (TEXT) — Status tugas (`PENDING_DISPATCH`, `ASSIGNED`, `ACCEPTED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `FAILED`)
   * `delivery_fee` (INTEGER) — Ongkos kirim warga
   * `driver_incentive` (INTEGER) — Komisi bersih untuk kurir desa
   * `cod_amount` (INTEGER) — Jumlah tagihan tunai yang harus ditagih ke warga

---

## 🌟 2. Penjelasan Detail Logika Fitur Utama

### A. Multi-Cooperative & Surcharge Dinamis
Sistem KMP Mart mengizinkan warga berbelanja di koperasi luar wilayah jika stok koperasi desa terdekat sedang kosong. Logika perhitungannya sebagai berikut:
1. Saat user memilih koperasi tujuan, `AppContext` mendeteksi jarak asal koperasi terhadap user.
2. Jika koperasi berada di luar desa (desa tetangga), ditambahkan **Surcharge Lintas Koperasi** sebesar **Rp5.000**.
3. Jika koperasi berada di luar provinsi (skala nasional, contoh: Koperasi Jawa Timur/Sumatera untuk user di Bali), ditambahkan **Surcharge Nasional** sebesar **Rp25.000** dan estimasi waktu tiba bertambah `+3 hari`.
4. Surcharge ini secara dinamis ditambahkan ke variabel `total` pada tabel `orders` dan dialokasikan ke pembukuan pengeluaran logistik admin koperasi.

### B. Animasi Live GPS Tracker Kurir (Simulation Engine)
Untuk menghindari dependensi Google Maps API Key yang mahal dan rumit selama demo, kami membangun simulator pergerakan kurir dengan data rute presisi:
1. **Titik Koordinat**: Sistem memetakan rute sepanjang 9 koordinat geografis nyata di daerah Kuta/Seminyak Bali dari koordinat Koperasi (Start) ke rumah warga (End).
2. **Animation Loop**: Menggunakan hook `useEffect` dengan interval timer 1 detik:
   * Posisi marker kurir (sepeda motor) berpindah dari koordinat `i` ke `i+1` secara perlahan.
   * Sudut rotasi motor (`bearing`) dihitung otomatis berdasarkan rumus matematika trigonometri antara dua koordinat koordinat agar icon motor menghadap ke arah jalan yang benar.
3. **Speed Accelerator**: Tombol **"Percepat Simulasi"** memotong interval timer dari 1000ms menjadi 100ms, mempermudah demonstrasi alur pelacakan selesai hanya dalam 5 detik.

### C. WebView OpenStreetMap (Dual-Maps)
Pada portal driver, visualisasi rute jalan desa tidak hanya mengandalkan native maps bawaan Android/iOS (yang seringkali blank tanpa API Key):
1. **OSM Bridge**: Kami menyematkan komponen Leaflet JS yang dibungkus di dalam React Native `WebView`.
2. **Offline Assets/Web Engine**: Peta merender ubin peta (tiles) OpenStreetMap secara dinamis, menggambar garis rute pengiriman (polyline), dan memposisikan marker koperasi serta tujuan kurir secara akurat tanpa lisensi berbayar.

---

## 🛡️ 3. Pola Desain Kode & State Management (Design Patterns)

### 1. Derived State Pattern (State Turunan)
Kami menghindari penyimpanan state redundan yang memicu bug desinkronisasi data. Nilai-nilai reaktif dihitung langsung dari data primer database pada saat render komponen:
* **Sisa Kuota Limit Kredit**: Dihitung dari `Limit Maksimal - Total Invoice Berstatus Aktif`.
* **Total Poin Didapat**: Dihitung secara runtime berdasarkan rumus `Total GMV Belanja / 10.000`.

### 2. Transaksi SQL Atomik (Atomic Writes)
Setiap transaksi belanja kritis (checkout) dibungkus dalam satu transaksi SQL tunggal untuk menghindari kegagalan parsial database:
```sql
-- Transaksi Checkout Tunggal (Atomic)
BEGIN TRANSACTION;
  INSERT INTO orders ...;
  INSERT INTO order_items ...;
  UPDATE products SET stock = stock - ? WHERE id = ?;
  INSERT INTO point_transactions ...;
  INSERT INTO audit_logs ...;
COMMIT;
```
Jika salah satu baris perintah SQL gagal (misal: stok produk habis di tengah jalan), seluruh transaksi dibatalkan otomatis (*rollback*) demi keamanan kas Koperasi.

### 3. Kepatuhan React Compiler (Purity Compliance)
Untuk menjamin rendering bebas efek samping (*idempotent rendering*), seluruh fungsi yang memodifikasi state luar (seperti pembuatan ID acak `uuid()` atau pemformatan tanggal waktu) diletakkan di luar tubuh fungsi komponen utama React. Hal ini memastikan komponen siap di-optimalkan oleh compiler otomatis masa depan React.
