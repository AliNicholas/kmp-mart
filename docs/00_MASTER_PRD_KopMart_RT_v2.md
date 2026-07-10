<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# PRD — KopMart RT v2.0

## 1. Product summary

**Product name:** KopMart RT  
**Product type:** Omni-channel Assisted Cooperative Marketplace  
**Target:** KDKMP / koperasi desa, warga desa, RT/kader, warung lokal, kurir lokal, admin koperasi, pemdes/auditor  
**Main hackathon pillar:** Pilar 1 — Peningkatan Volume Usaha Koperasi  
**Secondary impact:** Keterlibatan masyarakat, pemanfaatan potensi ekonomi desa, literasi Gen-Z/Gen-Alpha, inklusi digital

## 2. Updated product statement

> **KopMart RT adalah marketplace koperasi inklusif yang membuat semua warga bisa belanja di koperasi melalui aplikasi, Kartu Kopdes QR, RT Group Order, Petugas Layanan KopMart, Mitra Warung, katalog kertas, voice note, atau kios desa, sementara seluruh transaksi tetap tercatat digital untuk meningkatkan volume usaha, cashflow, auditability, dan dampak ekonomi koperasi.**

## 3. Core insight

Masalah utama bukan hanya koperasi belum memiliki aplikasi. Masalah utamanya adalah banyak koperasi sudah terdaftar, tetapi belum menjadi kanal transaksi harian warga.

Karena itu, KopMart RT tidak boleh menjadi app-only solution. Solusi harus cocok untuk kondisi desa yang beragam:

- ada warga digital yang nyaman pakai aplikasi,
- ada warga punya HP tetapi hanya nyaman WhatsApp/voice note,
- ada warga tanpa smartphone,
- ada lansia atau warga yang tidak nyaman mengetik,
- ada daerah dengan sinyal tidak stabil,
- ada warung lokal yang sudah dipercaya warga,
- ada koperasi yang belum siap hardware mahal,
- ada kebutuhan audit, cashflow, dan settlement yang rapi.

## 4. Product philosophy

### 4.1 Digitalisasi bukan berarti semua user harus checkout sendiri

Digitalisasi yang benar untuk desa adalah:

```text
Analog/Digital access channel
→ Digital order record
→ Digital stock movement
→ Digital payment/settlement record
→ Digital points/reward record
→ Digital financial and impact dashboard
```

### 4.2 Frontend can be analog; backend must be digital

Examples:

| Warga access method | Backend result |
|---|---|
| Order lewat aplikasi | Order digital |
| Order pakai kartu QR | Order digital |
| Order lewat RT | Order digital |
| Order lewat petugas | Order digital |
| Order lewat formulir kertas | Order digital setelah input |
| Order lewat voice note | Order digital setelah operator validation |
| Belanja lewat warung mitra | B2B/B2C transaction digital |
| Order lewat kios | Order digital |

## 5. Goals

| Goal | Success indicator |
|---|---|
| Increase cooperative business volume | GMV, order count, AOV, repeat order |
| Include non-digital citizens | Assisted order count, card purchase count, paper/voice orders |
| Reduce burden on RT | Dedicated Petugas Layanan and warung channel |
| Keep local warung alive | Warung B2B order and pickup point adoption |
| Create local jobs | KopKurir, Petugas Layanan, youth catalog assistant |
| Improve financial accountability | P&L, cashflow, RT/driver settlement, audit log |
| Drive engagement | missions completed, points redemption, referral first-order conversion |
| Support national values | Gotong royong, produk lokal, event nasional, social missions |

## 6. Non-goals for MVP

| Non-goal | Reason |
|---|---|
| Full e-KTP chip integration | Requires formal partnership/regulation/hardware |
| Server-side biometric storage | Privacy and regulatory risk |
| Paylater/simpan-pinjam | Regulatory complexity; not aligned with MVP Pilar 1 |
| Fully autonomous AI order taking | Risk of wrong orders; use human-in-the-loop first |
| Dedicated expensive kiosk hardware for every village | Not scalable for early phase |
| Fully custom logistics network everywhere | Use local KopKurir first; external integration optional |
| Super app with too many unrelated features | Keep transaction volume as core focus |

## 7. User personas

