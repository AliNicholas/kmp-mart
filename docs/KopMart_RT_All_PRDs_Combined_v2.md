<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# KopMart RT — All Updated PRDs Combined v2.0



---

<!-- Source: 00_MASTER_PRD_KopMart_RT_v2.md -->

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


---

<!-- Source: 01_Self_Order_App_PRD.md -->

# PRD — Self-order App

## 1. Objective

Enable digital citizens to browse, buy, pay, track orders, collect points, complete missions, and reorder cooperative products independently.

## 2. Target users

- Warga digital with smartphone.
- Gen-Z/Gen-Alpha family members helping parents.
- Cooperative members who already understand mobile commerce.
- Returning buyers who want fast reorder.

## 3. Scope

### In scope

- Register/login.
- Browse product catalog.
- Product detail and stock visibility.
- Cart and checkout.
- Fulfillment selection: pickup, RT batch, delivery, warung pickup.
- Payment method selection.
- Points earn/redeem.
- Referral code.
- Mission list and progress.
- Order tracking.
- Transaction history.

### Out of scope for MVP

- Paylater.
- Cross-cooperative marketplace.
- Complex personalization.
- Biometric server login.

## 4. Main user flow

```text
Open app
→ Login/register
→ Select cooperative/auto-detect location
→ Browse catalog
→ Add products to cart
→ Choose fulfillment method
→ Apply points/voucher if eligible
→ Confirm order
→ Pay or choose COD/RT payment
→ Track status
→ Receive order
→ Points and mission progress updated
```

## 5. Key features

| Feature | Description | Priority |
|---|---|---|
| Register/Login | Phone number + OTP/PIN | P0 |
| Cooperative Home | Banner, category, mission, package promo | P0 |
| Product Catalog | Product list with price and stock | P0 |
| Search/Filter | Find product by name/category | P1 |
| Product Detail | Photo, price, stock, seller, points | P0 |
| Cart | Add/update/remove product | P0 |
| Checkout | Address, fulfillment, payment, voucher | P0 |
| Fulfillment Option | Pickup, delivery, RT batch, warung pickup | P0 |
| Points Wallet | Balance, history, redeem | P0 |
| Referral KopAjak | Referral code and reward status | P0 |
| Misi Gotong Royong | Mission list/progress/reward | P1 |
| Order Tracking | Status and ETA | P0 |
| Reorder | Buy previous basket again | P1 |
| Help/Support | Contact Petugas/Koperasi | P1 |

## 6. User stories

### US-SELF-001 — Browse products

As a digital citizen, I want to browse cooperative products so I can buy daily needs from the cooperative.

**Acceptance criteria**

- User can see product list.
- Product list shows price, stock status, unit, and image.
- Out-of-stock products are visible but cannot be added to cart.
- User can filter by category.

### US-SELF-002 — Checkout order

As a digital citizen, I want to checkout my cart so my order is recorded and fulfilled.

**Acceptance criteria**

- User can choose pickup/delivery/RT batch/warung pickup.
- System validates stock before order creation.
- System shows subtotal, discount, points redeemed, delivery fee, and total.
- Order is created only after user confirmation.
- Order appears in order history.

### US-SELF-003 — Redeem points

As a user, I want to redeem Poin Gotong Royong so I can get discount and feel motivated to reorder.

**Acceptance criteria**

- User can see eligible points and voucher.
- System enforces redemption cap.
- Points are deducted only when order is successfully created.
- Points are reversed if order is cancelled/refunded.

### US-SELF-004 — Complete mission

As a user, I want my purchases to count toward Misi Gotong Royong so I can receive rewards.

**Acceptance criteria**

- Mission progress increases only after completed order.
- User can see mission progress.
- Reward is issued only once if max claim is one.
- Mission reward appears in points history.

## 7. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| SELF-001 | User can register using phone number | P0 |
| SELF-002 | User can login using OTP/PIN | P0 |
| SELF-003 | User can browse product catalog | P0 |
| SELF-004 | User can add products to cart | P0 |
| SELF-005 | System validates stock before checkout | P0 |
| SELF-006 | User can choose fulfillment method | P0 |
| SELF-007 | User can redeem points/voucher | P0 |
| SELF-008 | User can track order status | P0 |
| SELF-009 | User can view points history | P0 |
| SELF-010 | User can copy/share referral code | P0 |
| SELF-011 | User can view active missions | P1 |
| SELF-012 | User can reorder previous order | P1 |

## 8. API draft

```http
POST /auth/register
POST /auth/login
POST /auth/verify-otp
POST /auth/create-pin
GET /me
GET /products
GET /products/{productId}
GET /cart
POST /cart/items
PATCH /cart/items/{cartItemId}
DELETE /cart/items/{cartItemId}
POST /checkout/preview
POST /orders
GET /orders
GET /orders/{orderId}
GET /points/wallet
POST /points/redeem/preview
GET /referrals/me
GET /missions
GET /me/missions
```

## 9. Data model additions

```text
User
UserSession
UserAddress
Cart
CartItem
Order
OrderItem
Payment
PointWallet
PointTransaction
ReferralCode
MissionProgress
```

## 10. Analytics events

| Event | Properties |
|---|---|
| app_opened | userId, cooperativeId |
| product_viewed | productId, categoryId |
| add_to_cart | productId, quantity |
| checkout_started | channel, fulfillmentMethod |
| order_created | orderId, total, channel |
| order_completed | orderId, total |
| points_redeemed | points, orderId |
| mission_completed | missionId, rewardType |
| referral_shared | userId |

## 11. Edge cases

| Case | Expected behavior |
|---|---|
| Stock changes during checkout | Show updated stock and ask user to revise cart |
| User loses internet | Preserve cart locally and retry |
| Payment pending too long | Expire order based on timeout |
| Order cancelled after points earned | Reverse points and mission progress if required |
| Delivery unavailable | Hide delivery option and show pickup/RT/warung options |

## 12. MVP acceptance checklist

- User can register/login.
- User can browse catalog.
- User can create order.
- User can choose pickup/RT/delivery.
- User can see order status.
- User can earn points after completed order.
- User can see missions and progress.


---

<!-- Source: 02_Kartu_Kopdes_QR_PRD.md -->

# PRD — Kartu Kopdes QR

## 1. Objective

Enable citizens without smartphones to transact in KopMart RT using a physical or printable QR card, while orders, points, missions, and audit records remain digital.

## 2. Product principle

Kartu Kopdes QR is **not e-money**. It is an identity/access card for purchase assistance, points, receipt, and audit.

## 3. Target users

- Warga without smartphone.
- Lansia.
- Warga with low digital literacy.
- Warga who prefers offline service.
- Petugas/RT/kasir who assists transaction.

## 4. Scope

### In scope

- Issue QR card.
- Scan card to identify member.
- Verify transaction with PIN/OTP/simple signature.
- Create assisted order under citizen account.
- Record points and mission progress.
- Print/send receipt.
- Block/unblock lost card.

### Out of scope for MVP

- e-KTP chip read.
- NFC card.
- Biometric server authentication.
- Card as stored-value wallet.

## 5. Main flow

```text
Admin issues Kartu Kopdes QR
→ Warga receives card
→ Warga visits Petugas/RT/kasir/warung/kiosk
→ Card is scanned
→ System loads citizen profile
→ Order is created
→ Citizen confirms with PIN/OTP/signature
→ Receipt generated
→ Points and mission progress updated
```

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Card Issuance | Generate member QR/token | P0 |
| Print Card | Printable card template | P1 |
| Scan Card | Identify member via QR | P0 |
| Member Lookup | Search by member ID/phone if card unavailable | P0 |
| PIN Verification | Citizen approves transaction | P0 |
| Order Attribution | Order belongs to citizen, not staff | P0 |
| Points Recording | Points credited to citizen wallet | P0 |
| Receipt Generator | Print/WhatsApp/SMS receipt | P1 |
| Block/Unblock Card | Handle lost or stolen card | P0 |
| Audit Log | Track all card scans and orders | P0 |

## 7. User stories

### US-CARD-001 — Card-assisted order

As a citizen without smartphone, I want to use my Kartu Kopdes QR so I can buy cooperative products and get points.

**Acceptance criteria**

- Staff can scan QR card.
- System shows correct citizen profile.
- Staff can create order for the citizen.
- Citizen confirms using PIN/OTP/signature.
- Order is recorded under citizen ID.
- Receipt is generated.
- Points are issued after order completed.

### US-CARD-002 — Lost card block

As an admin, I want to block a lost card so nobody can misuse it.

**Acceptance criteria**

- Admin can block card.
- Blocked card cannot be used for new order.
- Admin can issue replacement card.
- All block/unblock actions are audited.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| CARD-001 | Generate unique card token | P0 |
| CARD-002 | QR must not contain raw NIK | P0 |
| CARD-003 | Scan QR returns masked member profile | P0 |
| CARD-004 | Transaction requires approval factor | P0 |
| CARD-005 | Order created via card must store assisting actor ID | P0 |
| CARD-006 | Card can be blocked/unblocked | P0 |
| CARD-007 | Card scan must be audit logged | P0 |
| CARD-008 | Card replacement keeps old transaction history | P1 |

## 9. API draft

