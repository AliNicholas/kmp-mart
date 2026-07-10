# PRD — Supplier & Procurement Network

## 1. Objective

Enable KDKMP to source goods transparently and efficiently from suppliers that may be companies, organizations, cooperatives, UMKM, producers, distributors, or individuals.

## 2. Problem

Without structured procurement, KDKMP may face:

- inconsistent supplier discovery,
- unclear price and MOQ comparison,
- unreliable lead time,
- undocumented purchase decisions,
- receiving discrepancies,
- uncontrolled supplier payable,
- inability to measure supplier performance,
- overstock/stockout because procurement is not linked to demand.

## 3. Product Scope

### P0

- Supplier registration and verification.
- Supplier product catalog.
- Direct purchase order.
- Basic RFQ to multiple suppliers.
- Quotation submission and comparison.
- Approval and PO issuance.
- Shipment notice and goods receipt.
- Discrepancy, return, invoice, payable.
- Basic supplier scorecard.

### P1

- Landed-cost comparison.
- Contract and price validity.
- Demand/reorder recommendation.
- Supplier capacity and service-area matching.
- Local supplier preference policy.

### P2

- Cross-KDKMP joint procurement.
- Reverse auction/bidding.
- AI-assisted supplier recommendation.
- Institutional buyers purchasing KDKMP/local products.

## 4. Supplier Types

| Type | Example |
|---|---|
| Company | FMCG manufacturer, distributor, wholesaler |
| Organization | Foundation, association, social enterprise |
| Cooperative | Producer or secondary cooperative |
| UMKM | Packaged food or household-product supplier |
| Producer | Farmer group, fisher group, artisan |
| Individual | Approved local producer or trader |

Verification requirements may differ by type and applicable policy.

## 5. Core Flows

### 5.1 Supplier onboarding

```text
Supplier application
→ Identity/legal/bank/document review
→ Service area and product capability
→ Approval/rejection
→ Catalog activation
```

### 5.2 RFQ and quotation

```text
KDKMP creates RFQ lines
→ Selects supplier pool
→ Suppliers submit price, MOQ, lead time, terms
→ System normalizes unit and landed cost
→ Procurement compares and records rationale
→ Approval
→ PO issued
```

### 5.3 Receiving

```text
Supplier sends shipment notice
→ Warehouse receives
→ Counts and inspects
→ Accepts / records discrepancy
→ Inventory batch created
→ Supplier invoice matched
→ Payable created
```

## 6. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| SUP-001 | Register supplier by type | P0 |
| SUP-002 | Verify documents and bank account | P0 |
| SUP-003 | Supplier manages product catalog | P0 |
| SUP-004 | Product unit/MOQ/lead time/service area | P0 |
| RFQ-001 | Create multi-line RFQ | P0 |
| RFQ-002 | Invite eligible suppliers | P0 |
| RFQ-003 | Supplier submits quotation | P0 |
| RFQ-004 | Normalize unit and compare price | P0 |
| RFQ-005 | Record award rationale and approval | P0 |
| PO-001 | Issue PO with immutable snapshot | P0 |
| PO-002 | Supplier acknowledges PO | P0 |
| GRN-001 | Record goods receipt by line | P0 |
| GRN-002 | Record short/damaged/expired item | P0 |
| FIN-001 | Match supplier invoice and payable | P0 |
| SCORE-001 | Calculate supplier performance | P1 |
| REC-001 | Suggest reorder from demand/stock | P1 |

## 7. Quotation Comparison

Comparison fields:

- unit price,
- normalized price per base unit,
- MOQ,
- available quantity,
- lead time,
- shipping cost,
- tax/discount,
- payment term,
- expiry/shelf-life requirement,
- supplier rating,
- local supplier indicator,
- total landed cost.

The system recommends but does not automatically award in MVP. Procurement officer remains accountable.

## 8. Supplier Scorecard

```text
On-Time Delivery Rate
Fill Rate
Discrepancy Rate
Return/Defect Rate
Price Competitiveness Index
Response Time
Invoice Accuracy
Local Supplier Contribution
```

Scores must be transparent, explainable, and reviewable.

## 9. APIs

```http
POST /suppliers/applications
PATCH /admin/suppliers/{id}/verify
GET  /suppliers/me/products
POST /suppliers/me/products
POST /procurement/rfqs
POST /procurement/rfqs/{id}/publish
POST /supplier/rfqs/{id}/quotations
GET  /procurement/rfqs/{id}/comparison
POST /procurement/rfqs/{id}/award
POST /procurement/purchase-orders
POST /supplier/purchase-orders/{id}/acknowledge
POST /purchase-orders/{id}/shipment-notices
POST /warehouse/goods-receipts
POST /goods-receipts/{id}/discrepancies
GET  /finance/supplier-payables
GET  /suppliers/{id}/scorecard
```

## 10. Risks and Controls

| Risk | Control |
|---|---|
| Collusion/favoritism | Multi-quote comparison, approval trail, award rationale |
| Fake supplier | Verification and bank/account checks |
| Price manipulation | Versioned quotations and immutable PO snapshot |
| Quantity/quality mismatch | Receiving inspection and evidence |
| Late delivery | SLA and scorecard |
| Overstock | Reorder based on stock and demand, approval required |
| Local supplier exclusion | Configurable local-supplier visibility/preference, not automatic award |

## 11. KPIs

- Active verified suppliers.
- RFQ response rate.
- Procurement cycle time.
- Price/landed-cost savings.
- Fill rate.
- On-time delivery.
- Discrepancy rate.
- Local supplier procurement share.
- Payable aging.

## 12. Definition of Done

A KDKMP can create a sourcing request, compare suppliers, issue an approved PO, receive goods, update inventory, create payable, and evaluate performance with a complete audit trail.
