<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# PRD — Misi Gotong Royong

## 1. Objective

Create a gamified engagement layer that increases cooperative transactions, repeat orders, local product absorption, referral activation, social participation, and national-value campaigns.

## 2. Product positioning

**Misi Gotong Royong** is not generic gaming. It is a mission system based on:

- gotong royong,
- cinta produk lokal,
- kemandirian ekonomi,
- kepedulian sosial,
- literasi koperasi,
- event nasional/kenegaraan,
- community participation.

## 3. Target users

- Warga digital.
- Warga using Kartu Kopdes.
- RT/kader.
- Petugas Layanan.
- Mitra Warung.
- Admin koperasi.
- Pemdes/auditor.

## 4. Mission categories

| Category | Purpose | Example |
|---|---|---|
| Transaction | Increase GMV/repeat order | Belanja 3x bulan ini |
| Local Product | Absorb village products | Beli 2 produk UMKM desa |
| Referral | Acquire active buyers | Ajak 1 tetangga transaksi pertama |
| Social | Encourage solidarity | Donasi poin untuk sembako warga rentan |
| Education | Improve literacy | Baca materi koperasi + quiz |
| National Event | Tie engagement to national values | Misi Merdeka Belanja Lokal |
| Community | Activate RT/warung | RT paling aktif batch order |
| Environment | Support sustainability | Setor bank sampah dapat poin |

## 5. Example campaigns

### 5.1 Misi Merdeka Belanja Lokal — August

- Buy 2 local products.
- Join 1 RT Group Order.
- Invite 1 citizen to first transaction.
- Donate 50 points for subsidized sembako.

Rewards:

- 2x points for local products.
- Badge “Warga Merdeka Belanja Lokal”.
- RT community leaderboard.

### 5.2 Hari Koperasi

- Complete first cooperative purchase.
- Read short cooperative literacy material.
- Buy a product from Titip Jual Warga.
- Invite one active buyer.

Rewards:

- Points.
- Voucher Paket Hemat.
- Badge “Sahabat Koperasi”.

### 5.3 Sumpah Pemuda

- Youth helps photo 3 UMKM products.
- Youth helps one elderly citizen order.
- Youth shares cooperative catalog.

Rewards:

- Badge “Pemuda Penggerak Koperasi”.
- Contribution points.
- Digital certificate.

## 6. Key features

| Feature | Description | Priority |
|---|---|---|
| Mission List | User sees active missions | P0 |
| Mission Detail | Requirement, period, reward | P0 |
| Mission Progress | Track completion | P0 |
| Auto Validation | Validate from order/events | P0 |
| Manual Validation | Admin validates offline missions | P1 |
| Reward Engine | Points/voucher/badge/free delivery | P0 |
| Badge System | Social recognition | P1 |
| Event Campaign | National/local campaign template | P1 |
| RT Leaderboard | Community-level leaderboard | P1 |
| Warung Mission | B2B partner mission | P1 |
| Budget Cap | Limit reward cost | P0 |
| Anti-Abuse Rule | Prevent fraud farming | P0 |
| Audit Log | Track mission reward | P0 |

## 7. User stories

### US-MISSION-001 — Complete transaction mission

As a citizen, I want to complete a buying mission so I get points and feel motivated to shop again at the cooperative.

**Acceptance criteria**

- User can view active missions.
- User sees mission requirement and reward.
- Progress updates only after completed order.
- Reward is issued after mission complete.
- Reward appears in points history.

### US-MISSION-002 — Non-digital mission participation

As a citizen without smartphone, I want my assisted/card purchase to count toward missions so I receive the same benefit as app users.

**Acceptance criteria**

- Card/assisted orders trigger mission progress.
- Receipt shows mission progress/reward when possible.
- Petugas can explain eligible missions.
- Reward goes to citizen account.

### US-MISSION-003 — Admin creates national event campaign

As admin, I want to create a mission for Hari Koperasi/17 Agustus so citizens engage with cooperative and local products.

**Acceptance criteria**

- Admin can create mission title, period, category.
- Admin can set trigger event and condition.
- Admin can set reward and budget cap.
- Admin can activate/end mission.
- Analytics show mission performance.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| MIS-001 | Admin can create mission | P0 |
| MIS-002 | Mission can have period and status | P0 |
| MIS-003 | Mission can target USER/RT/WARUNG | P0 |
| MIS-004 | Mission rule can be event-based | P0 |
| MIS-005 | Mission progress updates from events | P0 |
| MIS-006 | Reward issued after completion | P0 |
| MIS-007 | Reward budget cap enforced | P0 |
| MIS-008 | Mission supports manual validation | P1 |
| MIS-009 | Mission supports badge | P1 |
| MIS-010 | Mission supports leaderboard | P1 |
| MIS-011 | Fraud/reversal handled | P0 |

## 9. API draft

```http
GET /missions
GET /missions/{missionId}
GET /me/missions
GET /me/badges
POST /admin/missions
PATCH /admin/missions/{missionId}
POST /admin/missions/{missionId}/activate
POST /admin/missions/{missionId}/end
GET /admin/missions/{missionId}/analytics
POST /missions/{missionId}/manual-validate
POST /missions/events/ingest
```

## 10. Data model

```text
Mission
MissionRule
MissionProgress
MissionReward
MissionBudget
UserBadge
CommunityLeaderboard
MissionAuditLog
```

## 11. Mission event triggers

| Event | Example condition |
|---|---|
| ORDER_COMPLETED | minOrderValue >= 25000 |
| LOCAL_PRODUCT_PURCHASED | localProductQty >= 2 |
| RT_BATCH_JOINED | batch completed |
| REFERRAL_FIRST_ORDER | invitee first valid order |
| POINTS_DONATED | donatedPoints >= 50 |
| PAPER_ORDER_COMPLETED | source = PAPER_FORM |
| VOICE_ORDER_COMPLETED | source = VOICE_NOTE |
| WARUNG_B2B_ORDER | warung order >= min amount |
| KOPTASK_COMPLETED | task approved by admin |

## 12. Anti-abuse rules

| Risk | Mitigation |
|---|---|
| Fake order for points | Reward only after paid + completed |
| Cancel after reward | Reverse reward |
| Referral farming | Min order value, phone/device check, limit per month |
| Staff manipulation | Citizen PIN/OTP/signature and audit log |
| Budget overspend | Budget cap and max claim per user |
| Leaderboard unhealthy | Use RT/community leaderboard, not individual spending rank |

## 13. KPI

- Mission participation rate.
- Mission completion rate.
- Incremental GMV from mission.
- Local product GMV uplift.
- Referral first-order conversion.
- Points redemption to purchase rate.
- Social donation points.
- RT/community engagement.

## 14. MVP acceptance checklist

- Admin can create mission.
- User can view mission.
- Completed order updates mission progress.
- Reward is issued with budget cap.
- Assisted/card orders also count.