```http
POST /admin/cards/issue
POST /admin/cards/print-template
POST /cards/scan
GET /cards/{cardId}
POST /cards/{cardId}/block
POST /cards/{cardId}/unblock
POST /assisted-orders/preview
POST /assisted-orders
POST /assisted-orders/{orderId}/verify-pin
```

## 10. Data model

```json
{
  "KopdesCard": {
    "id": "uuid",
    "userId": "uuid",
    "cooperativeId": "uuid",
    "cardTokenHash": "string",
    "cardNumber": "string",
    "status": "ACTIVE | BLOCKED | REPLACED | EXPIRED",
    "issuedAt": "datetime",
    "issuedBy": "uuid"
  }
}
```

## 11. Security and privacy

- QR stores token only, not NIK.
- Token should be random and non-guessable.
- Token stored hashed in database.
- Profile shown to staff should be minimal and masked.
- PIN/OTP/signature is required for purchase confirmation.
- Staff cannot view unnecessary sensitive fields.

## 12. Edge cases

| Case | Expected behavior |
|---|---|
| QR damaged | Search by member ID/phone with extra verification |
| Card blocked | Show error and contact admin |
| Wrong PIN | Limit retry and lock verification temporarily |
| Duplicate scan | Do not create duplicate order without confirmation |
| Network down | Allow draft order but require sync before final confirmation |

## 13. MVP acceptance checklist

- Admin can issue QR card.
- Staff can scan QR card.
- Staff can create order under citizen account.
- Citizen can confirm purchase.
- Receipt and audit log are generated.
- Card can be blocked.


---

<!-- Source: 03_RT_Group_Order_PRD.md -->

# PRD — RT Group Order

## 1. Objective

Enable community-based collective orders so small individual demand becomes larger cooperative transaction volume, delivery becomes cheaper, and non-digital citizens can participate through RT/Petugas assistance.

## 2. Target users

- Ketua RT / kader.
- Petugas Layanan KopMart.
- Warga digital joining RT batch.
- Warga non-digital assisted by RT/Petugas.
- Admin koperasi.
- Driver/KopKurir.

## 3. Scope

### In scope

- RT creates batch order.
- Batch has deadline and pickup point.
- User can join batch from app.
- RT/Petugas can add assisted orders.
- Admin receives consolidated batch.
- Packing list per citizen.
- Delivery to RT point.
- Pickup confirmation per citizen.
- Points, missions, RT incentive, and settlement.

### Out of scope for MVP

- Dynamic routing optimization.
- Multi-RT route batching.
- Automated demand forecast.

## 4. Batch flow

```text
RT creates batch
→ Batch status Open
→ Users join / RT assists orders
→ Deadline reached or RT locks batch
→ Batch submitted to cooperative
→ Admin reviews stock
→ Cooperative packs per citizen
→ Driver delivers to RT point
→ RT confirms batch received
→ Citizens pickup their packages
→ Each order completed
→ Points, mission progress, RT incentive calculated
```

## 5. Statuses

| Batch status | Meaning |
|---|---|
| Draft | RT prepares batch |
| Open | Citizens can join |
| Locked | No more orders allowed |
| Submitted | Sent to cooperative |
| Confirmed | Cooperative confirms stock/fulfillment |
| Packing | Items being packed |
| Ready for Pickup | Ready for driver pickup |
| In Delivery | Driver delivering to RT point |
| Delivered to RT | Arrived at RT point |
| Partially Picked Up | Some citizens picked up |
| Completed | All valid orders completed |
| Cancelled | Batch cancelled |

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Create Batch | RT creates order batch | P0 |
| Batch Deadline | Cutoff time for order | P0 |
| Batch Catalog | Products eligible for batch | P0 |
| Join Batch | User joins batch from app | P0 |
| Assisted Batch Order | RT/Petugas adds order for warga | P0 |
| Lock Batch | Prevent new orders | P0 |
| Batch Summary | GMV, orders, item quantity | P0 |
| Packing List | Per citizen and consolidated list | P0 |
| Pickup List | Citizen pickup checklist | P0 |
| RT Incentive | Incentive based on completed batch | P1 |
| Batch Chat/Broadcast | WhatsApp message generator | P1 |
| Batch Audit Log | Track every action | P0 |

## 7. User stories

### US-RT-001 — Create batch

As an RT, I want to create a weekly group order so citizens can buy together from the cooperative.

**Acceptance criteria**

- RT can set title, deadline, pickup point, and notes.
- Batch is visible to citizens under that RT.
- Batch can be open, locked, submitted, or cancelled.
- All changes are audit logged.

### US-RT-002 — Assisted order in batch

As an RT/Petugas, I want to add orders for citizens without smartphones so they can join the batch.

**Acceptance criteria**

- RT/Petugas can scan Kartu Kopdes or search member.
- Order is attributed to citizen.
- Citizen confirmation is required.
- Order appears inside batch summary.

### US-RT-003 — Packing list

As admin koperasi, I want to generate packing list per batch so fulfillment is efficient.

**Acceptance criteria**

- Admin can see consolidated SKU quantity.
- Admin can see per-citizen package list.
- Items can be marked packed.
- Missing stock is flagged.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| RT-001 | RT can create batch | P0 |
| RT-002 | RT can update/cancel Draft/Open batch | P0 |
| RT-003 | Users can join open batch | P0 |
| RT-004 | Assisted orders can be added | P0 |
| RT-005 | Batch cannot accept orders after locked | P0 |
| RT-006 | Stock validation happens at submission | P0 |
| RT-007 | Generate consolidated packing list | P0 |
| RT-008 | Generate per-citizen pickup list | P0 |
| RT-009 | RT can mark citizen pickup | P0 |
| RT-010 | Completed batch triggers points and missions | P0 |
| RT-011 | RT incentive can be calculated | P1 |

## 9. API draft

```http
POST /rt/batches
GET /rt/batches
GET /rt/batches/{batchId}
PATCH /rt/batches/{batchId}
POST /rt/batches/{batchId}/open
POST /rt/batches/{batchId}/lock
POST /rt/batches/{batchId}/submit
POST /rt/batches/{batchId}/orders
GET /rt/batches/{batchId}/summary
GET /rt/batches/{batchId}/packing-list
GET /rt/batches/{batchId}/pickup-list
PATCH /rt/batches/{batchId}/orders/{orderId}/pickup
POST /admin/rt-batches/{batchId}/confirm
```

## 10. Data model

```text
RTBatch
RTBatchOrder
RTBatchItemSummary
PickupPoint
PackingTask
PickupConfirmation
RTIncentive
```

## 11. Edge cases

| Case | Expected behavior |
|---|---|
| Stock insufficient after batch submitted | Admin can propose substitution or partial fulfillment |
| Citizen does not pickup | Mark as unclaimed and apply return/cancellation rule |
| RT cancels batch after orders added | Notify affected users and reverse reserved stock |
| Payment mixed QRIS/COD | Track per order payment status |
| Driver failed to deliver | Batch goes to delivery exception status |

## 12. KPI

- RT active per month.
- Batch order count.
- GMV per batch.
- Average basket size per RT.
- Pickup completion rate.
- Unclaimed package rate.
- Cost per delivery.
- Repeat batch participation.

## 13. MVP acceptance checklist

- RT creates batch.
- Users and assisted citizens can join batch.
- Admin can see batch summary.
- Packing list is generated.
- Delivery to RT can be recorded.
- Pickup per citizen can be confirmed.
- Points and mission progress update after completion.


---

<!-- Source: 04_Petugas_Layanan_KopMart_PRD.md -->

# PRD — Petugas Layanan KopMart

## 1. Objective

Create an official assisted-commerce role so non-digital citizens can transact without overloading RT and without forcing every citizen to use a smartphone.

## 2. Role definition

**Petugas Layanan KopMart** is a verified cooperative/community operator who helps citizens create orders, scan Kartu Kopdes, input paper forms, process voice notes, explain points, generate receipts, and record all actions digitally.

## 3. Why this module exists

RT is useful for community trust, but RT should not carry all operational load. Petugas Layanan makes the assisted channel more accountable, trainable, auditable, and scalable.

## 4. Target users

- Petugas koperasi.
- Karang taruna youth.
- Kader PKK/Posyandu.
- Operator balai desa/koperasi.
- RT/kader with service assignment.
- Warga non-digital.

## 5. Scope

### In scope

- Assisted order form.
- Scan Kartu Kopdes.
- PIN/OTP/simple signature confirmation.
- Paper form input.
- Voice note inbox processing.
- Order confirmation preview.
- Receipt generation.
- Points assistance.
- Offline draft order.
- Audit log.

### Out of scope for MVP

- Petugas payroll system.
- Complex route/delivery management.
- Fully automated voice AI.

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Assisted Order Form | Input order atas nama warga | P0 |
| Scan Kartu Kopdes | Scan QR untuk mengambil profil warga | P0 |
| Manual Member Lookup | Search by member ID/phone/name | P0 |
| PIN Verification | Validasi persetujuan transaksi | P0 |
| Paper Form Input | Input berdasarkan formulir fisik | P0 |
| Order Confirmation | Ringkasan order sebelum submit | P0 |
| Receipt Generator | Cetak/kirim struk | P1 |
| Points Assistance | Cek dan redeem poin warga | P1 |
| Voice Note Inbox | Daftar voice note yang perlu diproses | P1 |
| Offline Draft Order | Simpan order offline sebelum sync | P1 |
| Activity Audit Log | Semua aksi petugas tercatat | P0 |
| Petugas Performance | Count orders, errors, settlement | P1 |

