@AGENTS.md

# Product Requirements Document (PRD)

# KopMart RT

## Marketplace Koperasi Inklusif dengan RT Group Order, Kartu Kopdes, Poin Gotong Royong, Referral, dan Dashboard Keuangan

**Version:** 2.0 — Detailed Development PRD  
**Prepared for:** Hackathon Digital Cooperative / SIMKOPDES 2026  
**Primary Pillar:** Pilar 1 — Peningkatan Volume Usaha Koperasi  
**Product Type:** Marketplace koperasi + assisted commerce + loyalty/referral engine  
**Core Hook:** Belanja koperasi bisa sendiri, bisa pakai kartu, bisa dibantu RT  
**Main Success Metric:** Koperasi yang sebelumnya hanya “terdaftar” menjadi aktif bertransaksi secara rutin

---

## Table of Contents

1. Executive Summary
2. Hackathon Scoring Optimization Strategy
3. Background and Problem Statement
4. National Baseline and Strategic Context
5. Scientific and Business Foundation
6. Product Vision
7. Product Positioning
8. Goals and Non-Goals
9. Target Users and Personas
10. User Journey Overview
11. Product Scope
12. Functional Modules
13. Detailed User Stories and Acceptance Criteria
14. Functional Requirements
15. Non-Functional Requirements
16. Role and Permission Matrix
17. Data Model
18. API Specification
19. Order, Payment, Reward, and Settlement Statuses
20. Loyalty, Referral, and Mission Rules
21. Financial Model and Business Feasibility
22. Audit, Compliance, and Internal Control
23. AI Features
24. Analytics and KPI Tracking
25. UX and Accessibility Principles
26. Security, Privacy, and Fraud Prevention
27. Offline-First and Low-Connectivity Strategy
28. SIMKOPDES Integration Strategy
29. MVP Scope
30. Development Milestones
31. Testing Strategy
32. Demo Scenario for Hackathon
33. Risks and Mitigation
34. Roadmap
35. Open Questions
36. Final Pitch Narrative
37. References and Research Basis

---

# 1. Executive Summary

## 1.1 Product Summary

**KopMart RT** adalah marketplace koperasi inklusif yang dirancang untuk meningkatkan volume usaha koperasi desa/kelurahan dengan membuat seluruh warga dapat bertransaksi di koperasi melalui tiga jalur utama:

1. **Self-order melalui aplikasi/PWA** untuk warga digital yang terbiasa checkout sendiri.
2. **Kartu Kopdes / QR Purchase Card** untuk warga tanpa smartphone atau yang tidak nyaman memakai aplikasi.
3. **RT Group Order** untuk warga yang membutuhkan pendampingan, seperti lansia, difabel, warga kurang mampu, atau masyarakat awam digital.

Produk ini bukan super app. Fokusnya adalah **mengaktifkan transaksi koperasi** melalui marketplace, group order, kartu anggota, loyalty points, referral, titip jual produk warga, dan dashboard finansial yang bisa diaudit.

## 1.2 One-Liner

> **KopMart RT membuat belanja koperasi bisa dilakukan sendiri, pakai kartu, atau dibantu RT — sehingga semua warga bisa bertransaksi dan volume usaha koperasi meningkat.**

## 1.3 Why Now

Koperasi Desa/Kelurahan Merah Putih sudah banyak terbentuk dan terhubung secara administratif, tetapi transaksi digital riil masih rendah. Masalahnya bukan sekadar “belum ada sistem”, tetapi **sistem belum menjadi kebiasaan belanja warga**.

KopMart RT menutup gap tersebut dengan membuat koperasi menjadi kanal transaksi harian warga melalui:

- katalog dan stok digital,
- checkout mandiri,
- pembelian kolektif per RT,
- kartu fisik untuk non-digital users,
- reward untuk repeat order,
- referral untuk akuisisi warga aktif,
- dashboard untuk audit dan analisis keuangan.

---

# 2. Hackathon Scoring Optimization Strategy

Berdasarkan kriteria penilaian hackathon yang diberikan, produk ini dirancang untuk mengoptimalkan seluruh komponen penilaian:

| Kriteria Penilaian                          |   Bobot | Strategi Optimasi KopMart RT                                                                                                                                                                                                                                        |
| ------------------------------------------- | ------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Relevansi dengan Permasalahan/Tantangan** | **25%** | Fokus langsung pada masalah nasional: banyak koperasi terdaftar tetapi belum aktif bertransaksi. Solusi diarahkan ke Pilar 1, yaitu peningkatan volume usaha koperasi, dengan metrik GMV, order, repeat order, RT aktif, household aktif, dan produk lokal terjual. |
| **Inovasi dan Kreativitas**                 | **20%** | Marketplace koperasi bukan hal baru, tetapi diferensiasinya adalah **RT Group Order + Kartu Kopdes + Poin Gotong Royong + Referral**. Ini menjadikan produk sebagai marketplace inklusif yang bisa dipakai warga digital dan non-digital.                           |
| **Dampak dan Manfaat**                      | **20%** | Dampak dihitung secara terukur: GMV naik, jumlah transaksi naik, RT aktif, warga non-digital terlayani, produk lokal terserap, repeat order meningkat, dan nilai ekonomi berputar di koperasi.                                                                      |
| **Kemudahan Implementasi**                  | **15%** | MVP tidak bergantung pada e-KTP chip, NFC, atau hardware mahal. Fitur utama memakai Android/PWA, QR card printable, nomor HP, PIN, offline-first RT app, dan dashboard web.                                                                                         |
| **Kualitas Teknologi dan Solusi**           | **15%** | PRD menyediakan arsitektur multi-tenant, API-ready, role-based access, audit log, offline sync, financial dashboard, fraud prevention, dan AI yang relevan untuk demand forecasting dan promo recommendation.                                                       |
| **Presentasi dan Pitch**                    |  **5%** | Narasi pitch tajam: “setiap RT menjadi keranjang belanja koperasi, setiap kartu menjadi akses transaksi, setiap poin menjadi alasan warga kembali belanja.” Demo menunjukkan end-to-end transaction loop.                                                           |

## 2.1 Judging Maximization Principles

### A. Jangan terlalu luas

Produk tidak diposisikan sebagai super app. Semua fitur harus menjawab pertanyaan:

> “Apakah fitur ini menaikkan transaksi koperasi?”

Jika tidak, fitur tersebut masuk roadmap, bukan MVP.

### B. Tunjukkan data dan baseline

Pitch harus membawa baseline:

- jumlah koperasi terdaftar,
- jumlah koperasi aktif transaksi,
- volume usaha tercatat,
- gap antara “terdaftar” dan “hidup”,
- target pilot 90 hari.

### C. Tunjukkan dampak strategis

Bukan hanya “aplikasi bisa jalan”, tetapi:

- koperasi memperoleh transaksi rutin,
- warga non-digital ikut masuk ekosistem,
- RT menjadi channel aktivasi,
- produk lokal terserap,
- cashflow tercatat,
- audit bisa dilakukan.

### D. Tunjukkan implementability

Juri perlu melihat bahwa solusi bisa direplikasi ke banyak koperasi dengan keterbatasan digital. Karena itu MVP harus memakai:

- QR card,
- PIN,
- PWA/Android,
- offline-first,
- template produk,
- dashboard sederhana,
- role-based access.

### E. Tunjukkan kualitas teknologi

Demo harus membuktikan:

- multi-role flow,
- stok berkurang otomatis,
- batch RT berjalan,
- poin cair setelah order selesai,
- referral cair setelah transaksi valid,
- dashboard GMV dan cashflow update,
- audit log tercatat.

---

# 3. Background and Problem Statement

## 3.1 Problem Statement

> **Koperasi desa sudah banyak terbentuk secara administratif, tetapi belum menjadi kanal transaksi harian warga.**

Banyak koperasi telah memiliki legalitas, sistem, dan akses digital, tetapi belum aktif sebagai tempat warga membeli kebutuhan harian, menjual produk lokal, atau melakukan transaksi rutin.

## 3.2 Core Problem

Masalah utama yang diselesaikan:

> **Bagaimana membuat koperasi yang sudah terdaftar menjadi koperasi yang benar-benar hidup melalui transaksi riil, rutin, dan inklusif?**

## 3.3 Root Causes

| Root Cause                                      | Explanation                                                                                   | Product Response                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Warga belum terbiasa transaksi digital koperasi | Aplikasi tersedia belum berarti dipakai                                                       | Marketplace sederhana + RT-assisted order |
| Warga non-digital tidak terjangkau              | Lansia, difabel, warga tanpa smartphone, dan warga awam digital tidak nyaman checkout sendiri | Kartu Kopdes + RT Agent App               |
| Order kecil dan tersebar                        | Belanja warga per rumah kecil, sehingga ongkir dan fulfillment tidak efisien                  | RT Group Order                            |
| Tidak ada habit belanja koperasi                | Warga tetap belanja di ritel/warung luar karena sudah terbiasa                                | Poin Gotong Royong + Paket Hemat RT       |
| Akuisisi user baru lambat                       | Koperasi sulit mengajak warga baru aktif                                                      | Referral / KopAjak                        |
| Produk lokal sulit terserap                     | UMKM/petani kecil tidak punya katalog digital                                                 | Titip Jual Warga                          |
| Data transaksi tidak rapi                       | Koperasi sulit forecast stok dan mengevaluasi performa                                        | Dashboard GMV, stok, P&L, cashflow        |
| Risiko salah urus                               | Cash, stok, poin, dan settlement bisa tidak transparan                                        | Audit log + financial dashboard           |

