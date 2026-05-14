import { StyleSheet } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type ProgressBoxProps = {
  label: string;
  value: string | number;
  helperText?: string;
};

export function ProgressBox({ label, value, helperText }: ProgressBoxProps) {
  return (
    <AppCard style={styles.box}>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
      {helperText ? (
        <AppText variant="caption" color={colors.textSubtle}>
          {helperText}
        </AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  box: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 94,
  },
});