## 7. User story

### US-PETUGAS-001 — Assisted order for non-smartphone citizen

As a citizen without smartphone, I want to be assisted by Petugas Layanan KopMart to create an order so I can still buy from the cooperative and collect points.

**Acceptance criteria**

- Petugas can identify citizen by scanning Kartu Kopdes or inputting member ID.
- Petugas can select products and quantity.
- System shows total, discount, points, and payment method.
- Citizen confirms using PIN/OTP/simple digital signature.
- Order is recorded under citizen account, not petugas account.
- All petugas actions are written to audit log.
- Receipt can be printed or sent.

### US-PETUGAS-002 — Paper form input

As a Petugas, I want to input orders from paper forms so citizens who use physical catalog can still be served.

**Acceptance criteria**

- Petugas can select source channel `PAPER_FORM`.
- Petugas can attach photo of paper form.
- System validates product code and stock.
- Order requires confirmation or is marked as pending confirmation.
- Paper form is linked to order audit record.

### US-PETUGAS-003 — Points assistance

As a Petugas, I want to help citizens check and redeem points so non-digital citizens get the same benefit as app users.

**Acceptance criteria**

- Petugas can view citizen points balance after identification.
- Sensitive data is masked.
- Petugas can apply eligible redemption.
- Citizen confirmation is required.
- Redemption is audited.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| PET-001 | Petugas login with staff role | P0 |
| PET-002 | Petugas can scan Kartu Kopdes | P0 |
| PET-003 | Petugas can search member manually | P0 |
| PET-004 | Petugas can create assisted order | P0 |
| PET-005 | Citizen confirmation required before final submit | P0 |
| PET-006 | Order stores assistedBy actor ID | P0 |
| PET-007 | Petugas can input paper form order | P0 |
| PET-008 | Petugas can generate receipt | P1 |
| PET-009 | Petugas can process voice note inbox | P1 |
| PET-010 | Petugas can create offline draft | P1 |
| PET-011 | Every action must be audit logged | P0 |

## 9. API draft

```http
GET /staff/me
POST /cards/scan
GET /members/search
POST /assisted-orders/preview
POST /assisted-orders
POST /assisted-orders/{orderId}/confirm-pin
POST /assisted-orders/{orderId}/signature
POST /paper-orders
POST /paper-orders/{paperOrderId}/attach-photo
GET /voice-orders/inbox
PATCH /voice-orders/{voiceOrderId}/process
GET /staff/activity-log
```

## 10. Data model

```text
StaffProfile
AssistedOrderSession
CitizenConfirmation
PaperOrderForm
VoiceOrderTicket
Receipt
StaffActivityLog
```

## 11. Audit requirements

Each assisted action must record:

- staff ID,
- citizen ID,
- source channel,
- location/service point,
- timestamp,
- before/after values if edited,
- order ID,
- confirmation method,
- device ID when available.

## 12. Edge cases

| Case | Expected behavior |
|---|---|
| Citizen forgot PIN | Admin reset flow with identity verification |
| Staff selects wrong citizen | Show citizen name/RT masked and require confirmation |
| Offline order created | Mark as Draft Offline until sync and stock validation |
| Product code invalid | Show error and allow manual product search |
| Citizen disputes order | Audit log and receipt used for investigation |

## 13. KPI

- Assisted orders per petugas.
- Non-digital citizens served.
- Error/dispute rate.
- Average service time.
- Paper orders processed.
- Voice orders processed.
- Points redeemed by assisted citizens.

## 14. MVP acceptance checklist

- Petugas can login.
- Petugas can scan card/search member.
- Petugas can create assisted order.
- Citizen confirmation is required.
- Order is under citizen account.
- Receipt and audit log are generated.


---

<!-- Source: 05_Mitra_Warung_KopMart_PRD.md -->

# PRD — Mitra Warung KopMart

## 1. Objective

Turn local warung kelontong into cooperative commerce partners instead of competitors, so cooperative business volume increases while existing village retail networks remain alive.

## 2. Product positioning

> **Koperasi menjadi supplier/grosir lokal, warung menjadi hub transaksi dan pickup point, warga tetap bisa belanja offline seperti biasa.**

## 3. Target users

- Warung kelontong owners.
- Cooperative admin.
- Citizens who still prefer offline warung shopping.
- Local drivers.
- UMKM/product suppliers.

## 4. Scope

### In scope

- Register warung as partner.
- Warung product catalog with partner price.
- B2B stock ordering.
- Minimum order and wholesale pricing.
- Warung points/loyalty.
- Warung as pickup point.
- Delivery to warung.
- Warung settlement and invoice.

### Out of scope for MVP

- Real-time POS for all retail sales to citizens.
- Credit/loan for warung.
- Complex consignment accounting.

## 5. Core flows

### 5.1 Warung stock order

```text
Warung login
→ Browse cooperative wholesale catalog
→ Add stock to cart
→ Checkout B2B order
→ Choose delivery/pickup
→ Cooperative prepares stock
→ Driver delivers to warung
→ Warung pays/settles
→ Cooperative GMV increases
```

### 5.2 Warung pickup point

```text
Citizen orders in app/assisted channel
→ Select warung pickup point
→ Cooperative packs order
→ Driver delivers packages to warung
→ Citizen picks up at warung
→ Warung confirms pickup and may receive small fee
```

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Warung Registration | Create partner profile | P0 |
| Partner Catalog | Product list with warung price | P0 |
| B2B Cart/Checkout | Warung buys cooperative stock | P0 |
| Minimum Order Rule | Min amount/quantity | P0 |
| Wholesale Price Tier | Special price for warung | P1 |
| Warung Points | Reward for repeat B2B order | P1 |
| Pickup Point Mode | Warung receives citizen packages | P1 |
| Warung Settlement | Invoice/payment tracking | P0 |
| Delivery to Warung | Assign driver/provider | P0 |
| Warung Performance | Order frequency and GMV | P1 |

## 7. User stories

### US-WARUNG-001 — Warung orders stock

As a warung owner, I want to order stock from the cooperative at partner price so I can resell to citizens and keep my warung alive.

**Acceptance criteria**

- Warung can view partner catalog.
- Warung price may differ from retail price.
- Warung can checkout B2B order.
- Order appears in admin dashboard as `WARUNG_B2B`.
- Payment and settlement are tracked.

### US-WARUNG-002 — Warung as pickup point

As a citizen, I want to pick up my KopMart order at a nearby warung so receiving goods is easier.

**Acceptance criteria**

- User can select eligible warung pickup point.
- Warung can see incoming packages.
- Warung can confirm pickup using QR/PIN.
- Pickup confirmation updates order status.
- Warung pickup fee can be calculated.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| WAR-001 | Admin can register warung partner | P0 |
| WAR-002 | Warung can login with partner role | P0 |
| WAR-003 | Warung can access B2B catalog | P0 |
| WAR-004 | Warung order uses partner price | P0 |
| WAR-005 | System enforces minimum order | P0 |
| WAR-006 | Warung can track order status | P0 |
| WAR-007 | Admin can manage warung settlement | P0 |
| WAR-008 | Warung can be configured as pickup point | P1 |
| WAR-009 | Warung can confirm citizen pickup | P1 |
| WAR-010 | Warung points/reward can be issued | P1 |

## 9. API draft

```http
POST /admin/warungs
GET /admin/warungs
PATCH /admin/warungs/{warungId}
POST /warung/login
GET /warung/catalog
POST /warung/orders/preview
POST /warung/orders
GET /warung/orders
GET /warung/orders/{orderId}
GET /pickup-points/warungs
POST /warung/pickups/{packageId}/confirm
GET /admin/warungs/{warungId}/settlements
```

## 10. Data model

```text
WarungPartner
WarungPriceList
WarungOrder
WarungOrderItem
WarungSettlement
PickupPoint
WarungPickupPackage
```

## 11. Edge cases

| Case | Expected behavior |
|---|---|
| Warung fails payment | Apply credit limit/block new orders |
| Warung out of storage capacity | Admin can disable pickup point mode |
| Package not picked up | Return to cooperative or retry notification |
| Price mismatch | Invoice uses price snapshot at order time |
| Warung inactive | Hide from pickup point list |

## 12. KPI

- Active warung partners.
- Warung GMV.
- Repeat B2B order rate.
- Average order value per warung.
- Warung pickup packages completed.
- Warung settlement timeliness.
- Local job/retail preservation impact.

## 13. MVP acceptance checklist

- Admin can create warung partner.
- Warung can order stock from cooperative.
- Admin can fulfill warung order.
- Settlement can be tracked.
- Warung channel contributes to GMV dashboard.


---

<!-- Source: 06_Paper_to_Digital_Catalog_PRD.md -->

# PRD — Paper-to-Digital Catalog

## 1. Objective

Serve citizens who are comfortable with physical catalog/forms by converting paper orders into digital cooperative transactions.

