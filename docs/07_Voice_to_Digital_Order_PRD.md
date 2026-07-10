<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# PRD — Voice-to-Digital Order

## 1. Objective

Allow citizens who are comfortable speaking but not typing to order cooperative products through WhatsApp voice note or phone call, with operator validation before order creation.

## 2. Product principle

Voice-to-Digital should be **human-in-the-loop** for MVP. AI transcription may assist, but operator confirmation is required to avoid wrong orders.

## 3. Target users

- Warga who use WhatsApp but cannot type comfortably.
- Lansia.
- Warga with low literacy.
- Warga with accessibility needs.
- Petugas/operator koperasi.

## 4. Scope

### In scope

- WhatsApp hotline/manual inbox.
- Voice note ticket creation.
- Optional transcription field.
- Operator parses order.
- Product matching.
- Confirmation message.
- Order creation after confirmation.
- Audit trail.

### Out of scope for MVP

- Fully automated phone bot.
- Real-time speech recognition.
- Multi-language dialect engine.

## 5. Flow

```text
Citizen sends voice note
→ System/operator creates voice order ticket
→ Optional AI transcription generated
→ Operator validates citizen identity
→ Operator maps spoken products to catalog SKUs
→ System sends order summary confirmation
→ Citizen replies YES/YA or confirms by call/PIN
→ Order is created under citizen account
→ Receipt sent
```

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Voice Inbox | List incoming voice orders | P1 |
| Ticket Status | New, transcribing, needs review, confirmed | P1 |
| Manual Transcription | Operator writes order text | P0 |
| AI Transcription Assist | Draft transcript | P2 |
| Product Matcher | Search/select products from transcript | P1 |
| Citizen Lookup | Match phone/member/card | P0 |
| Confirmation Message | Send summary before order | P0 |
| Order Creation | Create order after confirmation | P0 |
| Audit Log | Track operator actions | P0 |

## 7. User stories

### US-VOICE-001 — Voice note order

As a citizen, I want to send a voice note to the cooperative so I can order without typing.

**Acceptance criteria**

- Voice note creates a ticket.
- Operator can listen to voice note.
- Operator can identify citizen.
- Operator can select products and quantities.
- System sends confirmation summary.
- Order is created only after confirmation.

### US-VOICE-002 — Operator validation

As operator, I want to review AI transcript before creating order so wrong transcription does not create wrong order.

**Acceptance criteria**

- Transcript is editable.
- Product mapping requires operator selection.
- Ambiguous items are flagged.
- Order cannot be submitted without confirmation.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| VOICE-001 | Voice message can be registered as ticket | P1 |
| VOICE-002 | Operator can play/download voice note | P1 |
| VOICE-003 | Operator can input/edit transcript | P0 |
| VOICE-004 | Operator can search citizen | P0 |
| VOICE-005 | Operator can match product to SKU | P0 |
| VOICE-006 | System can send confirmation summary | P0 |
| VOICE-007 | Order created only after confirmation | P0 |
| VOICE-008 | Ticket and order are linked | P0 |
| VOICE-009 | AI transcript is optional assist | P2 |

## 9. API draft

```http
POST /voice-orders/tickets
GET /voice-orders/inbox
GET /voice-orders/{ticketId}
PATCH /voice-orders/{ticketId}/transcript
POST /voice-orders/{ticketId}/match-products
POST /voice-orders/{ticketId}/send-confirmation
POST /voice-orders/{ticketId}/confirm
POST /voice-orders/{ticketId}/create-order
```

## 10. Data model

```text
VoiceOrderTicket
VoiceAttachment
VoiceTranscript
VoiceProductMatch
VoiceConfirmation
```

## 11. Ticket statuses

| Status | Meaning |
|---|---|
| New | Voice note received |
| In Review | Operator processing |
| Need Clarification | Order ambiguous |
| Waiting Confirmation | Summary sent to citizen |
| Confirmed | Citizen confirmed |
| Order Created | Digital order created |
| Cancelled | Ticket cancelled |

## 12. Edge cases

| Case | Expected behavior |
|---|---|
| Voice unclear | Mark Need Clarification |
| Unknown citizen phone | Ask for member ID/card |
| Product not found | Operator suggests alternative |
| Citizen does not confirm | Ticket expires after configured time |
| Wrong order dispute | Audit voice note and confirmation summary |

## 13. MVP acceptance checklist

- Operator can process voice order manually.
- Order summary confirmation is required.
- Voice ticket links to created order.
- Audit log records operator actions.
