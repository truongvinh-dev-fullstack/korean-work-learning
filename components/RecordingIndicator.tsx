import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type RecordingIndicatorProps = {
  isRecording: boolean;
};

export function RecordingIndicator({ isRecording }: RecordingIndicatorProps) {
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isRecording) {
      pulseValue.stopAnimation();
      pulseValue.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          duration: 700,
          toValue: 1.25,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          duration: 700,
          toValue: 1,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [isRecording, pulseValue]);

  if (!isRecording) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { transform: [{ scale: pulseValue }] }]} />
      <AppText variant="bodyStrong" color={colors.danger}>
        Đang ghi âm...
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: '#E4A2A2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  dot: {
    backgroundColor: colors.danger,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
});
