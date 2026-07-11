# 👥 Panduan Penggunaan & Alur Kerja Berdasarkan Peran (Roles)

Aplikasi KMP Mart mengadopsi sistem **Multi-Tenant & Role-Based Access Control (RBAC)**. Terdapat 5 peran utama dengan dashboard portal yang berbeda-beda untuk menyimulasikan seluruh rantai pasok logistik sembako desa.

Untuk beralih peran secara cepat demi kebutuhan demo, gunakan tombol **`Demo (Hammer Icon)`** di sudut kanan atas halaman Login.

---

## 📋 Definisi & Fungsi Masing-Masing Peran

Aplikasi ini mendigitalisasi 5 elemen utama dalam ekosistem koperasi desa:

### 1. Warga (Citizen / USER)
* **Peran**: Pembeli utama kebutuhan bahan pangan eceran di Koperasi.
* **Fungsi Utama**:
  * Menjelajahi katalog sembako koperasi lokal maupun lintas daerah.
  * Berbelanja secara eceran menggunakan opsi Ambil Mandiri, Kirim ke Rumah (COD), atau Kolektif via RT.
  * Melacak pengantaran kurir secara langsung (*Live Maps Tracking*).
  * Mengumpulkan dan membelanjakan Poin Loyalitas Gotong Royong.
  * Mengajak tetangga bergabung menggunakan program referral.

### 2. RT Agent (RT_AGENT)
* **Peran**: Koordinator belanja warga satu RT sekaligus penanggung jawab drop-point pengantaran kolektif.
* **Fungsi Utama**:
  * Membantu warga yang tidak memiliki smartphone atau lansia untuk memesan sembako secara kolektif (Batch Delivery).
  * Menampung barang belanjaan warga di Pos RT (Drop Point).
  * Memverifikasi penerimaan kiriman batch besar dari kurir desa.
  * Melakukan settlement/penyetoran pembayaran batch ke koperasi.

### 3. Operasional / Superadmin (ADMIN)
* **Peran**: Pengelola gudang fisik dan pencatatan keuangan internal Koperasi Merah Putih.
* **Fungsi Utama**:
  * **Fulfillment**: Memproses antrean pesanan masuk, mengemas paket (`PACKED`), dan menugaskan kurir desa untuk pengiriman.
  * **Inventori (Stok)**: Memantau stok kritis sembako, mengedit harga eceran, dan membuat pengadaan grosir (Purchase Order) ke pemasok.
  * **Keuangan & Audit**: Memantau laba rugi real-time, memeriksa ledger pengeluaran/pendapatan, serta mengawasi *Immutable Audit Logs* pencegah korupsi.

### 4. Kurir Desa (DRIVER)
* **Peran**: Penyedia jasa pengiriman lokal (KopKurir) yang mendistribusikan barang dari Koperasi ke rumah warga/Pos RT.
* **Fungsi Utama**:
  * Menerima atau menolak tugas pengantaran barang masuk.
  * Melihat peta rute jalan desa dengan pilihan Google Maps atau OpenStreetMap.
  * Mengonfirmasi penyerahan paket dengan validasi PIN keamanan warga.
  * Mengumpulkan pembayaran COD tunai untuk disetor ke koperasi.

### 5. Pemasok (SUPPLIER)
* **Peran**: Mitra produsen lokal, UMKM, atau distributor grosir penyedia bahan pokok koperasi.
* **Fungsi Utama**:
  * Menerima Purchase Order (PO) grosir dari admin koperasi.
  * Memproses pengepakan dan pengiriman barang ke gudang koperasi.
  * Memantau tagihan piutang pembayaran atas pasokan sembako yang dikirim.

---

## 🔑 Kredensial Akses Akun Demo

| Peran (Role) | Nama | Nomor HP | PIN | Koperasi Asal |
| :--- | :--- | :--- | :--- | :--- |
| **Warga (Citizen)** | Dinda | `081234567890` | `123456` | Koperasi Merah Putih Sukamaju |
| **RT Agent (Agen Pos RT)** | Pak Budi | `081223344556` | `123456` | Koperasi Merah Putih Sukamaju |
| **Operasional (Admin)** | Mas Arif | `081299887766` | `123456` | Koperasi Merah Putih Sukamaju |
| **Kurir Desa (Driver)** | Mang Ujang | `081255667788` | `123456` | Koperasi Merah Putih Sukamaju |
| **Pemasok (Supplier)** | Dewi Lestari | `081244556677` | `123456` | Koperasi Merah Putih Sukamaju |

