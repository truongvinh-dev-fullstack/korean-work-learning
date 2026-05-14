import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { lessonCatalog } from '@/data/lessonCatalog';
import { appStorage, defaultLessonProgress } from '@/storage/appStorage';
import type { LessonProgress, UserLevel } from '@/types';

const levelLabels: Record<UserLevel, string> = {
  basic_review: 'Ôn nền tảng',
  work_communication: 'Giao tiếp đi làm',
  listening_speaking: 'Nghe nói tăng tốc',
};

function getLessonState(index: number, completedLessonIds: string[]) {
  const lesson = lessonCatalog[index];
  const previousLesson = lessonCatalog[index - 1];
  const isCompleted = completedLessonIds.includes(lesson.id);
  const isUnlocked =
    index === 0 ||
    isCompleted ||
    Boolean(previousLesson && completedLessonIds.includes(previousLesson.id));

  if (isCompleted) {
    return {
      icon: 'checkmark-circle' as const,
      label: 'Đã học',
      tone: colors.success,
      unlocked: true,
    };
  }

  if (isUnlocked) {
    return {
      icon: 'play-circle' as const,
      label: 'Đang học',
      tone: colors.primary,
      unlocked: true,
    };
  }

  return {
    icon: 'lock-closed' as const,
    label: 'Bị khóa',
    tone: colors.textSubtle,
    unlocked: false,
  };
}

export default function LessonsScreen() {
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>(defaultLessonProgress);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      appStorage.getLessonProgress().then((storedLessonProgress) => {
        if (!isActive) {
          return;
        }

        setLessonProgress(storedLessonProgress);
      });

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <AppScreen
      title="Lộ trình học"
      subtitle="Học từng bài theo thứ tự. Bài tiếp theo sẽ mở khi bạn hoàn thành bài trước.">
      <View style={styles.list}>
        {lessonCatalog.map((lesson, index) => {
          const state = getLessonState(index, lessonProgress.completedLessonIds);

          return (
            <Pressable
              key={lesson.id}
              accessibilityRole="button"
              disabled={!state.unlocked}
              onPress={() =>
                router.push({
                  pathname: '/daily-lesson',
                  params: { lessonId: lesson.id },
                })
              }>
              {({ pressed }) => (
                <AppCard
                  style={[
                    styles.lessonItem,
                    !state.unlocked && styles.lockedItem,
                    pressed && state.unlocked && styles.pressed,
                  ]}>
                  <View style={styles.topRow}>
                    <View style={styles.dayBadge}>
                      <AppText variant="label" color={colors.primary}>
                        Ngày {lesson.dayNumber}
                      </AppText>
                    </View>

                    <View style={styles.status}>
                      <Ionicons name={state.icon} size={18} color={state.tone} />
                      <AppText variant="caption" color={state.tone}>
                        {state.label}
                      </AppText>
                    </View>
                  </View>

                  <AppText variant="subtitle">{lesson.title}</AppText>

                  <View style={styles.metaRow}>
                    <AppText variant="caption" color={colors.textMuted}>
                      {lesson.estimatedMinutes} phút
                    </AppText>
                    <View style={styles.metaDot} />
                    <AppText variant="caption" color={colors.textMuted}>
                      {levelLabels[lesson.level]}
                    </AppText>
                  </View>
                </AppCard>
              )}
            </Pressable>
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  lessonItem: {
    gap: spacing.sm,
  },
  lockedItem: {
    opacity: 0.58,
  },
  pressed: {
    opacity: 0.72,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  dayBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  status: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaDot: {
    backgroundColor: colors.borderStrong,
    borderRadius: radius.pill,
    height: 4,
    width: 4,
  },
});
