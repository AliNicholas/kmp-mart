<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# PRD — Paper-to-Digital Catalog

## 1. Objective

Serve citizens who are comfortable with physical catalog/forms by converting paper orders into digital cooperative transactions.

## 2. Product principle

Paper is the access layer; digital system is the source of truth.

## 3. Target users

- Lansia.
- Warga without smartphone.
- Areas with poor internet.
- Pos RT, warung, posyandu, balai desa.
- Petugas Layanan who processes forms.

## 4. Scope

### In scope

- Generate printable catalog.
- Generate product codes.
- Generate paper order form template.
- Dropbox collection workflow.
- Petugas input form into system.
- Optional photo attachment of paper form.
- Confirmation before fulfillment.
- Audit log.

### Out of scope for MVP

- Full OCR automation.
- Postal-like tracking for forms.
- Complex offline inventory sync.

## 5. Flow

```text
Admin selects products for weekly catalog
→ System generates PDF catalog and order form
→ Catalog is printed and distributed
→ Citizen fills form with member ID/product code/quantity
→ Form submitted to dropbox/RT/warung
→ Petugas collects and inputs form
→ System validates product code and stock
→ Order confirmation is performed
→ Order becomes digital and enters fulfillment
```

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Catalog Generator | Printable product list | P0 |
| Product Short Code | Easy numeric/alphanumeric code | P0 |
| Order Form Template | Printable form | P0 |
| Dropbox Location | Track pickup/source location | P1 |
| Paper Form Input | Petugas inputs order | P0 |
| Form Photo Attachment | Attach proof image | P1 |
| Pending Confirmation | Order waits for citizen confirmation if needed | P0 |
| Batch Import | Input multiple forms quickly | P1 |
| Audit Log | Trace form-to-order conversion | P0 |

## 7. User stories

### US-PAPER-001 — Print catalog

As admin koperasi, I want to print a weekly catalog so citizens without smartphones can see available products.

**Acceptance criteria**

- Admin can select products to include.
- System generates PDF catalog.
- Each product has short code, name, price, unit, and optional photo.
- Catalog shows valid period and order deadline.

### US-PAPER-002 — Input paper order

As Petugas, I want to input paper forms so citizens can order without using app.

**Acceptance criteria**

- Petugas can choose source `PAPER_FORM`.
- Petugas can input member ID/name/RT.
- Petugas can input product codes and quantities.
- System validates codes and calculates total.
- Order is created as pending/confirmed based on policy.
- Form photo can be attached.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| PAPER-001 | Admin can generate printable catalog | P0 |
| PAPER-002 | Products have short order code | P0 |
| PAPER-003 | Admin can generate order form template | P0 |
| PAPER-004 | Petugas can input paper order | P0 |
| PAPER-005 | System validates product code | P0 |
| PAPER-006 | System validates stock at input time | P0 |
| PAPER-007 | Order stores source location/dropbox | P1 |
| PAPER-008 | Petugas can attach form photo | P1 |
| PAPER-009 | All paper input actions are audited | P0 |

## 9. API draft

```http
POST /admin/catalogs/printable
GET /admin/catalogs/{catalogId}/pdf
POST /admin/paper-forms/template
POST /paper-orders/preview
POST /paper-orders
POST /paper-orders/{paperOrderId}/attach-photo
POST /paper-orders/{paperOrderId}/confirm
GET /admin/paper-orders
```

## 10. Data model

```text
PrintableCatalog
CatalogProduct
ProductShortCode
PaperOrderForm
PaperOrderItem
DropboxLocation
PaperOrderAttachment
```

## 11. Edge cases

| Case | Expected behavior |
|---|---|
| Product code invalid | Petugas gets validation error |
| Price changed after catalog printed | Order uses catalog price until valid period ends or shows warning |
| Stock unavailable | Petugas can propose substitute or mark pending |
| Member ID missing | Petugas can search and attach after verification |
| Handwriting unclear | Mark as needs confirmation |

## 12. KPI

- Paper catalogs distributed.
- Paper orders converted.
- Input error rate.
- Time from form collection to digital order.
- Non-digital citizens served.
- GMV from paper channel.

## 13. MVP acceptance checklist

- Admin can generate catalog.
- Products have short codes.
- Petugas can input paper form.
- Order source is recorded as paper.
- Digital order enters normal fulfillment.
