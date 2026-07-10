import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Platform, StyleSheet } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { SymbolView } from 'expo-symbols';

export default function Header() {
  const { 
    activeRole, 
    activeUser, 
    allUsers, 
    setActiveRole, 
    setActiveUser, 
    resetAllData, 
    isLoading 
  } = useApp();
  
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN': 
        return {
          bg: '#fef3c7', // amber-100
          text: '#92400e', // amber-800
          border: '#fde68a', // amber-200
        };
      case 'RT_AGENT': 
        return {
          bg: '#dbeafe', // blue-100
          text: '#1e40af', // blue-800
          border: '#bfdbfe', // blue-200
        };
      default: 
        return {
          bg: '#d1fae5', // emerald-100
          text: '#065f46', // emerald-800
          border: '#a7f3d0', // emerald-200
        };
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin Koperasi';
      case 'RT_AGENT': return 'RT Agent';
      default: return 'Warga Digital';
    }
  };

  const handleRoleSelect = (role: 'USER' | 'RT_AGENT' | 'ADMIN', user: any) => {
    setActiveRole(role);
    setActiveUser(user);
    setRoleModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.logoContainer}>
          <View style={styles.cartBadge}>
            <SymbolView name="cart.fill" size={18} tintColor="#064e3b" />
          </View>
          <View>
            <Text style={styles.logoText}>
              KopMart <Text style={styles.goldText}>RT</Text>
            </Text>
            <Text style={styles.subLogoText}>SIMKOPDES 2026 - Pilar 1</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          {/* Reset Demo Button */}
          <Pressable 
            onPress={resetAllData}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && { backgroundColor: '#022d20' },
              isLoading && { opacity: 0.5 }
            ]}
          >
            <SymbolView name="arrow.clockwise" size={16} tintColor="#f59e0b" />
          </Pressable>

          {/* User Role Switcher Profile Button */}
          <Pressable 
            onPress={() => setRoleModalVisible(true)}
            style={({ pressed }) => [
              styles.profileButton,
              pressed && { backgroundColor: '#022d20' }
            ]}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {activeUser?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {activeUser?.name || 'Loading'}
              </Text>
              <Text style={styles.profileRole}>
                {activeRole === 'USER' ? 'Warga' : activeRole === 'RT_AGENT' ? 'RT Agent' : 'Admin'}
              </Text>
            </View>
            <SymbolView name="chevron.down" size={10} tintColor="#fbbf24" />
          </Pressable>
        </View>
      </View>

      {/* Demo helper banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Demo: <Text style={styles.boldWhite}>{activeUser?.cooperative_id === 'tenant-1' ? 'Kop. Merah Putih Sukamaju' : 'Koperasi Local'}</Text> 
          {activeUser?.rt_id ? ` • ${activeUser.rt_id}` : ''}
        </Text>
        <Pressable onPress={() => setRoleModalVisible(true)}>
          <Text style={styles.changeRoleText}>Ganti Peran</Text>
        </Pressable>
      </View>

      {/* Role Picker Modal */}
      <Modal
        visible={roleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Peran Demo Hackathon</Text>
              <Pressable 
                onPress={() => setRoleModalVisible(false)}
                style={styles.closeButton}
              >
                <SymbolView name="xmark" size={16} tintColor="#444" />
              </Pressable>
            </View>
            
            <Text style={styles.modalSub}>
              Pilih salah satu user di bawah ini untuk melihat antarmuka spesifik peran mereka dan jalankan demo transaksi end-to-end.
            </Text>

            <ScrollView>
              {allUsers.map((user) => {
                const isSelected = activeUser?.id === user.id;
                const badgeStyle = getRoleBadgeStyle(user.role);
                return (
                  <Pressable
                    key={user.id}
                    onPress={() => {
                      if (user.role === 'ADMIN') handleRoleSelect('ADMIN', user);
                      else if (user.role === 'RT_AGENT') handleRoleSelect('RT_AGENT', user);
                      else handleRoleSelect('USER', user);
                    }}
                    style={({ pressed }) => [
                      isSelected ? styles.userCardSelected : styles.userCard,
                      pressed && { backgroundColor: '#f5f5f4' }
                    ]}
                  >
                    <View style={styles.userCardInner}>
                      <View style={isSelected ? styles.userAvatarSelected : styles.userAvatar}>
                        <Text style={isSelected ? styles.userAvatarTextSelected : styles.userAvatarText}>
                          {user.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <Text style={isSelected ? styles.userNameSelected : styles.userName}>
                            {user.name}
                          </Text>
                          <View style={[
                            styles.inlineBadge, 
                            { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }
                          ]}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: badgeStyle.text }}>
                              {getRoleLabel(user.role)}
                            </Text>
                          </View>
                          {user.id === 'user-sari' && (
                            <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: '#92400e', fontSize: 7, fontWeight: 'bold' }}>KARTU ONLY</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.userPhone}>
                          Telp: {user.phone} {user.rt_id ? `• ${user.rt_id}` : ''}
                        </Text>
                        {user.role === 'USER' && (
                          <Text style={styles.userPoints}>
                            Dompet Poin: {user.points} Poin
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingRight: 4 }}>
                      {isSelected ? (
                        <SymbolView name="checkmark.circle.fill" size={20} tintColor="#059669" />
                      ) : (
                        <SymbolView name="circle" size={20} tintColor="#d1d5db" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#064e3b', // emerald-900
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#065f46', // emerald-800
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBadge: {
    backgroundColor: '#fbbf24', // amber-400
    padding: 8,
    borderRadius: 12,
  },
  logoText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
  },
  goldText: {
    color: '#fbbf24',
  },
  subLogoText: {
    color: '#a7f3d0', // emerald-200
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetButton: {
    padding: 8,
    backgroundColor: '#065f46', // emerald-800
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#047857', // emerald-700
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065f46', // emerald-800
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#047857', // emerald-700
    gap: 8,
  },
  avatarCircle: {
    width: 20,
    height: 20,
    backgroundColor: '#fbbf24', // amber-400
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#064e3b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  profileInfo: {
    alignItems: 'flex-start',
  },
  profileName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 16,
    maxWidth: 80,
  },
  profileRole: {
    fontSize: 9,
    color: '#fcd34d', // amber-300
    fontWeight: '500',
  },
  banner: {
    marginTop: 12,
    backgroundColor: 'rgba(2, 45, 32, 0.4)', // bg-emerald-950/40
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(2, 45, 32, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerText: {
    color: '#a7f3d0', // emerald-200
    fontSize: 10,
  },
  boldWhite: {
    color: '#fff',
    fontWeight: 'bold',
  },
  changeRoleText: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 10,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#fafaf9', // stone-50
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4', // stone-200
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    color: '#064e3b',
    fontWeight: '900',
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
    borderRadius: 9999,
    backgroundColor: '#e7e5e4',
  },
  modalSub: {
    color: '#78716c', // stone-500
    fontSize: 12,
    marginBottom: 16,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderColor: '#e7e5e4',
  },
  userCardSelected: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 5,
    borderLeftColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#f0fdf4', // Soft emerald wash
    borderColor: '#a7f3d0', // emerald-200
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  userCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e7e5e4',
  },
  userAvatarSelected: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669', // emerald-600
  },
  userAvatarText: {
    fontWeight: 'bold',
    color: '#444',
  },
  userAvatarTextSelected: {
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontWeight: 'bold',
    color: '#1c1917',
  },
  userNameSelected: {
    fontWeight: 'bold',
    color: '#064e3b',
  },
  userPhone: {
    fontSize: 11,
    color: '#78716c',
  },
  userPoints: {
    fontSize: 10,
    color: '#d97706',
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  inlineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  activeText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 6,
  }
});