---

# 4. National Baseline and Strategic Context

## 4.1 National Baseline

Baseline yang digunakan dalam pitch:

| Metric                                |                                                  Baseline |
| ------------------------------------- | --------------------------------------------------------: |
| KDKMP terdaftar di SIMKOPDES          |                                                   ±83.000 |
| KDKMP aktif bertransaksi digital      |                                                      ±795 |
| Volume usaha tercatat                 |                                            ±Rp16,8 miliar |
| Anggota terdaftar di SimkopDes Mobile |                                                ±2,08 juta |
| Gap utama                             | >99% koperasi terdaftar belum benar-benar aktif transaksi |

## 4.2 Strategic Gap

Masalahnya bukan lagi “membangun koperasi dari nol”, tetapi:

> **mengubah koperasi yang sudah ada menjadi channel transaksi yang rutin dipakai warga.**

KopMart RT adalah **transaction activation layer** yang dapat berdiri di atas atau terintegrasi dengan SIMKOPDES.

## 4.3 Strategic Relevance to Pillar 1

Pilar 1 adalah **Peningkatan Volume Usaha Koperasi**. Karena itu semua fitur harus mengarah ke:

- peningkatan GMV,
- peningkatan jumlah order,
- peningkatan active buyer,
- peningkatan repeat order,
- peningkatan AOV,
- peningkatan produk lokal terjual,
- peningkatan inventory turnover,
- peningkatan margin koperasi.

---

# 5. Scientific and Business Foundation

## 5.1 Loyalty Economics

Loyalty program digunakan karena transaksi pertama tidak cukup. Koperasi membutuhkan **repeat buyer** agar volume usaha stabil.

### Product implication

Poin Gotong Royong harus diukur dari:

- repeat order rate,
- redemption-to-purchase rate,
- GMV uplift dari voucher,
- increase in basket size,
- retention cohort.

Poin tidak boleh hanya menjadi hadiah registrasi. Poin harus menjadi **retention engine**.

## 5.2 Share of Wallet

Tujuan KopMart RT bukan mengganti semua tempat belanja warga, tetapi menaikkan porsi belanja rutin warga yang masuk ke koperasi.

Contoh kategori target:

- beras,
- telur,
- minyak,
- gas,
- sayur,
- bahan dapur mingguan,
- produk lokal,
- kebutuhan sekolah,
- paket posyandu,
- paket lansia.

## 5.3 Referral Marketing

Referral digunakan karena koperasi adalah jaringan sosial. Warga lebih percaya ajakan tetangga, keluarga, RT, PKK, atau kader dibanding iklan digital.

### Product implication

Referral reward harus cair setelah transaksi valid, bukan hanya registrasi.

```text
Invite → Register → First valid order → Reward released
```

## 5.4 Digital Intermediary Theory

Tidak semua warga dapat langsung menjadi pengguna digital. RT berfungsi sebagai **digital intermediary** yang membantu warga memakai layanan digital secara aman dan terpercaya.

### Product implication

Aplikasi tidak boleh memaksa semua warga install aplikasi. Harus ada:

- Kartu Kopdes,
- RT Agent App,
- PIN/OTP,
- struk SMS/WhatsApp,
- offline-first assisted order.

## 5.5 Cooperative Philosophy

Koperasi bukan hanya bisnis komersial. Koperasi memiliki dua dimensi:

1. profit/keberlanjutan bisnis,
2. kesejahteraan bersama.

KopMart RT menjaga keduanya dengan:

- menaikkan omzet koperasi,
- membuka akses warga kurang mampu,
- memberi ruang titip jual,
- mencatat cashflow dan audit,
- memastikan manfaat kembali ke koperasi dan anggota.

## 5.6 Industry Benchmark

Retail modern seperti Alfagift, Indomaret Poinku, OVO Points, dan member-card retail membuktikan bahwa:

- member identity penting untuk pencatatan transaksi,
- points mendorong repeat visit,
- coupons dapat mengarahkan pembelian,
- referral membantu akuisisi,
- personalized promo dapat menaikkan basket size.

Bedanya, KopMart RT menerapkan pola tersebut dengan filosofi koperasi:

> **insentif bukan untuk mengunci customer demi profit platform, tetapi untuk membuat nilai belanja warga kembali berputar di koperasi.**

---

# 6. Product Vision

## 6.1 Vision Statement

> **Menjadikan koperasi sebagai marketplace lokal yang inklusif, dipercaya, dan dipakai rutin oleh seluruh warga — baik yang digital maupun non-digital — sehingga koperasi benar-benar hidup melalui transaksi harian.**

## 6.2 Mission Statement

Membangun sistem transaksi koperasi yang:

- mudah dipakai,
- inklusif,
- terukur,
- bisa diaudit,
- bisa direplikasi,
- langsung berdampak ke volume usaha koperasi.

---

# 7. Product Positioning

## 7.1 What KopMart RT Is

KopMart RT adalah:

- marketplace koperasi,
- assisted commerce platform,
- RT group order system,
- loyalty and referral engine,
- financial and audit dashboard,
- koperasi transaction activation layer.

## 7.2 What KopMart RT Is Not

KopMart RT bukan:

- super app,
- aplikasi simpan pinjam,
- paylater,
- e-money,
- pengganti SIMKOPDES,
- marketplace nasional lintas provinsi untuk MVP,
- aplikasi sosial tanpa transaksi.

## 7.3 Unique Differentiation

| Marketplace biasa             | KopMart RT                                  |
| ----------------------------- | ------------------------------------------- |
| Menunggu user install app     | RT aktif mengumpulkan order                 |
| Hanya menjangkau user digital | Menjangkau digital dan non-digital users    |
| Order individual kecil        | Order digabung per RT                       |
| Ongkir/fulfillment mahal      | Pickup point RT menurunkan biaya distribusi |
| Loyalty umum                  | Poin diarahkan ke repeat order koperasi     |
| Referral komersial            | Referral berbasis gotong royong warga       |
| Tidak punya struktur lokal    | Memakai RT sebagai trusted activation layer |

---

# 8. Goals and Non-Goals

## 8.1 Product Goals

| Goal                                      | Metric                                    |
| ----------------------------------------- | ----------------------------------------- |
| Meningkatkan transaksi koperasi           | GMV, order count                          |
| Meningkatkan active buyers                | Monthly active buyers                     |
| Meningkatkan repeat order                 | Repeat order rate                         |
| Mengaktifkan RT sebagai channel transaksi | RT active, batch submitted                |
| Mengikutsertakan warga non-digital        | Assisted order count, card purchase count |
| Menyerap produk lokal                     | Local SKU sold, local product GMV         |
| Mengontrol cashflow                       | Settlement rate, pending settlement       |
| Membuat koperasi auditable                | Audit log completeness                    |
| Mengoptimalkan stok                       | Inventory turnover, stockout rate         |

## 8.2 Non-Goals for MVP

| Non-Goal                          | Reason                                        |
| --------------------------------- | --------------------------------------------- |
| e-KTP chip integration            | Regulasi dan hardware belum praktis untuk MVP |
| Fingerprint/FaceID server-side    | Risiko privasi tinggi                         |
| Paylater                          | Risiko kredit dan regulasi                    |
| Full accounting ERP               | MVP cukup financial dashboard dasar           |
| Inter-koperasi national logistics | Butuh fase scale-up                           |
| Full AI automation                | AI hanya sebagai decision support             |
| Crypto/tokenization               | Tidak relevan dan berisiko                    |
| Marketplace tanpa batas wilayah   | MVP fokus koperasi lokal/pilot                |

---

# 9. Target Users and Personas

## 9.1 Persona 1 — Warga Digital

**Profile:** Gen-Z, pekerja, keluarga muda, punya smartphone, terbiasa belanja online.  
**Needs:** cepat, praktis, stok terlihat, bisa checkout sendiri.  
**Pain:** koperasi terasa tidak praktis dibanding marketplace/ritel modern.  
**Feature:** self-order app, QRIS, delivery/pickup, points, referral.

## 9.2 Persona 2 — Warga Non-Digital

**Profile:** lansia, warga tanpa smartphone, warga hemat kuota, warga tidak nyaman aplikasi.  
**Needs:** tetap bisa belanja dan mendapat manfaat koperasi.  
**Pain:** takut salah pakai aplikasi, tidak punya e-wallet, tidak punya smartphone.  
**Feature:** Kartu Kopdes, PIN, dibantu RT/kasir, struk cetak/SMS.

## 9.3 Persona 3 — Warga Kurang Mampu

**Profile:** daya beli terbatas, belanja kecil, sering cari paket murah.  
**Needs:** paket hemat, diskon, akses produk pokok, bisa titip jual/kontribusi.  
**Pain:** tidak selalu mampu beli dalam jumlah besar, akses digital terbatas.  
**Feature:** Paket Hemat RT, poin, voucher, tabungan barang roadmap, titip jual, KopTask.

## 9.4 Persona 4 — RT/Kader

