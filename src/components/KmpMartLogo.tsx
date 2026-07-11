import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

interface KmpMartLogoProps {
  size?: number;
  className?: string;
  style?: any;
  noBackground?: boolean;
}

export function KmpMartLogo({ size = 44, className = '', style, noBackground = false }: KmpMartLogoProps) {
  if (noBackground) {
    return (
      <Image
        source={require('@/assets/images/expo-logo.png')}
        style={[{ width: size, height: size }, style]}
        className={className}
        contentFit="contain"
      />
    );
  }

  return (
    <View 
      className={`items-center justify-center bg-white rounded-2xl shadow-sm border border-stone-100 ${className}`}
      style={[{ width: size, height: size }, style]}
    >
      <Image
        source={require('@/assets/images/expo-logo.png')}
        style={{ width: size * 0.8, height: size * 0.8 }}
        contentFit="contain"
      />
    </View>
  );
}