## 2. Product principle

Paper is the access layer; digital system is the source of truth.

## 3. Target users

- Lansia.
- Warga without smartphone.
- Areas with poor internet.
- Pos RT, warung, posyandu, balai desa.
- Petugas Layanan who processes forms.

## 4. Scope

### In scope

- Generate printable catalog.
- Generate product codes.
- Generate paper order form template.
- Dropbox collection workflow.
- Petugas input form into system.
- Optional photo attachment of paper form.
- Confirmation before fulfillment.
- Audit log.

### Out of scope for MVP

- Full OCR automation.
- Postal-like tracking for forms.
- Complex offline inventory sync.

## 5. Flow

```text
Admin selects products for weekly catalog
→ System generates PDF catalog and order form
→ Catalog is printed and distributed
→ Citizen fills form with member ID/product code/quantity
→ Form submitted to dropbox/RT/warung
→ Petugas collects and inputs form
→ System validates product code and stock
→ Order confirmation is performed
→ Order becomes digital and enters fulfillment
```

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Catalog Generator | Printable product list | P0 |
| Product Short Code | Easy numeric/alphanumeric code | P0 |
| Order Form Template | Printable form | P0 |
| Dropbox Location | Track pickup/source location | P1 |
| Paper Form Input | Petugas inputs order | P0 |
| Form Photo Attachment | Attach proof image | P1 |
| Pending Confirmation | Order waits for citizen confirmation if needed | P0 |
| Batch Import | Input multiple forms quickly | P1 |
| Audit Log | Trace form-to-order conversion | P0 |

## 7. User stories

### US-PAPER-001 — Print catalog

As admin koperasi, I want to print a weekly catalog so citizens without smartphones can see available products.

**Acceptance criteria**

- Admin can select products to include.
- System generates PDF catalog.
- Each product has short code, name, price, unit, and optional photo.
- Catalog shows valid period and order deadline.

### US-PAPER-002 — Input paper order

As Petugas, I want to input paper forms so citizens can order without using app.

**Acceptance criteria**

- Petugas can choose source `PAPER_FORM`.
- Petugas can input member ID/name/RT.
- Petugas can input product codes and quantities.
- System validates codes and calculates total.
- Order is created as pending/confirmed based on policy.
- Form photo can be attached.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| PAPER-001 | Admin can generate printable catalog | P0 |
| PAPER-002 | Products have short order code | P0 |
| PAPER-003 | Admin can generate order form template | P0 |
| PAPER-004 | Petugas can input paper order | P0 |
| PAPER-005 | System validates product code | P0 |
| PAPER-006 | System validates stock at input time | P0 |
| PAPER-007 | Order stores source location/dropbox | P1 |
| PAPER-008 | Petugas can attach form photo | P1 |
| PAPER-009 | All paper input actions are audited | P0 |

## 9. API draft

```http
POST /admin/catalogs/printable
GET /admin/catalogs/{catalogId}/pdf
POST /admin/paper-forms/template
POST /paper-orders/preview
POST /paper-orders
POST /paper-orders/{paperOrderId}/attach-photo
POST /paper-orders/{paperOrderId}/confirm
GET /admin/paper-orders
```

## 10. Data model

```text
PrintableCatalog
CatalogProduct
ProductShortCode
PaperOrderForm
PaperOrderItem
DropboxLocation
PaperOrderAttachment
```

## 11. Edge cases

| Case | Expected behavior |
|---|---|
| Product code invalid | Petugas gets validation error |
| Price changed after catalog printed | Order uses catalog price until valid period ends or shows warning |
| Stock unavailable | Petugas can propose substitute or mark pending |
| Member ID missing | Petugas can search and attach after verification |
| Handwriting unclear | Mark as needs confirmation |

## 12. KPI

- Paper catalogs distributed.
- Paper orders converted.
- Input error rate.
- Time from form collection to digital order.
- Non-digital citizens served.
- GMV from paper channel.

## 13. MVP acceptance checklist

- Admin can generate catalog.
- Products have short codes.
- Petugas can input paper form.
- Order source is recorded as paper.
- Digital order enters normal fulfillment.


---

<!-- Source: 07_Voice_to_Digital_Order_PRD.md -->

# PRD — Voice-to-Digital Order

## 1. Objective

Allow citizens who are comfortable speaking but not typing to order cooperative products through WhatsApp voice note or phone call, with operator validation before order creation.

## 2. Product principle

Voice-to-Digital should be **human-in-the-loop** for MVP. AI transcription may assist, but operator confirmation is required to avoid wrong orders.

## 3. Target users

- Warga who use WhatsApp but cannot type comfortably.
- Lansia.
- Warga with low literacy.
- Warga with accessibility needs.
- Petugas/operator koperasi.

## 4. Scope

### In scope

- WhatsApp hotline/manual inbox.
- Voice note ticket creation.
- Optional transcription field.
- Operator parses order.
- Product matching.
- Confirmation message.
- Order creation after confirmation.
- Audit trail.

### Out of scope for MVP

- Fully automated phone bot.
- Real-time speech recognition.
- Multi-language dialect engine.

## 5. Flow

```text
Citizen sends voice note
→ System/operator creates voice order ticket
→ Optional AI transcription generated
→ Operator validates citizen identity
→ Operator maps spoken products to catalog SKUs
→ System sends order summary confirmation
→ Citizen replies YES/YA or confirms by call/PIN
→ Order is created under citizen account
→ Receipt sent
```

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Voice Inbox | List incoming voice orders | P1 |
| Ticket Status | New, transcribing, needs review, confirmed | P1 |
| Manual Transcription | Operator writes order text | P0 |
| AI Transcription Assist | Draft transcript | P2 |
| Product Matcher | Search/select products from transcript | P1 |
| Citizen Lookup | Match phone/member/card | P0 |
| Confirmation Message | Send summary before order | P0 |
| Order Creation | Create order after confirmation | P0 |
| Audit Log | Track operator actions | P0 |

## 7. User stories

### US-VOICE-001 — Voice note order

As a citizen, I want to send a voice note to the cooperative so I can order without typing.

**Acceptance criteria**

- Voice note creates a ticket.
- Operator can listen to voice note.
- Operator can identify citizen.
- Operator can select products and quantities.
- System sends confirmation summary.
- Order is created only after confirmation.

### US-VOICE-002 — Operator validation

As operator, I want to review AI transcript before creating order so wrong transcription does not create wrong order.

**Acceptance criteria**

- Transcript is editable.
- Product mapping requires operator selection.
- Ambiguous items are flagged.
- Order cannot be submitted without confirmation.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| VOICE-001 | Voice message can be registered as ticket | P1 |
| VOICE-002 | Operator can play/download voice note | P1 |
| VOICE-003 | Operator can input/edit transcript | P0 |
| VOICE-004 | Operator can search citizen | P0 |
| VOICE-005 | Operator can match product to SKU | P0 |
| VOICE-006 | System can send confirmation summary | P0 |
| VOICE-007 | Order created only after confirmation | P0 |
| VOICE-008 | Ticket and order are linked | P0 |
| VOICE-009 | AI transcript is optional assist | P2 |

## 9. API draft

```http
POST /voice-orders/tickets
GET /voice-orders/inbox
GET /voice-orders/{ticketId}
PATCH /voice-orders/{ticketId}/transcript
POST /voice-orders/{ticketId}/match-products
POST /voice-orders/{ticketId}/send-confirmation
POST /voice-orders/{ticketId}/confirm
POST /voice-orders/{ticketId}/create-order
```

## 10. Data model

```text
VoiceOrderTicket
VoiceAttachment
VoiceTranscript
VoiceProductMatch
VoiceConfirmation
```

## 11. Ticket statuses

| Status | Meaning |
|---|---|
| New | Voice note received |
| In Review | Operator processing |
| Need Clarification | Order ambiguous |
| Waiting Confirmation | Summary sent to citizen |
| Confirmed | Citizen confirmed |
| Order Created | Digital order created |
| Cancelled | Ticket cancelled |

## 12. Edge cases

| Case | Expected behavior |
|---|---|
| Voice unclear | Mark Need Clarification |
| Unknown citizen phone | Ask for member ID/card |
| Product not found | Operator suggests alternative |
| Citizen does not confirm | Ticket expires after configured time |
| Wrong order dispute | Audit voice note and confirmation summary |

## 13. MVP acceptance checklist

- Operator can process voice order manually.
- Order summary confirmation is required.
- Voice ticket links to created order.
- Audit log records operator actions.


---

<!-- Source: 08_Kiosk_Mode_PRD.md -->

# PRD — Kiosk Mode

## 1. Objective

Provide an assisted self-service ordering interface for balai desa, cooperative office, RT post, or service point using existing tablet/laptop/large-screen device.

## 2. Product principle

Kiosk Mode should be software-first, not hardware-first. MVP should run as PWA/tablet mode using affordable existing devices.

## 3. Target users

- Citizens who can tap large buttons but do not have personal smartphone.
- Petugas assisting citizens at balai desa/koperasi.
- Cooperative cashier/service counter.

## 4. Scope

### In scope

- Large button UI.
- Scan Kartu Kopdes via camera.
- Product catalog with simple categories.
- Cart and checkout.
- Print/send receipt.
- Petugas override/help mode.
- Session timeout and privacy reset.

