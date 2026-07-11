import type { MapCoordinate } from "@/components/open-street-map";
import OpenStreetMapView from "@/components/open-street-map";
import { dbService } from "@/utils/db";
import type { SFSymbol } from "expo-symbols";
import { SymbolView } from "@/components/app-symbol";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { AppModal } from "@/components/app-modal";

// Apple Maps is retained for iOS. Android uses the OpenStreetMap WebView branch below.
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS === "ios") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNMaps = require("react-native-maps");
    MapView = RNMaps.default || RNMaps;
    Marker = RNMaps.Marker;
    Polyline = RNMaps.Polyline;
  } catch {
    console.warn("react-native-maps not available");
  }
}

interface DeliveryTrackerModalProps {
  orderId: string | null;
  visible: boolean;
  onClose: () => void;
}

// ─── GEOGRAPHIC COORDINATES & REAL ROAD ROUTING ───
const COOP_COORDS_MAP: {
  [id: string]: { latitude: number; longitude: number };
} = {
  "tenant-1": { latitude: -8.409512, longitude: 115.188912 }, // Sukamaju
  "tenant-2": { latitude: -8.405112, longitude: 115.192512 }, // Sukasari
  "tenant-3": { latitude: -8.418912, longitude: 115.201212 }, // Sukamukti
  "tenant-4": { latitude: -7.250445, longitude: 112.750831 }, // Jaya Makmur (Jawa Timur)
  "tenant-5": { latitude: 2.445651, longitude: 98.991876 }, // Danau Toba (Sumatera)
  "tenant-6": { latitude: 1.545831, longitude: 124.778841 }, // Bunaken (Sulawesi)
};

const USER_HOME_COORD = { latitude: -8.404, longitude: 115.1948 };

// Realistic fallback street-following route (local Sukamaju area)
const DEFAULT_ROUTE_COORDS = [
  { latitude: -8.409512, longitude: 115.188912 }, // 0: Koperasi Sukamaju (start)
  { latitude: -8.4092, longitude: 115.1892 }, // 1: Keluar koperasi ke jalan lokal
  { latitude: -8.4075, longitude: 115.1898 }, // 2: Jalan ke utara
  { latitude: -8.4072, longitude: 115.1915 }, // 3: Belok kanan (timur) menyeberang sungai
  { latitude: -8.407, longitude: 115.1935 }, // 4: Lurus melewati perumahan
  { latitude: -8.4068, longitude: 115.1948 }, // 5: Junction utama (belok kiri/utara)
  { latitude: -8.4055, longitude: 115.1949 }, // 6: Menyusuri jalan utama ke utara
  { latitude: -8.4045, longitude: 115.1948 }, // 7: Mendekati lokasi
  { latitude: -8.404, longitude: 115.1948 }, // 8: Rumah warga (destination)
];

const getWaypointForStage = (s: number, totalPoints: number) => {
  if (totalPoints <= 0) return 0;
  switch (s) {
    case 0:
      return 0;
    case 1:
      return 0;
    case 2:
      return Math.floor(totalPoints / 2);
    case 3:
      return totalPoints - 1;
    default:
      return 0;
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
    label: "Mencari Kurir...",
    sublabel: "Menghubungkan dengan kurir terdekat Anda",
    color: "#f59e0b",
    icon: "dot.radiowaves.up.forward",
    chat: "Sistem sedang mencari kurir terbaik untuk Anda...",
    eta: "~5 menit",
  },
  {
    label: "Kurir Menuju Koperasi",
    sublabel: "Mang Ujang mengambil paket di Kopdes",
    color: "#3b82f6",
    icon: "storefront.fill",
    chat: "Halo! Saya Mang Ujang, sedang jalan ke Koperasi KMP ambil sembako Anda ya 🛵",
    eta: "~12 menit",
  },
  {
    label: "Dalam Perjalanan",
    sublabel: "Paket sedang dibawa menuju rumah Anda",
    color: "#059669",
    icon: "bicycle",
    chat: "Sembako sudah di tangan! Bentar lagi nyampe nih, jalanan lancar 👍",
    eta: "~5 menit",
  },
  {
    label: "🏠 Sampai di Rumah!",
    sublabel: "Sembako telah tiba. Hatur nuhun!",
    color: "#059669",
    icon: "checkmark.circle.fill",
    chat: "Paket udah saya taruh di depan teras ya Kak. Semoga bermanfaat! Hatur nuhun 🙏",
    eta: "Tiba",
  },
];