**Profile:** trusted local leader, dekat dengan warga.  
**Needs:** membantu warga belanja, mengelola batch order, mencatat pickup dan pembayaran.  
**Pain:** pencatatan manual rawan salah, uang tunai rawan tidak rapi.  
**Feature:** RT Agent App, group order, pickup list, settlement report, audit log.

## 9.5 Persona 5 — Admin Koperasi

**Profile:** pengurus koperasi yang mengelola produk, stok, pesanan, dan laporan.  
**Needs:** katalog, order management, stok, packing, dashboard keuangan.  
**Pain:** transaksi manual, stok tidak akurat, sulit forecast demand.  
**Feature:** Admin Web, stock management, batch fulfillment, dashboard GMV/P&L/cashflow.

## 9.6 Persona 6 — UMKM/Petani/Warga Penjual

**Profile:** warga punya produk rumahan/hasil tani, belum punya kanal digital.  
**Needs:** produk bisa dijual lewat koperasi.  
**Pain:** tidak punya katalog, tidak punya promosi, tidak punya akses pembeli.  
**Feature:** Titip Jual Warga.

## 9.7 Persona 7 — Pemdes/Auditor

**Profile:** pihak monitoring dampak program.  
**Needs:** laporan agregat, transaksi, cashflow, dan audit.  
**Pain:** program sering sulit dibuktikan dampaknya.  
**Feature:** dashboard KPI, export report, audit log.

---

# 10. User Journey Overview

## 10.1 Journey A — Self-Order

```text
Open app
→ Login
→ Choose cooperative
→ Browse product
→ Add to cart
→ Choose pickup/delivery/RT batch
→ Apply points/voucher
→ Pay
→ Order fulfilled
→ Points earned
→ Repeat order
```

## 10.2 Journey B — Kartu Kopdes Purchase

```text
Warga datang ke koperasi/RT
→ Kartu Kopdes discan
→ Profil warga muncul
→ Produk dipilih
→ Warga input PIN/OTP
→ Order dibuat
→ Bayar cash/QRIS
→ Struk diberikan
→ Points earned
```

## 10.3 Journey C — RT Group Order

```text
RT create batch
→ Batch open
→ Warga digital join directly
→ Warga non-digital titip RT
→ RT locks batch
→ Koperasi accepts batch
→ Packing per warga
→ Delivery to RT point
→ Warga pickup
→ RT confirms pickup/payment
→ Order completed
→ Points issued
```

## 10.4 Journey D — Referral

```text
User shares KopAjak code
→ Invitee registers
→ Invitee makes first valid order
→ Order completed
→ Referrer gets reward
→ Invitee gets reward
```

## 10.5 Journey E — Titip Jual

```text
Warga submits product via RT/admin
→ Admin reviews
→ Product approved
→ Product appears in catalog
→ Product sold
→ Settlement recorded
```

---

# 11. Product Scope

## 11.1 MVP Modules

1. User App/PWA
2. RT Agent App/PWA
3. Admin Koperasi Web
4. Backend API
5. Product Catalog
6. Inventory Management
7. Cart and Checkout
8. RT Group Order
9. Kartu Kopdes QR
10. Poin Gotong Royong Basic
11. KopAjak Referral Basic
12. Financial Dashboard Basic
13. Settlement and Audit Log

## 11.2 Future Modules

1. Titip Jual advanced
2. KopTask
3. Mission Engine advanced
4. NFC Card
5. AI demand forecasting
6. AI package generator
7. WhatsApp bot
8. SIMKOPDES API integration
9. e-KTP/IKD integration
10. Regional procurement

---

# 12. Functional Modules

## 12.1 Module: Authentication and Kopdes ID

### Description

Handles user registration, login, role assignment, PIN, and member identity.

### Features

- phone number login,
- OTP verification,
- PIN setup,
- member profile,
- role assignment,
- cooperative selection,
- RT association,
- account status.

### Requirements

| ID       | Requirement                          | Priority |
| -------- | ------------------------------------ | -------- |
| AUTH-001 | User can register with phone number  | P0       |
| AUTH-002 | User can verify OTP                  | P0       |
| AUTH-003 | User can create 6-digit PIN          | P0       |
| AUTH-004 | User can login with phone + PIN/OTP  | P0       |
| AUTH-005 | User can be assigned to RT           | P0       |
| AUTH-006 | Admin can assign roles               | P0       |
| AUTH-007 | System masks NIK/member sensitive ID | P0       |
| AUTH-008 | Account can be suspended             | P1       |

---

## 12.2 Module: Kartu Kopdes

### Description

A QR-based purchase card for residents without smartphone/app access.

### MVP Behavior

- card generated by admin,
- QR contains token/member ID,
- RT/kasir scans card,
- user must confirm with PIN/OTP,
- order is recorded under user account.

### Requirements

| ID       | Requirement                              | Priority |
| -------- | ---------------------------------------- | -------- |
| CARD-001 | Admin can issue Kartu Kopdes             | P0       |
| CARD-002 | Card has QR token                        | P0       |
| CARD-003 | RT/kasir can scan card                   | P0       |
| CARD-004 | System requires PIN/OTP verification     | P0       |
| CARD-005 | Card can be blocked/unblocked            | P1       |
| CARD-006 | Card transaction appears in user history | P0       |
| CARD-007 | System can generate printable card PDF   | P1       |

---

## 12.3 Module: Product Catalog

### Description

Displays cooperative products and local products with stock, price, points eligibility, and discount eligibility.

### Product Types

- sembako,
- produk lokal,
- paket hemat,
- produk UMKM,
- jasa lokal roadmap,
- seasonal campaign products.

### Requirements

| ID      | Requirement                          | Priority |
| ------- | ------------------------------------ | -------- |
| CAT-001 | User can view product list           | P0       |
| CAT-002 | User can view product detail         | P0       |
| CAT-003 | Product shows stock status           | P0       |
| CAT-004 | Product shows unit and price         | P0       |
| CAT-005 | Product can be searched              | P0       |
| CAT-006 | Product can be filtered by category  | P1       |
| CAT-007 | Product can show local product badge | P1       |
| CAT-008 | Product can show points multiplier   | P1       |

---

## 12.4 Module: Inventory Management

### Description

Allows admin to manage stock and prevents overselling.

### Requirements

| ID      | Requirement                                       | Priority |
| ------- | ------------------------------------------------- | -------- |
| INV-001 | Admin can update stock                            | P0       |
| INV-002 | Stock decreases after order confirmed             | P0       |
| INV-003 | Stock is reserved after checkout for limited time | P1       |
| INV-004 | Stock cannot go below zero                        | P0       |
| INV-005 | Stock changes are audited                         | P0       |
| INV-006 | Low stock alert shown to admin                    | P1       |
| INV-007 | Inventory report exportable                       | P1       |

---

## 12.5 Module: Cart and Checkout

### Description

Allows user/RT to create and pay orders.

### Checkout Channels

- SELF_ORDER,
- RT_ASSISTED,
- CARD_PURCHASE.

### Fulfillment Methods

- PICKUP_AT_COOP,
- DELIVERY_TO_HOME,
- RT_PICKUP_POINT.

### Requirements

| ID      | Requirement                                  | Priority | Description |
| ------- | -------------------------------------------- | -------- | ----------- |
| CHK-001 | Add product to cart                          | P0       | Add items to the shopping cart |
| CHK-002 | Update cart quantity                         | P0       | Adjust quantity of items in cart |
| CHK-003 | Remove item from cart                        | P0       | Delete an item from the cart |
| CHK-004 | Validate stock at checkout                   | P0       | Stop checkout if stock is insufficient |
| CHK-005 | Choose fulfillment method                    | P0       | Select Pos RT, Ambil Mandiri, or Kurir Desa |
| CHK-006 | Apply voucher/points                         | P0       | Redeem loyalty points for discounts |
| CHK-007 | Create order invoice                         | P0       | Persist orders in SQLite database |
| CHK-008 | Order is idempotent                          | P1       | Prevent double checkouts |
| CHK-009 | Live Delivery Simulation (GoFood-style)      | P0       | For `DELIVERY_TO_HOME`, show real-time 4-stage tracking modal (Driver: Mang Ujang). Reaching 'Arrived' auto-completes order (`COMPLETED`/`PAID`) in DB. |
| CHK-010 | Cross-Coop Shopping & Surcharge             | P0       | Warga can switch active Kopdes (Local, Neighboring, or National/Luar Pulau). National map displays all 6 cooperative locations across islands (Sumatra, Java, Bali, Sulawesi) using real Google Maps with dynamic surcharges (Rp5.000 to Rp25.000) and delivery adjustments (+1 to +5 days). |

---

## 12.6 Module: RT Group Order

### Description

Enables RT to open batch order, collect orders, lock batch, and coordinate pickup.

### Requirements

| ID     | Requirement                    | Priority |
| ------ | ------------------------------ | -------- |
| RT-001 | RT can create batch            | P0       |
| RT-002 | RT can set deadline            | P0       |
| RT-003 | RT can set pickup point        | P0       |
| RT-004 | User can join active batch     | P0       |
| RT-005 | RT can input assisted order    | P0       |
| RT-006 | RT can lock batch              | P0       |
| RT-007 | Admin can accept/reject batch  | P0       |
| RT-008 | System generates batch summary | P0       |
| RT-009 | System generates packing list  | P0       |
| RT-010 | RT can mark item picked up     | P0       |
| RT-011 | RT can record cash payment     | P0       |
| RT-012 | RT can submit settlement       | P0       |

