import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, ScrollView, Alert, Linking, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';

// Conditional imports for native maps
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  try {
    const MapModule = require('react-native-maps');
    MapView = MapModule.default || MapModule;
    Marker = MapModule.Marker;
  } catch (e) {
    console.warn("react-native-maps not available, using web/fallback");
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

  // Re-center when map selection changes
  useEffect(() => {
    if (selectedCoopForMap) {
      // If it's a distant coop, default to national view first so they can see where it is
      const isFar = selectedCoopForMap.id === 'tenant-4' || selectedCoopForMap.id === 'tenant-5' || selectedCoopForMap.id === 'tenant-6';
      setIsNationalView(isFar);
    }
  }, [selectedCoopForMap]);

  const handleOpenMap = (coop: CooperativeItem) => {
    setSelectedCoopForMap(coop);
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
        <View style={styles.overlay}>
          <View style={styles.content}>
            
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Pilih Lokasi Koperasi Desa</Text>
                <Text style={styles.subtitle}>Bandingkan ketersediaan stok & jarak pengiriman</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <SymbolView name="xmark" size={14} tintColor="#555" />
              </Pressable>
            </View>

            {/* Nusantara map shortcut */}
            <Pressable 
              onPress={handleOpenNationalMap}
              style={styles.nationalMapBanner}
            >
              <SymbolView name="network" size={16} tintColor="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.nationalMapBannerTitle}>Lihat Seluruh Koperasi Nusantara</Text>
                <Text style={styles.nationalMapBannerSubtitle}>Peta sebaran Kopdes antar pulau di Indonesia</Text>
              </View>
              <SymbolView name="chevron.right" size={12} tintColor="#fff" />
            </Pressable>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {cooperatives.map((coop) => {
                const isActive = coop.id === activeCoopId;
                const isFar = coop.id === 'tenant-4' || coop.id === 'tenant-5' || coop.id === 'tenant-6';
                
                return (
                  <View 
                    key={coop.id}
                    style={[
                      styles.coopCard,
                      isActive && styles.activeCard
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={[styles.coopName, isActive && styles.activeTextGreen]}>
                          {coop.name}
                        </Text>
                        {isActive && (
                          <View style={styles.activeTag}>
                            <Text style={styles.activeTagText}>AKTIF</Text>
                          </View>
                        )}
                        {isFar && (
                          <View style={styles.islandTag}>
                            <Text style={styles.islandTagText}>LUAR PULAU</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={styles.coopAddress}>{coop.address}</Text>
                      
                      <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                          <SymbolView name="mappin.and.ellipse" size={11} tintColor="#d97706" />
                          <Text style={styles.statText}>{coop.distance}</Text>
                        </View>
                        {coop.surcharge > 0 && (
                          <View style={styles.statItem}>
                            <SymbolView name="shippingbox" size={11} tintColor="#059669" />
                            <Text style={styles.statText}>Ongkir +Rp{coop.surcharge.toLocaleString('id-ID')}</Text>
                          </View>
                        )}
                      </View>

                      {coop.deliveryDaysExtra > 0 && (
                        <Text style={styles.deliveryWarning}>
                          🕒 Pengiriman memerlukan +{coop.deliveryDaysExtra} hari tambahan (Logistik Lintas Wilayah).
                        </Text>
                      )}
                    </View>

                    <View style={styles.actionColumn}>
                      <Pressable
                        onPress={() => handleOpenMap(coop)}
                        style={styles.mapBtn}
                      >
                        <SymbolView name="map.fill" size={12} tintColor="#047857" />
                        <Text style={styles.mapBtnText}>Peta</Text>
                      </Pressable>

                      {!isActive ? (
                        <Pressable
                          onPress={() => {
                            onSelectCoop(coop.id);
                            onClose();
                          }}
                          style={styles.selectBtn}
                        >
                          <Text style={styles.selectBtnText}>Pilih</Text>
                        </Pressable>
                      ) : (
                        <View style={styles.selectedIndicator}>
                          <SymbolView name="checkmark.circle.fill" size={16} tintColor="#059669" />
                          <Text style={styles.selectedIndicatorText}>Aktif</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Real Maps Modal */}
      {selectedCoopForMap && (
        <Modal
          visible={mapVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMapVisible(false)}
        >
          <View style={styles.mapOverlay}>
            <View style={styles.mapWindow}>
              
              {/* Map Header */}
              <View style={styles.mapHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapTitle}>
                    {isNationalView ? "Peta Koperasi Nusantara (Indonesia)" : "Peta Google Maps Terintegrasi"}
                  </Text>
                  <Text style={styles.mapSubtitle}>
                    {isNationalView ? "Menampilkan sebaran Kopdes antar pulau" : selectedCoopForMap.name}
                  </Text>
                </View>
                <Pressable onPress={() => setMapVisible(false)} style={styles.closeButton}>
                  <SymbolView name="xmark" size={14} tintColor="#555" />
                </Pressable>
              </View>

              {/* MAP SCOPE TOGGLE CONTROLS */}
              <View style={styles.mapScopeBar}>
                <Pressable
                  onPress={() => setIsNationalView(false)}
                  style={[styles.scopeBtn, !isNationalView && styles.scopeBtnActive]}
                >
                  <SymbolView name="mappin.circle.fill" size={11} tintColor={!isNationalView ? "#fff" : "#666"} />
                  <Text style={[styles.scopeBtnText, !isNationalView && styles.scopeBtnTextActive]}>Fokus Terdekat (Bali)</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsNationalView(true)}
                  style={[styles.scopeBtn, isNationalView && styles.scopeBtnActive]}
                >
                  <SymbolView name="network" size={11} tintColor={isNationalView ? "#fff" : "#666"} />
                  <Text style={[styles.scopeBtnText, isNationalView && styles.scopeBtnTextActive]}>Skala Nasional (Nusantara)</Text>
                </Pressable>
              </View>

              {/* REAL INTERACTIVE MAP AREA */}
              <View style={styles.mapArea}>
                {Platform.OS === 'web' ? (
                  <iframe
                    src={
                      isNationalView
                        ? `https://maps.google.com/maps?q=-2.548926,118.014863&t=&z=4&ie=UTF8&iwloc=&output=embed`
                        : `https://maps.google.com/maps?q=${selectedCoopForMap.latitude},${selectedCoopForMap.longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`
                    }
                    style={{ width: '100%', height: '100%', border: 0 }}
                  />
                ) : (
                  MapView && Marker ? (
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
                  )
                )}
              </View>

              {/* Map Footer Info */}
              <View style={styles.mapFooter}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.distanceLabel}>Koperasi Terpilih:</Text>
                  <Text style={styles.distanceValue} numberOfLines={1}>{selectedCoopForMap.name}</Text>
                  <Text style={styles.coopCoords}>
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
                      style={styles.mapSelectBtn}
                    >
                      <Text style={styles.mapSelectBtnText}>Ganti Ke Koperasi Ini</Text>
                    </Pressable>
                  )}
                  
                  <Pressable
                    onPress={() => handleOpenExternalMap(selectedCoopForMap)}
                    style={styles.gmapsBtn}
                  >
                    <SymbolView name="safari" size={10} tintColor="#fff" />
                    <Text style={styles.gmapsBtnText}>Rute Peta</Text>
                  </Pressable>
                </View>
              </View>

            </View>
          </View>
        </Modal>
      )}
    </View>
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
    height: '70%',
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
    marginBottom: 12,
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
  nationalMapBanner: {
    backgroundColor: '#0284c7', // light-blue-600
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  nationalMapBannerTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'black',
  },
  nationalMapBannerSubtitle: {
    color: '#e0f2fe',
    fontSize: 8.5,
    marginTop: 1,
  },
  coopCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  activeCard: {
    borderColor: '#10b981', // emerald-500
    backgroundColor: '#f0fdf4', // emerald-50
    borderLeftWidth: 5,
    borderLeftColor: '#059669',
  },
  coopName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1c1917',
  },
  activeTextGreen: {
    color: '#064e3b',
  },
  activeTag: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeTagText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
  },
  islandTag: {
    backgroundColor: '#0284c7', // blue
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  islandTagText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
  },
  coopAddress: {
    fontSize: 10,
    color: '#78716c',
    marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f4',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#e7e5e4',
  },
  statText: {
    fontSize: 9,
    color: '#44403c',
    fontWeight: 'bold',
  },
  deliveryWarning: {
    fontSize: 9,
    color: '#b45309', // amber-700
    fontWeight: 'bold',
    marginTop: 8,
  },
  actionColumn: {
    alignItems: 'flex-end',
    gap: 10,
    minWidth: 80,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mapBtnText: {
    color: '#047857',
    fontSize: 9,
    fontWeight: 'bold',
  },
  selectBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedIndicatorText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  // MAP MODAL STYLES
  mapOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapWindow: {
    width: '100%',
    height: '70%',
    backgroundColor: '#fafaf9',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    backgroundColor: '#fff',
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#064e3b',
  },
  mapSubtitle: {
    fontSize: 10,
    color: '#78716c',
    marginTop: 2,
  },
  mapScopeBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f4',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    justifyContent: 'space-between',
    gap: 4,
  },
  scopeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#d6d3d1',
  },
  scopeBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  scopeBtnText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#44403c',
  },
  scopeBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  mapFooter: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distanceLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#a8a29e',
    textTransform: 'uppercase',
  },
  distanceValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#064e3b',
  },
  coopCoords: {
    fontSize: 8,
    color: '#78716c',
    marginTop: 2,
  },
  mapSelectBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapSelectBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'black',
  },
  gmapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ea580c', // Orange google maps style button
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  gmapsBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  }
});
