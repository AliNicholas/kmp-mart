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

// ─── GEOGRAPHIC COORDINATES & REAL ROAD ROUTING ───
const COOP_COORDS_MAP: { [id: string]: { latitude: number; longitude: number } } = {
  'tenant-1': { latitude: -8.409512, longitude: 115.188912 }, // Sukamaju
  'tenant-2': { latitude: -8.405112, longitude: 115.192512 }, // Sukasari
  'tenant-3': { latitude: -8.418912, longitude: 115.201212 }, // Sukamukti
  'tenant-4': { latitude: -7.250445, longitude: 112.750831 }, // Jaya Makmur (Jawa Timur)
  'tenant-5': { latitude: 2.445651, longitude: 98.991876 },   // Danau Toba (Sumatera)
  'tenant-6': { latitude: 1.545831, longitude: 124.778841 },  // Bunaken (Sulawesi)
};

const USER_HOME_COORD = { latitude: -8.404000, longitude: 115.194800 };

// Realistic fallback street-following route (local Sukamaju area)
const DEFAULT_ROUTE_COORDS = [
  { latitude: -8.409512, longitude: 115.188912 }, // 0: Koperasi Sukamaju (start)
  { latitude: -8.409200, longitude: 115.189200 }, // 1: Keluar koperasi ke jalan lokal
  { latitude: -8.407500, longitude: 115.189800 }, // 2: Jalan ke utara
  { latitude: -8.407200, longitude: 115.191500 }, // 3: Belok kanan (timur) menyeberang sungai
  { latitude: -8.407000, longitude: 115.193500 }, // 4: Lurus melewati perumahan
  { latitude: -8.406800, longitude: 115.194800 }, // 5: Junction utama (belok kiri/utara)
  { latitude: -8.405500, longitude: 115.194900 }, // 6: Menyusuri jalan utama ke utara
  { latitude: -8.404500, longitude: 115.194800 }, // 7: Mendekati lokasi
  { latitude: -8.404000, longitude: 115.194800 }, // 8: Rumah warga (destination)
];

const getWaypointForStage = (s: number, totalPoints: number) => {
  if (totalPoints <= 0) return 0;
  switch (s) {
    case 0: return 0;
    case 1: return 0;
    case 2: return Math.floor(totalPoints / 2);
    case 3: return totalPoints - 1;
    default: return 0;
  }
};

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
    chat: 'Halo! Saya Mang Ujang, sedang jalan ke Koperasi KMP ambil sembako Anda ya 🛵',
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
  const [routeCoords, setRouteCoords] = useState<any[]>(DEFAULT_ROUTE_COORDS);
  const [driverCoord, setDriverCoord] = useState(DEFAULT_ROUTE_COORDS[0]);
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

  // Load order and fetch real route from OSRM
  useEffect(() => {
    if (!visible || !orderId) return;
    const load = async () => {
      setLoading(true);
      try {
        const orderData = await dbService.getFirst('SELECT * FROM orders WHERE id = ?', [orderId]);
        setCurrentOrder(orderData);
        
        const start = COOP_COORDS_MAP[orderData?.cooperative_id] || COOP_COORDS_MAP['tenant-1'];
        const end = USER_HOME_COORD;

        let fetchedCoords = null;
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes[0]) {
            fetchedCoords = data.routes[0].geometry.coordinates.map((c: any) => ({
              latitude: c[1],
              longitude: c[0]
            }));
          }
        } catch (fetchErr) {
          console.warn('Failed to fetch real route, using fallback:', fetchErr);
        }

        const activeCoords = fetchedCoords || DEFAULT_ROUTE_COORDS;
        setRouteCoords(activeCoords);

        if (orderData?.order_status === 'COMPLETED') {
          setStage(3);
          setDriverCoord(activeCoords[activeCoords.length - 1]);
        } else {
          setStage(0);
          setDriverCoord(activeCoords[0]);
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
    if (!visible || loading || routeCoords.length === 0) return;
    const targetWpIdx = getWaypointForStage(stage, routeCoords.length);
    animateDriverAlongRoute(targetWpIdx, routeCoords);
    setChatVisible(false);
    const t = setTimeout(() => setChatVisible(true), 1200);
    return () => clearTimeout(t);
  }, [stage, visible, loading, routeCoords]);

  // Smoothly move driver through each waypoint
  const animateDriverAlongRoute = (targetIdx: number, coordsList: any[]) => {
    if (coordsList.length === 0) return;
    const currentIdx = coordsList.findIndex(
      (c) => c.latitude === driverCoord.latitude && c.longitude === driverCoord.longitude
    );
    const from = Math.max(currentIdx, 0);
    if (targetIdx <= from) return;

    let delay = 0;
    const step = Math.max(Math.floor((targetIdx - from) / 15), 1); // Limit animation speed if there are too many OSRM points

    for (let i = from + 1; i <= targetIdx; i += step) {
      const idx = Math.min(i, targetIdx);
      const coord = coordsList[idx];
      setTimeout(() => {
        setDriverCoord(coord);
        // Pan map to follow driver
        if (mapRef.current && idx === targetIdx) {
          mapRef.current.animateToRegion({
            latitude: coord.latitude,
            longitude: coord.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }, 800);
        }
      }, delay);
      delay += Math.max(1000 / ((targetIdx - from) / step), 100);
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
  const travelledRoute = routeCoords.slice(0, getWaypointForStage(stage, routeCoords.length) + 1);
  const remainingRoute = routeCoords.slice(getWaypointForStage(stage, routeCoords.length));

  const COOP_COORD = routeCoords[0] || USER_HOME_COORD;
  const HOME_COORD = routeCoords[routeCoords.length - 1] || USER_HOME_COORD;

  const MAP_CENTER = {
    latitude: (COOP_COORD.latitude + HOME_COORD.latitude) / 2,
    longitude: (COOP_COORD.longitude + HOME_COORD.longitude) / 2,
    latitudeDelta: Math.max(Math.abs(COOP_COORD.latitude - HOME_COORD.latitude) * 1.5, 0.012),
    longitudeDelta: Math.max(Math.abs(COOP_COORD.longitude - HOME_COORD.longitude) * 1.5, 0.012),
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.root}>

        {/* ── REAL GOOGLE MAP (Full Screen Background) ── */}
        <View style={StyleSheet.absoluteFill}>
          {Platform.OS === 'web' ? (
            /* Web fallback: embed via iframe */
            <iframe
              src={`https://maps.google.com/maps?q=${driverCoord.latitude},${driverCoord.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          ) : MapView ? (
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
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

              {/* Stage progress dots (moved inside bottom panel) */}
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
    position: 'relative',
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
    top: Platform.OS === 'ios' ? 60 : 24,
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
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
