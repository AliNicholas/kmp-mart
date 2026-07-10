# PRD — Buyer Access, Convenience & Engagement

## 1. Objective

Make KDKMP easy and attractive for village citizens without requiring a self-order app or group-order coordination.

## 2. Experience Promise

# **Sebut. Scan. Selesai.**

1. **Sebut** kebutuhan kepada Petugas Layanan or nearest Agent/Warung.
2. **Scan** Kartu Kopdes or search phone/member ID to access member benefit.
3. **Selesai** after payment: take goods immediately or select local delivery.

## 3. Target Frictions

| Friction | Product response |
|---|---|
| Citizen does not understand app navigation | Operator handles product search and checkout |
| Citizen has no smartphone/data | Card/member ID works without citizen device |
| Group order requires waiting | Immediate purchase from available stock |
| Desired product is unavailable | KopRequest captures demand and notifies when available |
| Too many product choices | KopPaket Hemat offers clear bundles |
| Repeat staples are tedious | Optional KopPaket Rutin |
| Citizen does not see membership benefit | Member price, savings, points shown on receipt |
| Distance to KDKMP | Buy at agent or choose KopKurir delivery |

## 4. Core Buyer Hooks

### 4.1 Harga Anggota

- Clearly displayed member and regular price where policy allows.
- Savings printed on receipt.
- Must remain financially sustainable and compliant with cooperative policy.

### 4.2 KopPoin

- Issued after completed valid transaction.
- Redeemed with maximum transaction percentage and budget limit.
- Not cash and not transferable unless policy explicitly allows.

### 4.3 KopPaket Hemat

Predefined bundles such as:

- Paket Dapur Mingguan,
- Paket Anak Sekolah,
- Paket Lansia,
- Paket Produk Lokal,
- Paket Hari Besar.

Bundles reduce decision complexity and can improve inventory rotation.

### 4.4 KopPaket Rutin

Optional recurring essentials enrollment assisted by staff/agent:

- weekly/monthly schedule,
- reminder before preparation,
- citizen confirms, skips, or changes through staff/agent/approved message link,
- no automatic charge in MVP,
- inventory is reserved only after confirmation.

### 4.5 KopRequest

When item is unavailable, citizen can request it verbally. Staff/agent records request quickly. Aggregated demand informs procurement.

### 4.6 Ambil atau Antar

- Immediate pickup when stock is available.
- Pickup at KDKMP or agent.
- Local KopKurir delivery.
- External courier fallback where serviceable.

### 4.7 Struk Transparan

Receipt includes:

- item and quantity,
- regular/member price,
- discount,
- points earned/redeemed,
- delivery fee,
- total,
- operator/service point,
- transaction reference.

## 5. Buyer User Stories

### US-BUY-001 — Simple assisted purchase

**As a citizen, I want to tell the operator what I need and complete the purchase without navigating an app.**

Acceptance criteria:

- Common products can be found in under three interactions.
- Stock and price are clear.
- Member benefit is applied after card/member lookup.
- Final amount is confirmed before payment.
- Citizen receives goods or delivery reference and receipt.

### US-BUY-002 — Request unavailable product

- Staff/agent records request in under 30 seconds.
- Request can use existing SKU or free-text category.
- Contact/notification consent is optional.
- Procurement sees aggregated demand.
- Status can become available/notified/closed.

### US-BUY-003 — Repeat essential package

- Staff can enroll member into a package schedule.
- Member receives reminder.
- No order/payment occurs without confirmation.
- Member can skip or cancel.
- System records repeat and churn metrics.

## 6. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| BUY-001 | Assisted verbal-to-cart flow | P0 |
| BUY-002 | Card/member lookup | P0 |
| BUY-003 | Member price and savings | P0 |
| BUY-004 | Immediate stock validation | P0 |
| BUY-005 | Product request capture | P0 |
| BUY-006 | Pickup/delivery selection | P0 |
| BUY-007 | Print/digital receipt | P0 |
| BUY-008 | Basic points earn/redeem | P0/P1 |
| BUY-009 | Bundle catalog | P1 |
| BUY-010 | Recurring package enrollment | P1 |
| BUY-011 | Notification when available | P1 |
| BUY-012 | Mission eligibility | P1 |

## 7. Analytics Events

```text
MEMBER_IDENTIFIED
ASSISTED_CHECKOUT_STARTED
MEMBER_PRICE_APPLIED
PRODUCT_REQUEST_RECORDED
BUNDLE_PURCHASED
RECURRING_PACKAGE_ENROLLED
RECURRING_PACKAGE_CONFIRMED
RECURRING_PACKAGE_SKIPPED
PICKUP_SELECTED
DELIVERY_SELECTED
SALE_COMPLETED
```

## 8. KPIs

- Median transaction time.
- Member identification rate.
- Repeat purchase rate.
- Member price usage.
- Bundle conversion.
- Recurring package confirmation/skip/churn.
- Product request-to-stock conversion.
- Pickup vs delivery mix.
- Citizen complaint/refund rate.

## 9. Why This Is Easier Than Group Order

- No need to understand batch, deadline, minimum participants, or shared distribution.
- Citizen can buy when needed.
- Existing agents/warungs remain the interaction point.
- KDKMP still captures demand digitally through sales and product requests.
- Procurement can aggregate demand internally without exposing complexity to citizens.

## 10. Definition of Done

A citizen can purchase or request a product through a familiar local operator with transparent benefits, minimal steps, immediate confirmation, and consistent digital records behind the scenes.
