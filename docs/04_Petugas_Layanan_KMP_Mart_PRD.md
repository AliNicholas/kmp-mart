<!--
KMP Mart PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# PRD — Petugas Layanan KMP Mart

## 1. Objective

Create an official assisted-commerce role so non-digital citizens can transact without overloading RT and without forcing every citizen to use a smartphone.

## 2. Role definition

**Petugas Layanan KMP Mart** is a verified cooperative/community operator who helps citizens create orders, scan Kartu Kopdes, input paper forms, process voice notes, explain points, generate receipts, and record all actions digitally.

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

As a citizen without smartphone, I want to be assisted by Petugas Layanan KMP Mart to create an order so I can still buy from the cooperative and collect points.

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
