import { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Alert, Linking, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { cn } from '@/lib/utils';
import OpenStreetMapView from '@/components/open-street-map';

// Conditional imports for native maps
let MapView: any = null;
let Marker: any = null;

if (Platform.OS === 'ios') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MapModule = require('react-native-maps');
    MapView = MapModule.default || MapModule;
    Marker = MapModule.Marker;
  } catch {
    console.warn("react-native-maps not available on iOS");
  }
}

interface CooperativeItem {
  id: string;
  name: string;
  distance: string;
  address: string;
  latitude: number;
  longitude: number;
  deliveryDaysExtra: number;
  surcharge: number;
}

interface CoopSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  activeCoopId: string;
  onSelectCoop: (id: string) => void;
}

const cooperatives: CooperativeItem[] = [
  {
    id: 'tenant-1',
    name: 'Koperasi Merah Putih Sukamaju',
    distance: '0 meter (Koperasi Terdekat)',
    address: 'Jl. Merdeka No. 12, Desa Sukamaju, Bali',
    latitude: -8.409512,
    longitude: 115.188912,
    deliveryDaysExtra: 0,
    surcharge: 0
  },
  {
    id: 'tenant-2',
    name: 'Koperasi Sukasari (Tetangga)',
    distance: '750 meter',
    address: 'Dusun Kanginan, Desa Sukasari, Bali',
    latitude: -8.405112,
    longitude: 115.192512,
    deliveryDaysExtra: 1,
    surcharge: 5000
  },
  {
    id: 'tenant-3',
    name: 'Koperasi Sukamukti (Tetangga)',
    distance: '1,8 km',
    address: 'Kecamatan Timur, Desa Sukamukti, Bali',
    latitude: -8.418912,
    longitude: 115.201212,
    deliveryDaysExtra: 1,
    surcharge: 5000
  },
  {
    id: 'tenant-4',
    name: 'Koperasi Jaya Makmur (Jawa Timur)',
    distance: '350 km (Luar Pulau)',
    address: 'Jl. Pemuda No. 45, Surabaya, Jawa Timur',
    latitude: -7.250445,
    longitude: 112.750831,
    deliveryDaysExtra: 3,
    surcharge: 15000
  },
  {
    id: 'tenant-5',
    name: 'Koperasi Danau Toba (Sumatera Utara)',
    distance: '2.500 km (Luar Pulau)',
    address: 'Jl. Ringroad, Balige, Toba, Sumatera Utara',
    latitude: 2.445651,
    longitude: 98.991876,
    deliveryDaysExtra: 5,
    surcharge: 25000
  },
  {
    id: 'tenant-6',
    name: 'Koperasi Bunaken Lestari (Sulawesi Utara)',
    distance: '1.200 km (Luar Pulau)',
    address: 'Kawasan Wisata Bunaken, Manado, Sulawesi Utara',
    latitude: 1.545831,
    longitude: 124.778841,
    deliveryDaysExtra: 4,
    surcharge: 25000
  }
];

