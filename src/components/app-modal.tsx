import * as React from 'react';
import { Modal, Platform, View } from 'react-native';

interface AppModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  transparent?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  children: React.ReactNode;
}

// Lazy-load ReactDOM only on web to avoid bundling issues on native
let createPortal: typeof import('react-dom').createPortal | null = null;
if (Platform.OS === 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    createPortal = require('react-dom').createPortal;
  } catch {
    // noop – fall back to inline rendering
  }
}

export function AppModal({ visible, children, onRequestClose, animationType = 'slide' }: AppModalProps) {
  if (!visible) return null;
  
  if (Platform.OS === 'web') {
    const modalContent = (
      <View style={{ 
        position: 'fixed' as any, 
        top: 0, 
        bottom: 0, 
        left: 0,
        right: 0,
        margin: 'auto' as any,
        width: '100%',
        maxWidth: 460,
        zIndex: 99999, 
        elevation: 10,
        overflow: 'hidden'
      }}>
        {children}
      </View>
    );

    // Portal to document.body so it escapes any parent stacking context
    if (createPortal && typeof document !== 'undefined') {
      return createPortal(modalContent, document.body);
    }

    return modalContent;
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
