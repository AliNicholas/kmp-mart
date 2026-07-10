<!--
KopMart RT PRD Package v2.0
Updated concept: Omni-channel Assisted Cooperative Marketplace + Local Logistics + Misi Gotong Royong
Prepared for SIMPKOPDES Hackathon 2026 development planning
-->

# KopMart RT — Updated PRD Package v2.0

## Product positioning

**KopMart RT** is now positioned as an **Omni-channel Assisted Cooperative Marketplace** for KDKMP / koperasi desa.

The main idea is no longer limited to only “marketplace + RT agent”. The updated concept is:

> **Frontend boleh digital atau analog, tetapi backend transaksi koperasi harus digital, tercatat, bisa diaudit, dan bisa meningkatkan volume usaha koperasi.**

This means warga can access cooperative commerce through multiple channels:

1. **Self-order app** untuk warga digital.
2. **Kartu Kopdes QR** untuk warga tanpa smartphone.
3. **RT Group Order** untuk order kolektif berbasis komunitas.
4. **Petugas Layanan KopMart** untuk warga non-digital.
5. **Mitra Warung KopMart** untuk warga yang tetap belanja offline di warung.
6. **Paper-to-Digital Catalog** untuk warga yang terbiasa dengan katalog/formulir fisik.
7. **Voice-to-Digital Order** untuk warga yang bisa berbicara tetapi tidak nyaman mengetik.
8. **Driver & Local Logistics** untuk pickup, delivery, kurir koperasi, dan integrasi opsional dengan provider logistik.
9. **Misi Gotong Royong** sebagai gamification and national-value engagement layer.
10. **Financial, Audit & Impact Dashboard** untuk GMV, profit/loss, cashflow, settlement, audit, dan dampak.

## Recommended development order

| Order | Module | Why first |
|---:|---|---|
| 1 | Shared Core Platform | Tenant, user, role, product, inventory, order, audit foundation |
| 2 | Self-order App | Main digital buying flow |
| 3 | Kartu Kopdes QR | Non-smartphone identity/access layer |
| 4 | Petugas Layanan KopMart | Assisted order without overloading RT |
| 5 | RT Group Order | Community batch order for higher volume and cheaper logistics |
| 6 | Admin Koperasi Dashboard | Product, stock, order, fulfillment, finance |
| 7 | Poin + Referral + Misi Gotong Royong | Retention and engagement layer |
| 8 | Mitra Warung KopMart | B2B2C local commerce channel |
| 9 | Paper-to-Digital Catalog | Low-tech fallback for offline users |
| 10 | Driver & Local Logistics | Delivery/pickup operation |
| 11 | Voice-to-Digital Order | Voice + operator validation |
| 12 | AI Features | Demand forecast, package generation, fraud detection |

## Files included

| File | Description |
|---|---|
| `00_MASTER_PRD_KopMart_RT_v2.md` | Main updated PRD across the whole product |
| `01_Self_Order_App_PRD.md` | PRD for citizen digital marketplace app |
| `02_Kartu_Kopdes_QR_PRD.md` | PRD for QR card identity and purchase assistance |
| `03_RT_Group_Order_PRD.md` | PRD for RT/community batch order |
| `04_Petugas_Layanan_KopMart_PRD.md` | PRD for official assisted-commerce staff role |
| `05_Mitra_Warung_KopMart_PRD.md` | PRD for local warung as B2B2C hub |
| `06_Paper_to_Digital_Catalog_PRD.md` | PRD for physical catalog and paper order forms |
| `07_Voice_to_Digital_Order_PRD.md` | PRD for WhatsApp/voice order with operator validation |
| `09_Driver_Local_Logistics_PRD.md` | PRD for KopKurir and logistics integration |
| `10_Misi_Gotong_Royong_PRD.md` | PRD for gamified national-value missions |
| `11_Financial_Audit_Impact_Dashboard_PRD.md` | PRD for financial, audit, and impact reporting |
| `12_Shared_Data_Model_API_Contracts.md` | Shared entities, statuses, APIs, and permissions |
| `KopMart_RT_All_PRDs_Combined_v2.md` | Combined full Markdown document |

## Core product principle

> **KopMart RT tidak memaksa semua warga menjadi digital-native. KopMart RT membuat koperasi menjadi transaction-native: semua transaksi, stok, pembayaran, poin, pengiriman, dan laporan tercatat digital, meskipun warga masuk dari aplikasi, kartu, RT, warung, voice note, katalog kertas, atau petugas layanan.**
