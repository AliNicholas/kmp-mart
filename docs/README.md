# 📂 Pusat Dokumentasi KMP Mart (SIMKOPDES)

Selamat datang di pusat dokumentasi KMP Mart. Di bawah ini adalah panduan lengkap mengenai cara penggunaan, instalasi, dan spesifikasi teknis database aplikasi.

Silakan pilih panduan detail yang Anda butuhkan melalui tautan berikut:

---

## 🗺️ Menu Navigasi Panduan

### 1. [🛠️ Panduan Instalasi & Cara Menjalankan](file:///Users/gustam/Developer/hackathon/kopmart/docs/INSTALLATION.md)
* **Kebutuhan Sistem**: Prasyarat Node.js, SDK, dan emulator.
* **Instalasi**: Urutan perintah clone, install npm dependencies, dan TypeScript check.
* **Menjalankan Dev Server**: Langkah menjalankan di Browser (Web), iOS Simulator, Android Simulator, dan HP Fisik via Expo Go.
* **Troubleshooting**: Penyelesaian masalah Google Maps blank, port sibuk, clearing cache, dan legacy-peer-deps.

### 2. [👥 Panduan Akun Demo & Alur Kerja Peran](file:///Users/gustam/Developer/hackathon/kopmart/docs/ROLES_WORKFLOW.md)
* **Kredensial Demo**: Nomor handphone dan PIN demo untuk Warga, RT Agent, Admin, Kurir Desa, dan Pemasok.
* **Alur Simulasi Belanja (E2E)**: Cara memesan sembako eceran, konfirmasi admin, pelacakan rute driver, input PIN bukti kirim, dan pergerakan peta Live Tracker warga.
* **Alur Pasok Barang (Procurement)**: Pembelian grosir koperasi ke supplier, pengiriman supplier, penerimaan stok gudang, dan pencatatan audit log mutasi kas.
* **Alur Belanja Kolektif RT**: Penggabungan belanja warga ke drop point Pos RT agent.

### 3. [🧠 Panduan Fitur & Teknis Basis Data](file:///Users/gustam/Developer/hackathon/kopmart/docs/FEATURES_DATABASE.md)
* **Skema SQLite**: Definisi kolom, tipe data, dan relasi kunci (primary/foreign key) dari 19 tabel database.
* **Logika Fitur Kompleks**:
  * Perhitungan Surcharge Lintas Koperasi (Wilayah & Nasional).
  * Simulator GPS Tracker Kurir (Trigonometri bearing dan percepatan waktu).
  * WebView OpenStreetMap Leaflet untuk driver.
* **Pola Desain Kode**: Penerapan *Derived State*, transaksi SQL atomik, dan kepatuhan compiler murni (*Purity Compliance*).

### 4. [⚙️ Panduan Cara Kerja Sistem (System Mechanics)](file:///Users/gustam/Developer/hackathon/kopmart/docs/HOW_IT_WORKS.md)
* **Arsitektur Data**: Alur offline-first terenkapsulasi dari UI React ke SQLite/LocalStorage.
* **Siklus Logistik E2E**: Alur pergerakan barang dan uang dari pengadaan hulu (Supplier), pembagian tengah (Cooperative & RT Agent), hingga ke hilir (Driver & Citizen).
* **Ledger Anti-Fraud**: Cara kalkulasi laba/rugi koperasi secara runtime dan pencatatan ledger keuangan transparan yang tidak dapat dimanipulasi.

---

> [!TIP]
> Semua data di dalam aplikasi bersifat dinamis dan disimpan secara lokal. Jika Anda ingin menyetel ulang (reset) basis data kembali ke keadaan awal seperti seed data demo asli, Anda dapat masuk sebagai Admin dan menekan tombol **"Reset Database"** di dashboard portal.