---

## 12.7 Module: Payment

### MVP Payment Methods

- COD / cash at pickup,
- QRIS simulation or QRIS integration,
- bayar lewat RT,
- points/voucher discount.

### Requirements

| ID      | Requirement                          | Priority |
| ------- | ------------------------------------ | -------- |
| PAY-001 | User can choose COD                  | P0       |
| PAY-002 | User can upload/confirm QRIS payment | P1       |
| PAY-003 | Admin can verify payment             | P0       |
| PAY-004 | RT can record cash collected         | P0       |
| PAY-005 | Payment status updates order status  | P0       |
| PAY-006 | Refund status available              | P1       |
| PAY-007 | Payment changes audited              | P0       |

---

## 12.8 Module: Poin Gotong Royong

### Description

Closed-loop loyalty point system to increase repeat order and direct incentives back to cooperative transactions.

### Requirements

| ID      | Requirement                             | Priority |
| ------- | --------------------------------------- | -------- |
| LOY-001 | User earns points after completed order | P0       |
| LOY-002 | User can view points balance            | P0       |
| LOY-003 | User can redeem points for discount     | P0       |
| LOY-004 | Points have expiry date                 | P1       |
| LOY-005 | Admin can configure earn rules          | P1       |
| LOY-006 | Admin can configure redemption cap      | P1       |
| LOY-007 | Points can be reversed on refund/cancel | P0       |
| LOY-008 | Points transactions audited             | P0       |
| LOY-009 | Points liability shown in dashboard     | P1       |

---

## 12.9 Module: Referral / KopAjak

### Description

Referral engine to acquire active buyers through community trust.

### Requirements

| ID      | Requirement                             | Priority |
| ------- | --------------------------------------- | -------- |
| REF-001 | User has unique referral code           | P0       |
| REF-002 | Invitee can apply referral code         | P0       |
| REF-003 | System tracks referral relationship     | P0       |
| REF-004 | Reward released after first valid order | P0       |
| REF-005 | Admin can configure reward amount       | P1       |
| REF-006 | Referral has monthly cap                | P1       |
| REF-007 | Suspicious referral can be held         | P1       |

---

## 12.10 Module: Titip Jual Warga

### Description

Allows residents to submit products to be sold in cooperative marketplace.

### Requirements

| ID       | Requirement                          | Priority |
| -------- | ------------------------------------ | -------- |
| SELL-001 | RT/admin can submit seller product   | P1       |
| SELL-002 | Admin can approve/reject product     | P1       |
| SELL-003 | Approved product appears in catalog  | P1       |
| SELL-004 | Seller product has settlement record | P1       |
| SELL-005 | Seller can view sales summary        | P2       |

---

## 12.11 Module: Financial Dashboard

### Description

Tracks business performance, cashflow, P&L, points liability, settlement, and audit.

### Requirements

| ID      | Requirement                | Priority |
| ------- | -------------------------- | -------- |
| FIN-001 | Show GMV                   | P0       |
| FIN-002 | Show order count           | P0       |
| FIN-003 | Show AOV                   | P0       |
| FIN-004 | Show repeat order rate     | P1       |
| FIN-005 | Show RT batch performance  | P0       |
| FIN-006 | Show gross margin          | P1       |
| FIN-007 | Show reward cost           | P1       |
| FIN-008 | Show pending RT settlement | P0       |
| FIN-009 | Show P&L                   | P1       |
| FIN-010 | Show cashflow              | P1       |
| FIN-011 | Export CSV/PDF             | P1       |

---

# 13. Detailed User Stories and Acceptance Criteria

## 13.1 User Registration

**As a** resident,  
**I want** to register using phone number and PIN,  
**so that** I can access KopMart RT and transact at my cooperative.

### Acceptance Criteria

- User can enter phone number.
- System sends OTP.
- User verifies OTP.
- User creates PIN.
- User chooses or is assigned to cooperative and RT.
- User account status becomes ACTIVE.

---

## 13.2 Browse Product

**As a** resident,  
**I want** to browse cooperative products with stock visibility,  
**so that** I know what I can buy before going to koperasi/RT.

### Acceptance Criteria

- Product list shows product name, price, image, unit, stock status.
- Out-of-stock item cannot be purchased.
- User can search product.
- User can filter by category.

---

## 13.3 Self Checkout

**As a** digital resident,  
**I want** to checkout by myself,  
**so that** I can buy cooperative products without RT assistance.

### Acceptance Criteria

- User can add product to cart.
- User can update quantity.
- System validates stock.
- User selects fulfillment method.
- User applies points/voucher if eligible.
- User confirms order.
- Order appears in user history.

---

## 13.4 Kartu Kopdes Purchase

**As a** resident without smartphone,  
**I want** to use Kartu Kopdes to buy products,  
**so that** my transaction is still recorded and I can earn points.

### Acceptance Criteria

- RT/kasir scans QR card.
- System fetches resident profile.
- RT/kasir selects products.
- Resident confirms with PIN/OTP.
- Order is created under resident account.
- Receipt is printed or sent via SMS/WhatsApp.
- Points are issued after completion.

---

## 13.5 RT Opens Group Order

**As an** RT Agent,  
**I want** to open weekly group order,  
**so that** residents can buy together and cooperative can fulfill in one batch.

### Acceptance Criteria

- RT can set batch name.
- RT can set order deadline.
- RT can set pickup point.
- Batch status becomes OPEN.
- Residents can join batch.

---

## 13.6 RT Assisted Order

**As an** RT Agent,  
**I want** to create orders for residents who cannot use the app,  
**so that** non-digital residents can still participate.

### Acceptance Criteria

- RT selects resident by search or card scan.
- RT adds products.
- Resident confirms with PIN/OTP.
- Order channel is RT_ASSISTED.
- Order is linked to RT batch if selected.
- Audit log records RT action.

---

## 13.7 Admin Processes RT Batch

**As an** admin koperasi,  
**I want** to process RT batch orders,  
**so that** packing and fulfillment are efficient.

### Acceptance Criteria

- Admin sees submitted RT batch.
- Admin can accept batch.
- System generates summary by product.
- System generates packing list by resident.
- Admin can update status to packed/ready/delivered.

---

## 13.8 Points Earned

**As a** resident,  
**I want** to earn Poin Gotong Royong after completing an order,  
**so that** I have a reason to shop again at koperasi.

### Acceptance Criteria

- Points remain pending before order completion.
- Points become earned after status COMPLETED.
- Points transaction is visible in wallet.
- Points can be reversed if order is refunded.

---

## 13.9 Referral Reward

**As a** resident,  
**I want** to invite neighbors to buy from koperasi,  
**so that** we both get rewards after the invited user makes first purchase.

### Acceptance Criteria

- User can view referral code.
- Invitee can apply code during registration.
- No reward is issued at registration only.
- Reward is issued after invitee first valid order.
- System prevents self-referral.

---

## 13.10 Financial Monitoring

**As an** admin koperasi,  
**I want** to see GMV, P&L, cashflow, and RT settlement,  
**so that** the program can be managed and audited.

### Acceptance Criteria

- Dashboard shows GMV.
- Dashboard shows order count.
- Dashboard shows pending RT settlement.
- Dashboard shows reward cost.
- Dashboard shows cash in/out.
- Report can be exported.

---

# 14. Functional Requirements Summary

## Priority Definition

| Priority | Meaning                |
| -------- | ---------------------- |
| P0       | Must-have for MVP demo |
| P1       | Should-have for pilot  |
| P2       | Nice-to-have / roadmap |
| Future   | Strategic roadmap      |

## P0 Requirements

1. Authentication with phone + PIN/OTP
2. User profile and cooperative/RT association
3. Product catalog
4. Product stock
5. Cart
6. Checkout
7. Individual order
8. RT batch creation
9. Assisted order
10. QR Kartu Kopdes scan
11. Order status tracking
12. Admin product management
13. Admin order management
14. Packing list
15. Points earn/redeem basic
16. Referral basic
17. GMV dashboard
18. RT settlement report
19. Audit log

## P1 Requirements

1. Mission engine
2. Advanced voucher rules
3. P&L dashboard
4. Cashflow dashboard
5. Titip jual warga
6. Export reports
7. Low-stock alerts
8. Points liability dashboard
9. Referral fraud hold
10. AI package recommendation

## P2 Requirements

1. AI demand forecast
2. WhatsApp bot
3. NFC card
4. Advanced fraud detection
5. Seller portal
6. Multi-cooperative procurement

---

# 15. Non-Functional Requirements

| Category      | Requirement                                                                     |
| ------------- | ------------------------------------------------------------------------------- |
| Performance   | Product list should load under 2 seconds on normal 4G                           |
| Reliability   | Order creation must be idempotent                                               |
| Availability  | Admin and RT core flows should work during business hours with high reliability |
| Offline       | RT Agent can record assisted order offline and sync later                       |
| Scalability   | Multi-tenant architecture supports many koperasi                                |
| Security      | RBAC, audit log, encrypted sensitive fields                                     |
| Privacy       | NIK masked, biometric not stored server-side                                    |
| Accessibility | Large font mode, simple UI, low text density for RT/lansia                      |
| Localization  | Bahasa Indonesia first, local language optional                                 |
| Compatibility | Android-first, responsive web/PWA                                               |
| Observability | Logs, metrics, error tracking, request ID                                       |
| Exportability | CSV/PDF export for operational and financial reports                            |

