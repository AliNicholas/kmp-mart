<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

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