### Out of scope for MVP

- Dedicated custom kiosk hardware.
- Cash acceptor integration.
- Biometric hardware.

## 5. Flow

```text
Citizen visits kiosk
→ Tap Start
→ Scan Kartu Kopdes or ask Petugas help
→ Select products with large buttons
→ Review order summary
→ Confirm with PIN/Petugas assistance
→ Receipt printed/sent
→ Admin prepares goods
```

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Kiosk Session | Start/end anonymous session | P0 |
| Scan Card Login | QR card scan via camera | P0 |
| Large Button Catalog | Accessible simple product UI | P0 |
| Simple Cart | Add/remove quantities | P0 |
| Assisted Confirmation | PIN or staff confirmation | P0 |
| Receipt | Print or WhatsApp/SMS | P1 |
| Session Timeout | Auto clear data | P0 |
| Staff Help Mode | Petugas can assist/override | P1 |
| Offline Catalog Cache | View products with low connectivity | P1 |

## 7. User stories

### US-KIOSK-001 — Order through kiosk

As a citizen without smartphone, I want to order using a kiosk at the cooperative so I can buy goods independently or semi-independently.

**Acceptance criteria**

- Citizen can scan Kartu Kopdes.
- Catalog uses large buttons and clear images.
- Citizen can add products to cart.
- System shows total before confirmation.
- Confirmation is required before order creation.
- Session is cleared after completion/timeout.

### US-KIOSK-002 — Petugas help

As Petugas, I want to help a citizen at kiosk if they are confused.

**Acceptance criteria**

- Petugas can enter help mode.
- Petugas actions are logged.
- Order still belongs to citizen.
- Kiosk returns to normal mode after session.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| KIOSK-001 | Kiosk mode can be enabled per device | P0 |
| KIOSK-002 | Session starts without exposing previous user data | P0 |
| KIOSK-003 | Citizen can scan QR card | P0 |
| KIOSK-004 | Product UI supports large touch buttons | P0 |
| KIOSK-005 | Session timeout clears state | P0 |
| KIOSK-006 | Order requires confirmation | P0 |
| KIOSK-007 | Receipt can be generated | P1 |
| KIOSK-008 | Staff help mode is audit logged | P1 |

## 9. API draft

```http
POST /kiosk/sessions
POST /kiosk/sessions/{sessionId}/scan-card
GET /kiosk/catalog
POST /kiosk/sessions/{sessionId}/cart/items
POST /kiosk/sessions/{sessionId}/checkout/preview
POST /kiosk/sessions/{sessionId}/orders
POST /kiosk/sessions/{sessionId}/end
POST /kiosk/sessions/{sessionId}/staff-help
```

## 10. Data model

```text
KioskDevice
KioskSession
KioskCart
KioskHelpLog
```

## 11. Edge cases

| Case | Expected behavior |
|---|---|
| User walks away | Auto timeout and clear cart |
| Camera cannot scan | Manual member lookup by staff |
| Network down | Save draft only if staff mode enabled |
| Wrong order | Confirmation screen and audit log help dispute |

## 12. MVP acceptance checklist

- Kiosk mode opens in browser/PWA.
- Citizen can scan card.
- Citizen can create order with large button UI.
- Session clears after completion.


---

<!-- Source: 09_Driver_Local_Logistics_PRD.md -->

# PRD — Driver & Local Logistics

## 1. Objective

Support pickup and delivery for individual orders, RT batch orders, warung stock orders, and pickup point packages using local cooperative couriers (**KopKurir**) and optional integration with external logistics providers.

## 2. Product principle

KopMart RT should not depend fully on Gojek/Grab/JNE/J&T/Shopee Express. Koperasi must be able to operate with local courier first, while external providers remain optional based on availability, API/partnership, distance, SLA, and cost.

## 3. Logistics modes

| Mode | Description | Best for |
|---|---|---|
| KopKurir | Local cooperative courier/self-owned courier | Same village, RT batch, warung delivery, job creation |
| Community Pickup | Citizen picks up at koperasi/RT/warung | Low cost, dense village area |
| External Instant Courier | GoSend/GrabExpress type service if available | Urgent same-day urban/semi-urban delivery |
| External Parcel Provider | JNE/J&T/Shopee Express/aggregator | Inter-village/inter-district parcel |
| Manual Booking | Admin books provider manually and inputs tracking | MVP fallback when API unavailable |

## 4. Target users

- KopKurir/local driver.
- Cooperative admin/dispatcher.
- RT pickup receiver.
- Warung pickup receiver.
- Citizen recipient.
- External logistics provider/aggregator.

## 5. Scope

### In scope

- Delivery method selection.
- Driver assignment.
- Pickup from cooperative.
- Delivery to citizen/RT/warung.
- Proof of pickup and proof of delivery.
- Delivery status tracking.
- COD/cash collection.
- Driver settlement.
- Manual external logistics tracking.
- Provider abstraction for future integration.

### Out of scope for MVP

- Live GPS tracking.
- Complex route optimization.
- Real-time API integration with all providers.
- Driver payroll system.

## 6. Delivery flows

### 6.1 KopKurir individual delivery

```text
Admin marks order Ready for Delivery
→ Dispatcher assigns KopKurir
→ Driver accepts task
→ Driver picks up package
→ Driver delivers to citizen
→ Citizen confirms via PIN/QR/signature/photo
→ Order completed
→ COD/settlement recorded if applicable
```

### 6.2 RT batch delivery

```text
Batch Ready for Delivery
→ Driver picks up consolidated packages
→ Driver delivers to RT point
→ RT confirms batch receipt
→ Citizens pickup individually
→ RT/Petugas confirms each pickup
```

### 6.3 External logistics fallback

```text
Admin selects external provider/manual booking
→ System creates shipment record
→ Admin inputs provider name and tracking number
→ Package handed over
→ Status updated manually or via API if integrated
→ Delivery completed/failed
```

## 7. Key features

| Feature | Description | Priority |
|---|---|---|
| Delivery Method Selection | Pickup, RT, warung, KopKurir, external | P0 |
| Dispatch Dashboard | Assign delivery tasks | P0 |
| Driver App/Mode | View and update tasks | P0 |
| Proof of Pickup | Photo/QR/time/location | P0 |
| Proof of Delivery | Recipient confirmation | P0 |
| RT Batch Delivery | Deliver consolidated batch | P0 |
| Warung Delivery | Deliver B2B stock/pickup packages | P1 |
| COD Collection | Driver collects cash | P1 |
| Driver Settlement | Cash report and deposit | P1 |
| External Provider Record | Manual provider/tracking input | P1 |
| Provider Integration Layer | API abstraction for partners | P2 |
| Failed Delivery Handling | Retry/return/cancel rules | P0 |

## 8. Delivery statuses

| Status | Meaning |
|---|---|
| Pending Assignment | Needs driver/provider |
| Assigned | Driver/provider assigned |
| Accepted | Driver accepted task |
| Pickup Started | Driver heading to pickup |
| Picked Up | Package picked up |
| In Transit | Package on the way |
| Delivered to RT | Batch arrived at RT |
| Delivered to Warung | Package arrived at warung |
| Delivered to User | Delivered to citizen |
| Failed Delivery | Delivery failed |
| Returned | Returned to cooperative |
| Cancelled | Delivery cancelled |

## 9. User stories

### US-LOG-001 — Driver pickup

As KopKurir, I want to see assigned pickup tasks so I can pick up packages from the cooperative.

**Acceptance criteria**

- Driver can see assigned deliveries.
- Driver can accept task.
- Driver can scan package QR or enter code.
- Proof of pickup is recorded.
- Status changes to Picked Up.

### US-LOG-002 — RT batch delivery

As admin, I want to deliver a batch to RT so many orders can be fulfilled efficiently.

**Acceptance criteria**

- Batch can be assigned to driver.
- Driver sees consolidated package list.
- RT confirms receipt.
- Batch status becomes Delivered to RT.
- Individual citizen pickup remains separate.

### US-LOG-003 — Local job creation

As cooperative, I want to assign delivery to local KopKurir so the program creates job opportunities around the cooperative.

**Acceptance criteria**

- Admin can register local driver.
- Admin can assign tasks to local driver.
- Driver performance is tracked.
- Delivery incentive can be calculated.

## 10. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| LOG-001 | Admin can create shipment from order/batch | P0 |
| LOG-002 | Admin can assign KopKurir | P0 |
| LOG-003 | Driver can accept/reject task | P0 |
| LOG-004 | Driver can record proof of pickup | P0 |
| LOG-005 | Driver can record proof of delivery | P0 |
| LOG-006 | System supports delivery to user/RT/warung | P0 |
| LOG-007 | Failed delivery reason must be recorded | P0 |
| LOG-008 | COD amount can be recorded | P1 |
| LOG-009 | Driver settlement can be generated | P1 |
| LOG-010 | Admin can input external provider/tracking | P1 |
| LOG-011 | Provider abstraction supports future API integration | P2 |

## 11. API draft

