<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

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