---

# 16. Role and Permission Matrix

| Feature             | User |    RT Agent | Admin Koperasi | Super Admin | Auditor/Pemdes |
| ------------------- | ---: | ----------: | -------------: | ----------: | -------------: |
| Register/login      |   ✅ |          ✅ |             ✅ |          ✅ |             ✅ |
| View catalog        |   ✅ |          ✅ |             ✅ |          ✅ |             ✅ |
| Self-order          |   ✅ |          ✅ |             ✅ |          ❌ |             ❌ |
| Assisted order      |   ❌ |          ✅ |             ✅ |          ❌ |             ❌ |
| Scan Kartu Kopdes   |   ❌ |          ✅ |             ✅ |          ❌ |             ❌ |
| Create RT batch     |   ❌ |          ✅ |             ✅ |          ❌ |             ❌ |
| Join RT batch       |   ✅ |          ✅ |             ✅ |          ❌ |             ❌ |
| Manage products     |   ❌ |          ❌ |             ✅ |          ✅ |             ❌ |
| Manage stock        |   ❌ |          ❌ |             ✅ |          ✅ |             ❌ |
| Manage order status |   ❌ |     Limited |             ✅ |          ✅ |      View only |
| Configure points    |   ❌ |          ❌ |             ✅ |          ✅ |             ❌ |
| Configure referral  |   ❌ |          ❌ |             ✅ |          ✅ |             ❌ |
| View GMV dashboard  |   ❌ |     Limited |             ✅ |          ✅ |             ✅ |
| View P&L dashboard  |   ❌ |          ❌ |             ✅ |          ✅ |             ✅ |
| Submit settlement   |   ❌ |          ✅ |             ✅ |          ❌ |      View only |
| Confirm settlement  |   ❌ |          ❌ |             ✅ |          ✅ |      View only |
| View audit log      |   ❌ | Own actions |             ✅ |          ✅ |             ✅ |

---

# 17. Data Model

## 17.1 Core Entities

```text
Tenant / Cooperative
User
MemberProfile
RT
KopdesCard
Product
Category
InventoryTransaction
Cart
CartItem
Order
OrderItem
RTBatch
Payment
PointWallet
PointTransaction
Referral
Voucher
Mission
SellerProduct
Settlement
AuditLog
FinancialSnapshot
AIRecommendation
```

## 17.2 Entity Details

### Tenant / Cooperative

```json
{
  "id": "uuid",
  "name": "Koperasi Desa Merah Putih Sukamaju",
  "code": "KOP-SUKAMAJU",
  "province": "string",
  "city": "string",
  "district": "string",
  "village": "string",
  "status": "ACTIVE | INACTIVE",
  "createdAt": "datetime"
}
```

### User

```json
{
  "id": "uuid",
  "cooperativeId": "uuid",
  "rtId": "uuid|null",
  "name": "string",
  "phone": "string",
  "nikMasked": "string|null",
  "memberId": "string|null",
  "role": "USER | RT_AGENT | ADMIN | SUPER_ADMIN | AUDITOR",
  "status": "ACTIVE | SUSPENDED | DELETED",
  "createdAt": "datetime"
}
```

### KopdesCard

```json
{
  "id": "uuid",
  "userId": "uuid",
  "cooperativeId": "uuid",
  "cardToken": "string",
  "qrPayload": "string",
  "status": "ACTIVE | BLOCKED | EXPIRED",
  "issuedAt": "datetime",
  "blockedAt": "datetime|null"
}
```

### Product

```json
{
  "id": "uuid",
  "cooperativeId": "uuid",
  "sellerId": "uuid|null",
  "categoryId": "uuid",
  "name": "string",
  "description": "string",
  "imageUrl": "string",
  "price": 15000,
  "costPrice": 12000,
  "stock": 100,
  "unit": "pcs | kg | liter | pack",
  "isLocalProduct": true,
  "isPackage": false,
  "status": "ACTIVE | OUT_OF_STOCK | DISABLED"
}
```

### RTBatch

```json
{
  "id": "uuid",
  "cooperativeId": "uuid",
  "rtId": "uuid",
  "createdBy": "uuid",
  "name": "Order Mingguan RT 03",
  "deadlineAt": "datetime",
  "pickupPoint": "string",
  "status": "DRAFT | OPEN | LOCKED | SUBMITTED | PROCESSING | DELIVERED_TO_RT | COMPLETED | CANCELLED",
  "totalOrders": 50,
  "totalGmv": 3750000
}
```

### Order

```json
{
  "id": "uuid",
  "cooperativeId": "uuid",
  "userId": "uuid",
  "rtBatchId": "uuid|null",
  "createdBy": "uuid",
  "channel": "SELF_ORDER | RT_ASSISTED | CARD_PURCHASE",
  "fulfillmentMethod": "PICKUP_AT_COOP | DELIVERY_TO_HOME | RT_PICKUP_POINT",
  "subtotal": 75000,
  "discount": 5000,
  "pointsRedeemed": 100,
  "total": 70000,
  "paymentStatus": "UNPAID | WAITING_VERIFICATION | PAID | PARTIALLY_PAID | FAILED | REFUNDED",
  "orderStatus": "PENDING_PAYMENT | PAID | CONFIRMED | PACKED | READY_FOR_PICKUP | DELIVERED_TO_RT | PICKED_UP | COMPLETED | CANCELLED | REFUNDED",
  "createdAt": "datetime"
}
```

### PointTransaction

```json
{
  "id": "uuid",
  "userId": "uuid",
  "cooperativeId": "uuid",
  "type": "EARN | REDEEM | EXPIRE | REVERSE | ADJUSTMENT",
  "points": 100,
  "source": "ORDER | REFERRAL | MISSION | ADMIN_ADJUSTMENT",
  "referenceId": "uuid",
  "status": "PENDING | COMPLETED | REVERSED",
  "createdAt": "datetime"
}
```

### Settlement

```json
{
  "id": "uuid",
  "cooperativeId": "uuid",
  "rtId": "uuid",
  "rtBatchId": "uuid",
  "amountExpected": 3500000,
  "amountSubmitted": 3500000,
  "status": "PENDING | SUBMITTED | VERIFIED | DISPUTED",
  "submittedAt": "datetime|null",
  "verifiedAt": "datetime|null"
}
```

---

# 18. API Specification

## 18.1 Auth APIs

```http
POST /api/v1/auth/register
POST /api/v1/auth/request-otp
POST /api/v1/auth/verify-otp
POST /api/v1/auth/login
POST /api/v1/auth/create-pin
POST /api/v1/auth/verify-pin
POST /api/v1/auth/logout
GET  /api/v1/me
```

## 18.2 Product APIs

```http
GET    /api/v1/products
GET    /api/v1/products/{productId}
POST   /api/v1/admin/products
PATCH  /api/v1/admin/products/{productId}
PATCH  /api/v1/admin/products/{productId}/stock
DELETE /api/v1/admin/products/{productId}
GET    /api/v1/admin/products/low-stock
```

## 18.3 Cart and Checkout APIs

```http
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/{cartItemId}
DELETE /api/v1/cart/items/{cartItemId}
POST   /api/v1/checkout
GET    /api/v1/orders/{orderId}
GET    /api/v1/me/orders
PATCH  /api/v1/admin/orders/{orderId}/status
```

## 18.4 Kartu Kopdes APIs

```http
POST  /api/v1/admin/cards/issue
GET   /api/v1/admin/cards/{cardId}
POST  /api/v1/cards/scan
POST  /api/v1/cards/{cardId}/block
POST  /api/v1/cards/{cardId}/unblock
GET   /api/v1/cards/{cardId}/transactions
```

## 18.5 RT Batch APIs

```http
POST  /api/v1/rt/batches
GET   /api/v1/rt/batches
GET   /api/v1/rt/batches/{batchId}
PATCH /api/v1/rt/batches/{batchId}
POST  /api/v1/rt/batches/{batchId}/orders
POST  /api/v1/rt/batches/{batchId}/lock
POST  /api/v1/rt/batches/{batchId}/submit
GET   /api/v1/rt/batches/{batchId}/summary
GET   /api/v1/rt/batches/{batchId}/packing-list
GET   /api/v1/rt/batches/{batchId}/pickup-list
PATCH /api/v1/rt/batches/{batchId}/pickup/{orderId}
```

## 18.6 Points and Referral APIs

```http
GET  /api/v1/points/wallet
GET  /api/v1/points/history
POST /api/v1/points/redeem
GET  /api/v1/referrals/code
POST /api/v1/referrals/apply
GET  /api/v1/referrals/history
POST /api/v1/admin/points/rules
POST /api/v1/admin/vouchers
POST /api/v1/admin/missions
```

## 18.7 Settlement and Finance APIs

