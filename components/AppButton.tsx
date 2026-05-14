import { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';

type AppButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

type AppButtonProps = PropsWithChildren<
  PressableProps & {
    title?: string;
    variant?: AppButtonVariant;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
  }
>;

export function AppButton({
  title,
  variant = 'primary',
  disabled,
  style,
  textStyle,
  children,
  ...props
}: AppButtonProps) {
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
        <AppText
          variant="button"
          color={variant === 'primary' ? colors.white : variantTextColors[variant]}
          style={textStyle}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  disabled: {
    opacity: 0.58,
  },
  pressed: {
    opacity: 0.72,
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
  success: {
    backgroundColor: colors.successSoft,
    borderColor: '#8CCB9B',
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: '#E8C36C',
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#E4A2A2',
  },
});

const variantTextColors: Record<AppButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.text,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};
