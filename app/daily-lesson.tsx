import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { LessonCard } from '@/components/LessonCard';
import { QuizCard } from '@/components/QuizCard';
import { SpeakButton } from '@/components/SpeakButton';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { getLessonById, getNextLesson } from '@/services/lessonService';
import { appStorage } from '@/storage/appStorage';
import type { DailyLesson } from '@/types';

export default function DailyLessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const [lesson, setLesson] = useState<DailyLesson | null>(null);
  const [quizResult, setQuizResult] = useState<{ correctCount: number; totalCount: number } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadLesson() {
        setIsLoading(true);
        const lessonProgress = await appStorage.getLessonProgress();
        const routeLessonId = Array.isArray(lessonId) ? lessonId[0] : lessonId;
        const selectedLesson = routeLessonId ? getLessonById(routeLessonId) : null;
        const nextLesson =
          selectedLesson ??
          getNextLesson(lessonProgress.currentLessonDay, lessonProgress.completedLessonIds);

        if (!isActive) {
          return;
        }

        setLesson(nextLesson);
        setQuizResult(null);
        setIsLoading(false);
      }

      loadLesson();

      return () => {
        isActive = false;
      };
    }, [lessonId])
  );

  const hasFinishedQuiz = Boolean(quizResult);
  const canComplete = Boolean(lesson) && hasFinishedQuiz && !isSaving;

  async function handleCompleteLesson() {
    if (!lesson || !canComplete) {
      return;
    }

    setIsSaving(true);

    try {
      await appStorage.completeLesson(lesson);
      router.replace('/home');
    } catch (error) {
      setIsSaving(false);
      throw error;
    }
  }

  if (isLoading) {
    return (
      <AppScreen title="Bài học mỗi ngày" subtitle="Đang chuẩn bị bài học tiếp theo.">
        <AppCard style={styles.centerCard}>
          <AppText color={colors.textMuted}>Đang tải...</AppText>
        </AppCard>
      </AppScreen>
    );
  }

  if (!lesson) {
    return (
      <AppScreen
        title="Bạn đã hoàn thành lộ trình mẫu"
        subtitle="Tất cả bài học mẫu đã được hoàn thành.">
        <AppCard style={styles.doneCard}>
          <AppText variant="subtitle" style={styles.centerText}>
            Bạn đã hoàn thành lộ trình mẫu
          </AppText>
          <AppText color={colors.textMuted} style={styles.centerText}>
            Hãy ôn lại flashcards để giữ nhịp học và củng cố các từ đã gặp.
          </AppText>
          <AppButton title="Ôn tập flashcard" onPress={() => router.push('/flashcards')} />
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title={`Ngày ${lesson.dayNumber}: ${lesson.title}`}
      subtitle={`${lesson.description} · ${lesson.estimatedMinutes} phút`}>
      <LessonCard step={1} title="Từ vựng">
        {lesson.words.map((word) => (
          <View key={word.id} style={styles.wordItem}>
            <View style={styles.row}>
              <View style={styles.copy}>
                <AppText variant="korean">{word.korean}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {word.pronunciation}
                </AppText>
              </View>
              <SpeakButton text={word.korean} />
            </View>
            <AppText color={colors.textMuted}>{word.meaningVi}</AppText>
            <View style={styles.exampleBox}>
              <View style={styles.row}>
                <AppText style={styles.example}>{word.example}</AppText>
                <SpeakButton text={word.example} accessibilityLabel="Nghe ví dụ tiếng Hàn" />
              </View>
            </View>
          </View>
        ))}
      </LessonCard>

      <LessonCard step={2} title="Câu giao tiếp">
        {lesson.sentences.map((sentence, index) => (
          <View key={sentence.id ?? `${sentence.korean}-${index}`} style={styles.sentenceItem}>
            <View style={styles.row}>
              <AppText variant="subtitle" style={styles.flexText}>
                {sentence.korean}
              </AppText>
              <SpeakButton text={sentence.korean} accessibilityLabel="Nghe câu tiếng Hàn" />
            </View>
            <AppText color={colors.textMuted}>{sentence.meaningVi}</AppText>
          </View>
        ))}
      </LessonCard>

      <LessonCard step={3} title="Mẹo ngữ pháp">
        <View style={styles.tipBox}>
          <AppText>{lesson.grammarTip}</AppText>
        </View>
      </LessonCard>

      <LessonCard step={4} title="Quiz">
        <QuizCard
          questions={lesson.quiz}
          onComplete={(correctCount) =>
            setQuizResult({ correctCount, totalCount: lesson.quiz.length })
          }
        />
      </LessonCard>

      {quizResult ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.centerText}>
          Quiz: {quizResult.correctCount}/{quizResult.totalCount} câu đúng.
        </AppText>
      ) : (
        <AppText variant="caption" color={colors.textMuted} style={styles.centerText}>
          Hoàn thành quiz để mở nút lưu bài học.
        </AppText>
      )}

      <AppButton
        disabled={!canComplete}
        onPress={handleCompleteLesson}
        title={isSaving ? 'Đang lưu...' : 'Hoàn thành bài học'}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  doneCard: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 240,
  },
  centerText: {
    textAlign: 'center',
  },
  wordItem: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  flexText: {
    flex: 1,
  },
  exampleBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    padding: spacing.md,
  },
  example: {
    flex: 1,
  },
  sentenceItem: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    gap: spacing.sm,
    padding: spacing.md,
  },
  tipBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    padding: spacing.md,
  },
});
