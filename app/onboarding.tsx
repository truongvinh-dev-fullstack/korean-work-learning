import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { appStorage } from '@/storage/appStorage';

const slides = [
  {
    eyebrow: '5 phút mỗi ngày',
    title: 'Học lại tiếng Anh trong 5 phút mỗi ngày',
    description:
      'Mỗi bài học ngắn, dễ quay lại và đủ nhẹ để giữ nhịp học đều sau giờ làm.',
  },
  {
    eyebrow: 'Đi làm tự tin hơn',
    title: 'Tập trung giao tiếp khi đi làm',
    description:
      'Ưu tiên câu nói thực tế trong công việc để bạn dùng được ngay khi trao đổi hằng ngày.',
  },
  {
    eyebrow: 'Ôn đúng chỗ quên',
    title: 'Ôn lại từ quên bằng flashcard',
    description:
      'Flashcard giúp bạn đánh dấu từ chưa chắc và quay lại ôn đúng phần cần nhớ.',
  },
] as const;

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const currentSlide = slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === slides.length - 1;

  async function handlePrimaryPress() {
    if (!isLastSlide) {
      setCurrentSlideIndex((index) => index + 1);
      return;
    }

    setIsSaving(true);

    try {
      await appStorage.setHasCompletedOnboarding(true);
      router.replace('/level-test');
    } catch (error) {
      setIsSaving(false);
      throw error;
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <AppText variant="label" color={colors.primary}>
              {currentSlide.eyebrow}
            </AppText>
          </View>

          <View style={styles.illustration}>
            <AppText variant="languageLarge" color={colors.primaryDark}>
              EN
            </AppText>
          </View>

          <View style={styles.textBlock}>
            <AppText variant="title" style={styles.title}>
              {currentSlide.title}
            </AppText>
            <AppText color={colors.textMuted} style={styles.description}>
              {currentSlide.description}
            </AppText>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((slide, index) => (
              <View
                key={slide.title}
                style={[styles.dot, index === currentSlideIndex && styles.activeDot]}
              />
            ))}
          </View>

          <AppButton
            title={isLastSlide ? 'Bắt đầu' : 'Tiếp tục'}
            disabled={isSaving}
            onPress={handlePrimaryPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xxl,
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  illustration: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 96,
    borderWidth: 1,
    justifyContent: 'center',
    width: 176,
  },
  textBlock: {
    gap: spacing.md,
    maxWidth: 360,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  footer: {
    gap: spacing.xl,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: colors.borderStrong,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 28,
  },
});