---

## 🔄 Alur Simulasi Rantai Pasok Gotong Royong (E2E Workflow)

Berikut adalah panduan langkah demi langkah untuk menyimulasikan transaksi pembelian sembako dari hulu ke hilir menggunakan akun demo:

### 1. Peran Warga: Melakukan Belanja Eceran
* **Langkah 1**: Login sebagai **Dinda** (`081234567890`).
* **Langkah 2**: Lihat informasi poin loyalitas di dashboard atas. Anda memiliki **12.000 Poin Gotong Royong**.
* **Langkah 3**: Pilih koperasi belanja di header. Cari **Koperasi Sukasari (Koperasi Tetangga)** di peta atau daftar.
  > [!NOTE]
  > Memilih Koperasi luar wilayah akan memicu **Surcharge Pengiriman** sebesar Rp5.000 s/d Rp25.000 dan menambah estimasi pengiriman secara otomatis karena perbedaan jarak geografis koperasi.
* **Langkah 4**: Tambahkan beberapa barang sembako ke dalam keranjang belanja.
* **Langkah 5**: Buka halaman Keranjang. Klik **"Gunakan Poin"** untuk menukarkan poin loyalitas Anda menjadi diskon potongan harga.
* **Langkah 6**: Pilih opsi fulfillment: **"Kirim ke Rumah (COD)"**.
* **Langkah 7**: Klik **"Konfirmasi & Bayar"**. Pesanan Anda akan tersimpan di antrean fulfillment admin koperasi dengan status `PENDING`.
* **Langkah 8**: Popup pelacakan kurir **"Live Delivery Tracker"** akan langsung muncul secara otomatis. Untuk saat ini, posisinya masih berada di koperasi menunggu admin memproses pesanan.

### 2. Peran Admin: Fulfillment & Delegasi Kurir
* **Langkah 1**: Beralih peran (switch role) ke **Mas Arif (Admin)** melalui menu Demo.
* **Langkah 2**: Buka tab **"Fulfillment"** di dashboard Admin. Anda akan melihat pesanan milik Dinda yang berstatus `PAID` atau `UNPAID (COD)`.
* **Langkah 3**: Klik **"Siapkan Pesanan"** (status akan berubah menjadi `PACKED` / Siap Kirim).
* **Langkah 4**: Pilih kurir pengirim: **Mang Ujang** dari daftar kurir yang bertugas, lalu klik **"Kirim via Kurir"** (status pesanan berubah menjadi `IN_TRANSIT`).

### 3. Peran Kurir Desa (Driver): Pengantaran & Peta Rute
* **Langkah 1**: Beralih peran ke **Mang Ujang (Driver)**.
* **Langkah 2**: Di dashboard Kurir, Anda akan melihat kartu tugas baru untuk mengantar barang ke rumah Dinda.
* **Langkah 3**: Tekan tombol **"Terima Tugas"**.
* **Langkah 4**: Tekan tombol **"Rute Peta"** di kartu tugas untuk melihat visual peta navigasi dari Koperasi ke alamat warga.
  * Anda dapat menukar provider peta antara **Google/Apple Maps** dan **OpenStreetMap (Leaflet Webview)** secara dinamis.
* **Langkah 5**: Berikan barang ke warga, kumpulkan uang COD jika ada, lalu minta warga memberikan **PIN Konfirmasi** (PIN Dinda: `123456`).
* **Langkah 6**: Masukkan PIN tersebut di dashboard Kurir untuk menandai pengantaran selesai (`DELIVERED`). Status uang COD akan masuk ke antrean setor kurir.

### 4. Peran Warga: Melihat Live Tracking Bergerak
* **Langkah 1**: Beralih kembali ke **Dinda (Warga)**.
* **Langkah 2**: Lihat peta Live Tracker yang sedang terbuka. Anda akan melihat animasi motor Kurir desa bergerak secara real-time dari titik Koperasi Sukamaju, melewati belokan jalan desa Bali, hingga berhenti tepat di ikon rumah Anda.
* **Langkah 3**: Tekan tombol **"Percepat Simulasi"** untuk melihat pergerakan driver dalam hitungan detik. Setelah driver tiba di koordinat tujuan, status pelacakan akan otomatis berubah menjadi "Pesanan Tiba di Tujuan".

