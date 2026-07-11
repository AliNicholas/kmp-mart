<!--
KMP Mart PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# PRD — Financial, Audit & Impact Dashboard

## 1. Objective

Give koperasi and program stakeholders a clear, auditable dashboard for business volume, profit/loss, cashflow, inventory, settlement, rewards, logistics, and social-economic impact.

## 2. Why this module matters

KMP Mart should not only generate orders. It must help koperasi answer:

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
