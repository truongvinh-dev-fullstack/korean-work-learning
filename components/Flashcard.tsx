import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { SpeakButton } from '@/components/SpeakButton';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { WordProgress, WordProgressStatus } from '@/types';

type ReviewableWordStatus = Exclude<WordProgressStatus, 'new'>;

type FlashcardProps = {
  word: WordProgress;
  currentStatus: WordProgressStatus;
  onSelectStatus: (status: ReviewableWordStatus) => void;
};

const statusLabels: Record<ReviewableWordStatus, string> = {
  remembered: 'Nhớ',
  unsure: 'Mơ hồ',
  forgotten: 'Quên',
};

const statusVariants: Record<ReviewableWordStatus, 'success' | 'warning' | 'danger'> = {
  remembered: 'success',
  unsure: 'warning',
  forgotten: 'danger',
};

const reviewStatuses: ReviewableWordStatus[] = ['remembered', 'unsure', 'forgotten'];

export function Flashcard({ word, currentStatus, onSelectStatus }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [word.wordId]);

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFlipped ? 'Mặt sau flashcard' : 'Mặt trước flashcard'}
        onPress={() => setIsFlipped((value) => !value)}
        style={({ pressed }) => [pressed && styles.pressed]}>
        <AppCard style={styles.card}>
          {isFlipped ? (
            <View style={styles.backContent}>
              <View style={styles.cardHeader}>
                <View style={styles.copy}>
                  <AppText variant="language">{word.english}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {word.pronunciation}
                  </AppText>
                </View>
                <SpeakButton text={word.english} />
              </View>

              <View style={styles.divider} />

              <View style={styles.detailGroup}>
                <AppText variant="label" color={colors.textSubtle}>
                  Nghĩa
                </AppText>
                <AppText variant="subtitle">{word.meaningVi}</AppText>
              </View>

              <View style={styles.detailGroup}>
                <AppText variant="label" color={colors.textSubtle}>
                  Ví dụ
                </AppText>
                <View style={styles.exampleRow}>
                  <AppText style={styles.example}>{word.example}</AppText>
                  <SpeakButton text={word.example} accessibilityLabel="Nghe ví dụ tiếng Anh" />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.frontContent}>
              <AppText variant="caption" color={colors.textMuted}>
                Bấm để lật thẻ
              </AppText>
              <AppText variant="languageLarge">{word.english}</AppText>
              <SpeakButton text={word.english} />
            </View>
          )}
        </AppCard>
      </Pressable>

      <View style={styles.actions}>
        {reviewStatuses.map((status) => (
          <AppButton
            key={status}
            variant={statusVariants[status]}
            onPress={() => onSelectStatus(status)}
            style={[styles.statusButton, currentStatus === status && styles.selectedButton]}>
            <AppText
              variant="button"
              color={currentStatus === status ? colors.primaryDark : colors.text}>
              {statusLabels[status]}
            </AppText>
          </AppButton>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  card: {
    minHeight: 280,
  },
  frontContent: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  backContent: {
    gap: spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
  },
  detailGroup: {
    gap: spacing.sm,
  },
  exampleRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  example: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  selectedButton: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.72,
  },
});
