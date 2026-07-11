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
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, elevation: 10 }}>
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
