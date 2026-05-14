import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { SpeakButton } from '@/components/SpeakButton';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { mockWorkDialogues } from '@/data/mockWorkDialogues';
import { appStorage } from '@/storage/appStorage';

export default function WorkDialoguesScreen() {
  const [practicedDialogueIds, setPracticedDialogueIds] = useState<Set<string>>(() => new Set());
  const [savingDialogueId, setSavingDialogueId] = useState<string | null>(null);

  async function handlePractice(dialogueId: string) {
    if (savingDialogueId || practicedDialogueIds.has(dialogueId)) {
      return;
    }

    setSavingDialogueId(dialogueId);

    try {
      await appStorage.incrementPracticedSentencesCount();
      setPracticedDialogueIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(dialogueId);
        return nextIds;
      });
    } finally {
      setSavingDialogueId(null);
    }
  }

  return (
    <AppScreen
      title="Hội thoại công việc"
      subtitle="Luyện nhanh các câu dùng trong tình huống đi làm hằng ngày.">
      {mockWorkDialogues.map((dialogue, index) => {
        const isPracticed = practicedDialogueIds.has(dialogue.id);
        const isSaving = savingDialogueId === dialogue.id;

        return (
          <AppCard key={dialogue.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.stepBadge}>
                <AppText variant="caption" color={colors.primaryDark} style={styles.stepText}>
                  {index + 1}
                </AppText>
              </View>
              <AppText variant="subtitle" style={styles.title}>
                {dialogue.title}
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText variant="label" color={colors.textSubtle}>
                Tình huống
              </AppText>
              <AppText color={colors.textMuted}>{dialogue.contextVi}</AppText>
            </View>

            <View style={styles.sentenceBox}>
              <View style={styles.row}>
                <AppText variant="subtitle" style={styles.flexText}>
                  {dialogue.koreanSentence}
                </AppText>
                <SpeakButton text={dialogue.koreanSentence} accessibilityLabel="Nghe câu tiếng Hàn" />
              </View>
              <AppText color={colors.textMuted}>{dialogue.meaningVi}</AppText>
            </View>

            <View style={styles.replyBox}>
              <AppText variant="label" color={colors.textSubtle}>
                Trả lời gợi ý
              </AppText>
              <View style={styles.row}>
                <AppText variant="bodyStrong" style={styles.flexText}>
                  {dialogue.suggestedReply}
                </AppText>
                <SpeakButton
                  text={dialogue.suggestedReply}
                  accessibilityLabel="Nghe câu trả lời gợi ý"
                />
              </View>
            </View>

            <AppButton
              variant={isPracticed ? 'success' : 'primary'}
              disabled={isPracticed || isSaving}
              onPress={() => handlePractice(dialogue.id)}
              title={isPracticed ? 'Đã luyện' : isSaving ? 'Đang lưu...' : 'Đã luyện câu này'}
            />
          </AppCard>
        );
      })}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepBadge: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  stepText: {
    fontWeight: '800',
  },
  title: {
    flex: 1,
  },
  section: {
    gap: spacing.sm,
  },
  sentenceBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    gap: spacing.sm,
    padding: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  flexText: {
    flex: 1,
  },
  replyBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    gap: spacing.sm,
    padding: spacing.md,
  },
});