```http
GET  /api/v1/admin/dashboard/gmv
GET  /api/v1/admin/dashboard/profit-loss
GET  /api/v1/admin/dashboard/cashflow
GET  /api/v1/admin/settlements/rt
POST /api/v1/admin/settlements/rt/{settlementId}/verify
POST /api/v1/rt/settlements/{settlementId}/submit
GET  /api/v1/admin/audit-logs
GET  /api/v1/admin/reports/export
```

---

# 19. Order, Payment, Reward, and Settlement Statuses

## 19.1 Order Status

| Status           | Description                 | Trigger              |
| ---------------- | --------------------------- | -------------------- |
| PENDING_PAYMENT  | Order created but unpaid    | Checkout created     |
| PAID             | Payment received            | Payment verified     |
| CONFIRMED        | Admin confirms order        | Admin action         |
| PACKED           | Items packed                | Admin action         |
| READY_FOR_PICKUP | Ready at koperasi/RT        | Admin action         |
| OUT_FOR_DELIVERY | Delivery started            | Courier/admin action |
| DELIVERED_TO_RT  | Goods delivered to RT point | RT/admin action      |
| PICKED_UP        | Resident picked up items    | RT/admin action      |
| COMPLETED        | Order finalized             | System/admin action  |
| CANCELLED        | Order cancelled             | User/admin action    |
| REFUNDED         | Refund completed            | Admin/system action  |

## 19.2 Payment Status

| Status               | Description         |
| -------------------- | ------------------- |
| UNPAID               | Belum dibayar       |
| WAITING_VERIFICATION | Menunggu verifikasi |
| PAID                 | Sudah dibayar       |
| PARTIALLY_PAID       | Dibayar sebagian    |
| FAILED               | Pembayaran gagal    |
| REFUNDED             | Dana dikembalikan   |

## 19.3 Points Status

| Status    | Description                          |
| --------- | ------------------------------------ |
| PENDING   | Waiting for order completion         |
| COMPLETED | Points credited/debited              |
| REVERSED  | Points reversed due to refund/cancel |
| EXPIRED   | Points expired                       |

## 19.4 Settlement Status

| Status    | Description                          |
| --------- | ------------------------------------ |
| PENDING   | RT has not submitted cash settlement |
| SUBMITTED | RT submitted settlement              |
| VERIFIED  | Admin verified settlement            |
| DISPUTED  | Amount mismatch or issue             |

---

# 20. Loyalty, Referral, and Mission Rules

## 20.1 Points Rules

### Earn Rules

| Action                  |      Reward | Condition                 |
| ----------------------- | ----------: | ------------------------- |
| First order             | +100 points | Completed order           |
| Every Rp10.000 purchase |    +1 point | Completed order           |
| Join RT Group Order     |  +25 points | Completed batch order     |
| Buy local product       |   2x points | Eligible product          |
| Pickup on time          |  +10 points | Picked up before deadline |
| Referral first order    | +100 points | Invitee first valid order |

### Redeem Rules

| Rule                     |                         Value |
| ------------------------ | ----------------------------: |
| Max discount by points   |            20% of order total |
| Minimum order for redeem |                      Rp25.000 |
| Points expiry            |      6–12 months configurable |
| Non-eligible products    | Subsidized/regulated products |
| Reward budget cap        |     Configurable per campaign |

## 20.2 Referral Rules

- One user has one referral code.
- User cannot refer self.
- Reward only after invitee completes first valid order.
- Referral reward has monthly cap.
- Suspicious referral can be held.
- Cancelled/refunded order reverses referral reward.

## 20.3 Mission Engine Rules

Mission types:

- belanja koperasi,
- ikut RT order,
- beli produk lokal,
- event Hari Koperasi,
- event nasional,
- bank sampah,
- edukasi koperasi,
- gotong royong,
- sosmed challenge.

Mission fields:

```json
{
  "missionId": "uuid",
  "name": "Belanja Produk Lokal Minggu Ini",
  "description": "Beli minimal 1 produk lokal di koperasi",
  "startAt": "datetime",
  "endAt": "datetime",
  "rewardPoints": 50,
  "quota": 1000,
  "validationType": "ORDER_BASED | ADMIN_APPROVAL | RT_APPROVAL | UPLOAD_PROOF",
  "targetAudience": "ALL | RT_SPECIFIC | NEW_USER | MEMBER_ONLY",
  "status": "DRAFT | ACTIVE | ENDED | CANCELLED"
}
```

---

# 21. Financial Model and Business Feasibility

## 21.1 Financial Goals

The product must help koperasi:

- understand GMV,
- calculate gross margin,
- control reward cost,
- control RT incentive,
- monitor cash settlement,
- estimate points/voucher liability,
- track profit/loss,
- forecast break-even point.

## 21.2 Core Formulas

```text
GMV = Active Buyers × Order Frequency × Average Order Value
Gross Profit = GMV × Gross Margin
Net Revenue = Gross Profit + Handling Fee + Delivery Fee + Commission
Operating Profit = Net Revenue - OPEX - Reward Cost - RT Incentive - Logistics Subsidy
Break-even GMV = Fixed Monthly Cost / Contribution Margin %
```

## 21.3 Base Case Assumptions per Cooperative

| Component            |         Base Case |
| -------------------- | ----------------: |
| RT active            |             10 RT |
| Household per RT     |                50 |
| Registered household |               500 |
| Active buyer rate    |               60% |
| Active buyers        |               300 |
| Order frequency      |          3x/month |
| AOV                  |          Rp75.000 |
| Monthly orders       |               900 |
| Monthly GMV          |      Rp67.500.000 |
| Gross margin         |                8% |
| Handling fee         |     Rp2.000/order |
| Reward cost          |            1% GMV |
| RT incentive         |          1.5% GMV |
| Fixed OPEX + SaaS    | Rp4.000.000/month |

## 21.4 Break-even

```text
Contribution margin ≈ 7.5%
Fixed monthly cost ≈ Rp4.000.000
Break-even GMV = Rp4.000.000 / 7.5%
Break-even GMV ≈ Rp53.300.000/month
```

## 21.5 Profit/Loss Projection

| Month |           GMV |      Revenue | Reward + RT Cost | OPEX + SaaS |  Profit/Loss |
| ----: | ------------: | -----------: | ---------------: | ----------: | -----------: |
|     1 |   Rp6.000.000 |    Rp720.000 |        Rp150.000 | Rp4.000.000 | -Rp3.430.000 |
|     2 |  Rp16.500.000 |  Rp1.920.000 |        Rp412.500 | Rp4.000.000 | -Rp2.492.500 |
|     3 |  Rp39.000.000 |  Rp4.320.000 |        Rp975.000 | Rp4.000.000 |   -Rp655.000 |
|     4 |  Rp63.000.000 |  Rp6.840.000 |      Rp1.575.000 | Rp4.000.000 |  Rp1.265.000 |
|     5 |  Rp86.400.000 |  Rp9.312.000 |      Rp2.160.000 | Rp4.000.000 |  Rp3.152.000 |
|     6 | Rp120.000.000 | Rp12.800.000 |      Rp3.000.000 | Rp4.000.000 |  Rp5.800.000 |
|    12 | Rp264.000.000 | Rp27.720.000 |      Rp6.600.000 | Rp4.000.000 | Rp17.120.000 |

## 21.6 Financial Dashboard Requirements

| Metric             | Formula/Definition                              |
| ------------------ | ----------------------------------------------- |
| GMV                | Sum completed order total                       |
| Order Count        | Completed orders                                |
| AOV                | GMV / order count                               |
| Gross Margin       | Revenue - COGS                                  |
| Reward Cost        | Redeemed points + voucher cost                  |
| RT Incentive       | % of RT batch GMV                               |
| Net Profit         | Revenue - variable cost - OPEX                  |
| Pending Settlement | Cash collected by RT but not verified           |
| Points Liability   | Outstanding points × estimated redemption value |
| Inventory Value    | Stock × cost price                              |

---

# 22. Audit, Compliance, and Internal Control

## 22.1 Audit Log Scope

Every critical action must be logged:

| Action                  | Audit Data                        |
| ----------------------- | --------------------------------- |
| Product created/updated | actor, timestamp, before/after    |
| Stock updated           | actor, quantity, reason           |
| Price changed           | old price, new price, approval    |
| Order created           | channel, creator, user, timestamp |
| Order cancelled         | reason, actor                     |
| Payment updated         | old/new status, actor             |
| Points issued/redeemed  | rule, reference, amount           |
| Referral reward issued  | referrer, invitee, order          |
| RT settlement submitted | amount, proof, actor              |
| Admin config changed    | old/new config                    |

## 22.2 Internal Control Rules

| Risk                          | Control                                           |
| ----------------------------- | ------------------------------------------------- |
| RT misuse of resident account | PIN/OTP, QR scan, receipt, audit log              |
| Cash not submitted            | settlement deadline, amount expected vs submitted |
| Points manipulation           | points only after order completion                |
| Referral farming              | reward only after first valid order               |
| Price manipulation            | price change audit and optional approval          |
| Stock leakage                 | inventory transaction log and stock opname        |
| Voucher overbudget            | campaign budget cap                               |

---

# 23. AI Features

## 23.1 AI Principles

AI must support Pilar 1. It should not be a gimmick.

AI should help:

- increase transaction,
- reduce stockout,
- improve promo targeting,
- improve package bundling,
- reduce fraud,
- help RT/admin operate faster.