```http
POST /admin/shipments
GET /admin/shipments
POST /admin/shipments/{shipmentId}/assign-driver
POST /admin/shipments/{shipmentId}/external-provider
GET /driver/tasks
POST /driver/tasks/{taskId}/accept
POST /driver/tasks/{taskId}/reject
POST /driver/tasks/{taskId}/proof-pickup
POST /driver/tasks/{taskId}/proof-delivery
POST /driver/tasks/{taskId}/failed
GET /admin/driver-settlements
POST /admin/driver-settlements/{settlementId}/confirm
```

## 12. Data model

```text
DriverProfile
Shipment
ShipmentPackage
DeliveryTask
ProofOfPickup
ProofOfDelivery
DeliveryAttempt
CODCollection
DriverSettlement
ExternalLogisticsProvider
ExternalTrackingRecord
```

## 13. External logistics integration strategy

MVP should implement provider abstraction first:

```text
LogisticsProviderInterface
- quoteDelivery()
- createShipment()
- cancelShipment()
- getTrackingStatus()
- handleWebhook()
```

Provider options:

- `KOPKURIR_INTERNAL`
- `MANUAL_EXTERNAL`
- `GOSEND_PARTNER`
- `GRABEXPRESS_PARTNER`
- `JNE_PARTNER`
- `JNT_PARTNER`
- `SHOPEE_EXPRESS_PARTNER`
- `AGGREGATOR_PARTNER`

Important: real API access depends on partnership and provider availability. MVP should not assume all APIs are available.

## 14. Settlement and audit

Driver settlement must include:

- driver ID,
- shipment IDs,
- COD amount collected,
- delivery fee,
- incentive,
- deposit proof,
- pending amount,
- settlement status.

## 15. KPI

- Delivery success rate.
- Average delivery time.
- Cost per delivery.
- Failed delivery rate.
- COD settlement timeliness.
- KopKurir active jobs.
- Local driver income generated.
- RT batch delivery cost saved.

## 16. MVP acceptance checklist

- Admin can create shipment.
- Admin can assign local driver.
- Driver can update pickup and delivery status.
- Proof of delivery is recorded.
- Failed delivery can be handled.
- External provider can be recorded manually.


---

<!-- Source: 10_Misi_Gotong_Royong_PRD.md -->

# PRD — Misi Gotong Royong

## 1. Objective

Create a gamified engagement layer that increases cooperative transactions, repeat orders, local product absorption, referral activation, social participation, and national-value campaigns.

## 2. Product positioning

**Misi Gotong Royong** is not generic gaming. It is a mission system based on:

- gotong royong,
- cinta produk lokal,
- kemandirian ekonomi,
- kepedulian sosial,
- literasi koperasi,
- event nasional/kenegaraan,
- community participation.

## 3. Target users

- Warga digital.
- Warga using Kartu Kopdes.
- RT/kader.
- Petugas Layanan.
- Mitra Warung.
- Admin koperasi.
- Pemdes/auditor.

## 4. Mission categories

| Category | Purpose | Example |
|---|---|---|
| Transaction | Increase GMV/repeat order | Belanja 3x bulan ini |
| Local Product | Absorb village products | Beli 2 produk UMKM desa |
| Referral | Acquire active buyers | Ajak 1 tetangga transaksi pertama |
| Social | Encourage solidarity | Donasi poin untuk sembako warga rentan |
| Education | Improve literacy | Baca materi koperasi + quiz |
| National Event | Tie engagement to national values | Misi Merdeka Belanja Lokal |
| Community | Activate RT/warung | RT paling aktif batch order |
| Environment | Support sustainability | Setor bank sampah dapat poin |

## 5. Example campaigns

### 5.1 Misi Merdeka Belanja Lokal — August

- Buy 2 local products.
- Join 1 RT Group Order.
- Invite 1 citizen to first transaction.
- Donate 50 points for subsidized sembako.

Rewards:

- 2x points for local products.
- Badge “Warga Merdeka Belanja Lokal”.
- RT community leaderboard.

### 5.2 Hari Koperasi

- Complete first cooperative purchase.
- Read short cooperative literacy material.
- Buy a product from Titip Jual Warga.
- Invite one active buyer.

Rewards:

- Points.
- Voucher Paket Hemat.
- Badge “Sahabat Koperasi”.

### 5.3 Sumpah Pemuda

- Youth helps photo 3 UMKM products.
- Youth helps one elderly citizen order.
- Youth shares cooperative catalog.

Rewards:

- Badge “Pemuda Penggerak Koperasi”.
- Contribution points.
- Digital certificate.

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Mission List | User sees active missions | P0 |
| Mission Detail | Requirement, period, reward | P0 |
| Mission Progress | Track completion | P0 |
| Auto Validation | Validate from order/events | P0 |
| Manual Validation | Admin validates offline missions | P1 |
| Reward Engine | Points/voucher/badge/free delivery | P0 |
| Badge System | Social recognition | P1 |
| Event Campaign | National/local campaign template | P1 |
| RT Leaderboard | Community-level leaderboard | P1 |
| Warung Mission | B2B partner mission | P1 |
| Budget Cap | Limit reward cost | P0 |
| Anti-Abuse Rule | Prevent fraud farming | P0 |
| Audit Log | Track mission reward | P0 |

## 7. User stories

### US-MISSION-001 — Complete transaction mission

As a citizen, I want to complete a buying mission so I get points and feel motivated to shop again at the cooperative.

**Acceptance criteria**

- User can view active missions.
- User sees mission requirement and reward.
- Progress updates only after completed order.
- Reward is issued after mission complete.
- Reward appears in points history.

### US-MISSION-002 — Non-digital mission participation

As a citizen without smartphone, I want my assisted/card purchase to count toward missions so I receive the same benefit as app users.

**Acceptance criteria**

- Card/assisted orders trigger mission progress.
- Receipt shows mission progress/reward when possible.
- Petugas can explain eligible missions.
- Reward goes to citizen account.

### US-MISSION-003 — Admin creates national event campaign

As admin, I want to create a mission for Hari Koperasi/17 Agustus so citizens engage with cooperative and local products.

**Acceptance criteria**

- Admin can create mission title, period, category.
- Admin can set trigger event and condition.
- Admin can set reward and budget cap.
- Admin can activate/end mission.
- Analytics show mission performance.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| MIS-001 | Admin can create mission | P0 |
| MIS-002 | Mission can have period and status | P0 |
| MIS-003 | Mission can target USER/RT/WARUNG | P0 |
| MIS-004 | Mission rule can be event-based | P0 |
| MIS-005 | Mission progress updates from events | P0 |
| MIS-006 | Reward issued after completion | P0 |
| MIS-007 | Reward budget cap enforced | P0 |
| MIS-008 | Mission supports manual validation | P1 |
| MIS-009 | Mission supports badge | P1 |
| MIS-010 | Mission supports leaderboard | P1 |
| MIS-011 | Fraud/reversal handled | P0 |

## 9. API draft

```http
GET /missions
GET /missions/{missionId}
GET /me/missions
GET /me/badges
POST /admin/missions
PATCH /admin/missions/{missionId}
POST /admin/missions/{missionId}/activate
POST /admin/missions/{missionId}/end
GET /admin/missions/{missionId}/analytics
POST /missions/{missionId}/manual-validate
POST /missions/events/ingest
```

## 10. Data model

```text
Mission
MissionRule
MissionProgress
MissionReward
MissionBudget
UserBadge
CommunityLeaderboard
MissionAuditLog
```

## 11. Mission event triggers

| Event | Example condition |
|---|---|
| ORDER_COMPLETED | minOrderValue >= 25000 |
| LOCAL_PRODUCT_PURCHASED | localProductQty >= 2 |
| RT_BATCH_JOINED | batch completed |
| REFERRAL_FIRST_ORDER | invitee first valid order |
| POINTS_DONATED | donatedPoints >= 50 |
| PAPER_ORDER_COMPLETED | source = PAPER_FORM |
| VOICE_ORDER_COMPLETED | source = VOICE_NOTE |
| WARUNG_B2B_ORDER | warung order >= min amount |
| KOPTASK_COMPLETED | task approved by admin |

## 12. Anti-abuse rules

| Risk | Mitigation |
|---|---|
| Fake order for points | Reward only after paid + completed |
| Cancel after reward | Reverse reward |
| Referral farming | Min order value, phone/device check, limit per month |
| Staff manipulation | Citizen PIN/OTP/signature and audit log |
| Budget overspend | Budget cap and max claim per user |
| Leaderboard unhealthy | Use RT/community leaderboard, not individual spending rank |

## 13. KPI

- Mission participation rate.
- Mission completion rate.
- Incremental GMV from mission.
- Local product GMV uplift.
- Referral first-order conversion.
- Points redemption to purchase rate.
- Social donation points.
- RT/community engagement.

## 14. MVP acceptance checklist

- Admin can create mission.
- User can view mission.
- Completed order updates mission progress.
- Reward is issued with budget cap.
- Assisted/card orders also count.


---

<!-- Source: 11_Financial_Audit_Impact_Dashboard_PRD.md -->

# PRD — Financial, Audit & Impact Dashboard

## 1. Objective

Give koperasi and program stakeholders a clear, auditable dashboard for business volume, profit/loss, cashflow, inventory, settlement, rewards, logistics, and social-economic impact.

## 2. Why this module matters

