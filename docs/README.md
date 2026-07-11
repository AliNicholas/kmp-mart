# 📖 Panduan Penggunaan KMP Mart (SIMKOPDES)

Selamat datang di **KMP Mart (Sistem Informasi & Manajemen Koperasi Desa)**! Aplikasi ini dirancang khusus untuk mewujudkan digitalisasi koperasi inklusif, menghubungkan Koperasi Merah Putih (Kopdes), RT Agent, Kurir Desa, dan Pemasok untuk mempermudah pemenuhan kebutuhan pangan (sembako) warga desa.

---

## 🛠️ 1. Cara Instalasi dan Menjalankan Aplikasi

Aplikasi KMP Mart dibangun menggunakan **React Native (Expo)** dengan basis data lokal **SQLite** (menggunakan library `expo-sqlite` secara native dan mock local storage untuk web).

### Prasyarat System
* **Node.js** (Versi 18 atau lebih tinggi)
* **npm** atau **yarn**
* Perangkat Android/iOS dengan aplikasi **Expo Go** terpasang, atau simulator emulator (Xcode / Android Studio).

### Langkah-Langkah Instalasi
1. Clone repositori ini ke komputer lokal Anda:
   ```bash
   git clone <repository-url>
   cd kopmart
   ```
2. Instal semua dependensi projek:
   ```bash
   npm install
   ```
3. Jalankan server pembangunan lokal Metro:
   ```bash
   npx expo start
   ```

### Menjalankan Aplikasi pada Perangkat
* **Platform Web (Browser)**: Tekan tombol **`w`** pada terminal dev server Anda untuk membuka aplikasi di browser komputer.
* **Simulator iOS**: Tekan tombol **`i`** untuk membuka simulator Xcode.
* **Simulator Android**: Tekan tombol **`a`** untuk membuka simulator Android Studio.
* **HP Fisik (Android/iOS)**: Pindai kode QR yang muncul di terminal menggunakan kamera HP (iOS) atau aplikasi Expo Go (Android).

---

## 👥 2. Panduan Akun Demo Berdasarkan Peran (Roles)

Untuk mempermudah presentasi atau uji coba selama demo, gunakan akun simulasi berikut yang telah terisi data awal (seed data) di database:

| Peran (Role) | Nama Demo | Nomor HP | PIN Demo | Detail Peran |
| :--- | :--- | :--- | :--- | :--- |
| **Warga** | Dinda | `081234567890` | `123456` | Belanja kebutuhan eceran, cek poin & referral, lacak kurir |
| **RT Agent** | Pak Budi | `081223344556` | `123456` | Koordinator pesanan kolektif RT (Batch Order), Drop Point RT |
| **Admin** | Mas Arif | `081299887766` | `123456` | Kelola stok barang, proses order, pantau keuangan & audit log |
| **Kurir Desa** | Mang Ujang | `081255667788` | `123456` | Terima tugas antar barang, lihat peta rute, kumpulkan uang COD |
| **Pemasok** | Dewi Lestari | `081244556677` | `123456` | Kirim pasokan barang grosir ke Koperasi, terima bayaran |

> [!NOTE]
> Anda dapat berpindah peran secara cepat kapan saja tanpa logout melalui tombol **`Demo (Hammer Icon)`** di sudut kanan atas halaman Login.

---

## 🌟 3. Penjelasan Fitur Utama & Cara Penggunaan

### A. Fitur Warga (Citizen Portal)
1. **Multi-Cooperative Selector (Pilih Koperasi)**:
   * Warga dapat mengganti koperasi belanja melalui header atas di dashboard.
   * Tersedia peta wilayah lokal dan nasional yang menunjukkan 6 cabang Koperasi Merah Putih di seluruh Indonesia (Jawa, Bali, Sumatera, Sulawesi).
   * **Surcharge Dinamis**: Jika berbelanja di koperasi luar wilayah (jarak jauh), sistem akan otomatis menghitung surcharge pengiriman ekstra (Rp5.000 s/d Rp25.000) dan tambahan estimasi hari tiba secara dinamis.
2. **Belanja & Keranjang Sembako**:
   * Jelajahi barang eceran, tambah ke keranjang, gunakan voucher diskon, atau tukarkan **Poin Gotong Royong** sebagai potongan tunai langsung.