---

## 📈 Alur Pengadaan Barang (Procurement Workflow)

Untuk menyimulasikan rantai pasok hulu (koperasi memesan barang grosir ke supplier lokal karena stok menipis):

### 1. Peran Admin: Membuat Purchase Order (PO)
* **Langkah 1**: Login sebagai **Mas Arif (Admin)**.
* **Langkah 2**: Buka tab **"Stok Barang"**. Cari item **Beras Premium 5kg** yang stoknya tinggal 2 pcs (berwarna merah peringatan kritis).
* **Langkah 3**: Klik **"Pesan ke Supplier"**.
* **Langkah 4**: Pilih supplier **PT Agro Pangan Nusantara**, masukkan jumlah pemesanan (misalnya: 50 pcs), lalu klik **"Kirim Purchase Order"**.

### 2. Peran Pemasok (Supplier): Mengirim Pasokan Barang
* **Langkah 1**: Beralih peran ke **Dewi Lestari (Supplier)**.
* **Langkah 2**: Di dashboard Supplier, buka daftar Purchase Order masuk. Anda akan melihat pesanan PO Beras Premium dari Koperasi Sukamaju dengan status `PENDING`.
* **Langkah 3**: Klik **"Konfirmasi Pemesanan"** (status berubah menjadi `ACKNOWLEDGED`).
* **Langkah 4**: Klik **"Kirim Pasokan"** setelah barang selesai dikemas untuk dikirim ke gudang koperasi (status menjadi `SHIPPED`).

### 3. Peran Admin: Verifikasi & Audit Log Transaksi
* **Langkah 1**: Kembali ke **Mas Arif (Admin)**.
* **Langkah 2**: Di tab Stok, klik **"Terima Barang"** pada PO Beras yang baru tiba. Stok beras di koperasi akan bertambah secara otomatis sebanyak 50 pcs.
* **Langkah 3**: Buka tab **"Keuangan"**. Anda akan melihat mutasi pengeluaran kas baru untuk pembayaran beras kepada supplier.
* **Langkah 4**: Buka sub-tab **"Audit Log Ledger"**. Sistem mencatat riwayat transaksi tersebut:
  `[Mas Arif (Admin)] [RECEIVE_PO] Berhasil memverifikasi penerimaan beras 50 pcs dari PT Agro Pangan.`
  Log ini dienkripsi di tingkat database lokal agar tidak dapat dihapus/diubah.

---

## 📦 Alur Pemesanan Kolektif RT (Batch Order Workflow)

RT Agent berperan memfasilitasi belanja kolektif warga satu RT guna mendapatkan efisiensi biaya logistik:

### 1. Peran Warga: Belanja Kolektif RT
* **Langkah 1**: Login sebagai **Bu Sari** (`085566778899`).
* **Langkah 2**: Masukkan produk ke keranjang.
* **Langkah 3**: Di halaman Keranjang, pilih metode fulfillment: **"Ambil di Agen RT (Kolektif)"**.
* **Langkah 4**: Pilih Batch Aktif milik **Pak Budi (RT 03)**, lalu klik Checkout. Pesanan Bu Sari akan bergabung ke dalam keranjang besar RT 03.

### 2. Peran RT Agent: Penguncian & Penyetoran Batch
* **Langkah 1**: Beralih peran ke **Pak Budi (RT Agent)**.
* **Langkah 2**: Di dashboard Agen RT, Anda dapat melihat total pesanan warga terkumpul di batch aktif.
* **Langkah 3**: Klik **"Kunci Batch"** untuk menyetop pesanan masuk dari warga lain.
* **Langkah 4**: Klik **"Kirim ke Koperasi"** agar admin koperasi memproses paket besar tersebut.
* **Langkah 5**: Setelah kurir mengantarkan paket batch ke Pos RT, RT Agent menekan **"Konfirmasi Batch Diterima"** dan membagikan sembako ke masing-masing warga RT 03.
