<!--
KMP Mart PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# PRD — Driver & Local Logistics

## 1. Objective

Support pickup and delivery for individual orders, RT batch orders, warung stock orders, and pickup point packages using local cooperative couriers (**KopKurir**) and optional integration with external logistics providers.

## 2. Product principle

KMP Mart should not depend fully on Gojek/Grab/JNE/J&T/Shopee Express. Koperasi must be able to operate with local courier first, while external providers remain optional based on availability, API/partnership, distance, SLA, and cost.

## 3. Logistics modes

| Mode | Description | Best for |
|---|---|---|
| KopKurir | Local cooperative courier/self-owned courier | Same village, RT batch, warung delivery, job creation |
| Community Pickup | Citizen picks up at koperasi/RT/warung | Low cost, dense village area |
| External Instant Courier | GoSend/GrabExpress type service if available | Urgent same-day urban/semi-urban delivery |
| External Parcel Provider | JNE/J&T/Shopee Express/aggregator | Inter-village/inter-district parcel |
| Manual Booking | Admin books provider manually and inputs tracking | MVP fallback when API unavailable |

## 4. Target users

- KopKurir/local driver.
- Cooperative admin/dispatcher.
- RT pickup receiver.
- Warung pickup receiver.
- Citizen recipient.
- External logistics provider/aggregator.

## 5. Scope

### In scope

- Delivery method selection.
- Driver assignment.
- Pickup from cooperative.
- Delivery to citizen/RT/warung.
- Proof of pickup and proof of delivery.
- Delivery status tracking.
- COD/cash collection.
- Driver settlement.
- Manual external logistics tracking.
- Provider abstraction for future integration.

### Out of scope for MVP

- Live GPS tracking.
- Complex route optimization.
- Real-time API integration with all providers.
- Driver payroll system.

## 6. Delivery flows

### 6.1 KopKurir individual delivery

```text
Admin marks order Ready for Delivery
→ Dispatcher assigns KopKurir
→ Driver accepts task
→ Driver picks up package
→ Driver delivers to citizen
→ Citizen confirms via PIN/QR/signature/photo
→ Order completed
→ COD/settlement recorded if applicable
```

### 6.2 RT batch delivery

```text
Batch Ready for Delivery
→ Driver picks up consolidated packages
→ Driver delivers to RT point
→ RT confirms batch receipt
→ Citizens pickup individually
→ RT/Petugas confirms each pickup
```

### 6.3 External logistics fallback

```text
Admin selects external provider/manual booking
→ System creates shipment record
→ Admin inputs provider name and tracking number
→ Package handed over
→ Status updated manually or via API if integrated
→ Delivery completed/failed
```

## 7. Key features

| Feature | Description | Priority |
|---|---|---|
| Delivery Method Selection | Pickup, RT, warung, KopKurir, external | P0 |
| Dispatch Dashboard | Assign delivery tasks | P0 |
| Driver App/Mode | View and update tasks | P0 |
| Proof of Pickup | Photo/QR/time/location | P0 |
| Proof of Delivery | Recipient confirmation | P0 |
| RT Batch Delivery | Deliver consolidated batch | P0 |
| Warung Delivery | Deliver B2B stock/pickup packages | P1 |
| COD Collection | Driver collects cash | P1 |
| Driver Settlement | Cash report and deposit | P1 |
| External Provider Record | Manual provider/tracking input | P1 |
| Provider Integration Layer | API abstraction for partners | P2 |
| Failed Delivery Handling | Retry/return/cancel rules | P0 |

## 8. Delivery statuses

| Status | Meaning |
|---|---|
| Pending Assignment | Needs driver/provider |
| Assigned | Driver/provider assigned |
| Accepted | Driver accepted task |
| Pickup Started | Driver heading to pickup |
| Picked Up | Package picked up |
| In Transit | Package on the way |
| Delivered to RT | Batch arrived at RT |
| Delivered to Warung | Package arrived at warung |
| Delivered to User | Delivered to citizen |
| Failed Delivery | Delivery failed |
| Returned | Returned to cooperative |
| Cancelled | Delivery cancelled |