3. **Referral Gotong Royong**:
   * Ajak tetangga bergabung menggunakan kode unik Anda. Dapatkan bonus **10.000 Poin** setelah mereka berbelanja untuk pertama kalinya.
4. **Live Delivery Tracker (Simulasi Grab/Gojek)**:
   * Jika memilih metode **"Kirim ke Rumah"**, setelah checkout Anda akan otomatis disuguhkan dengan popup peta pelacakan kurir desa interaktif.
   * Anda bisa melihat posisi kurir (Mang Ujang) bergerak secara real-time sepanjang rute dari koperasi melewati belokan jalan desa hingga tiba di depan pintu rumah Anda.
   * Gunakan tombol **"Percepat Simulasi"** untuk mempercepat pergerakan kurir demi kelancaran demo.

### B. Fitur RT Agent (RTAgent Portal)
1. **Order Kolektif (Batch Delivery)**:
   * Membantu warga lansia atau non-smartphone memesan sembako secara kolektif untuk memangkas ongkos kirim.
   * RT Agent dapat memantau status pesanan batch yang sedang dikirim oleh kurir menuju Pos RT.
2. **Konfirmasi Penerimaan**:
   * Setelah barang tiba di drop-point Pos RT, agen memberikan konfirmasi digital untuk membagikan barang ke warga masing-masing.

### C. Fitur Admin & Operasional (Admin Portal)
1. **Fulfillment Queue & Riwayat Transaksi**:
   * Admin mengemas barang pesanan masuk, menandai barang siap diambil (untuk Ambil Mandiri), atau mendelegasikan pengiriman ke kurir (Kirim ke Rumah).
   * **Riwayat Transaksi Selesai**: Scroll ke bagian terbawah tab Fulfillment untuk melihat log lengkap transaksi yang telah selesai lengkap dengan detail waktu, metode penyerahan, dan status bayar.
2. **Manajemen Stok (Inventory)**:
   * Ubah harga barang, tambah stok masuk, atau pantau level persediaan sembako secara nasional.
3. **Finance & Immutable Ledger Audit Log**:
   * **Laporan Laba Rugi**: Menampilkan pendapatan kotor, biaya pengadaan barang, potongan poin, surcharge antar-koperasi, dan laba bersih secara real-time.
   * **Ledger Audit Log**: Menampilkan riwayat mutasi keuangan dan aksi penting petugas koperasi secara transparan dan tidak dapat dimanipulasi (immutable) untuk mencegah korupsi dana koperasi.

### D. Fitur Kurir Desa (Driver Portal)
1. **Task Board (Papan Tugas)**:
   * Kurir dapat menerima atau menolak tugas pengantaran sembako yang didelegasikan oleh Admin.
2. **Peta Rute Navigasi Driver**:
   * Kurir dapat menekan tombol **"Rute Peta"** pada kartu tugas untuk memunculkan navigasi peta rute.
   * **Pilihan Peta**: Dapat beralih secara dinamis antara **Google/Apple Maps** (native) dan **OpenStreetMap** (Leaflet JS WebView) untuk melihat visual jalur jalan desa.
   * Tombol **"Buka Navigasi"** akan membuka aplikasi peta navigasi GPS utama eksternal di handphone driver.
3. **Penyelesaian Tugas & COD**:
   * Kurir dapat mencatat PIN bukti penyerahan barang dan menginput jumlah uang tunai COD yang berhasil dikumpulkan dari warga untuk kemudian disetor ke admin koperasi.

### E. Fitur Pemasok (Supplier Portal)
1. **Supply Procurement Requests**:
   * Pemasok menerima order pembelian grosir dari admin koperasi.
   * Pemasok menandai pengiriman pasokan bahan pokok dan memantau status pembayaran piutang mereka.

---

## 📁 4. Struktur Folder Kunci Projek
* `src/app/` — Penataan rute navigasi utama projek (Expo Router).
* `src/components/portals/` — Dashboard khusus untuk masing-masing peran (Admin, Citizen, Driver, Supplier).
* `src/components/` — Komponen UI reusable seperti `DeliveryTrackerModal`, `CoopSelectorModal`, `open-street-map`, dll.
* `src/contexts/AppContext.tsx` — Pusat pengelolaan state aplikasi, fungsi login, checkout, kalkulasi keuangan, dan sinkronisasi data database.
* `src/utils/db.ts` — Pengelolaan skema database SQLite, query tabel, migrasi data, dan seed data demo otomatis.
