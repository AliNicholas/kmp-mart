import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'expo-symbols';
import { useApp } from '@/contexts/AppContext';
import { dbService } from '@/utils/db';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Conditional react-native-maps import (not available on web)
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  try {
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default || RNMaps;
    Marker = RNMaps.Marker;
    Polyline = RNMaps.Polyline;
  } catch (e) {
    console.warn('react-native-maps not available');
  }
}

interface DeliveryTrackerModalProps {
  orderId: string | null;
  visible: boolean;
  onClose: () => void;
}

// ─── REAL GEOGRAPHIC COORDINATES (Bali area, Sukamaju → rumah) ───
// Route: Koperasi Sukamaju → jalan desa → gang kampung → rumah warga
const ROUTE_COORDS = [
  { latitude: -8.409512, longitude: 115.188912 }, // 0: Koperasi (start)
  { latitude: -8.408200, longitude: 115.189800 }, // 1: keluar koperasi
  { latitude: -8.407100, longitude: 115.190600 }, // 2: jalan utama
  { latitude: -8.406500, longitude: 115.191200 }, // 3: belok kiri
  { latitude: -8.406000, longitude: 115.192000 }, // 4: lurus
  { latitude: -8.405400, longitude: 115.192700 }, // 5: gang kampung
  { latitude: -8.405000, longitude: 115.193400 }, // 6: masuk perumahan
  { latitude: -8.404500, longitude: 115.194100 }, // 7: mendekat
  { latitude: -8.404000, longitude: 115.194800 }, // 8: rumah (destination)
];

const COOP_COORD = ROUTE_COORDS[0];
const HOME_COORD = ROUTE_COORDS[ROUTE_COORDS.length - 1];

