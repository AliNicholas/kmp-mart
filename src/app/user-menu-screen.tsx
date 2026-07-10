import { UserMenu } from '@/components/user-menu';
import { View } from 'react-native';
 
export default function UserMenuScreen() {
  return (
    <View className='flex-1 items-center justify-center bg-emerald-900'>
      <UserMenu />
    </View>
  );
}
