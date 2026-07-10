<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

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
