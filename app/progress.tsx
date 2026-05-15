import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { ProgressBox } from '@/components/ProgressBox';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { appStorage, defaultProgress } from '@/storage/appStorage';
import { speakingStorage, type SpeakingPracticeStats } from '@/storage/speakingStorage';
import type { AppProgress, UserLevel, WordProgress, WordProgressMap, WordProgressStatus } from '@/types';

const levelLabels: Record<UserLevel, string> = {
  basic_review: 'Ôn nền tảng',
  work_communication: 'Giao tiếp đi làm',
  listening_speaking: 'Nghe nói tăng tốc',
};

const reviewStatusLabels: Record<WordProgressStatus, string> = {
  new: 'Chưa ôn',
  remembered: 'Nhớ',
  unsure: 'Mơ hồ',
  forgotten: 'Quên',
};

function countWordsByStatus(words: WordProgress[], status: WordProgressStatus) {
  return words.filter((word) => word.status === status).length;
}

function sortReviewWords(words: WordProgress[]) {
  return [...words].sort((firstWord, secondWord) => {
    if (firstWord.status !== secondWord.status) {
      return firstWord.status === 'forgotten' ? -1 : 1;
    }

    return firstWord.english.localeCompare(secondWord.english);
  });
}

export default function ProgressScreen() {
  const [progress, setProgress] = useState<AppProgress>(defaultProgress);
  const [wordProgressMap, setWordProgressMap] = useState<WordProgressMap>({});
  const [speakingStats, setSpeakingStats] = useState<SpeakingPracticeStats>({
    needPracticeCount: 0,
    speakingStreak: 0,
    totalPracticeAttempts: 0,
    totalPracticedSentences: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const loadProgressData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [storedProgress, storedWordProgress, storedSpeakingStats] = await Promise.all([
        appStorage.getProgress(),
        appStorage.getWordProgress(),
        speakingStorage.getSpeakingStats(),
      ]);

      setProgress(storedProgress);
      setWordProgressMap(storedWordProgress);
      setSpeakingStats(storedSpeakingStats);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgressData();
    }, [loadProgressData])
  );

  async function handleRetakeLevelTest() {
    if (isResetting) {
      return;
    }

    setIsResetting(true);

    try {
      await appStorage.resetLevelTest();
      router.replace('/level-test');
    } catch (error) {
      setIsResetting(false);
      throw error;
    }
  }

  const wordProgressList = Object.values(wordProgressMap);
  const totalWords = wordProgressList.length;
  const rememberedCount = countWordsByStatus(wordProgressList, 'remembered');
  const unsureCount = countWordsByStatus(wordProgressList, 'unsure');
  const forgottenCount = countWordsByStatus(wordProgressList, 'forgotten');
  const currentLevel = progress.userLevel ? levelLabels[progress.userLevel] : 'Chưa xác định';
  const wordsToReview = sortReviewWords(
    wordProgressList.filter((word) => word.status === 'forgotten' || word.status === 'unsure')
  );

  return (
    <AppScreen
      title="Tiến độ học tập"
      subtitle="Theo dõi nhịp học, số câu đã luyện, bài viết và các từ cần ôn lại.">
      <View style={styles.statsGrid}>
        <ProgressBox
          label="Streak"
          value={isLoading ? '-' : `${progress.streak} ngày`}
          helperText="Chuỗi ngày học hiện tại"
        />
        <ProgressBox label="Level hiện tại" value={isLoading ? '-' : currentLevel} />
        <ProgressBox label="Tổng từ" value={isLoading ? '-' : totalWords} />
        <ProgressBox
          label="Tổng câu đã luyện"
          value={isLoading ? '-' : progress.practicedSentencesCount}
        />
        <ProgressBox
          label="Tổng câu đã viết"
          value={isLoading ? '-' : progress.writingPracticeCount}
        />
        <ProgressBox
          label="Tổng câu đã luyện nói"
          value={isLoading ? '-' : speakingStats.totalPracticedSentences}
        />
        <ProgressBox
          label="Câu nói cần luyện thêm"
          value={isLoading ? '-' : speakingStats.needPracticeCount}
        />
        <ProgressBox
          label="Streak luyện nói"
          value={isLoading ? '-' : `${speakingStats.speakingStreak} ngày`}
        />
        <ProgressBox label="Số từ nhớ" value={isLoading ? '-' : rememberedCount} />
        <ProgressBox label="Số từ mơ hồ" value={isLoading ? '-' : unsureCount} />
        <ProgressBox label="Số từ quên" value={isLoading ? '-' : forgottenCount} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="subtitle">Từ cần ôn lại</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {isLoading ? '-' : `${wordsToReview.length} từ`}
          </AppText>
        </View>

        {isLoading ? (
          <AppCard style={styles.emptyCard}>
            <AppText color={colors.textMuted} style={styles.centerText}>
              Đang tải dữ liệu...
            </AppText>
          </AppCard>
        ) : wordsToReview.length > 0 ? (
          <View style={styles.reviewList}>
            {wordsToReview.map((word) => {
              const status = word.status;

              return (
                <AppCard key={word.wordId} style={styles.reviewItem}>
                  <View style={styles.reviewCopy}>
                    <AppText variant="language">{word.english}</AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {word.meaningVi}
                    </AppText>
                  </View>
                  {status ? (
                    <View
                      style={[
                        styles.statusBadge,
                        status === 'forgotten' ? styles.forgottenBadge : styles.unsureBadge,
                      ]}>
                      <AppText variant="caption" style={styles.statusText}>
                        {reviewStatusLabels[status]}
                      </AppText>
                    </View>
                  ) : null}
                </AppCard>
              );
            })}
          </View>
        ) : totalWords === 0 ? (
          <AppCard style={styles.emptyCard}>
            <AppText color={colors.textMuted} style={styles.centerText}>
              Chưa có từ nào. Hãy học lesson đầu tiên để tạo danh sách ôn tập.
            </AppText>
            <AppButton
              title="Học lesson đầu tiên"
              onPress={() => router.push('/daily-lesson')}
              style={styles.emptyAction}
            />
          </AppCard>
        ) : (
          <AppCard style={styles.emptyCard}>
            <AppText color={colors.textMuted} style={styles.centerText}>
              Chưa có từ mơ hồ hoặc quên. Hãy ôn flashcards để cập nhật danh sách này.
            </AppText>
          </AppCard>
        )}
      </View>

      <AppButton
        disabled={isResetting}
        onPress={handleRetakeLevelTest}
        title={isResetting ? 'Đang chuyển...' : 'Làm lại test trình độ'}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  reviewList: {
    gap: spacing.sm,
  },
  reviewItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  reviewCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  forgottenBadge: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#E4A2A2',
  },
  unsureBadge: {
    backgroundColor: colors.warningSoft,
    borderColor: '#E8C36C',
  },
  statusText: {
    color: colors.text,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyAction: {
    alignSelf: 'stretch',
  },
  centerText: {
    textAlign: 'center',
  },
});
