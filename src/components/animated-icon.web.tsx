import { Image } from 'expo-image';
import { View } from 'react-native';
import Animated, { Keyframe, Easing } from 'react-native-reanimated';

const DURATION = 300;
const logoSource = require('../../kmp-mart-logo.png');

export function AnimatedSplashOverlay() {
  return null;
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: 0 }],
  },
  60: {
    transform: [{ scale: 1.2 }],
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(1.2),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
  },
  60: {
    transform: [{ scale: 1.2 }],
    opacity: 0,
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(1.2),
  },
});

export function AnimatedIcon() {
  return (
    <View className="justify-center items-center w-32 h-32">
      <Animated.View className="w-32 h-32 rounded-[36px] bg-white absolute" entering={keyframe.duration(DURATION)} />

      <Animated.View className="justify-center items-center" entering={logoKeyframe.duration(DURATION)}>
        <Image className="w-24 h-24" source={logoSource} contentFit="contain" />
      </Animated.View>
    </View>
  );
}
