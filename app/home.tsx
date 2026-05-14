import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { HomeActionButton } from '@/components/HomeActionButton';
import { ProgressBox } from '@/components/ProgressBox';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { getNextLesson } from '@/data/lessonCatalog';
import { useAppProgress } from '@/hooks/use-app-progress';
import { appStorage, defaultLessonProgress } from '@/storage/appStorage';
import type { DailyLesson, LessonProgress, UserLevel } from '@/types';

const levelLabels: Record<UserLevel, string> = {
  basic_review: 'Ôn nền tảng',
  work_communication: 'Giao tiếp đi làm',
  listening_speaking: 'Nghe nói tăng tốc',
};

const homeActions = [
  {
    title: 'Bài học hôm nay',
    description: 'Học ngắn trong 5 phút, tập trung vào tình huống đi làm.',
    href: '/daily-lesson' as const,
  },
  {
    title: 'Lộ trình học',
    description: 'Xem danh sách bài học, trạng thái mở khóa và bài đã hoàn thành.',
    href: '/lessons' as const,
  },
  {
    title: 'Flashcard ôn tập',
    description: 'Ôn lại từ đã nhớ để giữ nhịp học đều mỗi ngày.',
    href: '/flashcards' as const,
  },
  {
    title: 'Hội thoại đi làm',
    description: 'Luyện câu nói thực tế cho môi trường công việc.',
    href: '/work-dialogues' as const,
  },
  {
    title: 'Tiến độ học',
    description: 'Xem streak, số từ đã học và số câu đã luyện.',
    href: '/progress' as const,
  },
];

export default function HomeScreen() {
  const { progress, loadProgress } = useAppProgress();
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>(defaultLessonProgress);
  const [nextLesson, setNextLesson] = useState<DailyLesson | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      loadProgress();
      appStorage.getLessonProgress().then((storedLessonProgress) => {
        if (!isActive) {
          return;
        }

        setLessonProgress(storedLessonProgress);
        setNextLesson(
          getNextLesson(
            storedLessonProgress.completedLessonIds,
            storedLessonProgress.currentLessonDay
          )
        );
      });

      return () => {
        isActive = false;
      };
    }, [loadProgress])
  );

  const currentLevel = progress.userLevel ? levelLabels[progress.userLevel] : 'Chưa xác định';

  return (
    <AppScreen
      title="Hôm nay học 5 phút tiếng Hàn"
      subtitle="Chọn một phần nhỏ để học đều, nhẹ nhàng và sát với công việc.">
      <View style={styles.settingsRow}>
        <Pressable
          accessibilityLabel="Mở cài đặt"
          accessibilityRole="button"
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
          <Ionicons name="settings-outline" size={18} color={colors.primaryDark} />
          <AppText variant="caption" color={colors.primaryDark} style={styles.settingsText}>
            Cài đặt
          </AppText>
        </Pressable>
      </View>

      <View style={styles.progressGrid}>
        <ProgressBox label="Streak ngày học" value={`${progress.streak} ngày`} />
        <ProgressBox label="Số từ đã học" value={progress.learnedWordsCount} />
        <ProgressBox label="Số câu đã luyện" value={progress.practicedSentencesCount} />
        <ProgressBox label="Level hiện tại" value={currentLevel} />
      </View>

      <AppCard style={styles.focusCard}>
        {nextLesson ? (
          <>
            <AppText variant="label" color={colors.primary}>
              Bài học tiếp theo
            </AppText>
            <AppText variant="subtitle">
              Ngày {nextLesson.dayNumber}: {nextLesson.title}
            </AppText>
            <AppText color={colors.textMuted}>{nextLesson.description}</AppText>
            <AppText variant="caption" color={colors.textSubtle}>
              {nextLesson.estimatedMinutes} phút · Đã hoàn thành{' '}
              {lessonProgress.completedLessonIds.length} bài
            </AppText>
            <AppButton title="Bắt đầu bài học" onPress={() => router.push('/daily-lesson')} />
          </>
        ) : (
          <>
            <AppText variant="label" color={colors.primary}>
              Lộ trình mẫu
            </AppText>
            <AppText variant="subtitle">Bạn đã hoàn thành lộ trình mẫu</AppText>
            <AppText color={colors.textMuted}>
              Hãy chuyển sang flashcards để ôn lại các từ đã học.
            </AppText>
            <AppButton title="Ôn tập flashcard" onPress={() => router.push('/flashcards')} />
          </>
        )}
      </AppCard>

      <View style={styles.actions}>
        {homeActions.map((action) => (
          <HomeActionButton key={action.href} {...action} />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  settingsRow: {
    alignItems: 'flex-end',
    marginBottom: -spacing.md,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.72,
  },
  settingsText: {
    fontWeight: '700',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  focusCard: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
});