KopMart RT should not only generate orders. It must help koperasi answer:

- Are we increasing GMV?
- Are we profitable or losing money?
- Is cash stuck with RT, driver, warung, or COD?
- How much reward liability do we have?
- Which products have margin?
- Which RT/warung/channel drives volume?
- Are non-digital citizens being included?
- Are local products being absorbed?

## 3. Target users

- Admin koperasi.
- Treasurer/finance staff.
- Cooperative manager.
- Auditor/pemdes.
- Program owner/super admin.

## 4. Dashboard modules

| Module | Purpose | Priority |
|---|---|---|
| GMV Dashboard | Volume usaha | P0 |
| Order Dashboard | Order status and channel | P0 |
| Profit/Loss | Revenue, margin, cost, net profit | P1 |
| Cashflow | Cash in/out and pending settlement | P1 |
| RT Settlement | Cash and batch settlement | P0 |
| Driver Settlement | COD/delivery fee settlement | P1 |
| Warung Settlement | B2B invoice and payment | P1 |
| Points Liability | Outstanding points/voucher cost | P1 |
| Inventory Value | Stock and locked value | P1 |
| Mission Cost | Reward budget and campaign ROI | P1 |
| Impact Dashboard | Local products, non-digital users, jobs | P1 |
| Audit Log | Traceability | P0 |

## 5. Core financial formulas

```text
GMV = Sum(completed order total before refund)
Gross Profit = Sum((sellingPrice - costPrice) * quantity)
AOV = GMV / completed order count
Reward Cost = redeemed points value + voucher subsidy
RT Incentive = configured RT incentive per completed batch/order
Delivery Cost = courier fee + subsidy
Net Profit = Gross Profit + service fees - reward cost - incentive - delivery subsidy - OPEX allocation
Pending Settlement = cash collected but not deposited/confirmed
Points Liability = outstanding points * estimated redemption value
Inventory Locked Value = current stock quantity * cost price
```

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| GMV by Channel | Self, RT, Petugas, Warung, Paper, Voice, Kiosk | P0 |
| P&L Summary | Revenue, COGS, gross profit, costs | P1 |
| Cashflow Summary | Cash in/out and pending settlement | P1 |
| Settlement Tracker | RT, driver, warung, COD | P0 |
| Product Margin | Margin per SKU/category | P1 |
| Channel Performance | Which channel drives volume | P0 |
| Reward Liability | Points/voucher outstanding | P1 |
| Mission ROI | GMV uplift vs reward cost | P1 |
| Audit Log Search | Search by user/order/action | P0 |
| Export CSV/PDF | Report export | P1 |

## 7. User stories

### US-FIN-001 — GMV dashboard

As admin koperasi, I want to see GMV by channel so I know which channels increase cooperative business volume.

**Acceptance criteria**

- Dashboard shows total GMV for selected period.
- GMV can be filtered by channel.
- Dashboard shows order count and AOV.
- Cancelled/refunded orders are excluded or shown separately.

### US-FIN-002 — Settlement tracking

As finance staff, I want to track pending cash settlement so cashflow is controlled.

**Acceptance criteria**

- System shows pending settlement by RT/driver/warung.
- Settlement has due date and status.
- Staff can confirm deposit with proof.
- Overdue settlement is highlighted.

### US-FIN-003 — Audit log

As auditor, I want to inspect important actions so misuse can be detected.

**Acceptance criteria**

- Audit log includes actor, action, object, timestamp.
- Audit log stores before/after values for critical updates.
- Audit log can be filtered by date, actor, action, order.
- Audit log cannot be edited by regular admin.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FIN-001 | Dashboard shows GMV/order/AOV | P0 |
| FIN-002 | Dashboard filters by channel/date/RT/warung | P0 |
| FIN-003 | Settlement tracker supports RT cash | P0 |
| FIN-004 | Settlement tracker supports driver COD | P1 |
| FIN-005 | Settlement tracker supports warung invoice | P1 |
| FIN-006 | P&L summary calculates gross profit | P1 |
| FIN-007 | Cashflow summary shows pending/confirmed cash | P1 |
| FIN-008 | Points liability calculated | P1 |
| FIN-009 | Mission reward cost tracked | P1 |
| FIN-010 | Audit log records critical actions | P0 |
| FIN-011 | Reports can be exported | P1 |

## 9. API draft

```http
GET /admin/dashboard/gmv
GET /admin/dashboard/orders
GET /admin/dashboard/channels
GET /admin/dashboard/profit-loss
GET /admin/dashboard/cashflow
GET /admin/dashboard/inventory-value
GET /admin/dashboard/points-liability
GET /admin/dashboard/impact
GET /admin/settlements/rt
GET /admin/settlements/drivers
GET /admin/settlements/warungs
POST /admin/settlements/{settlementId}/confirm
GET /admin/audit-logs
GET /admin/reports/export
```

## 10. Data model

```text
FinancialSnapshot
ChannelMetric
Settlement
SettlementItem
CashMovement
PointsLiabilitySnapshot
InventoryValuation
MissionCostSnapshot
AuditLog
ImpactMetric
```

## 11. Audit actions

| Action | Must audit |
|---|---|
| Product price change | actor, old price, new price |
| Stock adjustment | actor, old stock, new stock, reason |
| Order creation/edit/cancel | actor, source, order state |
| Points issue/redeem/reverse | rule, amount, source order |
| Mission reward | mission, reward, budget |
| Cash settlement | payer, amount, proof, confirmer |
| Driver delivery proof | driver, timestamp, proof |
| Card scan and assisted order | staff/RT, citizen, order ID |
| Warung invoice/payment | warung, amount, status |

## 12. Impact metrics

| Metric | Why it matters |
|---|---|
| Active non-digital citizens | Inclusion |
| Assisted order count | Digital intermediary impact |
| Local SKU GMV | Village product absorption |
| Active warung partners | Local retail preservation |
| KopKurir active jobs | Local job creation |
| RT active batch count | Community participation |
| Paper/voice/kiosk orders | Accessibility |
| Social donation points | Gotong royong impact |

## 13. MVP acceptance checklist

- Admin can see GMV and order count.
- Admin can filter by channel.
- RT settlement can be tracked.
- Audit log records key actions.
- Export basic report works.


---

<!-- Source: 12_Shared_Data_Model_API_Contracts.md -->

# Shared Data Model & API Contracts

## 1. Purpose

This document defines shared entities, statuses, permissions, and cross-module rules for all KopMart RT PRDs.

## 2. Shared roles

| Role | Description |
|---|---|
| USER | Citizen/warga |
| RT_AGENT | RT/kader who manages group order |
| SERVICE_STAFF | Petugas Layanan KopMart |
| WARUNG_PARTNER | Mitra Warung owner/operator |
| DRIVER | KopKurir/local courier |
| ADMIN_KOPERASI | Cooperative admin |
| FINANCE_ADMIN | Cooperative finance/treasurer |
| AUDITOR | Read-only audit/report user |
| SUPER_ADMIN | Program/national admin |

## 3. Shared channels

| Channel | Description |
|---|---|
| SELF_ORDER | User app/PWA order |
| CARD_PURCHASE | Kartu Kopdes assisted purchase |
| RT_ASSISTED | RT creates order for citizen |
| SERVICE_STAFF | Petugas Layanan creates order |
| WARUNG_B2B | Warung buys stock from cooperative |
| WARUNG_PICKUP | Citizen pickup at warung |
| PAPER_FORM | Paper catalog/order form |
| VOICE_NOTE | WhatsApp/phone voice order |
| KIOSK | Kiosk mode order |

## 4. Shared order statuses

| Status | Description |
|---|---|
| Draft | Not submitted yet |
| Pending Confirmation | Awaiting citizen confirmation |
| Pending Payment | Created but unpaid |
| Paid | Payment received |
| Confirmed | Accepted by cooperative |
| Packing | Being packed |
| Ready for Pickup | Ready at cooperative |
| Ready for Delivery | Ready for courier |
| In Delivery | In transit |
| Delivered to RT | Batch delivered to RT |
| Delivered to Warung | Package delivered to warung |
| Ready for Citizen Pickup | Waiting citizen pickup |
| Picked Up | Citizen picked up |
| Completed | Completed successfully |
| Cancelled | Cancelled |
| Refunded | Refunded |

## 5. Payment statuses

| Status | Description |
|---|---|
| Unpaid | No payment yet |
| Waiting Verification | Proof/payment being checked |
| Paid | Fully paid |
| Partially Paid | Partial payment |
| Failed | Payment failed |
| Refunded | Payment refunded |
| Settled | Cash/COD settled to cooperative |

## 6. Shipment statuses

| Status | Description |
|---|---|
| Pending Assignment | Need driver/provider |
| Assigned | Assigned to driver/provider |
| Accepted | Driver accepted task |
| Picked Up | Package picked up |
| In Transit | On delivery |
| Delivered | Delivered |
| Failed Delivery | Failed delivery attempt |
| Returned | Returned to cooperative |
| Cancelled | Cancelled |

## 7. Points statuses

| Status | Description |
|---|---|
| Pending | Waiting valid order/action |
| Earned | Points credited |
| Redeemed | Points used |
| Expired | Points expired |
| Reversed | Points reversed due to cancel/refund/fraud |

