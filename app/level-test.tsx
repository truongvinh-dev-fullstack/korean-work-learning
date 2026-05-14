import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { mockLevelTestQuestions } from '@/data/mockLevelTest';
import { appStorage } from '@/storage/appStorage';
import type { UserLevel } from '@/types';

function getLevelFromScore(score: number): UserLevel {
  if (score <= 2) {
    return 'basic_review';
  }

  if (score <= 4) {
    return 'work_communication';
  }

  return 'listening_speaking';
}

export default function LevelTestScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = mockLevelTestQuestions[currentQuestionIndex];
  const questionCount = mockLevelTestQuestions.length;
  const progressText = `Câu ${currentQuestionIndex + 1}/${questionCount}`;

  async function handleSelectAnswer(answer: string) {
    if (isSaving) {
      return;
    }

    const nextScore = answer === currentQuestion.correctAnswer ? score + 1 : score;
    const isLastQuestion = currentQuestionIndex === questionCount - 1;

    if (!isLastQuestion) {
      setScore(nextScore);
      setCurrentQuestionIndex((index) => index + 1);
      return;
    }

    setIsSaving(true);

    try {
      await appStorage.completeLevelTest(getLevelFromScore(nextScore));
      router.replace('/home');
    } catch (error) {
      setIsSaving(false);
      throw error;
    }
  }

  return (
    <AppScreen
      title="Kiểm tra trình độ"
      subtitle="5 câu hỏi nhanh để chọn lộ trình ôn lại phù hợp.">
      <AppText variant="caption" color={colors.textMuted}>
        {progressText}
      </AppText>

      <AppCard>
        <AppText variant="subtitle">{currentQuestion.question}</AppText>
      </AppCard>

      <View style={styles.options}>
        {currentQuestion.options.map((option) => (
          <AppButton
            key={option}
            variant="secondary"
            disabled={isSaving}
            onPress={() => handleSelectAnswer(option)}
            style={styles.optionButton}
            textStyle={styles.optionText}
            title={option}
          />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.md,
  },
  optionButton: {
    alignItems: 'flex-start',
    minHeight: 62,
  },
  optionText: {
    color: colors.text,
    textAlign: 'left',
  },
});
