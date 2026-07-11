# PRD — Mitra Agen & Warung KMP Mart v4.0

## 1. Objective

Turn existing warungs, local agents, KDKMP outlets, and approved community retailers into a distributed sales network rather than competitors of KDKMP.

## 2. Agent Types

```text
WARUNG_RESELLER
KDKMP_OUTLET
COMMUNITY_AGENT
BUMDES_OUTLET
INSTITUTIONAL_AGENT
```

## 3. Core Value Proposition

| Stakeholder | Value |
|---|---|
| KDKMP | Higher B2B volume and wider distribution |
| Agent/warung | Access to partner prices, reliable stock, delivery, and reorder history |
| Citizen | Familiar purchase location near home, no app required |
| Supplier | Consolidated route to local retail network |

## 4. Main B2B Flow

```text
Agent approved
→ Views partner catalog and price
→ Creates order or reorders history
→ KDKMP confirms/reserves stock
→ Invoice generated
→ Pickup or delivery
→ Agent confirms goods receipt
→ Payment/receivable settles
→ Sales and requests inform reorder planning
```

## 5. Key Features

| Feature | Description | Priority |
|---|---|---|
| Agent Onboarding | Identity, location, type, approval | P0 |
| Partner Price List | Price tier, MOQ, effective dates | P0 |
| B2B Order | New order and reorder | P0 |
| Inventory Reservation | Prevent overselling | P0 |
| Invoice & Payment | Cash/transfer/QRIS/term | P0 |
| Pickup/Delivery | KDKMP pickup or courier | P0 |
| Goods Receipt | Quantity/condition acceptance | P0 |
| Discrepancy/Return | Short/damaged/wrong item | P1 |
| Receivable Control | Limit, aging, suspension | P1 |
| Product Request | Agent reports citizen demand | P0 |
| Optional Member Scan | Member benefit at agent | P1 |
| Agent Incentive | Margin, points, target bonus | P1 |
| Agent Analytics | Reorder, sell-through proxy, requests | P1 |

## 6. Agent Purchase User Story

**As a local warung, I want to reorder essential stock from KDKMP at partner prices so I can serve citizens and maintain my margin.**

Acceptance criteria:

- Agent sees only active products and valid partner prices.
- MOQ and available stock are visible.
- Current price is revalidated at submit.
- Order creates inventory reservation.
- Invoice and fulfillment method are generated.
- Agent can confirm receipt and report discrepancy.
- Receivable is tracked when terms are allowed.

## 7. Citizen Purchase at Agent

Citizen interaction remains familiar:

1. Citizen verbally requests products.
2. Agent selects/scans products in a lightweight sale screen only if digital recording is enabled.
3. Agent can optionally scan Kartu Kopdes for member benefits.
4. Citizen pays and receives goods.
5. Agent can record unavailable-item request.

The platform does **not** require the citizen to join a batch or wait for a group-order deadline.

## 8. Financial Rules

- Wholesale revenue and COGS stored separately.
- Price/cost snapshot stored per order item.
- Credit limit is rule-based in MVP.
- Overdue receivable can suspend new term orders.
- Return or shortage creates credit note or invoice adjustment.
- Agent incentive must be margin-aware and budget-capped.

## 9. API Draft

```http
POST /admin/agents
PATCH /admin/agents/{id}/approve
PATCH /admin/agents/{id}/suspend
GET  /agent/catalog
POST /agent/orders
POST /agent/orders/{id}/submit
POST /agent/orders/{id}/reorder
POST /agent/orders/{id}/goods-receipts
POST /agent/orders/{id}/discrepancies
GET  /agent/invoices
GET  /agent/receivables
POST /agent/product-requests
POST /agent/member-sales
```

## 10. KPIs

- Active agents.
- B2B GMV.
- Average B2B order value.
- Reorder rate.
- Fill rate.
- Agent retention.
- Receivable aging/default.
- Product request volume.
- Local-product share.

## 11. Definition of Done

An approved agent can order stock through receipt and settlement, while KDKMP inventory, revenue, margin, receivable, shipment, and audit records remain consistent.
