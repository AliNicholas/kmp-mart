# Product Requirements Document (PRD)

# KopMart

## Marketplace Koperasi Inklusif dengan Kartu Kopdes, Peta Koperasi Nusantara, Pelacakan Pengiriman Real-Time, Poin Gotong Royong, Referral, dan Dashboard Keuangan

**Version:** 3.0 — Updated Development PRD (Post-RT Agent Deprecation)  
**Primary Pillar:** Pilar 1 — Peningkatan Volume Usaha Koperasi  
**Product Type:** Marketplace koperasi + assisted commerce + loyalty/referral engine  
**Core Hook:** Belanja koperasi bisa sendiri atau pakai kartu, dikirim langsung oleh Kurir Desa  
**Main Success Metric:** Peningkatan GMV, volume transaksi, dan penyerapan produk lokal koperasi secara inklusif  

---

## 1. Executive Summary

### 1.1 Product Summary
**KopMart** adalah platform marketplace koperasi desa yang inklusif untuk meningkatkan volume usaha Koperasi Desa/Kelurahan Merah Putih. Aplikasi ini dirancang agar seluruh warga desa—baik yang melek teknologi maupun awam digital—dapat berbelanja di koperasi melalui dua jalur utama:
1. **Self-order via Aplikasi** untuk warga digital yang mandiri.
2. **Kartu Kopdes (QR Purchase Card)** untuk warga tanpa smartphone atau lansia, dibantu kasir/kurir desa dengan konfirmasi PIN.

Sistem pengiriman difokuskan pada **Ambil Mandiri** dan **Kirim ke Rumah (Kurir Desa)** yang dilengkapi simulator pelacakan pengiriman real-time.

### 1.2 One-Liner
> **KopMart membuat belanja koperasi bisa dilakukan sendiri atau pakai kartu—semua warga terlayani, pesanan dikirim langsung ke rumah, dan volume usaha koperasi meningkat.**

---

## 2. Product Positioning

| Dimensi | Deskripsi |
| :--- | :--- |
| **Bukan Super App** | Fokus 100% pada transaksi belanja harian koperasi, loyalitas anggota, dan pencatatan keuangan yang transparan. |
| **Inklusi Digital** | Warga non-smartphone tetap bisa berbelanja menggunakan kartu fisik QR Kopdes + PIN. |
| **Fulfillment Terintegrasi** | Pengiriman langsung ke rumah warga oleh Kurir Desa, didukung sistem pelacakan simulator 4-tahap (Kemas -> Ambil -> Antar -> Tiba). |
| **Skala Wilayah** | Mendukung belanja lintas koperasi desa (Lokal, Tetangga, maupun Lintas Pulau/Nasional) dengan dynamic surcharge & estimasi waktu tambahan. |

---

## 3. Core Functional Modules

### 3.1 Otentikasi dan Profil Anggota
- Pendaftaran dengan nomor HP + OTP.
- Pengaturan PIN 6 digit untuk keamanan transaksi kartu fisik.
- Pembatasan peran pengguna: `USER` (Warga) dan `ADMIN` (Koperasi).

### 3.2 Kartu Kopdes QR
- Kartu fisik ber-QR Code diterbitkan oleh Admin Koperasi untuk warga non-digital.
- Pemindaian kartu otomatis menampilkan profil belanja warga.
- Konfirmasi transaksi wajib menggunakan input PIN warga pada perangkat Admin.

### 3.3 Katalog Produk Desa & Lintas Wilayah
- Menampilkan produk sembako, produk lokal/UMKM, dan paket hemat.
- Peta Koperasi Nusantara terintegrasi menggunakan Google Maps:
  - Memungkinkan warga memilih berbelanja di 6 lokasi koperasi contoh (Sumatra, Jawa, Bali, Sulawesi).
  - Penambahan biaya ongkir dinamis (*dynamic surcharge* Rp5.000 s.d Rp25.000) dan tambahan hari pengiriman (+1 s.d +5 hari) berdasarkan jarak geografis.

### 3.4 Alur Checkout & Pelacakan Pengiriman
- Metode Pengiriman:
  - **Ambil Mandiri** di Koperasi.
  - **Kirim ke Rumah** via Kurir Desa.
- **Simulator Pengiriman Real-time (Mang Ujang)**:
  - Untuk metode "Kirim ke Rumah", menayangkan modal pelacakan 4-tahap: `PACKED` -> `PICKED_UP` -> `DELIVERING` -> `ARRIVED`.
  - Mencapai tahap `ARRIVED` secara otomatis meng-update status pesanan di SQLite menjadi `COMPLETED` dan status pembayaran menjadi `PAID` secara instan.

### 3.5 Poin Gotong Royong (Loyalty)
- Poin didapatkan setelah pesanan berstatus `COMPLETED` (1 poin setiap pembelanjaan Rp10.000, 2x lipat untuk produk lokal).
- Poin dapat ditukarkan sebagai potongan harga langsung saat checkout.

### 3.6 KopAjak Referral
- Setiap anggota memiliki kode referral unik.
- Reward referral cair ke dompet poin pengundang setelah orang yang diundang menyelesaikan transaksi pertamanya secara sukses.

### 3.7 Dashboard Finansial Admin
- Grafik visual dan metrik keuangan riil:
  - **Gross Merchandise Value (GMV)**.
  - **Jumlah Transaksi & Average Order Value (AOV)**.
  - **Margin Kotor / Gross Profit** (berdasarkan selisih harga jual dan harga pokok penjualan/COGS).
  - **Proyeksi Laba Rugi (P&L)** & **Arus Kas (Cashflow)**.
  - **Audit Log** lengkap mencatat histori penambahan stok, perubahan harga, dan status pesanan.

---

## 4. Tech Stack & Architecture

- **Frontend:** React Native (Expo SDK 57), NativeWind v4 (Tailwind CSS), React Native Reusables (CVA, clsx).
- **Styling & CSS:** CSS Variables dideklarasikan di `global.css` dan dipetakan di `tailwind.config.js`.
- **Database:** SQLite (`expo-sqlite` via `dbService` di `src/utils/db.ts`) untuk penyimpanan lokal offline-first.
- **Kondisi Khusus:** Penanganan peta interaktif fallback ke Google Maps `iframe` pada platform Web, dan menggunakan `react-native-maps` pada platform Native (iOS/Android).

---

## 5. Database Entities (SQLite Schema)

1. **tenants / cooperatives**: Daftar koperasi desa beserta koordinat lintang/bujur & surcharge.
2. **users**: Pengguna berserta peran (`USER` \| `ADMIN`), ID RT, dan NIK tersamar.
3. **kopdes_cards**: Token QR & status aktif kartu fisik warga.
4. **products**: Katalog produk, stok, COGS (harga modal), dan harga jual.
5. **orders**: Invoice, status pesanan (`CONFIRMED`, `PACKED`, `PICKED_UP`, `COMPLETED`), dan status bayar (`PAID`).
6. **order_items**: Detail produk dalam pesanan.
7. **point_transactions**: Histori penambahan & pemotongan poin warga.
8. **referrals**: Pencatatan relasi kode referral warga.
9. **audit_logs**: Catatan immutable aktivitas admin/pengguna.
