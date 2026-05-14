import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { appStorage } from '@/storage/appStorage';

export default function IndexScreen() {
  useEffect(() => {
    let isMounted = true;

    async function redirectFromStoredState() {
      const progress = await appStorage.getProgress();

      if (!isMounted) {
        return;
      }

      if (!progress.hasCompletedOnboarding) {
        router.replace('/onboarding');
        return;
      }

      router.replace(progress.hasCompletedLevelTest ? '/home' : '/level-test');
    }

    redirectFromStoredState();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.root}>
      <ActivityIndicator color={colors.primary} />
      <AppText color={colors.textMuted}>Đang tải tiến độ học tập...</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
});