| Persona | Needs | Main channel |
|---|---|---|
| Warga digital | Quick self-order | Self-order app |
| Warga without smartphone | Buy and collect points without app | Kartu Kopdes QR, Petugas, Kios |
| Lansia / warga awam | Assisted ordering | Petugas, RT, Paper Catalog, Voice |
| Warga with WhatsApp only | Order by voice/chat | Voice-to-Digital |
| Warung owner | Buy stock cheaper from cooperative | Mitra Warung |
| RT/kader | Organize group order | RT Group Order |
| Petugas Layanan | Assist citizen transactions | Assisted Order Console |
| Admin koperasi | Manage product, stock, order, finance | Admin Dashboard |
| KopKurir/local driver | Pickup and deliver orders | Driver App |
| UMKM/petani/pengrajin | Sell products through cooperative | Titip Jual / Mitra Warung |
| Pemdes/auditor | Monitor accountability and impact | Audit/Impact Dashboard |

## 8. Product modules

| Module | Purpose | Priority |
|---|---|---|
| Self-order App | Digital user marketplace | P0 |
| Kartu Kopdes QR | Identity and purchase card | P0 |
| RT Group Order | Community batch order | P0 |
| Petugas Layanan KopMart | Assisted commerce staff | P0 |
| Admin Koperasi Dashboard | Operational control | P0 |
| Poin Gotong Royong | Retention and reward | P0 |
| Referral/KopAjak | Active buyer acquisition | P0 |
| Driver & Local Logistics | Pickup/delivery/settlement | P0/P1 |
| Mitra Warung KopMart | Warung B2B2C channel | P1 |
| Paper-to-Digital Catalog | Offline physical order channel | P1 |
| Misi Gotong Royong | Gamified national-value engagement | P1 |
| Voice-to-Digital Order | Voice note ordering | P1 |
| Kiosk Mode | Assisted self-service kiosk | P2 |
| AI Features | Forecast, bundles, fraud, voice support | P2 |

## 9. Updated core flows

### 9.1 Digital self-order flow

```text
User login
→ Browse catalog
→ Add to cart
→ Choose pickup / delivery / RT batch
→ Pay QRIS/COD/RT
→ Order fulfilled
→ Points issued
→ Mission progress updated
→ Financial dashboard updated
```

### 9.2 Non-smartphone card-assisted flow

```text
Warga brings Kartu Kopdes QR
→ Petugas/RT/Kasir scans card
→ Select products
→ Show total and points
→ Warga confirms via PIN/OTP/signature
→ Order is created under warga account
→ Receipt printed/sent
→ Points and mission progress recorded
```

### 9.3 RT Group Order flow

```text
RT opens batch
→ Warga digital join directly
→ Warga non-digital assisted by RT/Petugas
→ Batch locked
→ Admin prepares packing list per warga
→ KopKurir/external courier delivers to RT point
→ RT confirms receipt
→ Warga pickup
→ Order completed and points issued
```

### 9.4 Petugas Layanan flow

```text
Warga visits service point / calls / submits paper form
→ Petugas identifies warga using card/member ID
→ Petugas inputs order
→ Warga confirms
→ Order goes to cooperative fulfillment
→ Receipt and audit log generated
```

### 9.5 Mitra Warung flow

```text
Warung orders stock from cooperative
→ Cooperative supplies with partner price
→ Warung sells offline to warga
→ Warung may become pickup point
→ Cooperative GMV grows through B2B order
→ Warung earns margin without being killed by digitalization
```

### 9.6 Mission engagement flow

```text
Admin creates national/local mission
→ User completes action via any channel
→ Mission engine validates event
→ Reward points/badge/voucher issued
→ Budget cap checked
→ Impact dashboard updated
```

## 10. Shared order channels

| Channel code | Description |
|---|---|
| `SELF_ORDER` | User orders directly from app/PWA |
| `CARD_PURCHASE` | Order assisted through Kartu Kopdes scan |
| `RT_ASSISTED` | RT creates order for warga |
| `SERVICE_STAFF` | Petugas Layanan creates order |
| `WARUNG_B2B` | Warung buys stock from cooperative |
| `WARUNG_PICKUP` | User chooses warung pickup point |
| `PAPER_FORM` | Order from physical form/dropbox |
| `VOICE_NOTE` | Order from WhatsApp/phone voice note |
| `KIOSK` | Order from kiosk mode |

