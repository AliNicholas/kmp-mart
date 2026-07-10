<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# PRD — RT Group Order

## 1. Objective

Enable community-based collective orders so small individual demand becomes larger cooperative transaction volume, delivery becomes cheaper, and non-digital citizens can participate through RT/Petugas assistance.

## 2. Target users

- Ketua RT / kader.
- Petugas Layanan KopMart.
- Warga digital joining RT batch.
- Warga non-digital assisted by RT/Petugas.
- Admin koperasi.
- Driver/KopKurir.

## 3. Scope

### In scope

- RT creates batch order.
- Batch has deadline and pickup point.
- User can join batch from app.
- RT/Petugas can add assisted orders.
- Admin receives consolidated batch.
- Packing list per citizen.
- Delivery to RT point.
- Pickup confirmation per citizen.
- Points, missions, RT incentive, and settlement.

### Out of scope for MVP

- Dynamic routing optimization.
- Multi-RT route batching.
- Automated demand forecast.

## 4. Batch flow

```text
RT creates batch
→ Batch status Open
→ Users join / RT assists orders
→ Deadline reached or RT locks batch
→ Batch submitted to cooperative
→ Admin reviews stock
→ Cooperative packs per citizen
→ Driver delivers to RT point
→ RT confirms batch received
→ Citizens pickup their packages
→ Each order completed
→ Points, mission progress, RT incentive calculated
```

## 5. Statuses

| Batch status | Meaning |
|---|---|
| Draft | RT prepares batch |
| Open | Citizens can join |
| Locked | No more orders allowed |
| Submitted | Sent to cooperative |
| Confirmed | Cooperative confirms stock/fulfillment |
| Packing | Items being packed |
| Ready for Pickup | Ready for driver pickup |
| In Delivery | Driver delivering to RT point |
| Delivered to RT | Arrived at RT point |
| Partially Picked Up | Some citizens picked up |
| Completed | All valid orders completed |
| Cancelled | Batch cancelled |

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Create Batch | RT creates order batch | P0 |
| Batch Deadline | Cutoff time for order | P0 |
| Batch Catalog | Products eligible for batch | P0 |
| Join Batch | User joins batch from app | P0 |
| Assisted Batch Order | RT/Petugas adds order for warga | P0 |
| Lock Batch | Prevent new orders | P0 |
| Batch Summary | GMV, orders, item quantity | P0 |
| Packing List | Per citizen and consolidated list | P0 |
| Pickup List | Citizen pickup checklist | P0 |
| RT Incentive | Incentive based on completed batch | P1 |
| Batch Chat/Broadcast | WhatsApp message generator | P1 |
| Batch Audit Log | Track every action | P0 |

## 7. User stories

### US-RT-001 — Create batch

As an RT, I want to create a weekly group order so citizens can buy together from the cooperative.

**Acceptance criteria**

- RT can set title, deadline, pickup point, and notes.
- Batch is visible to citizens under that RT.
- Batch can be open, locked, submitted, or cancelled.
- All changes are audit logged.

### US-RT-002 — Assisted order in batch

As an RT/Petugas, I want to add orders for citizens without smartphones so they can join the batch.

**Acceptance criteria**

- RT/Petugas can scan Kartu Kopdes or search member.
- Order is attributed to citizen.
- Citizen confirmation is required.
- Order appears inside batch summary.

### US-RT-003 — Packing list

As admin koperasi, I want to generate packing list per batch so fulfillment is efficient.

**Acceptance criteria**

- Admin can see consolidated SKU quantity.
- Admin can see per-citizen package list.
- Items can be marked packed.
- Missing stock is flagged.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| RT-001 | RT can create batch | P0 |
| RT-002 | RT can update/cancel Draft/Open batch | P0 |
| RT-003 | Users can join open batch | P0 |
| RT-004 | Assisted orders can be added | P0 |
| RT-005 | Batch cannot accept orders after locked | P0 |
| RT-006 | Stock validation happens at submission | P0 |
| RT-007 | Generate consolidated packing list | P0 |
| RT-008 | Generate per-citizen pickup list | P0 |
| RT-009 | RT can mark citizen pickup | P0 |
| RT-010 | Completed batch triggers points and missions | P0 |
| RT-011 | RT incentive can be calculated | P1 |

## 9. API draft

```http
POST /rt/batches
GET /rt/batches
GET /rt/batches/{batchId}
PATCH /rt/batches/{batchId}
POST /rt/batches/{batchId}/open
POST /rt/batches/{batchId}/lock
POST /rt/batches/{batchId}/submit
POST /rt/batches/{batchId}/orders
GET /rt/batches/{batchId}/summary
GET /rt/batches/{batchId}/packing-list
GET /rt/batches/{batchId}/pickup-list
PATCH /rt/batches/{batchId}/orders/{orderId}/pickup
POST /admin/rt-batches/{batchId}/confirm
```

## 10. Data model

```text
RTBatch
RTBatchOrder
RTBatchItemSummary
PickupPoint
PackingTask
PickupConfirmation
RTIncentive
```

## 11. Edge cases

| Case | Expected behavior |
|---|---|
| Stock insufficient after batch submitted | Admin can propose substitution or partial fulfillment |
| Citizen does not pickup | Mark as unclaimed and apply return/cancellation rule |
| RT cancels batch after orders added | Notify affected users and reverse reserved stock |
| Payment mixed QRIS/COD | Track per order payment status |
| Driver failed to deliver | Batch goes to delivery exception status |

## 12. KPI

- RT active per month.
- Batch order count.
- GMV per batch.
- Average basket size per RT.
- Pickup completion rate.
- Unclaimed package rate.
- Cost per delivery.
- Repeat batch participation.

## 13. MVP acceptance checklist

- RT creates batch.
- Users and assisted citizens can join batch.
- Admin can see batch summary.
- Packing list is generated.
- Delivery to RT can be recorded.
- Pickup per citizen can be confirmed.
- Points and mission progress update after completion.
