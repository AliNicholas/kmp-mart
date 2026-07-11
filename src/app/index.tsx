import { View, ActivityIndicator, Text } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import AuthGateway from '@/components/auth-gateway';
import CitizenPortal from '@/components/portals/CitizenPortal';
import AdminPortal from '@/components/portals/AdminPortal';
import DriverPortal from '@/components/portals/DriverPortal';
import SupplierPortal from '@/components/portals/SupplierPortal';

export default function HomeScreen() {
  const { 
    activeRole, 
    activeUser, 
    isLoading 
  } = useApp();

  if (isLoading) {
    return (
      <View className="flex-1 bg-emerald-900 justify-center items-center">
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text className="text-white font-bold text-sm mt-4 tracking-wider">Memuat Database KMP Mart...</Text>
        <Text className="text-emerald-300 text-[10px] mt-1 font-semibold">SIMKOPDES Koperasi Inklusif 2026</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {activeUser ? (
        <View className="flex-1 bg-stone-100 flex-column">
          {/* Persistent top switcher bar */}
          <Header />
          
          {/* Role specific portals */}
          <View className="flex-1">
            {activeRole === 'USER' && <CitizenPortal />}
            {(activeRole === 'ADMIN' || activeRole === 'OPERASIONAL') && <AdminPortal />}
            {activeRole === 'DRIVER' && <DriverPortal />}
            {activeRole === 'SUPPLIER' && <SupplierPortal />}
          </View>
        </View>
      ) : (
        <AuthGateway />
      )}
    </View>
  );
}