## 9. User stories

### US-LOG-001 — Driver pickup

As KopKurir, I want to see assigned pickup tasks so I can pick up packages from the cooperative.

**Acceptance criteria**

- Driver can see assigned deliveries.
- Driver can accept task.
- Driver can scan package QR or enter code.
- Proof of pickup is recorded.
- Status changes to Picked Up.

### US-LOG-002 — RT batch delivery

As admin, I want to deliver a batch to RT so many orders can be fulfilled efficiently.

**Acceptance criteria**

- Batch can be assigned to driver.
- Driver sees consolidated package list.
- RT confirms receipt.
- Batch status becomes Delivered to RT.
- Individual citizen pickup remains separate.

### US-LOG-003 — Local job creation

As cooperative, I want to assign delivery to local KopKurir so the program creates job opportunities around the cooperative.

**Acceptance criteria**

- Admin can register local driver.
- Admin can assign tasks to local driver.
- Driver performance is tracked.
- Delivery incentive can be calculated.

## 10. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| LOG-001 | Admin can create shipment from order/batch | P0 |
| LOG-002 | Admin can assign KopKurir | P0 |
| LOG-003 | Driver can accept/reject task | P0 |
| LOG-004 | Driver can record proof of pickup | P0 |
| LOG-005 | Driver can record proof of delivery | P0 |
| LOG-006 | System supports delivery to user/RT/warung | P0 |
| LOG-007 | Failed delivery reason must be recorded | P0 |
| LOG-008 | COD amount can be recorded | P1 |
| LOG-009 | Driver settlement can be generated | P1 |
| LOG-010 | Admin can input external provider/tracking | P1 |
| LOG-011 | Provider abstraction supports future API integration | P2 |

## 11. API draft

```http
POST /admin/shipments
GET /admin/shipments
POST /admin/shipments/{shipmentId}/assign-driver
POST /admin/shipments/{shipmentId}/external-provider
GET /driver/tasks
POST /driver/tasks/{taskId}/accept
POST /driver/tasks/{taskId}/reject
POST /driver/tasks/{taskId}/proof-pickup
POST /driver/tasks/{taskId}/proof-delivery
POST /driver/tasks/{taskId}/failed
GET /admin/driver-settlements
POST /admin/driver-settlements/{settlementId}/confirm
```

## 12. Data model

```text
DriverProfile
Shipment
ShipmentPackage
DeliveryTask
ProofOfPickup
ProofOfDelivery
DeliveryAttempt
CODCollection
DriverSettlement
ExternalLogisticsProvider
ExternalTrackingRecord
```

## 13. External logistics integration strategy

MVP should implement provider abstraction first:

```text
LogisticsProviderInterface
- quoteDelivery()
- createShipment()
- cancelShipment()
- getTrackingStatus()
- handleWebhook()
```

Provider options:

- `KOPKURIR_INTERNAL`
- `MANUAL_EXTERNAL`
- `GOSEND_PARTNER`
- `GRABEXPRESS_PARTNER`
- `JNE_PARTNER`
- `JNT_PARTNER`
- `SHOPEE_EXPRESS_PARTNER`
- `AGGREGATOR_PARTNER`

Important: real API access depends on partnership and provider availability. MVP should not assume all APIs are available.

## 14. Settlement and audit

Driver settlement must include:

- driver ID,
- shipment IDs,
- COD amount collected,
- delivery fee,
- incentive,
- deposit proof,
- pending amount,
- settlement status.

## 15. KPI

- Delivery success rate.
- Average delivery time.
- Cost per delivery.
- Failed delivery rate.
- COD settlement timeliness.
- KopKurir active jobs.
- Local driver income generated.
- RT batch delivery cost saved.

## 16. MVP acceptance checklist

- Admin can create shipment.
- Admin can assign local driver.
- Driver can update pickup and delivery status.
- Proof of delivery is recorded.
- Failed delivery can be handled.
- External provider can be recorded manually.
