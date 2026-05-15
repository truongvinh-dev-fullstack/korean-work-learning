import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { SpeakButton } from '@/components/SpeakButton';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { getWritingPrompts } from '@/services/lessonService';
import { appStorage } from '@/storage/appStorage';
import type { WritingPrompt } from '@/types';

type CheckResult = {
  isCorrect: boolean;
  matchPercent: number;
};

function normalizeWriting(value: string) {
  return value
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function getMatchPercent(answer: string, target: string) {
  const answerWords = new Set(normalizeWriting(answer).split(' ').filter(Boolean));
  const targetWords = normalizeWriting(target).split(' ').filter(Boolean);

  if (targetWords.length === 0) {
    return 0;
  }

  const matchedCount = targetWords.filter((word) => answerWords.has(word)).length;
  return Math.round((matchedCount / targetWords.length) * 100);
}

function getNextPromptIndex(
  prompts: WritingPrompt[],
  completedPromptIds: Set<string>,
  currentIndex = 0
) {
  if (prompts.length === 0) {
    return 0;
  }

  const nextUnfinishedIndex = prompts.findIndex(
    (prompt, index) => index >= currentIndex && !completedPromptIds.has(prompt.id)
  );

  if (nextUnfinishedIndex >= 0) {
    return nextUnfinishedIndex;
  }

  const firstUnfinishedIndex = prompts.findIndex((prompt) => !completedPromptIds.has(prompt.id));

  return firstUnfinishedIndex >= 0 ? firstUnfinishedIndex : Math.min(currentIndex, prompts.length - 1);
}

export default function WritingPracticeScreen() {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [completedPromptIds, setCompletedPromptIds] = useState<Set<string>>(() => new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadWritingPractice() {
        setIsLoading(true);

        const [lessonProgress, storedCompletedPromptIds] = await Promise.all([
          appStorage.getLessonProgress(),
          appStorage.getCompletedWritingPromptIds(),
        ]);
        const nextCompletedPromptIds = new Set(storedCompletedPromptIds);
        const nextPrompts = getWritingPrompts(lessonProgress.completedLessonIds);

        if (!isActive) {
          return;
        }

        setPrompts(nextPrompts);
        setCompletedPromptIds(nextCompletedPromptIds);
        setCurrentIndex(getNextPromptIndex(nextPrompts, nextCompletedPromptIds));
        setAnswer('');
        setCheckResult(null);
        setIsLoading(false);
      }

      loadWritingPractice();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const currentPrompt = prompts[currentIndex] ?? null;
  const completedCount = useMemo(
    () => prompts.filter((prompt) => completedPromptIds.has(prompt.id)).length,
    [completedPromptIds, prompts]
  );
  const hasChecked = Boolean(checkResult);
  const canCheck = Boolean(currentPrompt) && answer.trim().length > 0 && !isSaving;

  async function handleCheckAnswer() {
    if (!currentPrompt || !canCheck) {
      return;
    }

    const isCorrect = normalizeWriting(answer) === normalizeWriting(currentPrompt.targetEnglish);
    const nextResult = {
      isCorrect,
      matchPercent: getMatchPercent(answer, currentPrompt.targetEnglish),
    };

    setCheckResult(nextResult);

    if (!isCorrect || completedPromptIds.has(currentPrompt.id)) {
      return;
    }

    setIsSaving(true);

    try {
      await appStorage.completeWritingPrompt(currentPrompt.id);
      setCompletedPromptIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(currentPrompt.id);
        return nextIds;
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleNextPrompt() {
    if (prompts.length === 0) {
      return;
    }

    const nextIndex = (currentIndex + 1) % prompts.length;
    setCurrentIndex(getNextPromptIndex(prompts, completedPromptIds, nextIndex));
    setAnswer('');
    setCheckResult(null);
  }

  function handleTryAgain() {
    setCheckResult(null);
  }

  if (isLoading) {
    return (
      <AppScreen title="Luyện viết" subtitle="Đang chuẩn bị câu luyện viết.">
        <AppCard style={styles.centerCard}>
          <AppText color={colors.textMuted}>Đang tải...</AppText>
        </AppCard>
      </AppScreen>
    );
  }

  if (!currentPrompt) {
    return (
      <AppScreen title="Luyện viết" subtitle="Chưa có câu để luyện viết.">
        <AppCard style={styles.centerCard}>
          <AppText color={colors.textMuted} style={styles.centerText}>
            Hãy thêm câu giao tiếp vào bài học rồi quay lại luyện viết.
          </AppText>
          <AppButton title="Về trang chủ" onPress={() => router.push('/home')} />
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Luyện viết"
      subtitle="Nhìn nghĩa tiếng Việt, tự viết lại câu tiếng Anh rồi kiểm tra đáp án.">
      <View style={styles.progressRow}>
        <AppText variant="caption" color={colors.textMuted}>
          Đã viết đúng {completedCount}/{prompts.length} câu
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Lesson {currentPrompt.dayNumber}
        </AppText>
      </View>

      <AppCard style={styles.practiceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.lessonBadge}>
            <AppText variant="caption" color={colors.primaryDark} style={styles.badgeText}>
              {currentIndex + 1}
            </AppText>
          </View>
          <View style={styles.headerCopy}>
            <AppText variant="label" color={colors.textSubtle}>
              {currentPrompt.lessonTitle}
            </AppText>
            <AppText variant="subtitle">Viết câu tiếng Anh</AppText>
          </View>
        </View>

        <View style={styles.promptBox}>
          <AppText variant="label" color={colors.textSubtle}>
            Nghĩa tiếng Việt
          </AppText>
          <AppText variant="bodyStrong">{currentPrompt.meaningVi}</AppText>
        </View>

        <View style={styles.hintBox}>
          <AppText variant="label" color={colors.textSubtle}>
            Gợi ý chữ đầu
          </AppText>
          <AppText color={colors.textMuted}>{currentPrompt.hint}</AppText>
        </View>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          onChangeText={(value) => {
            setAnswer(value);
            if (checkResult) {
              setCheckResult(null);
            }
          }}
          placeholder="Nhập câu tiếng Anh..."
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          textAlignVertical="top"
          value={answer}
        />

        {hasChecked && checkResult ? (
          <View
            style={[
              styles.resultBox,
              checkResult.isCorrect ? styles.correctResult : styles.incorrectResult,
            ]}>
            <AppText
              variant="bodyStrong"
              color={checkResult.isCorrect ? colors.success : colors.warning}>
              {checkResult.isCorrect ? 'Đúng rồi' : `Gần đúng ${checkResult.matchPercent}%`}
            </AppText>
            <View style={styles.answerRow}>
              <AppText style={styles.answerText}>{currentPrompt.targetEnglish}</AppText>
              <SpeakButton text={currentPrompt.targetEnglish} accessibilityLabel="Nghe đáp án" />
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          {checkResult?.isCorrect ? (
            <AppButton title="Câu tiếp theo" onPress={handleNextPrompt} />
          ) : (
            <AppButton
              disabled={!canCheck}
              title={isSaving ? 'Đang lưu...' : 'Kiểm tra'}
              onPress={handleCheckAnswer}
            />
          )}
          {checkResult && !checkResult.isCorrect ? (
            <AppButton title="Sửa lại" variant="secondary" onPress={handleTryAgain} />
          ) : (
            <AppButton title="Bỏ qua" variant="secondary" onPress={handleNextPrompt} />
          )}
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centerCard: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 180,
  },
  centerText: {
    textAlign: 'center',
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  practiceCard: {
    gap: spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  lessonBadge: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  badgeText: {
    fontWeight: '800',
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  promptBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
  },
  hintBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    padding: spacing.md,
  },
  resultBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  correctResult: {
    backgroundColor: colors.successSoft,
    borderColor: '#8CCB9B',
  },
  incorrectResult: {
    backgroundColor: colors.warningSoft,
    borderColor: '#E8C36C',
  },
  answerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  answerText: {
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
});
