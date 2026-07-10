import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image, Modal, Alert } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { dbService, User, Product, RTBatch, Order, Settlement } from '@/utils/db';
import { SymbolView } from 'expo-symbols';

export default function RTAgentPortal() {
  const {
    activeUser,
    products,
    batches,
    orders,
    settlements,
    createBatch,
    lockBatch,
    submitBatch,
    markItemPickedUp,
    submitSettlement,
    checkout,
    allUsers,
    refreshData,
    cart,
    clearCart,
    addToCart
  } = useApp();

  const [subTab, setSubTab] = useState(0); // 0: Batch, 1: Bantu Belanja, 2: Penyelesaian
  
  // Tab 0 states
  const [createBatchOpen, setCreateBatchOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('Order Pekanan RT 03');
  const [newBatchDeadline, setNewBatchDeadline] = useState(new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0]);
  const [newBatchPickup, setNewBatchPickup] = useState('Balai RT 03');

  // Tab 1 states: Assisted Order
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<User | null>(null);
  const [assistedCart, setAssistedCart] = useState<{ [prodId: string]: number }>({});
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isCardScanned, setIsCardScanned] = useState(false);

  // Tab 2 states: Settlements
  const [settlementSubmitOpen, setSettlementSubmitOpen] = useState(false);
  const [activeSettlement, setActiveSettlement] = useState<Settlement | null>(null);
  const [cashSubmitted, setCashSubmitted] = useState('');

  // Filter batches for RT Agent's unit
  const agentRT = activeUser?.rt_id || 'RT 03';
  const myBatches = batches.filter(b => b.rt_id === agentRT);
  const activeBatch = myBatches.find(b => b.status === 'OPEN' || b.status === 'LOCKED' || b.status === 'SUBMITTED' || b.status === 'PROCESSING' || b.status === 'DELIVERED_TO_RT');

  // Get orders linked to active batch
  const batchOrders = activeBatch ? orders.filter(o => o.rt_batch_id === activeBatch.id) : [];

  // Cart operations for assisted order
  const updateAssistedQty = (productId: string, delta: number, maxStock: number) => {
    setAssistedCart(prev => {
      const current = prev[productId] || 0;
      const target = current + delta;
      if (target <= 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: Math.min(target, maxStock) };
    });
  };

  const calculateAssistedTotal = () => {
    let sub = 0;
    Object.keys(assistedCart).forEach(pId => {
      const p = products.find(prod => prod.id === pId);
      if (p) sub += p.price * assistedCart[pId];
    });
    return sub;
  };

  const handleCreateBatch = async () => {
    if (!newBatchName.trim() || !newBatchPickup.trim()) return;
    try {
      await createBatch(newBatchName, newBatchDeadline, newBatchPickup);
      setCreateBatchOpen(false);
      Alert.alert("Sukses", "Batch Group Order baru berhasil dibuka!");
    } catch (err) {
      Alert.alert("Gagal", "Gagal membuat batch.");
    }
  };

  // Scanner Simulator Card Scan
  const simulateCardScan = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setSelectedResident(user);
      setIsCardScanned(true);
      setIsScannerOpen(false);
      setAssistedCart({});
      Alert.alert("Kartu Kopdes Terdeteksi", `Profil Warga Berhasil Dimuat: ${user.name}`);
    }
  };

  const handleAssistedCheckout = () => {
    if (Object.keys(assistedCart).length === 0 || !selectedResident) return;
    setPinInput('');
    setPinModalOpen(true);
  };

  const submitPinVerification = async () => {
    if (!selectedResident) return;
    
    // Verify PIN: Bu Sari = 000000, others check database
    if (pinInput !== selectedResident.pin) {
      Alert.alert("Gagal Verifikasi", "PIN yang Anda masukkan salah. Silakan coba lagi.");
      return;
    }

    setPinModalOpen(false);

    try {
      // Temporarily store original cart, seed AppContext cart with assisted cart items, checkout, then restore
      // Since AppContext manages checkout on the current 'cart' state, let's inject assisted items into active cart
      // To prevent race conditions, let's write a simple sequence:
      // 1. Clear cart
      // 2. Add each item
      // 3. Call checkout
      // This is a direct "/caveman" approach that reuses our context logic flawlessly!
      
      const prevCart = [...cart];
      await clearCart();
      
      for (const pId of Object.keys(assistedCart)) {
        const product = products.find(p => p.id === pId);
        if (product) {
          await addToCart(product, assistedCart[pId]);
        }
      }

      // Determine channel
      const channel = isCardScanned ? 'CARD_PURCHASE' : 'RT_ASSISTED';
      const batchId = activeBatch && activeBatch.status === 'OPEN' ? activeBatch.id : null;

      const res = await checkout(
        'RT_PICKUP_POINT',
        channel,
        0, // No points redemption for offline card/assisted order for now
        batchId,
        selectedResident.id
      );

      if (res.success) {
        setAssistedCart({});
        setSelectedResident(null);
        setIsCardScanned(false);
        Alert.alert("Sukses", `Pesanan atas nama ${selectedResident.name} berhasil didaftarkan!`);
        await refreshData();
      } else {
        Alert.alert("Gagal Checkout", res.error || "Gagal memproses pesanan.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Terjadi kesalahan.");
    }
  };

  const handleLockBatch = async (id: string) => {
    await lockBatch(id);
    Alert.alert("Terkunci", "Batch berhasil dikunci. Warga tidak dapat menambah pesanan.");
  };

  const handleSubmitBatch = async (id: string) => {
    await submitBatch(id);
    Alert.alert("Terkirim", "Batch berhasil dikirim ke Admin Koperasi.");
  };

  const handleResidentPickup = async (orderId: string) => {
    await markItemPickedUp(orderId);
    Alert.alert("Pesanan Diambil", "Status pesanan diupdate menjadi SELESAI, poin rewards telah dicairkan.");
  };

  // Open Settlement Modal
  const openSettlementSubmit = (batch: RTBatch) => {
    const set = settlements.find(s => s.rt_batch_id === batch.id);
    if (set) {
      setActiveSettlement(set);
      setCashSubmitted(String(batch.total_gmv));
      setSettlementSubmitOpen(true);
    } else {
      Alert.alert("Info", "Settlement data belum digenerate oleh sistem.");
    }
  };

  const handleSubmitSettlement = async () => {
    if (!activeSettlement) return;
    const cash = parseFloat(cashSubmitted);
    if (isNaN(cash) || cash < 0) {
      Alert.alert("Error", "Jumlah setoran tidak valid.");
      return;
    }

    await submitSettlement(activeSettlement.id, cash);
    setSettlementSubmitOpen(false);
    Alert.alert("Sukses", `Setoran uang tunai sebesar Rp${cash.toLocaleString('id-ID')} telah dikirim ke Koperasi.`);
  };

  // UI status color helper for batches
  const getBatchStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Pendaftaran Dibuka';
      case 'LOCKED': return 'Terkunci (Verifikasi RT)';
      case 'SUBMITTED': return 'Menunggu Konfirmasi Koperasi';
      case 'PROCESSING': return 'Sedang Dikemas Koperasi';
      case 'DELIVERED_TO_RT': return 'Barang Tiba di RT (Siap Ambil)';
      case 'COMPLETED': return 'Selesai & Lunas';
      default: return 'Batal';
    }
  };

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'LOCKED': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELIVERED_TO_RT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-stone-100 text-stone-700 border-stone-200';
      default: return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  // Render Batch
  const renderBatch = () => (
    <ScrollView className="flex-1 bg-stone-50" contentContainerClassName="p-4 pb-28">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-stone-900 font-black text-lg">Batch Group Order {agentRT}</Text>
        {!activeBatch && (
          <Pressable
            onPress={() => setCreateBatchOpen(true)}
            className="bg-emerald-700 px-4 py-2 rounded-xl flex-row items-center gap-1.5 active:bg-emerald-950"
          >
            <SymbolView name="plus" size={12} tintColor="#fff" />
            <Text className="text-white text-xs font-bold">Buka Batch Baru</Text>
          </Pressable>
        )}
      </View>

      {myBatches.length === 0 ? (
        <View className="bg-white p-8 border border-stone-200 rounded-xl items-center justify-center mt-4">
          <SymbolView name="folder.badge.plus" size={32} tintColor="#ccc" />
          <Text className="text-stone-500 text-xs mt-2 text-center">Belum ada riwayat batch order di RT ini.</Text>
        </View>
      ) : (
        [...myBatches].reverse().map(b => (
          <View key={b.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-3">
            <View className="flex-row justify-between items-start border-b border-stone-100 pb-2 mb-2">
              <View>
                <Text className="text-stone-900 font-bold text-sm">{b.name}</Text>
                <Text className="text-stone-400 text-[10px] mt-0.5">Tenggat: {new Date(b.deadline).toLocaleDateString('id-ID')}</Text>
              </View>
              <View className={`px-2.5 py-0.5 rounded-full border ${getBatchStatusColor(b.status)}`}>
                <Text className="text-[8px] font-bold">{getBatchStatusLabel(b.status)}</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center mt-2.5">
              <View>
                <Text className="text-stone-500 text-[10px]">Total Pesanan: <Text className="font-bold text-stone-800">{b.total_orders} Warga</Text></Text>
                <Text className="text-stone-500 text-[10px] mt-0.5">Fulfillment: <Text className="font-bold text-stone-800">{b.pickup_point}</Text></Text>
              </View>
              <View className="items-end">
                <Text className="text-stone-500 text-[10px]">Nilai Batch (GMV)</Text>
                <Text className="text-emerald-900 font-black text-sm">Rp{b.total_gmv.toLocaleString('id-ID')}</Text>
              </View>
            </View>

            {/* Actions for current active batch */}
            <View className="flex-row justify-end gap-2 border-t border-stone-100 pt-3 mt-3">
              {b.status === 'OPEN' && (
                <Pressable
                  onPress={() => handleLockBatch(b.id)}
                  className="bg-amber-500 px-3 py-1.5 rounded-lg border border-amber-600 active:bg-amber-600"
                >
                  <Text className="text-emerald-950 text-[10px] font-bold">Kunci & Tutup Batch</Text>
                </Pressable>
              )}
              {b.status === 'LOCKED' && (
                <Pressable
                  onPress={() => handleSubmitBatch(b.id)}
                  className="bg-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-800 active:bg-emerald-900"
                >
                  <Text className="text-white text-[10px] font-bold">Kirim ke Koperasi</Text>
                </Pressable>
              )}
              {(b.status === 'DELIVERED_TO_RT' || b.status === 'PROCESSING' || b.status === 'SUBMITTED') && (
                <Pressable
                  onPress={() => setSubTab(2)} // Go to settlement/pickup checklist
                  className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 active:bg-emerald-100"
                >
                  <Text className="text-emerald-800 text-[10px] font-bold">Lihat Checklist Pengambilan</Text>
                </Pressable>
              )}
              {b.status === 'COMPLETED' && (
                <View className="bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                  <Text className="text-stone-500 text-[10px]">Batch Selesai</Text>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  // Render Assisted Order
  const renderBantuBelanja = () => {
    // Exclude admins and RT agents from resident list
    const residents = allUsers.filter(u => u.role === 'USER');

    return (
      <View className="flex-1 pb-16 bg-stone-50">
        {/* Resident Scanner Simulation Box */}
        <View className="bg-white p-4 border-b border-stone-200">
          <Text className="text-stone-900 font-bold text-xs mb-2">Pilih/Scan Kartu Anggota (Warga)</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setIsScannerOpen(true)}
              className="flex-1 bg-emerald-800 border border-emerald-900 rounded-xl py-3 flex-row justify-center items-center gap-2 active:bg-emerald-950"
            >
              <SymbolView name="qrcode.viewfinder" size={16} tintColor="#fff" />
              <Text className="text-white font-bold text-xs">Scan Kartu Kopdes QR</Text>
            </Pressable>

            {/* Manual Selection Dropdown Fallback */}
            <View className="flex-1 bg-stone-100 rounded-xl px-3 border border-stone-200 justify-center">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-[30px] pt-1">
                {residents.map(r => (
                  <Pressable
                    key={r.id}
                    onPress={() => {
                      setSelectedResident(r);
                      setIsCardScanned(false);
                      setAssistedCart({});
                    }}
                    className={`mr-2 px-2.5 py-0.5 rounded border ${
                      selectedResident?.id === r.id ? 'bg-amber-100 border-amber-300' : 'bg-white border-stone-300'
                    }`}
                  >
                    <Text className="text-[10px] font-bold text-stone-700">{r.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Selected Warga Info */}
        {selectedResident ? (
          <View className="bg-white px-4 py-3 border-b border-stone-200 flex-row justify-between items-center">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-amber-100 w-8 h-8 rounded-full items-center justify-center">
                <Text className="text-amber-900 font-bold text-xs">{selectedResident.name.charAt(0)}</Text>
              </View>
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-stone-950 font-bold text-xs">{selectedResident.name}</Text>
                  {isCardScanned && (
                    <View className="bg-emerald-100 px-1 rounded">
                      <Text className="text-emerald-800 text-[8px] font-black">SCAN AKTIF</Text>
                    </View>
                  )}
                </View>
                <Text className="text-stone-400 text-[9px]">ID: {selectedResident.referral_code} • RT: {selectedResident.rt_id || 'Umum'} • Poin: {selectedResident.points}</Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                setSelectedResident(null);
                setAssistedCart({});
              }}
              className="bg-stone-100 px-2 py-1 rounded border border-stone-200"
            >
              <Text className="text-stone-500 text-[9px] font-bold">Batal</Text>
            </Pressable>
          </View>
        ) : (
          <View className="p-8 items-center justify-center">
            <SymbolView name="person.crop.circle.badge.plus" size={32} tintColor="#aaa" />
            <Text className="text-stone-400 text-xs mt-2 text-center">Silakan scan Kartu Kopdes atau pilih nama warga di atas untuk mulai memproses belanjaan mereka.</Text>
          </View>
        )}

        {/* Assisted Catalog grid */}
        {selectedResident && (
          <View className="flex-1">
            <ScrollView className="p-3">
              <Text className="text-stone-500 text-[10px] font-bold mb-2">PILIH PRODUK BELANJA WARGA</Text>
              {products.map(p => {
                const qty = assistedCart[p.id] || 0;
                return (
                  <View key={p.id} className="bg-white p-3 rounded-xl border border-stone-200 mb-2 flex-row justify-between items-center shadow-sm">
                    <View className="flex-row items-center gap-3 flex-1">
                      <Image source={{ uri: p.image_url }} className="w-10 h-10 rounded-lg bg-stone-100" />
                      <View className="flex-1">
                        <Text className="text-stone-900 font-bold text-xs" numberOfLines={1}>{p.name}</Text>
                        <Text className="text-emerald-800 text-[10px] font-bold mt-0.5">Rp{p.price.toLocaleString('id-ID')}</Text>
                        <Text className="text-stone-400 text-[8px]">Stok: {p.stock}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-2">
                      {qty > 0 ? (
                        <>
                          <Pressable 
                            onPress={() => updateAssistedQty(p.id, -1, p.stock)}
                            className="w-6 h-6 rounded-full border border-stone-300 items-center justify-center active:bg-stone-100"
                          >
                            <Text className="text-xs font-bold text-stone-700">-</Text>
                          </Pressable>
                          <Text className="text-xs font-bold text-stone-900 w-5 text-center">{qty}</Text>
                          <Pressable 
                            onPress={() => updateAssistedQty(p.id, 1, p.stock)}
                            className="w-6 h-6 rounded-full border border-stone-300 items-center justify-center active:bg-stone-100"
                          >
                            <Text className="text-xs font-bold text-stone-700">+</Text>
                          </Pressable>
                        </>
                      ) : (
                        <Pressable
                          onPress={() => updateAssistedQty(p.id, 1, p.stock)}
                          disabled={p.stock <= 0}
                          className={`px-3 py-1 rounded-lg border active:bg-emerald-50 ${
                            p.stock > 0 ? 'border-emerald-600 bg-white' : 'border-stone-200 bg-stone-50'
                          }`}
                        >
                          <Text className={`text-[10px] font-bold ${p.stock > 0 ? 'text-emerald-800' : 'text-stone-400'}`}>
                            {p.stock > 0 ? 'Pilih' : 'Habis'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Assisted checkout bar */}
            {calculateAssistedTotal() > 0 && (
              <View className="bg-white border-t border-stone-200 p-3 shadow-lg flex-row justify-between items-center px-4">
                <View>
                  <Text className="text-stone-500 text-[9px]">Total Belanja Warga</Text>
                  <Text className="text-emerald-800 font-black text-sm">Rp{calculateAssistedTotal().toLocaleString('id-ID')}</Text>
                  {activeBatch && activeBatch.status === 'OPEN' && (
                    <Text className="text-amber-600 text-[8px] font-bold">Akan digabung ke batch {activeBatch.name}</Text>
                  )}
                </View>
                <Pressable 
                  onPress={handleAssistedCheckout}
                  className="bg-emerald-700 border border-emerald-800 px-5 py-2 rounded-xl active:bg-emerald-950"
                >
                  <Text className="text-white font-bold text-xs">Minta PIN Warga</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Render Settlements and Pickup confirmation
  const renderPenyelesaian = () => {
    // Get orders in this batch that are NOT completed/cancelled yet
    const pendingPickups = batchOrders.filter(o => o.order_status !== 'COMPLETED' && o.order_status !== 'CANCELLED');
    
    // Total cash expected (payment status is unpaid or already paid but waiting settlement)
    const totalCashCollected = batchOrders
      .filter(o => o.order_status === 'COMPLETED' || o.order_status === 'PICKED_UP')
      .reduce((sum, o) => sum + o.total, 0);

    const activeBatchSettlement = activeBatch 
      ? settlements.find(s => s.rt_batch_id === activeBatch.id) 
      : null;

    return (
      <ScrollView className="flex-1 bg-stone-50" contentContainerClassName="p-4 pb-28">
        {!activeBatch ? (
          <View className="bg-white p-8 border border-stone-200 rounded-xl items-center justify-center mt-4">
            <SymbolView name="lock.shield" size={32} tintColor="#ccc" />
            <Text className="text-stone-500 text-xs mt-2 text-center">Buka batch order terlebih dahulu di tab 1.</Text>
          </View>
        ) : (
          <View className="space-y-4">
            {/* Status of Batch */}
            <View className="bg-emerald-900 p-4 rounded-xl text-white shadow-sm border border-emerald-800 mb-4">
              <Text className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">BATCH KONTROL AKTIF</Text>
              <Text className="text-white font-black text-sm mt-0.5">{activeBatch.name}</Text>
              <Text className="text-emerald-100 text-[10px] mt-1">Status Fulfillment Koperasi: <Text className="font-bold text-white">{activeBatch.status}</Text></Text>

              {/* Progress visual helper */}
              <View className="w-full bg-emerald-950 h-1.5 rounded-full mt-3 overflow-hidden">
                <View 
                  className="bg-amber-400 h-full"
                  style={{
                    width: activeBatch.status === 'OPEN' ? '20%' : 
                           activeBatch.status === 'LOCKED' ? '40%' : 
                           activeBatch.status === 'SUBMITTED' ? '60%' : 
                           activeBatch.status === 'PROCESSING' ? '80%' : '100%'
                  }}
                />
              </View>
            </View>

            {/* Resident Pickup Checklist */}
            <Text className="text-stone-900 font-black text-xs">1. Checklist Pengambilan Barang & Pembayaran Tunai Warga</Text>
            
            {activeBatch.status !== 'DELIVERED_TO_RT' && activeBatch.status !== 'PROCESSING' && activeBatch.status !== 'COMPLETED' ? (
              <View className="bg-white p-4 rounded-xl border border-stone-200">
                <Text className="text-stone-400 text-[10px] italic text-center">Checklist pengambilan akan aktif setelah Koperasi mengirimkan barang (Status: Tiba di RT).</Text>
              </View>
            ) : pendingPickups.length === 0 ? (
              <View className="bg-white p-4 rounded-xl border border-stone-200 items-center">
                <SymbolView name="checkmark.circle.fill" size={24} tintColor="#10b981" />
                <Text className="text-stone-700 text-xs font-bold mt-1.5">Semua barang warga telah diambil!</Text>
              </View>
            ) : (
              pendingPickups.map(o => {
                const resident = allUsers.find(u => u.id === o.user_id);
                return (
                  <View key={o.id} className="bg-white p-3 rounded-xl border border-stone-200 mb-2 flex-row justify-between items-center shadow-sm">
                    <View className="flex-1 pr-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-stone-900 font-bold text-xs">{resident?.name}</Text>
                        <View className="bg-amber-100 px-1 rounded">
                          <Text className="text-amber-800 text-[8px] font-bold uppercase">{o.channel.replace('_', ' ')}</Text>
                        </View>
                      </View>
                      <Text className="text-[10px] text-stone-500 mt-1">Metode: COD • Total: <Text className="font-bold text-emerald-800">Rp{o.total.toLocaleString('id-ID')}</Text></Text>
                    </View>
                    
                    <Pressable
                      onPress={() => handleResidentPickup(o.id)}
                      className="bg-emerald-700 border border-emerald-800 px-3 py-1.5 rounded-lg active:bg-emerald-950"
                    >
                      <Text className="text-white text-[9px] font-bold">Terima COD & Serahkan</Text>
                    </Pressable>
                  </View>
                );
              })
            )}

            {/* Settlement summary */}
            <Text className="text-stone-900 font-black text-xs mt-4">2. Rekapitulasi Uang Setoran RT ke Koperasi</Text>
            <View className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-4">
              <View className="flex-row justify-between py-1 border-b border-stone-100 mb-2">
                <Text className="text-stone-500 text-[10px]">Uang Tunai Terkumpul (Dari Warga):</Text>
                <Text className="text-emerald-900 font-black text-xs">Rp{totalCashCollected.toLocaleString('id-ID')}</Text>
              </View>
              <View className="flex-row justify-between py-1 border-b border-stone-100 mb-2">
                <Text className="text-stone-500 text-[10px]">Nilai Target Batch (Expected):</Text>
                <Text className="text-stone-900 font-bold text-xs">Rp{activeBatch.total_gmv.toLocaleString('id-ID')}</Text>
              </View>

              {activeBatchSettlement && (
                <View className="mt-2.5 flex-row justify-between items-center">
                  <View>
                    <Text className="text-stone-500 text-[10px]">Status Setoran:</Text>
                    <Text className={`text-[10px] font-bold ${
                      activeBatchSettlement.status === 'VERIFIED' ? 'text-emerald-600' :
                      activeBatchSettlement.status === 'SUBMITTED' ? 'text-blue-600' : 'text-rose-500'
                    }`}>
                      {activeBatchSettlement.status === 'PENDING' ? 'Belum Disetor' :
                       activeBatchSettlement.status === 'SUBMITTED' ? 'Menunggu Verifikasi Admin' : 'Terverifikasi Koperasi'}
                    </Text>
                  </View>
                  
                  {activeBatchSettlement.status === 'PENDING' && (
                    <Pressable
                      onPress={() => openSettlementSubmit(activeBatch)}
                      className="bg-amber-500 border border-amber-600 px-4 py-2 rounded-xl active:bg-amber-600"
                    >
                      <Text className="text-emerald-950 font-bold text-xs">Setor Tunai</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-stone-100">
      {/* Sub tabs render */}
      {subTab === 0 && renderBatch()}
      {subTab === 1 && renderBantuBelanja()}
      {subTab === 2 && renderPenyelesaian()}

      {/* Sub Tabs Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 h-16 flex-row justify-around items-center">
        <Pressable 
          onPress={() => setSubTab(0)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView 
            name="shippingbox.fill" 
            size={18} 
            tintColor={subTab === 0 ? '#0f5132' : '#888'} 
          />
          <Text className={`text-[10px] mt-1 font-bold ${subTab === 0 ? 'text-emerald-800 font-extrabold' : 'text-stone-400'}`}>
            Batch Order
          </Text>
        </Pressable>

        <Pressable 
          onPress={() => setSubTab(1)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView 
            name="qrcode.viewfinder" 
            size={18} 
            tintColor={subTab === 1 ? '#0f5132' : '#888'} 
          />
          <Text className={`text-[10px] mt-1 font-bold ${subTab === 1 ? 'text-emerald-800 font-extrabold' : 'text-stone-400'}`}>
            Bantu Belanja
          </Text>
        </Pressable>

        <Pressable 
          onPress={() => setSubTab(2)}
          className="items-center justify-center flex-1 h-full active:bg-stone-50"
        >
          <SymbolView 
            name="banknote.fill" 
            size={18} 
            tintColor={subTab === 2 ? '#0f5132' : '#888'} 
          />
          <Text className={`text-[10px] mt-1 font-bold ${subTab === 2 ? 'text-emerald-800 font-extrabold' : 'text-stone-400'}`}>
            Setoran & Pickup
          </Text>
        </Pressable>
      </View>

      {/* Create Batch Modal */}
      <Modal
        visible={createBatchOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCreateBatchOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
              <Text className="text-emerald-950 font-black text-lg">Buka Batch Baru</Text>
              <Pressable onPress={() => setCreateBatchOpen(false)} className="p-1 rounded-full bg-stone-100">
                <SymbolView name="xmark" size={16} tintColor="#555" />
              </Pressable>
            </View>

            <View className="space-y-4">
              <Text className="text-stone-700 text-xs font-bold mb-1">Nama Batch Order</Text>
              <TextInput
                value={newBatchName}
                onChangeText={setNewBatchName}
                placeholder="cth: Belanja Mingguan Warga RT 03"
                className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 mb-3"
              />

              <Text className="text-stone-700 text-xs font-bold mb-1">Tenggat Waktu Order (Deadline)</Text>
              <TextInput
                value={newBatchDeadline}
                onChangeText={setNewBatchDeadline}
                placeholder="YYYY-MM-DD"
                className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 mb-3"
              />

              <Text className="text-stone-700 text-xs font-bold mb-1">Titik Pengambilan Barang (Pickup Point)</Text>
              <TextInput
                value={newBatchPickup}
                onChangeText={setNewBatchPickup}
                placeholder="cth: Balai RT 03 / Rumah Ketua RT"
                className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 mb-4"
              />

              <Pressable
                onPress={handleCreateBatch}
                className="bg-emerald-700 border border-emerald-800 py-3.5 rounded-xl items-center justify-center active:bg-emerald-950"
              >
                <Text className="text-white font-black text-xs">Simpan & Buka Pendaftaran</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Scanner Simulation Modal */}
      <Modal
        visible={isScannerOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsScannerOpen(false)}
      >
        <View className="flex-1 bg-black/85 justify-center items-center p-5">
          <View className="w-64 h-64 border-2 border-dashed border-amber-400 rounded-2xl items-center justify-center mb-6 relative">
            <SymbolView name="qrcode.viewfinder" size={120} tintColor="#fbbf24" />
            <View className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded">
              <Text className="text-amber-400 text-[8px] font-bold">KAMERA SIMULASI AKTIF</Text>
            </View>
          </View>
          
          <Text className="text-white text-center text-sm font-bold mb-1">Pindai Kartu Kopdes Anggota</Text>
          <Text className="text-stone-400 text-center text-xs mb-8 max-w-[280px]">Pilih kartu salah satu warga di bawah ini untuk mensimulasikan pemindaian QR Code fisik kartu mereka.</Text>

          <View className="bg-stone-900 p-4 rounded-2xl w-full max-w-[320px]">
            <Text className="text-stone-400 text-[10px] font-bold mb-3">PILIH KARTU FISIK WARGA UNTUK DISCAN:</Text>
            {allUsers.filter(u => u.role === 'USER').map(user => (
              <Pressable
                key={user.id}
                onPress={() => simulateCardScan(user.id)}
                className="bg-stone-800 p-3 rounded-lg flex-row justify-between items-center mb-2 border border-stone-700 active:bg-stone-700"
              >
                <View>
                  <Text className="text-white font-bold text-xs">{user.name}</Text>
                  <Text className="text-stone-500 text-[9px]">ID: {user.referral_code}</Text>
                </View>
                <View className="bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                  <Text className="text-amber-400 text-[8px] font-bold">SCAN CARD</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setIsScannerOpen(false)}
            className="mt-6 bg-stone-800 px-6 py-2.5 rounded-xl border border-stone-700 active:bg-stone-900"
          >
            <Text className="text-stone-300 text-xs font-bold">Kembali</Text>
          </Pressable>
        </View>
      </Modal>

      {/* PIN Verification Modal */}
      <Modal
        visible={pinModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPinModalOpen(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <View className="bg-white rounded-2xl p-5 w-full max-w-[320px]">
            <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
              <Text className="text-emerald-950 font-black text-sm">Otorisasi PIN Warga</Text>
              <Pressable onPress={() => setPinModalOpen(false)} className="p-1 rounded-full bg-stone-100">
                <SymbolView name="xmark" size={14} tintColor="#555" />
              </Pressable>
            </View>

            <Text className="text-stone-600 text-xs mb-4 text-center">
              Untuk mengamankan transaksi, silakan minta warga (<Text className="font-bold text-stone-900">{selectedResident?.name}</Text>) memasukkan 6-digit PIN Kartu Kopdes mereka.
            </Text>

            {/* Hint for judges/hackathon */}
            <View className="bg-amber-50 p-2.5 rounded border border-amber-250 mb-4">
              <Text className="text-[9px] text-amber-850 font-bold">
                💡 Hint Demo PIN: Dinda = '123456', Bu Sari = '000000', Ibu Rina = '111111'
              </Text>
            </View>

            <TextInput
              secureTextEntry={true}
              keyboardType="number-pad"
              maxLength={6}
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="******"
              className="text-center font-bold text-lg tracking-widest bg-stone-100 border border-stone-200 py-3 rounded-xl mb-4 text-stone-900"
            />

            <Pressable
              onPress={submitPinVerification}
              className="bg-emerald-700 border border-emerald-800 py-3 rounded-xl items-center justify-center active:bg-emerald-950"
            >
              <Text className="text-white font-bold text-xs">Verifikasi & Konfirmasi Belanja</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Cash Settlement Form Modal */}
      <Modal
        visible={settlementSubmitOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSettlementSubmitOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row justify-between items-center border-b border-stone-200 pb-3 mb-4">
              <Text className="text-emerald-950 font-black text-lg">Setor Tunai RT ke Koperasi</Text>
              <Pressable onPress={() => setSettlementSubmitOpen(false)} className="p-1 rounded-full bg-stone-100">
                <SymbolView name="xmark" size={16} tintColor="#555" />
              </Pressable>
            </View>

            <View className="space-y-4">
              <Text className="text-stone-500 text-[10px]">Batch Order Terkait</Text>
              <Text className="text-stone-900 font-bold text-xs bg-stone-100 p-2.5 rounded-lg mb-3">{activeBatch?.name}</Text>

              <View className="flex-row justify-between py-1 border-b border-stone-100 mb-2">
                <Text className="text-stone-500 text-[10px]">Uang Tunai Seharusnya Terkumpul (Expected):</Text>
                <Text className="text-emerald-900 font-extrabold text-xs">Rp{activeBatch?.total_gmv.toLocaleString('id-ID')}</Text>
              </View>

              <Text className="text-stone-700 text-xs font-bold mb-1.5">Jumlah Setoran Uang Fisik (Rp)</Text>
              <TextInput
                value={cashSubmitted}
                onChangeText={setCashSubmitted}
                keyboardType="numeric"
                className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 font-bold mb-4"
              />

              <Text className="text-stone-400 text-[9px] italic mb-4 leading-tight">
                * Dengan menekan Setor, Anda mengonfirmasi penyerahan uang tunai fisik hasil pembayaran warga kepada kasir Koperasi. Admin Koperasi akan memverifikasi kecocokan setoran ini.
              </Text>

              <Pressable
                onPress={handleSubmitSettlement}
                className="bg-emerald-700 border border-emerald-800 py-3.5 rounded-xl items-center justify-center active:bg-emerald-950"
              >
                <Text className="text-white font-black text-xs">Kirim Setoran</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