export default function CoopSelectorModal({ visible, onClose, activeCoopId, onSelectCoop }: CoopSelectorModalProps) {
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedCoopForMap, setSelectedCoopForMap] = useState<CooperativeItem | null>(null);
  const [isNationalView, setIsNationalView] = useState(false);

  const handleOpenMap = (coop: CooperativeItem) => {
    const isFar = coop.id === 'tenant-4' || coop.id === 'tenant-5' || coop.id === 'tenant-6';
    setSelectedCoopForMap(coop);
    setIsNationalView(isFar);
    setMapVisible(true);
  };

  const handleOpenNationalMap = () => {
    setSelectedCoopForMap(cooperatives[0]); // default anchor
    setIsNationalView(true);
    setMapVisible(true);
  };

  const handleOpenExternalMap = (coop: CooperativeItem) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coop.latitude},${coop.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Gagal Membuka Peta", "Aplikasi peta tidak dapat dibuka.");
    });
  };

  return (
    <View>
      {/* Cooperative Selector Main Sheet */}
      <Modal
        visible={visible && !mapVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable
          onPress={onClose}
          className={styles.overlay}
        >
          <Pressable onPress={() => {}} className={styles.content}>
            
            <View className={styles.header}>
              <View style={{ flex: 1 }}>
                <Text className={styles.title}>Pilih Lokasi Koperasi Desa</Text>
                <Text className={styles.subtitle}>Bandingkan ketersediaan stok & jarak pengiriman</Text>
              </View>
              <Pressable onPress={onClose} className={styles.closeButton}>
                <SymbolView name="xmark" size={14} tintColor="#555" />
              </Pressable>
            </View>

            {/* Nusantara map shortcut */}
            <Pressable 
              onPress={handleOpenNationalMap}
              className={styles.nationalMapBanner}
            >
              <SymbolView name="network" size={16} tintColor="#fff" />
              <View style={{ flex: 1 }}>
                <Text className={styles.nationalMapBannerTitle}>Lihat Seluruh Koperasi Nusantara</Text>
                <Text className={styles.nationalMapBannerSubtitle}>Peta sebaran Kopdes antar pulau di Indonesia</Text>
              </View>
              <SymbolView name="chevron.right" size={12} tintColor="#fff" />
            </Pressable>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {cooperatives.map((coop) => {
                const isActive = coop.id === activeCoopId;
                const isFar = coop.id === 'tenant-4' || coop.id === 'tenant-5' || coop.id === 'tenant-6';
                
                return (
                  <Pressable 
                    key={coop.id}
                    onPress={() => {
                      if (!isActive) {
                        onSelectCoop(coop.id);
                        onClose();
                      }
                    }}
                    className={cn(
                      styles.coopCard,
                      isActive && styles.activeCard
                    )}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text className={cn(styles.coopName, isActive && styles.activeTextGreen)}>
                          {coop.name}
                        </Text>
                        {isActive && (
                          <View className={styles.activeTag}>
                            <Text className={styles.activeTagText}>AKTIF</Text>
                          </View>
                        )}
                        {isFar && (
                          <View className={styles.islandTag}>
                            <Text className={styles.islandTagText}>LUAR PULAU</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text className={styles.coopAddress}>{coop.address}</Text>
                      
                      <View className={styles.statsRow}>
                        <View className={styles.statItem}>
                          <SymbolView name="mappin.and.ellipse" size={11} tintColor="#d97706" />
                          <Text className={styles.statText}>{coop.distance}</Text>
                        </View>
                        {coop.surcharge > 0 && (
                          <View className={styles.statItem}>
                            <SymbolView name="shippingbox" size={11} tintColor="#059669" />
                            <Text className={styles.statText}>Ongkir +Rp{coop.surcharge.toLocaleString('id-ID')}</Text>
                          </View>
                        )}
                      </View>

                      {coop.deliveryDaysExtra > 0 && (
                        <Text className={styles.deliveryWarning}>
                          🕒 Pengiriman memerlukan +{coop.deliveryDaysExtra} hari tambahan (Logistik Lintas Wilayah).
                        </Text>
                      )}
                    </View>

                    <View className={styles.actionColumn}>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleOpenMap(coop);
                        }}
                        className={styles.mapBtn}
                      >
                        <SymbolView name="map.fill" size={12} tintColor="#047857" />
                        <Text className={styles.mapBtnText}>Peta</Text>
                      </Pressable>

                      {isActive && (
                        <View className={styles.selectedIndicator}>
                          <SymbolView name="checkmark.circle.fill" size={16} tintColor="#059669" />
                          <Text className={styles.selectedIndicatorText}>Aktif</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

          </Pressable>
        </Pressable>
      </Modal>

      {/* Real Maps Modal */}
      {selectedCoopForMap && (
        <Modal
          visible={mapVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMapVisible(false)}
        >
          <Pressable
            onPress={() => setMapVisible(false)}
            className={styles.mapOverlay}
          >
            <Pressable onPress={() => {}} className={styles.mapWindow}>
              
              {/* Map Header */}
              <View className={styles.mapHeader}>
                <View style={{ flex: 1 }}>
                  <Text className={styles.mapTitle}>
                    {isNationalView ? "Peta Koperasi Nusantara (Indonesia)" : "Peta Google Maps Terintegrasi"}
                  </Text>
                  <Text className={styles.mapSubtitle}>
                    {isNationalView ? "Menampilkan sebaran Kopdes antar pulau" : selectedCoopForMap.name}
                  </Text>
                </View>
                <Pressable onPress={() => setMapVisible(false)} className={styles.closeButton}>
                  <SymbolView name="xmark" size={14} tintColor="#555" />
                </Pressable>
              </View>

              {/* MAP SCOPE TOGGLE CONTROLS */}
              <View className={styles.mapScopeBar}>
                <Pressable
                  onPress={() => setIsNationalView(false)}
                  className={cn(styles.scopeBtn, !isNationalView && styles.scopeBtnActive)}
                >
                  <SymbolView name="mappin.circle.fill" size={11} tintColor={!isNationalView ? "#fff" : "#666"} />
                  <Text className={cn(styles.scopeBtnText, !isNationalView && styles.scopeBtnTextActive)}>Fokus Terdekat (Bali)</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsNationalView(true)}
                  className={cn(styles.scopeBtn, isNationalView && styles.scopeBtnActive)}
                >
                  <SymbolView name="network" size={11} tintColor={isNationalView ? "#fff" : "#666"} />
                  <Text className={cn(styles.scopeBtnText, isNationalView && styles.scopeBtnTextActive)}>Skala Nasional (Nusantara)</Text>
                </Pressable>
              </View>

              {/* REAL INTERACTIVE MAP AREA */}
              <View className={styles.mapArea}>
                {Platform.OS === 'web' ? (
                  <iframe
                    src={
                      isNationalView
                        ? `https://maps.google.com/maps?q=-2.548926,118.014863&t=&z=4&ie=UTF8&iwloc=&output=embed`
                        : `https://maps.google.com/maps?q=${selectedCoopForMap.latitude},${selectedCoopForMap.longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`
                    }
                    style={{ width: '100%', height: '100%', border: 0 }}
                  />
                ) : Platform.OS === 'android' ? (
                  <OpenStreetMapView
                    region={
                      isNationalView
                        ? {
                            latitude: -2.548926,
                            longitude: 118.014863,
                            latitudeDelta: 16.0,
                            longitudeDelta: 28.0,
                          }
                        : {
                            latitude: selectedCoopForMap.latitude,
                            longitude: selectedCoopForMap.longitude,
                            latitudeDelta: 0.03,
                            longitudeDelta: 0.03,
                          }
                    }
                    markers={[
                      ...(!isNationalView
                        ? [{
                            coordinate: { latitude: -8.409512, longitude: 115.188912 },
                            title: 'Lokasi Anda',
                            description: 'Rumah Anda di Desa Sukamaju',
                            color: '#2563eb',
                            type: 'user' as const,
                          }]
                        : []),
                      ...cooperatives.map((coop) => ({
                        coordinate: { latitude: coop.latitude, longitude: coop.longitude },
                        title: coop.name,
                        description: `${coop.address} (${coop.distance})`,
                        color: coop.id === selectedCoopForMap.id ? '#dc2626' : '#d97706',
                        type: 'cooperative' as const,
                      })),
                    ]}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : MapView && Marker ? (
                    <MapView
                      initialRegion={
                        isNationalView
                          ? {
                              latitude: -2.548926,
                              longitude: 118.014863,
                              latitudeDelta: 16.0,
                              longitudeDelta: 28.0,
                            }
                          : {
                              latitude: selectedCoopForMap.latitude,
                              longitude: selectedCoopForMap.longitude,
                              latitudeDelta: 0.03,
                              longitudeDelta: 0.03,
                            }
                      }
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* User Location Marker (only relevant on local view) */}
                      {!isNationalView && (
                        <Marker
                          coordinate={{ latitude: -8.409512, longitude: 115.188912 }}
                          title="Lokasi Anda"
                          description="Rumah Anda di Desa Sukamaju"
                          pinColor="blue"
                        />
                      )}
                      
                      {/* All Cooperatives Markers */}
                      {cooperatives.map(c => (
                        <Marker
                          key={c.id}
                          coordinate={{ latitude: c.latitude, longitude: c.longitude }}
                          title={c.name}
                          description={`${c.address} (${c.distance})`}
                          pinColor={c.id === selectedCoopForMap.id ? "red" : "orange"}
                          onPress={() => setSelectedCoopForMap(c)}
                        />
                      ))}
                    </MapView>
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, color: '#666' }}>Peta tidak dapat dimuat</Text>
                    </View>
                  )}
              </View>

              {/* Map Footer Info */}
              <View className={styles.mapFooter}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text className={styles.distanceLabel}>Koperasi Terpilih:</Text>
                  <Text className={styles.distanceValue} numberOfLines={1}>{selectedCoopForMap.name}</Text>
                  <Text className={styles.coopCoords}>
                    {selectedCoopForMap.distance} • Ongkir: Rp{selectedCoopForMap.surcharge.toLocaleString('id-ID')}
                  </Text>
                </View>
                
                <View style={{ gap: 6 }}>
                  {activeCoopId !== selectedCoopForMap.id && (
                    <Pressable
                      onPress={() => {
                        onSelectCoop(selectedCoopForMap.id);
                        setMapVisible(false);
                        onClose();
                      }}
                      className={styles.mapSelectBtn}
                    >
                      <Text className={styles.mapSelectBtnText}>Ganti Ke Koperasi Ini</Text>
                    </Pressable>
                  )}
                  
                  <Pressable
                    onPress={() => handleOpenExternalMap(selectedCoopForMap)}
                    className={styles.gmapsBtn}
                  >
                    <SymbolView name="safari" size={10} tintColor="#fff" />
                    <Text className={styles.gmapsBtnText}>Rute Peta</Text>
                  </Pressable>
                </View>
              </View>

            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = {
  overlay: 'flex-1 bg-black/60 justify-end',
  content: 'bg-stone-50 rounded-t-3xl p-5 h-[70%] border-t border-stone-200',
  header: 'flex-row justify-between items-center border-b border-stone-200 pb-3 mb-3',
  title: 'text-emerald-950 font-black text-base',
  subtitle: 'text-stone-500 text-[10px] mt-0.5',
  closeButton: 'p-1.5 rounded-full bg-stone-200',
  nationalMapBanner: 'bg-sky-600 rounded-2xl p-3 flex-row items-center gap-2.5 mb-3.5',
  nationalMapBannerTitle: 'text-white text-[11px] font-black',
  nationalMapBannerSubtitle: 'text-sky-100 text-[8.5px] mt-0.5',
  coopCard: 'bg-white border border-stone-200 rounded-2xl p-3.5 mb-3 flex-row items-center gap-3 shadow-sm elevation-1',
  activeCard: 'border-emerald-600 bg-emerald-50/60 border-2 shadow-sm',
  coopName: 'text-xs font-black text-stone-900',
  activeTextGreen: 'text-emerald-950',
  activeTag: 'bg-emerald-600 px-1.5 py-0.5 rounded',
  activeTagText: 'text-white text-[7px] font-bold',
  islandTag: 'bg-sky-600 px-1.5 py-0.5 rounded',
  islandTagText: 'text-white text-[7px] font-bold',
  coopAddress: 'text-[10px] text-stone-500 mt-0.5',
  statsRow: 'flex-row flex-wrap gap-2 mt-2',
  statItem: 'flex-row items-center gap-1 bg-stone-100 px-1.5 py-0.5 rounded-md border border-stone-200',
  statText: 'text-[9px] text-stone-700 font-bold',
  deliveryWarning: 'text-[9px] text-amber-700 font-bold mt-2',
  actionColumn: 'items-end gap-2.5 min-w-[80px]',
  mapBtn: 'flex-row items-center gap-1 border border-emerald-200 bg-emerald-50 px-2 py-1 rounded-lg',
  mapBtnText: 'text-emerald-700 text-[9px] font-bold',
  selectedIndicator: 'flex-row items-center gap-1',
  selectedIndicatorText: 'text-emerald-600 text-[9px] font-bold',
  mapOverlay: 'flex-1 bg-black/70 justify-center items-center p-5',
  mapWindow: 'w-full h-[70%] bg-stone-50 rounded-3xl border border-stone-200 overflow-hidden',
  mapHeader: 'flex-row justify-between items-center p-4 border-b border-stone-200 bg-white',
  mapTitle: 'text-xs font-black text-emerald-950',
  mapSubtitle: 'text-[10px] text-stone-500 mt-0.5',
  mapScopeBar: 'flex-row bg-stone-100 p-1 border-b border-stone-200 justify-between gap-1',
  scopeBtn: 'flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-lg bg-white border border-stone-300',
  scopeBtnActive: 'bg-emerald-600 border-emerald-700',
  scopeBtnText: 'text-[9.5px] font-semibold text-stone-700',
  scopeBtnTextActive: 'text-white font-bold',
  mapArea: 'flex-1 bg-slate-200 relative overflow-hidden',
  mapFooter: 'bg-white p-3 border-t border-stone-200 flex-row items-center justify-between',
  distanceLabel: 'text-[8px] font-bold text-stone-400 uppercase',
  distanceValue: 'text-xs font-black text-emerald-950',
  coopCoords: 'text-[8px] text-stone-500 mt-0.5',
  mapSelectBtn: 'bg-emerald-600 px-2.5 py-1.5 rounded-lg items-center',
  mapSelectBtnText: 'text-white text-[9px] font-black',
  gmapsBtn: 'flex-row items-center justify-center gap-1 bg-orange-600 px-2.5 py-1.5 rounded-lg',
  gmapsBtnText: 'text-white text-[9px] font-bold',
};