## 23.2 AI Features

| Feature                   | Description                                                       | MVP?  |
| ------------------------- | ----------------------------------------------------------------- | ----- |
| AI Paket Hemat Generator  | Suggests product bundles based on stock, margin, and local demand | P1    |
| AI Demand Forecast per RT | Predicts future demand by RT and product                          | P1/P2 |
| AI Promo Recommendation   | Suggests which product should get bonus points/discount           | P1    |
| AI Fraud Detection        | Detects abnormal referral, points, order pattern                  | P2    |
| AI RT Message Generator   | Creates WhatsApp broadcast copy for RT                            | P1    |

## 23.3 Example AI Output

```text
RT 03 biasanya membeli beras, telur, dan minyak pada hari Jumat.
Rekomendasi: buka Paket Dapur 50K pada Kamis sore.
Stok telur diprediksi kurang 30 pack jika batch mencapai 50 rumah tangga.
```

---

# 24. Analytics and KPI Tracking

## 24.1 Core KPI

| KPI                           | Definition                                 | Target Pilot 90 Days |
| ----------------------------- | ------------------------------------------ | -------------------: |
| Active RT                     | RT with at least 1 submitted batch/month   |                   10 |
| Active Buyer                  | User with at least 1 completed order/month |                  300 |
| Monthly Orders                | Completed orders/month                     |                1.000 |
| GMV                           | Completed order value                      |        Rp75–100 juta |
| Repeat Order Rate             | Users with >1 order/month                  |                 >40% |
| Referral Conversion           | Referral users with first valid order      |               25–40% |
| Points Redemption-to-Purchase | Redeemed points leading to order           |                 >30% |
| Local SKU Active              | Local products sold at least once          |               30 SKU |
| Assisted Users                | Non-digital users helped by RT/card        |                  150 |
| Batch Frequency               | RT batch submitted per week                |                   10 |

## 24.2 Analytics Events

| Event                | Key Properties                      |
| -------------------- | ----------------------------------- |
| user_registered      | cooperativeId, rtId, referralSource |
| card_issued          | userId, cooperativeId               |
| card_scanned         | cardId, actorId, location           |
| product_viewed       | productId, category                 |
| add_to_cart          | productId, quantity                 |
| checkout_started     | channel, fulfillmentMethod          |
| order_created        | orderId, channel, amount            |
| payment_confirmed    | orderId, method, amount             |
| order_completed      | orderId, GMV, pointsEarned          |
| rt_batch_created     | rtId, deadline                      |
| rt_batch_submitted   | rtId, GMV, orderCount               |
| points_earned        | userId, source, points              |
| points_redeemed      | userId, orderId, points             |
| referral_applied     | referrerId, inviteeId               |
| referral_rewarded    | referrerId, orderId                 |
| settlement_submitted | rtId, amount                        |
| settlement_verified  | rtId, amount                        |

---

# 25. UX and Accessibility Principles

## 25.1 Core UX Principles

1. **Low friction** — user should buy in a few taps.
2. **Clear stock visibility** — avoid disappointment and cancellation.
3. **Assisted but accountable** — RT can help, but transaction belongs to resident.
4. **Accessible for non-digital users** — card, PIN, receipt, offline mode.
5. **Trust-first design** — show receipts, status, points, and who processed transaction.
6. **Financial clarity** — admin sees GMV, settlement, and cashflow.

## 25.2 Accessibility Features

- large font mode,
- high contrast mode,
- simple bahasa Indonesia,
- icon-based order status,
- voice note/order note roadmap,
- receipt via WhatsApp/SMS,
- printable pickup list.

---

# 26. Security, Privacy, and Fraud Prevention

## 26.1 Privacy Rules

- NIK is masked.
- QR card stores token, not raw NIK.
- Biometric data not stored server-side.
- e-KTP/IKD is future integration.
- Role-based access controls sensitive data.
- Audit logs are immutable or append-only.

## 26.2 Fraud Scenarios and Mitigation

| Scenario                 | Mitigation                                          |
| ------------------------ | --------------------------------------------------- |
| RT creates fake order    | Points released only after paid + picked up         |
| Referral farming         | Reward after first valid order, device/phone checks |
| Card stolen              | PIN required, block card feature                    |
| Cash settlement mismatch | Expected vs submitted amount, dispute flow          |
| Points abuse             | redemption cap, budget cap, anomaly detection       |
| Fake product listing     | admin approval for titip jual                       |
| Stock manipulation       | stock audit trail                                   |

---

# 27. Offline-First and Low-Connectivity Strategy

## 27.1 Why Offline-First

RT/kader may operate in areas with weak connectivity or limited data quota. The RT Agent App must still support core order collection.

## 27.2 Offline-Capable Flows

- view cached product catalog,
- create assisted order draft,
- scan card and store token,
- record cash payment draft,
- record pickup draft,
- sync when internet is available.

## 27.3 Sync Rules

- Each offline action has local UUID.
- Sync uses idempotency key.
- Conflict resolution prioritizes server stock validation.
- If stock insufficient during sync, order enters NEEDS_REVIEW.
- RT receives sync status notification.

---

# 28. SIMKOPDES Integration Strategy

## 28.1 Integration Principle

KopMart RT should complement SIMKOPDES, not replace it.

## 28.2 Integration Levels

| Level   | Integration        | Scope                               |
| ------- | ------------------ | ----------------------------------- |
| Level 0 | Manual export      | CSV/PDF reports                     |
| Level 1 | API-ready          | Standard endpoints for transactions |
| Level 2 | Member sync        | Cooperative/member data sync        |
| Level 3 | Transaction sync   | GMV/order sync to SIMKOPDES         |
| Level 4 | National dashboard | Aggregated KPI by region            |

## 28.3 Data to Sync

- cooperative ID,
- member ID,
- order summary,
- GMV,
- product category,
- RT batch summary,
- points summary,
- financial report summary.

---

# 29. MVP Scope

## 29.1 MVP Must-Have

1. User register/login
2. Product catalog
3. Stock management
4. Cart and checkout
5. Self-order
6. Kartu Kopdes QR scan
7. RT Group Order
8. RT assisted order
9. Admin product management
10. Admin order management
11. Packing list
12. Basic points earn/redeem
13. Basic referral
14. GMV dashboard
15. RT settlement dashboard
16. Audit log

## 29.2 MVP Demo Data

- 1 koperasi
- 3 RT
- 20–50 warga sample
- 30 products
- 5 local products
- 2 paket hemat
- 2 active RT batches
- 5 completed orders
- 1 referral conversion
- 1 card-assisted order
- dashboard with GMV/P&L mock

---

# 30. Development Milestones

| Sprint   | Duration | Deliverables                               |
| -------- | -------: | ------------------------------------------ |
| Sprint 0 | 3–5 days | Final UX flow, schema, API contract        |
| Sprint 1 |   1 week | Auth, roles, tenant/cooperative setup      |
| Sprint 2 |   1 week | Product catalog, stock, admin product CRUD |
| Sprint 3 |   1 week | Cart, checkout, individual order           |
| Sprint 4 |   1 week | RT batch, assisted order                   |
| Sprint 5 |   1 week | Kartu Kopdes QR, PIN verification          |
| Sprint 6 |   1 week | Points, referral, voucher basic            |
| Sprint 7 |   1 week | Admin order, packing list, settlement      |
| Sprint 8 |   1 week | Financial dashboard, audit log, QA         |
| Sprint 9 | 3–5 days | Demo polish, data seeding, pitch script    |

---

# 31. Testing Strategy

## 31.1 Unit Tests

- points calculation,
- referral eligibility,
- stock validation,
- order status transition,
- settlement calculation,
- voucher cap,
- card token validation.

## 31.2 Integration Tests

- checkout → payment → order completed → points earned,
- RT batch → packing list → pickup → settlement,
- referral → first order → reward,
- stock update → low-stock alert,
- card scan → assisted order.

## 31.3 E2E Tests

1. User self-order flow.
2. Kartu Kopdes assisted purchase.
3. RT creates group order.
4. Admin fulfills RT batch.
5. Points redemption.
6. Referral reward.
7. Settlement verification.

## 31.4 Security Tests

- unauthorized role access,
- card scan without PIN,
- duplicate referral,
- points redemption beyond cap,
- settlement mismatch,
- stock oversell.

---

# 32. Demo Scenario for Hackathon

## 32.1 Demo Goal

Show that KopMart RT increases cooperative transaction volume by enabling three kinds of users:

- digital user,
- card user,
- RT-assisted user.

## 32.2 Demo Flow

### Scene 1 — Admin setup

- Admin logs in.
- Admin adds products and stock.
- Admin creates Paket Hemat RT.

### Scene 2 — Digital self-order

- User opens marketplace.
- User buys products.
- User chooses RT pickup.
- Order created.

### Scene 3 — RT assisted order

- RT opens batch.
- RT scans Kartu Kopdes.
- RT inputs order for non-digital resident.
- Resident confirms PIN.

### Scene 4 — Admin fulfillment

- Admin sees RT batch.
- Admin generates packing list.
- Admin marks packed/delivered.

### Scene 5 — Pickup and reward

- RT marks resident picked up.
- Payment settled.
- Points earned.
- Dashboard updates GMV and RT performance.

### Scene 6 — Referral