// Center map between coop and home
const MAP_CENTER = {
  latitude: (COOP_COORD.latitude + HOME_COORD.latitude) / 2,
  longitude: (COOP_COORD.longitude + HOME_COORD.longitude) / 2,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

// Stage → which waypoint index the driver should be at
const STAGE_WAYPOINTS = [0, 0, 4, 8];

const STAGE_INFO: {
  label: string;
  sublabel: string;
  color: string;
  icon: SFSymbol;
  chat: string;
  eta: string;
}[] = [
  {
    label: 'Mencari Kurir...',
    sublabel: 'Menghubungkan dengan kurir terdekat Anda',
    color: '#f59e0b',
    icon: 'dot.radiowaves.up.forward',
    chat: 'Sistem sedang mencari kurir terbaik untuk Anda...',
    eta: '~5 menit',
  },
  {
    label: 'Kurir Menuju Koperasi',
    sublabel: 'Mang Ujang mengambil paket di Kopdes',
    color: '#3b82f6',
    icon: 'storefront.fill',
    chat: 'Halo! Saya Mang Ujang, sedang jalan ke Koperasi Sukamaju ambil sembako Anda ya 🛵',
    eta: '~12 menit',
  },
  {
    label: 'Dalam Perjalanan',
    sublabel: 'Paket sedang dibawa menuju rumah Anda',
    color: '#059669',
    icon: 'bicycle',
    chat: 'Sembako sudah di tangan! Bentar lagi nyampe nih, jalanan lancar 👍',
    eta: '~5 menit',
  },
  {
    label: '🏠 Sampai di Rumah!',
    sublabel: 'Sembako telah tiba. Hatur nuhun!',
    color: '#059669',
    icon: 'checkmark.circle.fill',
    chat: 'Paket udah saya taruh di depan teras ya Kak. Semoga bermanfaat! Hatur nuhun 🙏',
    eta: 'Tiba',
  },
];

export default function DeliveryTrackerModal({
  orderId,
  visible,
  onClose,
}: DeliveryTrackerModalProps) {
  const { refreshData, allUsers } = useApp();

  const [stage, setStage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [driverCoord, setDriverCoord] = useState(ROUTE_COORDS[0]);
  const [chatVisible, setChatVisible] = useState(false);

  const mapRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse ring animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Load order on open
  useEffect(() => {
    if (!visible || !orderId) return;
    const load = async () => {
      setLoading(true);
      try {
        const orderData = await dbService.getFirst('SELECT * FROM orders WHERE id = ?', [orderId]);
        setCurrentOrder(orderData);
        if (orderData?.order_status === 'COMPLETED') {
          setStage(3);
          setDriverCoord(HOME_COORD);
        } else {
          setStage(0);
          setDriverCoord(ROUTE_COORDS[0]);
        }
      } catch (err) {
        console.error('Failed to load delivery order:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId, visible]);

  // Auto-progress stages every 7s
  useEffect(() => {
    if (!visible || !orderId || loading || !currentOrder) return;
    if (currentOrder.order_status === 'COMPLETED' || stage === 3) return;
    const timer = setTimeout(advanceStage, 7000);
    return () => clearTimeout(timer);
  }, [stage, visible, loading, currentOrder]);

  // Animate driver along route when stage changes
  useEffect(() => {
    if (!visible) return;
    const targetWpIdx = STAGE_WAYPOINTS[stage];
    animateDriverAlongRoute(targetWpIdx);
    // Show chat bubble after short delay
    setChatVisible(false);
    const t = setTimeout(() => setChatVisible(true), 1200);
    return () => clearTimeout(t);
  }, [stage, visible]);

  // Smoothly move driver through each waypoint
  const animateDriverAlongRoute = (targetIdx: number) => {
    const currentIdx = ROUTE_COORDS.findIndex(
      (c) => c.latitude === driverCoord.latitude && c.longitude === driverCoord.longitude
    );
    const from = Math.max(currentIdx, 0);
    if (targetIdx <= from) return;

    let delay = 0;
    for (let i = from + 1; i <= targetIdx; i++) {
      const coord = ROUTE_COORDS[i];
      setTimeout(() => {
        setDriverCoord(coord);
        // Pan map to follow driver
        if (mapRef.current && i === targetIdx) {
          mapRef.current.animateToRegion({
            latitude: coord.latitude,
            longitude: coord.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }, 800);
        }
      }, delay);
      delay += 950;
    }
  };

  const advanceStage = async () => {
    if (stage < 3) {
      const next = stage + 1;
      setStage(next);

      if (next === 3 && currentOrder && currentOrder.order_status !== 'COMPLETED') {
        try {
          await dbService.run(
            `UPDATE orders SET order_status = 'COMPLETED', payment_status = 'PAID' WHERE id = ?`,
            [orderId]
          );
          const buyer = allUsers.find((u: any) => u.id === currentOrder.user_id);
          const logId = `log-${Date.now()}`;
          await dbService.run(
            'INSERT INTO audit_logs (id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?)',
            [
              logId,
              'Mang Ujang (Kurir)',
              'DELIVERY_COMPLETE',
              `Delivered order ${orderId} to ${buyer?.name ?? 'Warga'}`,
              new Date().toISOString(),
            ]
          );
          await refreshData();
          Alert.alert('✅ Pengiriman Selesai!', 'Sembako telah diterima. Status pesanan: SELESAI.');
        } catch (err) {
          console.error('Failed to complete delivery:', err);
        }
      }
    }
  };

  if (!visible) return null;

  const stageInfo = STAGE_INFO[stage];
  const MAP_HEIGHT = SCREEN_HEIGHT * 0.50;
  const travelledRoute = ROUTE_COORDS.slice(0, STAGE_WAYPOINTS[stage] + 1);
  const remainingRoute = ROUTE_COORDS.slice(STAGE_WAYPOINTS[stage]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>

        {/* ── REAL GOOGLE MAP ── */}
        <View style={{ height: MAP_HEIGHT, overflow: 'hidden' }}>
          {Platform.OS === 'web' ? (
            /* Web fallback: embed via iframe */
            <iframe
              src={`https://maps.google.com/maps?q=${driverCoord.latitude},${driverCoord.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          ) : MapView ? (
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={MAP_CENTER}
              showsUserLocation={false}
              showsTraffic={false}
              showsBuildings={true}
              showsPointsOfInterest={true}
            >
              {/* Route already travelled (solid green) */}
              {Polyline && travelledRoute.length > 1 && (
                <Polyline
                  coordinates={travelledRoute}
                  strokeColor="#059669"
                  strokeWidth={5}
                  lineDashPattern={undefined}
                />
              )}

              {/* Remaining route (dashed grey) */}
              {Polyline && remainingRoute.length > 1 && (
                <Polyline
                  coordinates={remainingRoute}
                  strokeColor="#94a3b8"
                  strokeWidth={4}
                  lineDashPattern={[8, 6]}
                />
              )}

              {/* Koperasi marker (origin) */}
              {Marker && (
                <Marker
                  coordinate={COOP_COORD}
                  title="Koperasi Merah Putih Sukamaju"
                  description="Titik Pengambilan Paket"
                  pinColor="green"
                />
              )}

              {/* Home marker (destination) */}
              {Marker && (
                <Marker
                  coordinate={HOME_COORD}
                  title="Rumah Anda"
                  description="Titik Pengiriman"
                  pinColor="red"
                />
              )}

              {/* Animated Driver marker */}
              {Marker && stage > 0 && (
                <Marker
                  coordinate={driverCoord}
                  title="Mang Ujang (Kurir Desa)"
                  description="Sedang mengantarkan sembako Anda"
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  {/* Custom driver icon */}
                  <View style={styles.driverMarkerOuter}>
                    <Animated.View
                      style={[
                        styles.driverPulseRing,
                        {
                          transform: [{ scale: pulseAnim }],
                          backgroundColor: stageInfo.color + '30',
                        },
                      ]}
                    />
                    <View style={[styles.driverMarkerDot, { backgroundColor: stageInfo.color }]}>
                      <SymbolView name="bicycle" size={13} tintColor="#fff" />
                    </View>
                  </View>
                </Marker>
              )}
            </MapView>
          ) : (
            <View style={styles.mapFallback}>
              <Text style={styles.mapFallbackText}>Peta tidak dapat dimuat</Text>
            </View>
          )}

          {/* Stage chip overlay on map */}
          <View style={styles.mapTopOverlay}>
            <View style={[styles.stageChip, { backgroundColor: stageInfo.color }]}>
              <SymbolView name={stageInfo.icon} size={11} tintColor="#fff" />
              <Text style={styles.stageChipText}>{stageInfo.label}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeMapBtn}>
              <SymbolView name="xmark" size={13} tintColor="#333" />
            </Pressable>
          </View>

          {/* Stage progress dots */}
          <View style={styles.stageDotsRow}>
            {STAGE_INFO.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.stageDot,
                  {
                    backgroundColor: i <= stage ? stageInfo.color : '#d4d4d4',
                    width: i === stage ? 20 : 7,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── BOTTOM PANEL (Gojek/Grab style) ── */}
        <View style={styles.panel}>

          {/* Loading state */}
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#059669" />
              <Text style={styles.loadingText}>Memuat detail pengiriman...</Text>
            </View>
          ) : (
            <>
              {/* Status */}
              <View style={styles.statusRow}>
                <View style={[styles.statusIconBg, { backgroundColor: stageInfo.color + '20' }]}>
                  <SymbolView name={stageInfo.icon} size={20} tintColor={stageInfo.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusTitle}>{stageInfo.label}</Text>
                  <Text style={styles.statusSub}>{stageInfo.sublabel}</Text>
                </View>
                {stageInfo.eta !== 'Tiba' && (
                  <View style={[styles.etaBadge, { borderColor: stageInfo.color + '50' }]}>
                    <Text style={[styles.etaText, { color: stageInfo.color }]}>{stageInfo.eta}</Text>
                  </View>
                )}
              </View>

              <View style={styles.divider} />

              {/* Driver card */}
              <View style={styles.driverCard}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarInitials}>MU</Text>
                  <View style={styles.onlineDot} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>Mang Ujang</Text>
                  <Text style={styles.driverVehicle}>Honda Supra Fit · DK 4821 RT</Text>
                  <View style={styles.ratingRow}>
                    <SymbolView name="star.fill" size={9} tintColor="#f59e0b" />
                    <Text style={styles.ratingText}>4.9 · Kurir Desa Terpercaya</Text>
                  </View>
                </View>
                <View style={styles.driverActionBtns}>
                  <Pressable style={styles.iconBtn}>
                    <SymbolView name="phone.fill" size={15} tintColor="#059669" />
                  </Pressable>
                  <Pressable style={styles.iconBtn}>
                    <SymbolView name="message.fill" size={15} tintColor="#3b82f6" />
                  </Pressable>
                </View>
              </View>

              {/* Chat bubble */}
              {chatVisible && (
                <View style={styles.chatBubble}>
                  <View style={styles.chatAvatar}>
                    <Text style={styles.chatAvatarText}>MU</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chatText}>"{stageInfo.chat}"</Text>
                    <Text style={styles.chatTime}>Baru saja</Text>
                  </View>
                </View>
              )}

              {/* Payment row */}
              {currentOrder && (
                <View style={styles.paymentRow}>
                  <SymbolView name="banknote.fill" size={12} tintColor="#065f46" />
                  <Text style={styles.paymentLabel}>
                    {currentOrder.payment_status === 'PAID' ? '✅ Pembayaran Lunas' : '💵 Siapkan COD'}
                  </Text>
                  <Text style={styles.paymentAmount}>
                    Rp{currentOrder.total?.toLocaleString('id-ID') ?? '—'}
                  </Text>
                </View>
              )}

              {/* Buttons */}
              <View style={styles.btnRow}>
                {stage < 3 && (
                  <Pressable onPress={advanceStage} style={styles.speedBtn}>
                    <SymbolView name="forward.fill" size={13} tintColor="#fff" />
                    <Text style={styles.speedBtnText}>Percepat Simulasi</Text>
                  </Pressable>
                )}
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>Tutup</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  mapFallback: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFallbackText: {
    color: '#64748b',
    fontSize: 13,
  },

  // Driver marker (custom, rendered inside Marker)
  driverMarkerOuter: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverPulseRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  driverMarkerDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },

  // Map overlays
  mapTopOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  stageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 5,
  },
  stageChipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeMapBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  stageDotsRow: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  stageDot: {
    height: 6,
    borderRadius: 3,
  },

  // Bottom panel
  panel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#78716c',
    fontSize: 12,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statusIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1c1917',
  },
  statusSub: {
    fontSize: 10,
    color: '#78716c',
    marginTop: 2,
  },
  etaBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f8fafc',
  },
  etaText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f5f5f4',
    marginBottom: 12,
  },

  // Driver card
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  driverAvatarInitials: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  driverName: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#1c1917',
  },
  driverVehicle: {
    fontSize: 9,
    color: '#78716c',
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  ratingText: {
    fontSize: 9,
    color: '#78716c',
    fontWeight: '600',
  },
  driverActionBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f5f5f4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },

  // Chat
  chatBubble: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    borderTopLeftRadius: 2,
    padding: 10,
    marginBottom: 10,
  },
  chatAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chatAvatarText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  chatText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#065f46',
    lineHeight: 15,
  },
  chatTime: {
    fontSize: 7.5,
    color: '#6ee7b7',
    marginTop: 3,
  },

  // Payment
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 14,
  },
  paymentLabel: {
    flex: 1,
    fontSize: 10,
    color: '#065f46',
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#064e3b',
  },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speedBtn: {
    flex: 2,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  speedBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#f5f5f4',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  closeBtnText: {
    color: '#44403c',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
