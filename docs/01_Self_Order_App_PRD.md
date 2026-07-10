<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

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