## 8. Core entities

```text
Tenant/Cooperative
User
Role
MemberProfile
KopdesCard
RT
ServicePoint
WarungPartner
Product
ProductCategory
Inventory
Cart
Order
OrderItem
Payment
RTBatch
Shipment
DriverProfile
PointWallet
PointTransaction
Referral
Voucher
Mission
MissionProgress
PaperOrderForm
VoiceOrderTicket
KioskSession
Settlement
AuditLog
FinancialSnapshot
ImpactMetric
```

## 9. Key entity samples

### User

```json
{
  "id": "uuid",
  "cooperativeId": "uuid",
  "name": "string",
  "phone": "string",
  "role": "USER",
  "memberId": "string",
  "nikMasked": "string|null",
  "rtId": "uuid|null",
  "status": "ACTIVE | SUSPENDED"
}
```

### Order

```json
{
  "id": "uuid",
  "cooperativeId": "uuid",
  "userId": "uuid|null",
  "channel": "SELF_ORDER | CARD_PURCHASE | RT_ASSISTED | SERVICE_STAFF | WARUNG_B2B | PAPER_FORM | VOICE_NOTE | KIOSK",
  "assistedByUserId": "uuid|null",
  "rtBatchId": "uuid|null",
  "warungId": "uuid|null",
  "subtotal": 75000,
  "discount": 5000,
  "deliveryFee": 2000,
  "total": 72000,
  "paymentStatus": "UNPAID | PAID | SETTLED",
  "orderStatus": "PENDING_PAYMENT | CONFIRMED | PACKING | COMPLETED",
  "createdAt": "datetime"
}
```

### AuditLog

```json
{
  "id": "uuid",
  "cooperativeId": "uuid",
  "actorId": "uuid",
  "actorRole": "SERVICE_STAFF",
  "action": "CREATE_ASSISTED_ORDER",
  "objectType": "ORDER",
  "objectId": "uuid",
  "before": {},
  "after": {},
  "metadata": {
    "channel": "CARD_PURCHASE",
    "deviceId": "string",
    "location": "string"
  },
  "createdAt": "datetime"
}
```

## 10. Permission matrix

| Feature | User | RT | Petugas | Warung | Driver | Admin | Finance | Auditor |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Browse catalog | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Self-order | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Assisted order | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Scan card | ❌ | ✅ | ✅ | Optional | ❌ | ✅ | ❌ | ❌ |
| Create RT batch | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Warung B2B order | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Driver task update | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Product management | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | View |
| Financial dashboard | ❌ | Limited | Limited | Own | Own | ✅ | ✅ | ✅ |
| Audit log | ❌ | Own | Own | Own | Own | ✅ | ✅ | ✅ |

## 11. Cross-module business rules

1. Order source channel must always be stored.
2. Assisted order must store actor ID and citizen confirmation method.
3. Points must only be issued after valid completed action.
4. Refund/cancellation must reverse points if already issued.
5. Mission progress should be event-driven, not manual by default.
6. Cash settlement must be separated by collector: RT, driver, warung, staff.
7. Product price snapshot must be stored in order item.
8. Inventory movement must be recorded for every stock change.
9. Audit log is append-only.
10. Sensitive citizen data must be masked based on role.

## 12. Shared API groups

```http
/auth/*
/me/*
/products/*
/cart/*
/orders/*
/cards/*
/assisted-orders/*
/rt/batches/*
/warung/*
/paper-orders/*
/voice-orders/*
/kiosk/*
/shipments/*
/driver/*
/points/*
/referrals/*
/missions/*
/admin/dashboard/*
/admin/settlements/*
/admin/audit-logs
```

## 13. Event bus / analytics event examples

```text
USER_REGISTERED
CARD_SCANNED
ORDER_CREATED
ORDER_CONFIRMED
ORDER_COMPLETED
ORDER_CANCELLED
POINTS_EARNED
POINTS_REDEEMED
MISSION_PROGRESS_UPDATED
MISSION_COMPLETED
RT_BATCH_SUBMITTED
SHIPMENT_DELIVERED
SETTLEMENT_CONFIRMED
STOCK_ADJUSTED
PRICE_CHANGED
```

## 14. Non-functional requirements

| Category | Requirement |
|---|---|
| Performance | Product list loads < 2 seconds on normal 4G |
| Offline | Petugas/RT can save draft offline for later sync |
| Security | RBAC, audit log, encrypted secrets |
| Privacy | No raw NIK in QR, no server-side biometric |
| Reliability | Idempotent order creation and payment callbacks |
| Scalability | Multi-tenant cooperative architecture |
| Accessibility | Large text and simple UI for assisted/kiosk mode |
| Observability | Logs, metrics, tracing for order/payment/settlement |
| Export | CSV/PDF for finance/audit reports |


---

<!-- Source: README_INDEX.md -->

# KopMart RT — Updated PRD Package v2.0

## Product positioning

**KopMart RT** is now positioned as an **Omni-channel Assisted Cooperative Marketplace** for KDKMP / koperasi desa.

The main idea is no longer limited to only “marketplace + RT agent”. The updated concept is:

> **Frontend boleh digital atau analog, tetapi backend transaksi koperasi harus digital, tercatat, bisa diaudit, dan bisa meningkatkan volume usaha koperasi.**

This means warga can access cooperative commerce through multiple channels:

1. **Self-order app** untuk warga digital.
2. **Kartu Kopdes QR** untuk warga tanpa smartphone.
3. **RT Group Order** untuk order kolektif berbasis komunitas.
4. **Petugas Layanan KopMart** untuk warga non-digital.
5. **Mitra Warung KopMart** untuk warga yang tetap belanja offline di warung.
6. **Paper-to-Digital Catalog** untuk warga yang terbiasa dengan katalog/formulir fisik.
7. **Voice-to-Digital Order** untuk warga yang bisa berbicara tetapi tidak nyaman mengetik.
8. **Kiosk Mode** untuk balai desa/koperasi/pos layanan yang sudah siap perangkat.
9. **Driver & Local Logistics** untuk pickup, delivery, kurir koperasi, dan integrasi opsional dengan provider logistik.
10. **Misi Gotong Royong** sebagai gamification and national-value engagement layer.
11. **Financial, Audit & Impact Dashboard** untuk GMV, profit/loss, cashflow, settlement, audit, dan dampak.

## Recommended development order

| Order | Module | Why first |
|---:|---|---|
| 1 | Shared Core Platform | Tenant, user, role, product, inventory, order, audit foundation |
| 2 | Self-order App | Main digital buying flow |
| 3 | Kartu Kopdes QR | Non-smartphone identity/access layer |
| 4 | Petugas Layanan KopMart | Assisted order without overloading RT |
| 5 | RT Group Order | Community batch order for higher volume and cheaper logistics |
| 6 | Admin Koperasi Dashboard | Product, stock, order, fulfillment, finance |
| 7 | Poin + Referral + Misi Gotong Royong | Retention and engagement layer |
| 8 | Mitra Warung KopMart | B2B2C local commerce channel |
| 9 | Paper-to-Digital Catalog | Low-tech fallback for offline users |
| 10 | Driver & Local Logistics | Delivery/pickup operation |
| 11 | Voice-to-Digital Order | Voice + operator validation |
| 12 | Kiosk Mode | Optional channel for locations with devices |
| 13 | AI Features | Demand forecast, package generation, fraud detection |

## Files included

| File | Description |
|---|---|
| `00_MASTER_PRD_KopMart_RT_v2.md` | Main updated PRD across the whole product |
| `01_Self_Order_App_PRD.md` | PRD for citizen digital marketplace app |
| `02_Kartu_Kopdes_QR_PRD.md` | PRD for QR card identity and purchase assistance |
| `03_RT_Group_Order_PRD.md` | PRD for RT/community batch order |
| `04_Petugas_Layanan_KopMart_PRD.md` | PRD for official assisted-commerce staff role |
| `05_Mitra_Warung_KopMart_PRD.md` | PRD for local warung as B2B2C hub |
| `06_Paper_to_Digital_Catalog_PRD.md` | PRD for physical catalog and paper order forms |
| `07_Voice_to_Digital_Order_PRD.md` | PRD for WhatsApp/voice order with operator validation |
| `08_Kiosk_Mode_PRD.md` | PRD for cooperative/balai desa kiosk mode |
| `09_Driver_Local_Logistics_PRD.md` | PRD for KopKurir and logistics integration |
| `10_Misi_Gotong_Royong_PRD.md` | PRD for gamified national-value missions |
| `11_Financial_Audit_Impact_Dashboard_PRD.md` | PRD for financial, audit, and impact reporting |
| `12_Shared_Data_Model_API_Contracts.md` | Shared entities, statuses, APIs, and permissions |
| `KopMart_RT_All_PRDs_Combined_v2.md` | Combined full Markdown document |

## Core product principle

> **KopMart RT tidak memaksa semua warga menjadi digital-native. KopMart RT membuat koperasi menjadi transaction-native: semua transaksi, stok, pembayaran, poin, pengiriman, dan laporan tercatat digital, meskipun warga masuk dari aplikasi, kartu, RT, warung, voice note, katalog kertas, kios, atau petugas layanan.**