interface DeliveryMapProps {
  targetStage: number;
  routeCoords: MapCoordinate[];
  cooperativeId: string;
  visible: boolean;
  onStageReached: (stage: number) => void;
}

function DeliveryMap({
  targetStage,
  routeCoords,
  cooperativeId,
  visible,
  onStageReached,
}: DeliveryMapProps) {
  const [driverCoord, setDriverCoord] = useState<MapCoordinate>(
    routeCoords[0] || DEFAULT_ROUTE_COORDS[0],
  );
  const mapRef = useRef<any>(null);
  const currentWpIdxRef = useRef<number>(0);
  const [currentWpIdx, setCurrentWpIdx] = useState<number>(0);
  const lastAnimatedStageRef = useRef<number>(-1);
  const animationTimeoutsRef = useRef<any[]>([]);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  const clearTimeouts = useCallback(() => {
    animationTimeoutsRef.current.forEach((t) => clearTimeout(t));
    animationTimeoutsRef.current = [];
  }, []);

  useEffect(() => {
    if (!visible) {
      clearTimeouts();
      lastAnimatedStageRef.current = -1;
    }
    return () => {
      clearTimeouts();
    };
  }, [visible, clearTimeouts]);

  // Pulse ring animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 700,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 700,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Smoothly move driver through each waypoint
  const animateDriverAlongRoute = useCallback(
    (targetIdx: number, coordsList: any[], onComplete?: () => void) => {
      if (coordsList.length === 0) return;
      clearTimeouts();

      const from = currentWpIdxRef.current;

      // Web optimization: set target coordinate immediately to prevent iframe reloading / flashy flickering
      if (Platform.OS === "web") {
        setDriverCoord(coordsList[targetIdx]);
        currentWpIdxRef.current = targetIdx;
        setCurrentWpIdx(targetIdx);
        if (onComplete) onComplete();
        return;
      }

      if (targetIdx === from) {
        setDriverCoord(coordsList[targetIdx]);
        setCurrentWpIdx(targetIdx);
        if (onComplete) onComplete();
        return;
      }

      if (targetIdx < from) {
        currentWpIdxRef.current = targetIdx;
        setCurrentWpIdx(targetIdx);
        setDriverCoord(coordsList[targetIdx]);
        if (onComplete) onComplete();
        return;
      }

      let delay = 0;
      const stepsCount = targetIdx - from;
      const totalDuration = 4000; // total duration of movement animation in ms
      const maxUpdates = 45; // much smoother movement!
      const step = Math.max(Math.floor(stepsCount / maxUpdates), 1);
      const interval = totalDuration / (stepsCount / step);

      for (let i = from + 1; i <= targetIdx; i += step) {
        const idx = Math.min(i, targetIdx);
        const coord = coordsList[idx];
        const isLastStep = idx === targetIdx;

        const t = setTimeout(() => {
          setDriverCoord(coord);
          currentWpIdxRef.current = idx;
          setCurrentWpIdx(idx);

          // Pan map smoothly to follow driver
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: coord.latitude,
                longitude: coord.longitude,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
              },
              interval * 0.95,
            );
          }

          if (isLastStep && onComplete) {
            onComplete();
          }
        }, delay);
        animationTimeoutsRef.current.push(t);
        delay += interval;
      }
    },
    [clearTimeouts],
  );

  // Initialize/reset coordinator index when routeCoords or visibility changes
  useEffect(() => {
    if (!visible || routeCoords.length === 0) return;
    const targetWpIdx = getWaypointForStage(targetStage, routeCoords.length);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDriverCoord(routeCoords[targetWpIdx]);
    currentWpIdxRef.current = targetWpIdx;
    setCurrentWpIdx(targetWpIdx);
  }, [visible, routeCoords, targetStage]);

  // Animate driver along route when targetStage changes
  useEffect(() => {
    if (!visible || routeCoords.length === 0) return;
    if (lastAnimatedStageRef.current === targetStage) return;
    const targetWpIdx = getWaypointForStage(targetStage, routeCoords.length);
    animateDriverAlongRoute(targetWpIdx, routeCoords, () => {
      lastAnimatedStageRef.current = targetStage;
      onStageReached(targetStage);
    });
  }, [
    targetStage,
    routeCoords,
    visible,
    onStageReached,
    animateDriverAlongRoute,
  ]);

  const COOP_COORD = routeCoords[0] || USER_HOME_COORD;
  const HOME_COORD = routeCoords[routeCoords.length - 1] || USER_HOME_COORD;

  const MAP_CENTER = {
    latitude: (COOP_COORD.latitude + HOME_COORD.latitude) / 2,
    longitude: (COOP_COORD.longitude + HOME_COORD.longitude) / 2,
    latitudeDelta: Math.max(
      Math.abs(COOP_COORD.latitude - HOME_COORD.latitude) * 1.5,
      0.012,
    ),
    longitudeDelta: Math.max(
      Math.abs(COOP_COORD.longitude - HOME_COORD.longitude) * 1.5,
      0.012,
    ),
  };

  const travelledRoute = routeCoords.slice(0, currentWpIdx + 1);
  const remainingRoute = routeCoords.slice(currentWpIdx);
  const stageInfo = STAGE_INFO[targetStage] || STAGE_INFO[0];

  return (
    <View className="absolute inset-0">
      {Platform.OS === "web" ? (
        <iframe
          src={`https://maps.google.com/maps?q=${driverCoord.latitude},${driverCoord.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      ) : Platform.OS === "android" ? (
        <OpenStreetMapView
          region={MAP_CENTER}
          markers={[
            {
              coordinate: COOP_COORD,
              title: "Koperasi Merah Putih Sukamaju",
              description: "Titik pengambilan paket",
              color: "#059669",
              type: "cooperative",
            },
            {
              coordinate: HOME_COORD,
              title: "Rumah Anda",
              description: "Titik pengiriman",
              color: "#dc2626",
              type: "home",
            },
          ]}
          polylines={[
            { coordinates: travelledRoute, color: "#059669", width: 6 },
            {
              coordinates: remainingRoute,
              color: "#3b82f6",
              width: 5,
              dashArray: "10 8",
            },
          ]}
          style={{ flex: 1 }}
          driverCoord={targetStage > 0 ? driverCoord : null}
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
          {/* Travelled route */}
          {Polyline && travelledRoute.length > 1 && (
            <Polyline
              coordinates={travelledRoute}
              strokeColor="#059669"
              strokeWidth={6}
              lineDashPattern={undefined}
            />
          )}

          {/* Remaining route */}
          {Polyline && remainingRoute.length > 1 && (
            <Polyline
              coordinates={remainingRoute}
              strokeColor="#3b82f650"
              strokeWidth={5}
              lineDashPattern={undefined}
            />
          )}

          {/* Koperasi marker */}
          {Marker && (
            <Marker
              coordinate={COOP_COORD}
              title="Koperasi Merah Putih Sukamaju"
              description="Titik Pengambilan Paket"
              pinColor="green"
            />
          )}

          {/* Home marker */}
          {Marker && (
            <Marker
              coordinate={HOME_COORD}
              title="Rumah Anda"
              description="Titik Pengiriman"
              pinColor="red"
            />
          )}

          {/* Animated Driver marker */}
          {Marker && targetStage > 0 && (
            <Marker
              coordinate={driverCoord}
              title="Mang Ujang (Kurir Desa)"
              description="Sedang mengantarkan sembako Anda"
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View className={styles.driverMarkerOuter}>
                <Animated.View
                  className={styles.driverPulseRing}
                  style={{
                    transform: [{ scale: pulseAnim }],
                    backgroundColor: stageInfo.color + "30",
                  }}
                />
                <View
                  className={styles.driverMarkerDot}
                  style={{ backgroundColor: stageInfo.color }}
                >
                  <SymbolView name="bicycle" size={13} tintColor="#fff" />
                </View>
              </View>
            </Marker>
          )}
        </MapView>
      ) : (
        <View className={styles.mapFallback}>
          <Text className={styles.mapFallbackText}>
            Peta tidak dapat dimuat
          </Text>
        </View>
      )}
    </View>
  );
}

export default function DeliveryTrackerModal({
  orderId,
  visible,
  onClose,
}: DeliveryTrackerModalProps) {
  const [stage, setStage] = useState(0);
  const [targetStage, setTargetStage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>(DEFAULT_ROUTE_COORDS);
  const [chatVisible, setChatVisible] = useState(false);

  // Load order and fetch real route from OSRM
  useEffect(() => {
    if (!visible || !orderId) return;
    const load = async () => {
      setLoading(true);
      try {
        const orderData = await dbService.getFirst(
          "SELECT * FROM orders WHERE id = ?",
          [orderId],
        );
        const buyer = orderData
          ? await dbService.getFirst<{ cooperative_id?: string }>(
              "SELECT * FROM users WHERE id = ?",
              [orderData.user_id],
            )
          : null;
        setCurrentOrder(
          orderData
            ? { ...orderData, cooperative_id: buyer?.cooperative_id }
            : null,
        );

        const start =
          COOP_COORDS_MAP[buyer?.cooperative_id || ""] ||
          COOP_COORDS_MAP["tenant-1"];
        const end = USER_HOME_COORD;

        let fetchedCoords = null;
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes[0]) {
            fetchedCoords = data.routes[0].geometry.coordinates.map(
              (c: any) => ({
                latitude: c[1],
                longitude: c[0],
              }),
            );
          }
        } catch (fetchErr) {
          console.warn("Failed to fetch real route, using fallback:", fetchErr);
        }

        const activeCoords = fetchedCoords || DEFAULT_ROUTE_COORDS;
        setRouteCoords(activeCoords);

        if (orderData?.order_status === "COMPLETED") {
          setStage(3);
          setTargetStage(3);
        } else {
          setStage(0);
          setTargetStage(0);
        }
      } catch (err) {
        console.error("Failed to load delivery order:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId, visible]);

  const advanceStage = useCallback(async () => {
    if (targetStage < 3) {
      const next = targetStage + 1;
      setTargetStage(next);
    }
  }, [targetStage]);

  // The tracker only simulates map progress. Delivery completion remains the
  // driver's responsibility through the delivery-task workflow.
  const handleStageReached = useCallback((reachedStage: number) => {
    setStage(reachedStage);
  }, []);

  // Auto-progress stages every 7s for the visual simulation only.
  useEffect(() => {
    if (!visible || !orderId || loading || !currentOrder) return;
    if (currentOrder.order_status === "COMPLETED" || targetStage === 3) return;
    const timer = setTimeout(advanceStage, 7000);
    return () => clearTimeout(timer);
  }, [advanceStage, currentOrder, loading, orderId, targetStage, visible]);

  // Show chat messages as stage changes
  useEffect(() => {
    if (!visible || loading) return;
    const resetChat = setTimeout(() => setChatVisible(false), 0);
    const showChat = setTimeout(() => setChatVisible(true), 1200);
    return () => {
      clearTimeout(resetChat);
      clearTimeout(showChat);
    };
  }, [stage, visible, loading]);

  if (!visible) return null;

  const stageInfo = STAGE_INFO[stage];

  return (
    <AppModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className={styles.root}>
        {/* ── REAL GOOGLE MAP (Full Screen Background) ── */}
        <View className="absolute inset-0">
          <DeliveryMap
            targetStage={targetStage}
            routeCoords={routeCoords}
            cooperativeId={currentOrder?.cooperative_id || "tenant-1"}
            visible={visible}
            onStageReached={handleStageReached}
          />

          {/* Stage chip overlay on map */}
          <View className={styles.mapTopOverlay}>
            <View
              className={styles.stageChip}
              style={{ backgroundColor: stageInfo.color }}
            >
              <SymbolView name={stageInfo.icon} size={11} tintColor="#fff" />
              <Text className={styles.stageChipText}>{stageInfo.label}</Text>
            </View>
            <Pressable onPress={onClose} className={styles.closeMapBtn}>
              <SymbolView name="xmark" size={13} tintColor="#333" />
            </Pressable>
          </View>
        </View>

        {/* ── BOTTOM PANEL (Gojek/Grab style) ── */}
        <View className={styles.panel}>
          {/* Loading state */}
          {loading ? (
            <View className={styles.loadingRow}>
              <ActivityIndicator size="small" color="#059669" />
              <Text className={styles.loadingText}>
                Memuat detail pengiriman...
              </Text>
            </View>
          ) : (
            <>
              {/* Status */}
              <View className={styles.statusRow}>
                <View
                  className={styles.statusIconBg}
                  style={{ backgroundColor: stageInfo.color + "20" }}
                >
                  <SymbolView
                    name={stageInfo.icon}
                    size={20}
                    tintColor={stageInfo.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className={styles.statusTitle}>{stageInfo.label}</Text>
                  <Text className={styles.statusSub}>{stageInfo.sublabel}</Text>
                </View>
                {stageInfo.eta !== "Tiba" && (
                  <View
                    className={styles.etaBadge}
                    style={{ borderColor: stageInfo.color + "50" }}
                  >
                    <Text
                      className={styles.etaText}
                      style={{ color: stageInfo.color }}
                    >
                      {stageInfo.eta}
                    </Text>
                  </View>
                )}
              </View>

              {/* Stage progress dots (moved inside bottom panel) */}
              <View className={styles.stageDotsRow}>
                {STAGE_INFO.map((_, i) => (
                  <View
                    key={i}
                    className={styles.stageDot}
                    style={{
                      backgroundColor: i <= stage ? stageInfo.color : "#d4d4d4",
                      width: i === stage ? 20 : 7,
                    }}
                  />
                ))}
              </View>

              <View className={styles.divider} />

              {/* Driver card */}
              <View className={styles.driverCard}>
                <View className={styles.driverAvatar}>
                  <Text className={styles.driverAvatarInitials}>MU</Text>
                  <View className={styles.onlineDot} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className={styles.driverName}>Mang Ujang</Text>
                  <Text className={styles.driverVehicle}>
                    Honda Supra Fit · DK 4821 AA
                  </Text>
                  <View className={styles.ratingRow}>
                    <SymbolView name="star.fill" size={9} tintColor="#f59e0b" />
                    <Text className={styles.ratingText}>
                      4.9 · Kurir Desa Terpercaya
                    </Text>
                  </View>
                </View>
                <View className={styles.driverActionBtns}>
                  <Pressable className={styles.iconBtn}>
                    <SymbolView
                      name="phone.fill"
                      size={15}
                      tintColor="#059669"
                    />
                  </Pressable>
                  <Pressable className={styles.iconBtn}>
                    <SymbolView
                      name="message.fill"
                      size={15}
                      tintColor="#3b82f6"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Chat bubble */}
              {chatVisible && (
                <View className={styles.chatBubble}>
                  <View className={styles.chatAvatar}>
                    <Text className={styles.chatAvatarText}>MU</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      className={styles.chatText}
                    >{`"${stageInfo.chat}"`}</Text>
                    <Text className={styles.chatTime}>Baru saja</Text>
                  </View>
                </View>
              )}

              {/* Payment row */}
              {currentOrder && (
                <View className={styles.paymentRow}>
                  <SymbolView
                    name="banknote.fill"
                    size={12}
                    tintColor="#065f46"
                  />
                  <Text className={styles.paymentLabel}>
                    {currentOrder.payment_status === "PAID"
                      ? "✅ Pembayaran Lunas"
                      : "💵 Siapkan COD"}
                  </Text>
                  <Text className={styles.paymentAmount}>
                    Rp{currentOrder.total?.toLocaleString("id-ID") ?? "—"}
                  </Text>
                </View>
              )}

              {/* Buttons */}
              <View className={styles.btnRow}>
                {stage < 3 && (
                  <Pressable onPress={advanceStage} className={styles.speedBtn}>
                    <SymbolView
                      name="forward.fill"
                      size={13}
                      tintColor="#fff"
                    />
                    <Text className={styles.speedBtnText}>
                      Percepat Simulasi
                    </Text>
                  </Pressable>
                )}
                <Pressable onPress={onClose} className={styles.closeBtn}>
                  <Text className={styles.closeBtnText}>Tutup</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </AppModal>
  );
}

const styles = {
  root: "flex-1 bg-black justify-end relative",
  mapFallback: "flex-1 bg-slate-200 items-center justify-center",
  mapFallbackText: "text-slate-500 text-xs",
  driverMarkerOuter: "w-[52px] h-[52px] items-center justify-center",
  driverPulseRing: "absolute w-[52px] h-[52px] rounded-full",
  driverMarkerDot:
    "w-9 h-9 rounded-full items-center justify-center border-[3px] border-white shadow-md elevation-6",
  mapTopOverlay:
    "absolute top-16 left-4 right-4 flex-row justify-between items-center z-10",
  stageChip:
    "flex-row items-center gap-1.5 px-3.5 py-2 rounded-full shadow-md elevation-5",
  stageChipText: "text-white font-bold text-xs",
  closeMapBtn:
    "w-8 h-8 rounded-full bg-white items-center justify-center shadow elevation-3",
  stageDotsRow: "flex-row gap-1 justify-center items-center mb-3",
  stageDot: "h-1.5 rounded-full",
  panel: "bg-white rounded-t-3xl px-5 pt-4 pb-6 shadow-2xl elevation-14",
  loadingRow: "flex-row items-center gap-2.5 py-5 justify-center",
  loadingText: "text-stone-500 text-xs",
  statusRow: "flex-row items-center gap-3 mb-3",
  statusIconBg: "w-[46px] h-[46px] rounded-full items-center justify-center",
  statusTitle: "text-sm font-black text-stone-900",
  statusSub: "text-[10px] text-stone-500 mt-0.5",
  etaBadge: "border border-slate-200 rounded-xl px-2 py-1 bg-slate-50",
  etaText: "text-[10px] font-bold",
  divider: "h-[1px] bg-stone-100 mb-3",
  driverCard: "flex-row items-center gap-2.5 mb-2.5",
  driverAvatar:
    "w-11 h-11 rounded-full bg-emerald-700 items-center justify-center relative",
  driverAvatarInitials: "text-white font-bold text-sm",
  onlineDot:
    "absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white",
  driverName: "font-bold text-xs text-stone-900",
  driverVehicle: "text-[9px] text-stone-500 mt-0.5",
  ratingRow: "flex-row items-center gap-1 mt-0.5",
  ratingText: "text-[9px] text-stone-500 font-semibold",
  driverActionBtns: "flex-row gap-1.5",
  iconBtn:
    "w-9 h-9 rounded-full bg-stone-100 items-center justify-center border border-stone-200",
  chatBubble:
    "flex-row gap-2 items-start bg-emerald-50 border border-emerald-250 rounded-2xl rounded-tl-sm p-2.5 mb-2.5",
  chatAvatar:
    "w-6 h-6 rounded-full bg-emerald-700 items-center justify-center flex-shrink-0",
  chatAvatarText: "text-white text-[8px] font-bold",
  chatText: "text-[10px] italic text-emerald-800 leading-4",
  chatTime: "text-[7.5px] text-emerald-400 mt-0.5",
  paymentRow:
    "flex-row items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1.5 mb-3.5",
  paymentLabel: "flex-1 text-[10px] text-emerald-800 font-semibold",
  paymentAmount: "text-[11px] font-bold text-emerald-950",
  btnRow: "flex-row gap-2",
  speedBtn:
    "flex-[2] bg-emerald-600 rounded-xl py-3 flex-row items-center justify-center gap-1.5",
  speedBtnText: "text-white font-bold text-xs",
  closeBtn:
    "flex-1 bg-stone-100 rounded-xl py-3 items-center justify-center border border-stone-200",
  closeBtnText: "text-stone-700 font-bold text-xs",
};
