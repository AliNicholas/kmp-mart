import * as React from 'react';
import { Modal, Platform, View } from 'react-native';

interface AppModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  transparent?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  children: React.ReactNode;
}

export function AppModal({ visible, children, onRequestClose, animationType = 'slide' }: AppModalProps) {
  if (!visible) return null;
  
  if (Platform.OS === 'web') {
    return (
      <View style={{ 
        position: 'fixed' as any, 
        top: 0, 
        bottom: 0, 
        left: '50%' as any,
        transform: [{ translateX: '-50%' }] as any,
        width: '100%',
        maxWidth: 460,
        zIndex: 9999, 
        elevation: 10,
        overflow: 'hidden'
      }}>
        {children}
      </View>
    );
  }
  
  return (
    <Modal 
      visible={visible} 
      transparent={true} 
      animationType={animationType} 
      onRequestClose={onRequestClose}
    >
      {children}
    </Modal>
  );
}
