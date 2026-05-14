import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { DailyLessonQuizQuestion } from '@/types';

type QuizCardProps = {
  questions: DailyLessonQuizQuestion[];
  onComplete: (correctCount: number) => void;
};

export function QuizCard({ questions, onComplete }: QuizCardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setIsComplete(false);
  }, [questions]);

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
  const nextCorrectCount = useMemo(() => {
    if (!hasAnswered) {
      return correctCount;
    }

    return isCorrect ? correctCount + 1 : correctCount;
  }, [correctCount, hasAnswered, isCorrect]);

  function handleNextQuestion() {
    if (!hasAnswered) {
      return;
    }

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (isLastQuestion) {
      setCorrectCount(nextCorrectCount);
      setIsComplete(true);
      onComplete(nextCorrectCount);
      return;
    }

    setCorrectCount(nextCorrectCount);
    setSelectedAnswer(null);
    setCurrentQuestionIndex((index) => index + 1);
  }

  if (questions.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <AppText color={colors.textMuted}>Chưa có câu hỏi quiz cho bài này.</AppText>
      </View>
    );
  }

  if (isComplete) {
    return (
      <View style={styles.resultBox}>
        <AppText variant="subtitle" style={styles.centerText}>
          Hoàn thành quiz
        </AppText>
        <AppText variant="heading" color={colors.primary} style={styles.centerText}>
          {correctCount}/{questions.length}
        </AppText>
        <AppText color={colors.textMuted} style={styles.centerText}>
          Bạn có thể bấm “Hoàn thành bài học” để lưu tiến độ.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppText variant="caption" color={colors.textMuted}>
        Câu {currentQuestionIndex + 1}/{questions.length}
      </AppText>

      <AppText variant="bodyStrong">{currentQuestion.question}</AppText>

      <View style={styles.options}>
        {currentQuestion.options.map((option) => {
          const optionIsSelected = selectedAnswer === option;
          const optionIsCorrect = option === currentQuestion.correctAnswer;
          const shouldShowCorrect = hasAnswered && optionIsCorrect;
          const shouldShowWrong = optionIsSelected && !optionIsCorrect;

          return (
            <Pressable
              key={option}
              disabled={hasAnswered}
              onPress={() => setSelectedAnswer(option)}
              style={({ pressed }) => [
                styles.option,
                shouldShowCorrect && styles.correctOption,
                shouldShowWrong && styles.wrongOption,
                pressed && styles.pressed,
              ]}>
              <AppText>{option}</AppText>
            </Pressable>
          );
        })}
      </View>

      {hasAnswered ? (
        <View style={[styles.feedbackBox, isCorrect ? styles.correctBox : styles.wrongBox]}>
          <AppText variant="bodyStrong" color={isCorrect ? colors.success : colors.danger}>
            {isCorrect ? 'Đúng rồi' : 'Chưa đúng'}
          </AppText>
          <AppText color={colors.textMuted}>{currentQuestion.explanationVi}</AppText>
        </View>
      ) : null}

      <AppButton
        disabled={!hasAnswered}
        title="Câu tiếp theo"
        onPress={handleNextQuestion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  correctOption: {
    backgroundColor: colors.successSoft,
    borderColor: '#8CCB9B',
  },
  wrongOption: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#E4A2A2',
  },
  feedbackBox: {
    borderRadius: 8,
    gap: spacing.xs,
    padding: spacing.md,
  },
  correctBox: {
    backgroundColor: colors.successSoft,
  },
  wrongBox: {
    backgroundColor: colors.dangerSoft,
  },
  resultBox: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    padding: spacing.lg,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
