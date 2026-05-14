import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { appStorage, defaultProgress } from '@/storage/appStorage';
import type { AppProgress, UserLevel } from '@/types';

const levelLabels: Record<UserLevel, string> = {
  basic_review: 'Ôn nền tảng',
  work_communication: 'Giao tiếp đi làm',
  listening_speaking: 'Nghe nói tăng tốc',
};

export default function SettingsScreen() {
  const [progress, setProgress] = useState<AppProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetakingTest, setIsRetakingTest] = useState(false);
  const [isResettingAll, setIsResettingAll] = useState(false);

  const loadProgress = useCallback(async () => {
    setIsLoading(true);

    try {
      const storedProgress = await appStorage.getProgress();
      setProgress(storedProgress);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  async function retakeLevelTest() {
    if (isRetakingTest || isResettingAll) {
      return;
    }

    setIsRetakingTest(true);

    try {
      await appStorage.resetLevelTest();
      router.replace('/level-test');
    } catch (error) {
      setIsRetakingTest(false);
      throw error;
    }
  }

  async function resetAllProgress() {
    if (isRetakingTest || isResettingAll) {
      return;
    }

    setIsResettingAll(true);

    try {
      await appStorage.resetProgress();
      router.replace('/onboarding');
    } catch (error) {
      setIsResettingAll(false);
      throw error;
    }
  }

  function handleRetakeLevelTest() {
    Alert.alert(
      'Làm lại test trình độ?',
      'App sẽ xoá level hiện tại và kết quả test. Tiến độ bài học vẫn được giữ.',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Làm lại test', style: 'destructive', onPress: () => void retakeLevelTest() },
      ]
    );
  }

  function handleResetAllProgress() {
    Alert.alert(
      'Reset toàn bộ tiến độ?',
      'Thao tác này sẽ xoá onboarding, test trình độ, tiến độ học, từ đã ôn và bài học đã hoàn thành.',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => void resetAllProgress() },
      ]
    );
  }

  const currentLevel = progress.userLevel ? levelLabels[progress.userLevel] : 'Chưa xác định';
  const isBusy = isRetakingTest || isResettingAll;

  return (
    <AppScreen
      title="Cài đặt"
      subtitle="Quản lý level và dữ liệu học tập đang lưu trên máy.">
      <AppCard style={styles.levelCard}>
        <AppText variant="label" color={colors.primary}>
          Level hiện tại
        </AppText>
        <AppText variant="subtitle">{isLoading ? 'Đang tải...' : currentLevel}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Level được dùng để chọn lộ trình và bài học phù hợp.
        </AppText>
      </AppCard>

      <View style={styles.actions}>
        <AppCard style={styles.actionCard}>
          <View style={styles.actionCopy}>
            <AppText variant="subtitle">Làm lại test trình độ</AppText>
            <AppText color={colors.textMuted}>
              Chỉ xoá trạng thái hoàn thành test và level hiện tại, sau đó chuyển về màn test.
            </AppText>
          </View>
          <AppButton
            disabled={isBusy}
            onPress={handleRetakeLevelTest}
            title={isRetakingTest ? 'Đang chuyển...' : 'Làm lại test'}
            variant="warning"
          />
        </AppCard>

        <AppCard style={[styles.actionCard, styles.dangerCard]}>
          <View style={styles.actionCopy}>
            <AppText variant="subtitle" color={colors.danger}>
              Reset toàn bộ tiến độ
            </AppText>
            <AppText color={colors.textMuted}>
              Xoá onboarding, test, chỉ số tiến độ, word progress, bài đã hoàn thành và ngày học hiện tại.
            </AppText>
          </View>
          <AppButton
            disabled={isBusy}
            onPress={handleResetAllProgress}
            title={isResettingAll ? 'Đang reset...' : 'Reset toàn bộ'}
            variant="danger"
          />
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  levelCard: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
  actionCard: {
    gap: spacing.lg,
  },
  actionCopy: {
    gap: spacing.sm,
  },
  dangerCard: {
    borderColor: '#E4A2A2',
  },
});
