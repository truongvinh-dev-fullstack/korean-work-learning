import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { SpeakingCard } from '@/components/SpeakingCard';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { getNextLesson } from '@/services/lessonService';
import { appStorage } from '@/storage/appStorage';
import {
  speakingStorage,
  type SpeakingPracticeRecord,
  type SpeakingPracticeStatus,
} from '@/storage/speakingStorage';
import type { DailyLesson, DailyLessonSentence } from '@/types';

type SpeakingSentence = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  dayNumber: number;
  english: string;
  meaningVi: string;
};

type LessonSentenceWithLegacyField = DailyLessonSentence & {
  korean?: string;
};

function buildSpeakingSentences(lesson: DailyLesson): SpeakingSentence[] {
  return lesson.sentences
    .map((sentence, index) => {
      const candidate = sentence as LessonSentenceWithLegacyField;
      const english = candidate.english ?? candidate.korean ?? '';

      return {
        id: sentence.id ?? `sentence-${index + 1}`,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        dayNumber: lesson.dayNumber,
        english,
        meaningVi: sentence.meaningVi,
      };
    })
    .filter((sentence) => sentence.english.trim().length > 0);
}

export default function SpeakingPracticeScreen() {
  const [lesson, setLesson] = useState<DailyLesson | null>(null);
  const [sentences, setSentences] = useState<SpeakingSentence[]>([]);
  const [lessonProgress, setLessonProgress] = useState<SpeakingPracticeRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadSpeakingPractice() {
        setIsLoading(true);

        const storedLessonProgress = await appStorage.getLessonProgress();
        const nextLesson = getNextLesson(
          storedLessonProgress.currentLessonDay,
          storedLessonProgress.completedLessonIds
        );
        const nextSentences = nextLesson ? buildSpeakingSentences(nextLesson) : [];
        const nextSpeakingProgress = nextLesson
          ? await speakingStorage.getLessonSpeakingProgress(nextLesson.id)
          : [];

        if (!isActive) {
          return;
        }

        setLesson(nextLesson);
        setSentences(nextSentences);
        setLessonProgress(nextSpeakingProgress);
        setCurrentIndex(0);
        setIsFinished(false);
        setIsLoading(false);
      }

      loadSpeakingPractice();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const currentSentence = sentences[currentIndex] ?? null;
  const practicedSentenceIds = useMemo(
    () => new Set(lessonProgress.map((record) => record.sentenceId)),
    [lessonProgress]
  );
  const completedCount = sentences.filter((sentence) => practicedSentenceIds.has(sentence.id)).length;

  async function handleSelfEvaluate(status: SpeakingPracticeStatus) {
    if (!currentSentence || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const nextRecord = await speakingStorage.saveSentenceProgress({
        lessonId: currentSentence.lessonId,
        sentenceId: currentSentence.id,
        status,
      });

      setLessonProgress((currentProgress) => {
        const otherRecords = currentProgress.filter(
          (record) => record.sentenceId !== currentSentence.id
        );

        return [...otherRecords, nextRecord];
      });

      if (currentIndex >= sentences.length - 1) {
        setIsFinished(true);
        return;
      }

      setCurrentIndex((index) => index + 1);
    } finally {
      setIsSaving(false);
    }
  }

  function handlePracticeAgain() {
    setCurrentIndex(0);
    setIsFinished(false);
  }

  if (isLoading) {
    return (
      <AppScreen title="Luyện nói" subtitle="Đang chuẩn bị câu luyện nói cho lesson hiện tại.">
        <AppCard style={styles.centerCard}>
          <AppText color={colors.textMuted}>Đang tải...</AppText>
        </AppCard>
      </AppScreen>
    );
  }

  if (!lesson || sentences.length === 0 || !currentSentence) {
    return (
      <AppScreen title="Luyện nói" subtitle="Chưa có câu để luyện shadowing.">
        <AppCard style={styles.centerCard}>
          <AppText color={colors.textMuted} style={styles.centerText}>
            Chưa có lesson hiện tại hoặc lesson này chưa có câu giao tiếp để luyện nói.
          </AppText>
          <AppButton title="Về Home" onPress={() => router.push('/home')} style={styles.fullButton} />
        </AppCard>
      </AppScreen>
    );
  }

  if (isFinished) {
    return (
      <AppScreen
        title="Luyện nói"
        subtitle={`Ngày ${lesson.dayNumber}: ${lesson.title}`}>
        <AppCard style={styles.doneCard}>
          <AppText variant="subtitle" style={styles.centerText}>
            Bạn đã hoàn thành luyện nói hôm nay
          </AppText>
          <AppText color={colors.textMuted} style={styles.centerText}>
            Đã lưu tiến độ shadowing của {sentences.length} câu trong lesson này.
          </AppText>
          <View style={styles.doneActions}>
            <AppButton title="Luyện lại" onPress={handlePracticeAgain} />
            <AppButton title="Về Home" variant="secondary" onPress={() => router.push('/home')} />
          </View>
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Luyện nói"
      subtitle={`Nghe mẫu, shadowing, ghi âm và tự đánh giá. Ngày ${lesson.dayNumber}: ${lesson.title}`}>
      <View style={styles.progressRow}>
        <AppText variant="caption" color={colors.textMuted}>
          Đã luyện {completedCount}/{sentences.length} câu
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {currentSentence.lessonTitle}
        </AppText>
      </View>

      <SpeakingCard
        isSaving={isSaving}
        meaningVi={currentSentence.meaningVi}
        onSelfEvaluate={handleSelfEvaluate}
        sentenceEnglish={currentSentence.english}
        sentenceNumber={currentIndex + 1}
        totalSentences={sentences.length}
      />
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
  doneCard: {
    alignItems: 'stretch',
    gap: spacing.lg,
    justifyContent: 'center',
    minHeight: 240,
  },
  centerText: {
    textAlign: 'center',
  },
  fullButton: {
    alignSelf: 'stretch',
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  doneActions: {
    gap: spacing.md,
  },
});