## 11. MVP scope

### P0 Hackathon/MVP demo

1. User login/register.
2. Product catalog and stock.
3. Cart and checkout.
4. Admin product and stock management.
5. Kartu Kopdes QR scan.
6. Petugas Layanan assisted order.
7. RT Group Order.
8. Basic pickup/delivery assignment.
9. Basic KopKurir driver status.
10. Poin Gotong Royong earn/redeem.
11. Referral first-order reward.
12. Basic Misi Gotong Royong.
13. GMV/order/active buyer dashboard.
14. Settlement report.
15. Audit log.

### P1 Pilot

1. Mitra Warung ordering.
2. Paper-to-Digital catalog input.
3. Driver cash settlement.
4. External logistics integration abstraction.
5. P&L and cashflow dashboard.
6. Mission campaign builder.
7. Badge and RT leaderboard.
8. Voucher sponsor.
9. Offline draft order.

### P2 Scale

1. Voice-to-Digital with AI transcript + operator validation.
2. Kiosk Mode.
3. AI package generator.
4. AI demand forecast per RT/warung.
5. Fraud detection.
6. SIMKOPDES deeper integration.
7. NFC/IKD/e-KTP roadmap.

## 12. Hackathon scoring optimization

| Judging concern | KopMart RT answer |
|---|---|
| Problem relevance | Directly targets inactive transaction gap in KDKMP |
| Innovation | Omni-channel assisted marketplace, not app-only marketplace |
| Feasibility | Uses QR card, assisted staff, paper, warung, RT, and local couriers before expensive tech |
| Impact | Increases GMV, active buyers, repeat order, local product sales, local jobs |
| Inclusivity | Serves digital and non-digital warga |
| Sustainability | Koperasi earns margin; warung remains partner; local courier jobs created |
| Scalability | Multi-tenant, feature flag, offline-first, channel-based adoption |
| Auditability | All transactions, points, settlement, cashflow, and stock movements logged |
| National values | Misi Gotong Royong based on Hari Koperasi, 17 Agustus, Sumpah Pemuda, produk lokal, social solidarity |
| Integration | API-ready for SIMKOPDES, QRIS, WhatsApp, logistics partners, future IKD/e-KTP |

## 13. Key metrics

| Category | Metric |
|---|---|
| Business volume | GMV, order count, AOV, gross margin |
| Activation | active buyers, active RT, active warung, active assisted users |
| Retention | repeat order rate, points redemption rate, mission completion rate |
| Inclusion | non-smartphone orders, paper orders, voice orders, card scans |
| Logistics | delivery success rate, SLA, failed delivery, settlement time |
| Finance | P&L, cashflow, pending settlement, inventory locked value |
| Local economy | local SKU sales, UMKM sellers, warung B2B orders, KopKurir jobs |
| Trust | audit log completeness, dispute rate, refund rate |

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| RT overloaded | Add Petugas Layanan and Warung channel |
| Digital app adoption low | Use Kartu QR, paper form, voice note, kiosk, assisted staff |
| Warung sees cooperative as competitor | Make warung a mitra/reseller/pickup point |
| Fraud in points/missions | Reward after completed order; budget cap; audit log |
| Petugas misuses warga account | PIN/OTP/signature, receipt, audit trail |
| Cash settlement delayed | Settlement deadline, transaction limit, proof of deposit |
| External logistics API unavailable | Use provider abstraction and manual booking fallback |
| Kiosk hardware costly | Optional PWA kiosk mode on existing tablet/laptop |
| AI voice wrong | Human-in-the-loop confirmation |

## 15. Final product narrative

> **KopMart RT tidak membangun marketplace yang hanya bisa dipakai warga digital. KopMart RT membangun sistem transaksi koperasi yang bisa diakses lewat banyak pintu: aplikasi, Kartu Kopdes, RT, Petugas Layanan, Warung Mitra, katalog kertas, voice note, kios, dan kurir lokal. Dengan begitu, warga paling digital sampai warga paling awam tetap bisa bertransaksi, sementara koperasi mendapatkan volume usaha, data demand, cashflow, audit trail, dan dampak ekonomi yang terukur.**
