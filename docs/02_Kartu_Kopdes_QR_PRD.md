<!--
KMP Mart PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# PRD — Kartu Kopdes QR

## 1. Objective

Enable citizens without smartphones to transact in KMP Mart using a physical or printable QR card, while orders, points, missions, and audit records remain digital.

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
