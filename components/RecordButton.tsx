import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';

type IconName = ComponentProps<typeof Ionicons>['name'];
type RecordButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

type RecordButtonProps = PropsWithChildren<
  PressableProps & {
    title: string;
    iconName: IconName;
    variant?: RecordButtonVariant;
    style?: StyleProp<ViewStyle>;
  }
>;

export function RecordButton({
  title,
  iconName,
  variant = 'secondary',
  disabled,
  style,
  children,
  ...props
}: RecordButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}>
      {children ?? (
        <>
          <Ionicons
            name={iconName}
            size={20}
            color={isPrimary ? colors.white : variantTextColors[variant]}
          />
          <AppText
            variant="button"
            color={isPrimary ? colors.white : variantTextColors[variant]}
            style={styles.text}>
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  disabled: {
    opacity: 0.58,
  },
  pressed: {
    opacity: 0.72,
  },
  text: {
    flexShrink: 1,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#E4A2A2',
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: '#8CCB9B',
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: '#E8C36C',
  },
});

const variantTextColors: Record<RecordButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.text,
  danger: colors.danger,
  success: colors.success,
  warning: colors.warning,
};
