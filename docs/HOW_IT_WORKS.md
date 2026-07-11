# ⚙️ Cara Kerja Sistem KMP Mart (SIMKOPDES)

Dokumen ini menjelaskan alur operasional, mekanisme data, serta bagaimana komponen-komponen KMP Mart saling terhubung untuk membentuk ekosistem rantai pasok gotong royong yang stabil, aman, dan offline-first.

---

## 🧭 1. Arsitektur Data Offline-First (Data Flow)

KMP Mart didesain agar dapat berfungsi penuh di area pedesaan dengan konektivitas internet terbatas menggunakan basis data lokal relasional (SQLite).

```
[ Antarmuka Layar / UI React Native ]
       ▲                          │
       │ (Re-render Reaktif)      │ (Panggil Aksi/Fungsi)
       │                          ▼
[  Global AppState Context / AppContext  ]
       ▲                          │
       │ (Data Ter-update)        │ (Query SQL: INSERT/UPDATE)
       │                          ▼
[ SQLite Engine (Native) / LocalStorage Fallback (Web) ]
```

1. **Interaksi Pengguna**: Ketika pengguna menekan tombol (misalnya: menambah barang ke keranjang atau konfirmasi pengiriman).
2. **Pemicu State Context**: Komponen UI memanggil fungsi yang dideklarasikan di `AppContext.tsx` (misal: `checkOut()`).
3. **Transaksi Database**: `AppContext` menjalankan operasi transaksi SQL gabungan ke database `db.ts`. Jika pada HP native, ia menulis langsung ke berkas database SQLite perangkat. Jika pada browser web, ia memproses query SQL di dalam memori dan menyimpannya ke `localStorage`.
4. **Reactive State Update**: Setelah operasi database sukses, state lokal di React (`orders`, `products`, `users`) diperbarui dari hasil bacaan database terbaru, memicu re-render UI secara instan dan sinkron di semua halaman.

---

## 🔄 2. Siklus Rantai Pasok Gotong Royong (E2E Supply Chain Flow)

Visualisasi alur pergerakan barang dan dana dari pemasok hingga dikonsumsi oleh warga desa:

```
┌──────────┐      PO Barang      ┌──────────┐     Pesan Eceran     ┌──────────┐
│ Supplier ├────────────────────>│ Koperasi |<─────────────────────┤  Warga   │
└────┬─────┘                     └────┬─────┘                      └────┬─────┘
     │ Kirim Barang                   │ Delegasi                        │ Bayar Tunai
     ▼                                ▼                                 ▼ / Poin
┌──────────┐                     ┌──────────┐                      ┌──────────┐
│  Gudang  │                     │  Kurir   ├─────────────────────>│ Rumah /  │
│ Koperasi │                     │   Desa   │    Antar Paket       │  Pos RT  │
└──────────┘                     └──────────┘                      └──────────┘
```

### A. Alur Hulu: Pengadaan Stok (Procurement)
1. **Deteksi Kritis**: Sistem memantau persediaan barang secara real-time. Jika stok berada di bawah batas minimum (seperti Beras < 5 pcs), admin koperasi mendapatkan peringatan.
2. **Purchase Order**: Admin mengirim permintaan pengadaan barang grosir ke Supplier lewat aplikasi.
3. **Pengiriman & Kas Masuk**: Supplier mengirim barang ke gudang koperasi. Begitu admin mengonfirmasi barang diterima, stok di katalog otomatis bertambah, dan transaksi pengeluaran tercatat di pembukuan keuangan koperasi.

### B. Alur Tengah: Belanja & Konsolidasi (Shopping & Consolidation)
1. **Opsi Belanja Mandiri**: Warga memesan eceran dan memilih opsi **Ambil Mandiri** ke koperasi terdekat tanpa biaya kirim.
2. **Opsi Kirim ke Rumah (Home Delivery)**: Warga memesan dengan opsi COD/Poin, pesanan diteruskan ke kurir desa untuk diantarkan langsung ke rumah warga.
3. **Opsi Pesanan Kolektif RT (Batch Order)**: Warga satu RT menggabungkan pesanan mereka ke satu batch yang dikoordinasikan oleh Agen RT. Ongkos kirim dipangkas karena barang dikirim secara massal ke satu drop point (Pos RT).

### C. Alur Hilir: Logistik & Distribusi (Logistics & Distribution)
1. **Penerimaan Kurir**: Kurir Desa (Driver) menerima notifikasi tugas pengantaran melalui dashboard mereka.
2. **Navigasi Rute**: Kurir membuka peta rute (Google Maps/OSM) untuk melacak jalan terbaik menuju lokasi pengantaran.
3. **Penyelesaian Transaksi Aman (PIN Verification)**: 
   * Untuk memastikan barang benar-benar sampai di tangan warga yang sah, Kurir wajib meminta **PIN Keamanan** warga pembeli.
   * Setelah PIN diverifikasi cocok oleh sistem database KMP Mart, status pesanan berubah menjadi `COMPLETED`, kas COD tercatat di tangan kurir, dan poin loyalitas warga bertambah.
4. **Penyetoran Kas**: Kurir menyetorkan uang tunai COD yang terkumpul ke Koperasi untuk ditandai selesai oleh admin keuangan.

---

## 📊 3. Mekanisme Keuangan & Audit Log Ledger (Anti-Fraud Ledger)

Untuk mencegah korupsi dan manipulasi dana oleh petugas internal koperasi, KMP Mart dilengkapi dengan fitur **Ledger Keuangan Transparan**:

1. **Immutable Ledger (Catatan Permanen)**:
   Setiap transaksi uang masuk (penjualan eceran, biaya pengiriman, biaya surcharge) dan uang keluar (pembelian barang ke supplier, komisi kurir, penukaran poin warga) dicatat ke tabel `audit_logs` secara otomatis dengan format:
   `[Waktu] - [Pelaku] - [Aksi] - [Detail Nominal & Alasan]`
2. **Kalkulasi Laba Bersih Otomatis**:
   Laba/Rugi koperasi dihitung secara runtime dengan rumus:
   $$\text{Laba Bersih} = \text{Subtotal Penjualan} + \text{Surcharge Jarak} + \text{Biaya Pengiriman Warga} - (\text{Harga Pokok/Modal PO} + \text{Potongan Poin} + \text{Komisi Kurir})$$
   Semua arus keuangan ini ditampilkan dalam grafik interaktif yang dapat diakses oleh pihak manajemen koperasi kapan saja.