- User invites neighbor.
- Neighbor makes first order.
- Reward released after completion.

### Scene 7 — Financial dashboard

- Show GMV.
- Show order count.
- Show RT active.
- Show pending settlement.
- Show reward cost.
- Show projected break-even.

---

# 33. Risks and Mitigation

| Risk                       | Impact             | Mitigation                               |
| -------------------------- | ------------------ | ---------------------------------------- |
| RT misuses account         | Trust loss         | PIN/OTP, audit log, receipt              |
| Cash not settled           | Financial loss     | settlement deadline, limit, verification |
| Points overbudget          | Margin loss        | budget cap, redemption cap               |
| Referral fraud             | Fake growth        | reward after first valid order           |
| Stock mismatch             | Order cancellation | stock reservation, cutoff, admin review  |
| User does not repeat order | Low GMV            | points, paket hemat, RT recurring batch  |
| Koperasi not ready         | Slow adoption      | onboarding kit, simple admin dashboard   |
| Poor internet              | Failed adoption    | offline-first RT mode                    |
| Privacy concern            | Regulatory risk    | minimal data, masking, RBAC              |
| Too many features          | Poor MVP           | phase-based roadmap                      |

---

# 34. Roadmap

## Phase 1 — MVP

- marketplace,
- Kartu Kopdes QR,
- RT Group Order,
- points basic,
- referral basic,
- dashboard basic.

## Phase 2 — Pilot Readiness

- mission engine,
- titip jual,
- voucher sponsor,
- P&L dashboard,
- cashflow dashboard,
- export reports.

## Phase 3 — AI and Optimization

- AI paket hemat,
- demand forecast per RT,
- promo recommendation,
- fraud detection.

## Phase 4 — Ecosystem Integration

- SIMKOPDES API,
- QRIS production,
- WhatsApp bot,
- supplier integration.

## Phase 5 — National Scale

- multi-koperasi procurement,
- NFC card,
- IKD/e-KTP integration,
- national analytics dashboard.

---

# 35. Open Questions

1. Is SIMKOPDES API available for pilot integration?
2. Will QRIS be real or simulated in hackathon demo?
3. Who funds reward cost during pilot?
4. Should points be per cooperative or regional?
5. Should RT incentive be cash, points, or both?
6. Is titip jual included in MVP or Phase 2?
7. What product categories should be prioritized for pilot?
8. Can koperasi provide initial stock data?
9. Can RT/kader be recruited for pilot validation?
10. What legal consent is required for Kartu Kopdes?

---

# 36. Final Pitch Narrative

> **Masalahnya bukan koperasi belum terdaftar. Masalahnya koperasi belum menjadi tempat transaksi harian warga. Dari puluhan ribu KDKMP yang sudah masuk ekosistem digital, hanya sebagian kecil yang benar-benar aktif bertransaksi. KopMart RT hadir sebagai marketplace koperasi inklusif: warga digital bisa checkout sendiri, warga tanpa smartphone bisa memakai Kartu Kopdes, dan warga awam bisa dibantu RT melalui group order. Dengan Poin Gotong Royong dan KopAjak, warga terdorong belanja ulang dan mengajak tetangga. Dengan dashboard keuangan, koperasi bisa melihat GMV, cashflow, settlement RT, dan profit/loss. Hasilnya, transaksi koperasi naik, stok bergerak, produk lokal terserap, dan nilai ekonomi kembali berputar di komunitas.**

## 36.1 Final One-Liner

> **KopMart RT mengubah setiap RT menjadi keranjang belanja koperasi, setiap Kartu Kopdes menjadi akses transaksi, dan setiap poin menjadi alasan warga kembali belanja di koperasi.**

---

# 37. References and Research Basis

## 37.1 Internal Mentorship / Hackathon Materials

- HackTheCooperative — Integrasi Ekosistem Digital & Navigasi Kebijakan.
- Koperasi Modern — DailySocial / Rama Mamuaya mentorship.
- Edukasi dan Financial Model — FEB UI / Kemenkop.
- AI & Transformasi Digital — Kata.ai / Kemenkop.
- Solusi Data & Makro Ekonomi — Irwanda Wisnu Wardhana.

## 37.2 Academic / Business References

- Frederick F. Reichheld, **The Loyalty Effect**, Harvard Business School Press.
- Sharp & Sharp, **Loyalty Programs and Their Impact on Repeat-Purchase Loyalty Patterns**.
- Leenheer et al., **Do Loyalty Programs Really Enhance Behavioral Loyalty?**
- Wirtz, Mattila & Lwin, **How Effective Are Loyalty Reward Programs in Driving Share of Wallet?**
- Schmitt, Skiera & Van den Bulte, **Referral Programs and Customer Value**.
- Ryu & Feick, **A Penny for Your Thoughts: Referral Reward Programs and Referral Likelihood**.
- Ofek, Libai & Muller, **Customer Lifetime Social Value**.
- Research on **digital intermediaries** in e-government and digital inclusion.
- Research on **privacy-preserving loyalty programs**.

## 37.3 Industry Benchmarks

- Alfagift loyalty and member ecosystem.
- Indomaret Poinku / i-Kupon model.
- OVO Points and merchant rewards.
- Retail member card and coupon ecosystems.

---

# Appendix A — MVP Backlog

## Epic 1: Authentication

- Register with phone number.
- OTP verification.
- Create PIN.
- Login.
- Assign cooperative/RT.

## Epic 2: Marketplace

- Product list.
- Product detail.
- Search/filter.
- Cart.
- Checkout.
- Order history.

## Epic 3: Kartu Kopdes

- Generate QR card.
- Scan card.
- Verify PIN.
- Create card purchase order.
- Block card.

## Epic 4: RT Group Order

- Create batch.
- Open batch.
- Join batch.
- Assisted order.
- Lock batch.
- Submit batch.
- Pickup list.

## Epic 5: Admin

- Product CRUD.
- Stock update.
- Order management.
- Batch fulfillment.
- Packing list.

## Epic 6: Loyalty and Referral

- Earn points.
- Redeem points.
- Referral code.
- Referral reward after first order.

## Epic 7: Finance and Audit

- GMV dashboard.
- Settlement report.
- Reward cost report.
- Audit log.

---

# Appendix B — MVP Database Tables

```text
tenants
users
roles
rt_units
kopdes_cards
products
categories
inventory_transactions
carts
cart_items
orders
order_items
rt_batches
payments
point_wallets
point_transactions
referrals
vouchers
settlements
audit_logs
financial_snapshots
```

---

# Appendix C — MVP Demo Seed Data

## Cooperative

- Koperasi Merah Putih Sukamaju

## RT

- RT 01
- RT 02
- RT 03

## Users

- Bu Sari — non-digital card user
- Pak Budi — RT Agent
- Dinda — digital user
- Mas Arif — admin koperasi
- Ibu Rina — UMKM seller

## Products

- Beras 5kg
- Telur 1kg
- Minyak 1L
- Gula 1kg
- Paket Dapur 50K
- Keripik Pisang Lokal
- Sambal Rumahan
- Sayur Kangkung
- Gas LPG
- Sabun Cuci

## Demo Orders

- Self-order by Dinda
- Assisted order for Bu Sari
- RT Batch RT 03
- Referral order by invited user

---

# Appendix D — Pitch Slide Mapping

| Slide | Content                           | Judging Criteria Supported |
| ----- | --------------------------------- | -------------------------- |
| 1     | Title + one-liner                 | Presentation               |
| 2     | Problem: registered but not alive | Relevance                  |
| 3     | Baseline data                     | Relevance, Impact          |
| 4     | Root cause                        | Relevance                  |
| 5     | Solution overview                 | Innovation                 |
| 6     | User journey                      | Implementation             |
| 7     | RT Group Order hook               | Innovation                 |
| 8     | Kartu Kopdes inclusion            | Impact, Implementation     |
| 9     | Points + referral growth loop     | Impact, Business reasoning |
| 10    | Dashboard and audit               | Technology quality         |
| 11    | Financial model                   | Impact, Feasibility        |
| 12    | MVP demo architecture             | Technology quality         |
| 13    | Pilot KPI                         | Impact                     |
| 14    | Roadmap                           | Scalability                |
| 15    | Closing narrative                 | Pitch                      |

---

# Appendix E — Score Defense Statements

## Relevance Defense

> The product directly addresses the gap between registered cooperatives and actively transacting cooperatives. It is focused on Pillar 1 by measuring GMV, order count, active buyers, RT batch volume, and repeat order.

## Innovation Defense

> The innovation is not merely a marketplace. The novelty is combining marketplace with RT-assisted group order and Kartu Kopdes so both digital and non-digital residents can transact.

## Impact Defense

> Impact is measurable through 90-day pilot metrics: active RT, household active buyers, GMV, repeat order, local products sold, points redemption, and settlement transparency.

## Implementation Defense

> MVP avoids complex dependencies like e-KTP chip and paylater. It uses QR cards, PIN, Android/PWA, and offline-first design.

## Technology Defense

> The system has multi-tenant architecture, API-ready integration, audit logs, role permissions, financial dashboard, offline sync, and fraud prevention.

## Pitch Defense

> The story is simple: every RT becomes a cooperative shopping basket, every card becomes access to transactions, and every point becomes a reason to come back.
