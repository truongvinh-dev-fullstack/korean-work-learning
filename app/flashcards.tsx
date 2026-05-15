import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { Flashcard } from '@/components/Flashcard';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { appStorage } from '@/storage/appStorage';
import type { WordProgress, WordProgressMap, WordProgressStatus } from '@/types';

type ReviewableWordStatus = Exclude<WordProgressStatus, 'new'>;

const statusLabels: Record<WordProgressStatus, string> = {
  new: 'Chưa ôn',
  remembered: 'Nhớ',
  unsure: 'Mơ hồ',
  forgotten: 'Quên',
};

function shuffleWordsForReview(words: WordProgress[]) {
  const shuffledWords = [...words];

  for (let index = shuffledWords.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentWord = shuffledWords[index];
    shuffledWords[index] = shuffledWords[randomIndex];
    shuffledWords[randomIndex] = currentWord;
  }

  return shuffledWords;
}

export default function FlashcardsScreen() {
  const [reviewQueue, setReviewQueue] = useState<WordProgress[]>([]);
  const [wordProgressMap, setWordProgressMap] = useState<WordProgressMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadWordProgress() {
      const storedWordProgress = await appStorage.getWordProgress();

      if (!isMounted) {
        return;
      }

      setWordProgressMap(storedWordProgress);
      setReviewQueue(shuffleWordsForReview(Object.values(storedWordProgress)));
      setCurrentIndex(0);
      setIsLoading(false);
    }

    loadWordProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSelectStatus(status: ReviewableWordStatus) {
    const currentWord = reviewQueue[currentIndex];

    if (!currentWord || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const nextWordProgress = await appStorage.setWordProgressStatus(currentWord.wordId, status);

      if (nextWordProgress) {
        setWordProgressMap((currentProgress) => ({
          ...currentProgress,
          [currentWord.wordId]: nextWordProgress,
        }));
        setReviewQueue((currentQueue) =>
          currentQueue.map((word) =>
            word.wordId === nextWordProgress.wordId ? nextWordProgress : word
          )
        );
      }

      setCurrentIndex((index) => index + 1);
    } finally {
      setIsSaving(false);
    }
  }

  const currentWord = reviewQueue[currentIndex];
  const hasNoWords = !isLoading && reviewQueue.length === 0;
  const hasFinished = !isLoading && reviewQueue.length > 0 && currentIndex >= reviewQueue.length;
  const progressText = `${Math.min(currentIndex + 1, reviewQueue.length)}/${reviewQueue.length}`;

  if (isLoading) {
    return (
      <AppScreen title="Flashcards" subtitle="Đang chuẩn bị danh sách ôn tập.">
        <AppCard style={styles.centerCard}>
          <AppText color={colors.textMuted}>Đang tải...</AppText>
        </AppCard>
      </AppScreen>
    );
  }

  if (hasNoWords) {
    return (
      <AppScreen title="Flashcards" subtitle="Chưa có từ nào trong danh sách ôn tập.">
        <AppCard style={styles.doneCard}>
          <AppText variant="subtitle" style={styles.centerText}>
            Chưa có từ nào
          </AppText>
          <AppText color={colors.textMuted} style={styles.centerText}>
            Hãy học lesson đầu tiên để thêm từ vào flashcards.
          </AppText>
          <AppButton title="Học lesson đầu tiên" onPress={() => router.push('/daily-lesson')} />
        </AppCard>
      </AppScreen>
    );
  }

  if (hasFinished) {
    return (
      <AppScreen
        title="Flashcards"
        subtitle="Mỗi lượt ôn sẽ trộn ngẫu nhiên danh sách từ để bạn không học theo thứ tự cố định.">
        <AppCard style={styles.doneCard}>
          <AppText variant="subtitle" style={styles.centerText}>
            Hôm nay ôn xong rồi
          </AppText>
          <AppText color={colors.textMuted} style={styles.centerText}>
            Trạng thái từng từ đã được lưu local. Khi ôn lại, danh sách sẽ được trộn mới.
          </AppText>
          <AppButton
            title="Ôn lại với thứ tự mới"
            onPress={() => {
              appStorage.getWordProgress().then((storedWordProgress) => {
                setWordProgressMap(storedWordProgress);
                setReviewQueue(shuffleWordsForReview(Object.values(storedWordProgress)));
                setCurrentIndex(0);
              });
            }}
          />
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Flashcards"
      subtitle="Bấm vào thẻ để xem nghĩa, rồi chọn mức độ nhớ của bạn.">
      <View style={styles.headerRow}>
        <AppText variant="caption" color={colors.textMuted}>
          Thẻ {progressText}
        </AppText>
        {currentWord ? (
          <AppText variant="caption" color={colors.textMuted}>
            Trạng thái cũ:{' '}
            {statusLabels[wordProgressMap[currentWord.wordId]?.status ?? currentWord.status]}
          </AppText>
        ) : null}
      </View>

      {currentWord ? (
        <Flashcard
          word={currentWord}
          currentStatus={wordProgressMap[currentWord.wordId]?.status ?? currentWord.status}
          onSelectStatus={handleSelectStatus}
        />
      ) : null}

      {isSaving ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.centerText}>
          Đang lưu trạng thái...
        </AppText>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
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
});
