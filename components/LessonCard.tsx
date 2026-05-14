import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type LessonCardProps = PropsWithChildren<{
  title: string;
  step: number;
}>;

export function LessonCard({ title, step, children }: LessonCardProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.stepBadge}>
          <AppText variant="caption" color={colors.primaryDark} style={styles.stepText}>
            {step}
          </AppText>
        </View>
        <AppText variant="subtitle" style={styles.title}>
          {title}
        </AppText>
      </View>
      <View style={styles.body}>{children}</View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  header: {
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
  body: {
    gap: spacing.md,
  },
});
