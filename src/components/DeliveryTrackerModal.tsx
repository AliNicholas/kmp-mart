import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useApp } from '@/contexts/AppContext';
import { dbService } from '@/utils/db';

interface DeliveryTrackerModalProps {
  orderId: string | null;
  visible: boolean;
  onClose: () => void;
}

export default function DeliveryTrackerModal({ orderId, visible, onClose }: DeliveryTrackerModalProps) {
  const { refreshData, orders, allUsers } = useApp();
  
  const [stage, setStage] = useState(0); // 0: Finding, 1: Picking Up, 2: Transit, 3: Arrived
  const [loading, setLoading] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);

  const driverName = "Mang Ujang (Kurir Desa)";
  const driverVehicle = "Honda Supra Fit Hijau (DK 4821 RT)";
  const driverRating = "4.9 ★ Gotong Royong";

  // Stage details
  const stageTitles = [
    "Mencari Kurir Desa...",
    "Kurir Menuju Koperasi",
    "Sembako Sedang Diantar",
    "Sembako Tiba di Rumah!"
  ];

  const stageSubtitles = [
    "Menghubungkan dengan kurir terdekat Anda",
    "Mang Ujang mengambil paket sembako di Koperasi",
    "Mang Ujang sedang berkendara menuju alamat Anda",
    "Sembako telah diserahterahkan ke depan rumah"
  ];

  const driverChats = [
    "Sistem sedang mencari kurir untuk Anda...",
    "Halo Bu/Pak, saya Mang Ujang. Saya jalan ke Koperasi Sukamaju untuk ambil belanjaan Anda ya.",
    "Belanjaan sembako sudah saya ikat di motor. Langsung meluncur ke alamat Kakak!",
    "Paket sembako sudah sampai di depan teras ya kak. Hatur nuhun!"
  ];

  // Load order details on open
  useEffect(() => {
    if (!visible || !orderId) return;

    const loadOrder = async () => {
      setLoading(true);
      try {
        const orderData = await dbService.getFirst(
          'SELECT * FROM orders WHERE id = ?',
          [orderId]
        );
        setCurrentOrder(orderData);

        // If order is already completed in database, jump straight to Arrived stage
        if (orderData && orderData.order_status === 'COMPLETED') {
          setStage(3);
        } else {
          setStage(0);
        }
      } catch (err) {
        console.error("Failed to load delivery order:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, visible]);

  // Auto-progress stages if order is not completed
  useEffect(() => {
    if (!visible || !orderId || loading || !currentOrder) return;
    if (currentOrder.order_status === 'COMPLETED' || stage === 3) return;

    const timer = setTimeout(() => {
      handleNextStage();
    }, 6000); // 6 seconds per stage

    return () => clearTimeout(timer);
  }, [stage, visible, loading, currentOrder]);

  const handleNextStage = async () => {
    if (stage < 3) {
      const nextStage = stage + 1;
      setStage(nextStage);

      // If reaching the final stage, complete the order in database
      if (nextStage === 3 && currentOrder && currentOrder.order_status !== 'COMPLETED') {
        try {
          const nowStr = new Date().toISOString();
          
          // 1. Update order status in database
          await dbService.run(
            `UPDATE orders SET order_status = 'COMPLETED', payment_status = 'PAID' WHERE id = ?`,
            [orderId]
          );

          // Get buyer details
          const buyer = allUsers.find(u => u.id === currentOrder.user_id);
          const buyerName = buyer ? buyer.name : 'Warga';

          // 2. Insert audit log
          const logId = `log-${Date.now()}`;
          await dbService.run(
            'INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)',
            [logId, 'Mang Ujang (Kurir)', 'DELIVERY_COMPLETE', `Delivered home order ${orderId} to ${buyerName}. Payment status updated to PAID.`, nowStr]
          );

          // 3. Refresh App State
          await refreshData();
          Alert.alert("Simulasi Selesai", "Sembako telah diterima! Status pesanan diupdate menjadi SELESAI.");
        } catch (err) {
          console.error("Failed to update completed delivery in database:", err);
        }
      }
    }
  };

  const getPositionLeft = () => {
    switch (stage) {
      case 0: return '4%';
      case 1: return '33%';
      case 2: return '66%';
      default: return '93%';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Simulasi Kurir Desa</Text>
              <Text style={styles.subtitle}>Pengiriman Langsung ke Rumah</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <SymbolView name="xmark" size={14} tintColor="#555" />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.loadingText}>Memuat detail pengiriman...</Text>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              
              {/* GoFood Style Live Map Animation Track */}
              <View style={styles.mapContainer}>
                {/* Visual Background Road */}
                <View style={styles.roadTrack} />
                
                {/* Milestones */}
                <View style={styles.milestoneRow}>
                  <View style={[styles.milestoneCircle, stage >= 1 && styles.milestoneActive]}>
                    <SymbolView name="storefront.fill" size={12} tintColor={stage >= 1 ? "#fff" : "#777"} />
                  </View>
                  <View style={[styles.milestoneCircle, stage >= 2 && styles.milestoneActive]}>
                    <SymbolView name="box.truck.fill" size={12} tintColor={stage >= 2 ? "#fff" : "#777"} />
                  </View>
                  <View style={[styles.milestoneCircle, stage >= 3 && styles.milestoneActive]}>
                    <SymbolView name="house.fill" size={12} tintColor={stage >= 3 ? "#fff" : "#777"} />
                  </View>
                </View>

                {/* Motorbike Driver Tracker */}
                <View style={[styles.driverMarker, { left: getPositionLeft() }]}>
                  {stage === 0 ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <View style={styles.markerInner}>
                      <SymbolView name="bicycle" size={16} tintColor="#fff" />
                    </View>
                  )}
                </View>
              </View>

              {/* Status Header */}
              <View style={styles.statusBox}>
                <View style={styles.statusDotRow}>
                  <View style={[styles.statusDot, styles.dotActive]} />
                  <View style={[styles.statusDot, stage >= 1 && styles.dotActive]} />
                  <View style={[styles.statusDot, stage >= 2 && styles.dotActive]} />
                  <View style={[styles.statusDot, stage >= 3 && styles.dotActive]} />
                </View>
                <Text style={styles.statusTitle}>{stageTitles[stage]}</Text>
                <Text style={styles.statusSubtitle}>{stageSubtitles[stage]}</Text>
              </View>

              {/* Driver info card */}
              <View style={styles.driverCard}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>MU</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{driverName}</Text>
                  <Text style={styles.driverVehicle}>{driverVehicle}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <SymbolView name="star.fill" size={8} tintColor="#fbbf24" />
                    <Text style={styles.driverRating}>{driverRating}</Text>
                  </View>
                </View>
              </View>

              {/* Chat Simulation bubble */}
              <Text style={styles.chatHeader}>Pesan dari Kurir:</Text>
              <View style={styles.chatBubble}>
                <Text style={styles.chatText}>“{driverChats[stage]}”</Text>
                <Text style={styles.chatTime}>Baru Saja</Text>
              </View>

              {/* COD Reminder */}
              {currentOrder && (
                <View style={styles.paymentCard}>
                  <SymbolView name="creditcard.fill" size={12} tintColor="#065f46" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.paymentLabel}>
                      {currentOrder.payment_status === 'PAID' ? 'Pembayaran Selesai' : 'Siapkan Uang COD'}
                    </Text>
                    <Text style={styles.paymentValue}>
                      Rp{currentOrder.total.toLocaleString('id-ID')} {currentOrder.points_redeemed > 0 ? `(-${currentOrder.points_redeemed} Poin)` : ''}
                    </Text>
                  </View>
                  <View style={[
                    styles.paymentBadge, 
                    currentOrder.payment_status === 'PAID' ? styles.badgePaid : styles.badgeCod
                  ]}>
                    <Text style={styles.paymentBadgeText}>
                      {currentOrder.payment_status === 'PAID' ? 'LUNAS' : 'TUNAI COD'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.footerButtons}>
                {stage < 3 && (
                  <Pressable 
                    onPress={handleNextStage}
                    style={styles.speedUpButton}
                  >
                    <SymbolView name="forward.fill" size={12} tintColor="#fff" />
                    <Text style={styles.speedUpText}>Percepat Simulasi</Text>
                  </Pressable>
                )}
                
                <Pressable 
                  onPress={onClose}
                  style={styles.backButton}
                >
                  <Text style={styles.backText}>Tutup Pelacak</Text>
                </Pressable>
              </View>

            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fafaf9', // stone-50
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '75%',
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    paddingBottom: 12,
    marginBottom: 16,
  },
  title: {
    color: '#064e3b',
    fontWeight: '900',
    fontSize: 16,
  },
  subtitle: {
    color: '#78716c',
    fontSize: 10,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 9999,
    backgroundColor: '#e7e5e4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#78716c',
    fontSize: 11,
    marginTop: 10,
  },
  mapContainer: {
    height: 60,
    backgroundColor: '#f1f5f9', // slate-100
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  roadTrack: {
    height: 4,
    backgroundColor: '#cbd5e1', // slate-300
    borderRadius: 2,
    position: 'absolute',
    left: 20,
    right: 20,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  milestoneActive: {
    backgroundColor: '#059669', // emerald-600
  },
  driverMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginTop: -14,
    top: '50%',
  },
  markerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
    marginBottom: 12,
  },
  statusDotRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  statusDot: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#e7e5e4',
  },
  dotActive: {
    backgroundColor: '#059669',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1c1917',
  },
  statusSubtitle: {
    fontSize: 10,
    color: '#78716c',
    marginTop: 3,
    textAlign: 'center',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 16,
    padding: 10,
    gap: 10,
    marginBottom: 10,
  },
  driverAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  driverName: {
    fontWeight: 'bold',
    color: '#1c1917',
    fontSize: 11,
  },
  driverVehicle: {
    fontSize: 9,
    color: '#78716c',
    marginTop: 1,
  },
  driverRating: {
    fontSize: 9,
    color: '#78716c',
    fontWeight: '600',
  },
  chatHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#a8a29e',
    textTransform: 'uppercase',
    marginBottom: 3,
    marginLeft: 2,
  },
  chatBubble: {
    backgroundColor: '#f5f5f4', // stone-100
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 12,
    borderTopLeftRadius: 2,
    padding: 8,
    marginBottom: 12,
  },
  chatText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#44403c',
    lineHeight: 14,
  },
  chatTime: {
    fontSize: 8,
    color: '#a8a29e',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5', // emerald-50
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    padding: 8,
    marginBottom: 14,
  },
  paymentLabel: {
    fontSize: 8,
    color: '#065f46',
  },
  paymentValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#064e3b',
  },
  paymentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePaid: {
    backgroundColor: '#059669',
  },
  badgeCod: {
    backgroundColor: '#d97706',
  },
  paymentBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  speedUpButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  speedUpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#e7e5e4',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#44403c',
    fontWeight: 'bold',
    fontSize: 11,
  }
});
