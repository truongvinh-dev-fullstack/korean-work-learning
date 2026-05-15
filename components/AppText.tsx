import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

type AppTextVariant =
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'button'
  | 'language'
  | 'languageLarge';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: string;
};

export function AppText({ variant = 'body', color = colors.text, style, ...props }: AppTextProps) {
  return <Text style={[styles.base, styles[variant], { color }, style]} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0,
  },
  title: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.extrabold,
    lineHeight: typography.lineHeight.display,
  },
  heading: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.xxl,
  },
  subtitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.xl,
  },
  body: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.regular,
    lineHeight: typography.lineHeight.md,
  },
  bodyStrong: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.md,
  },
  caption: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    lineHeight: typography.lineHeight.sm,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.xs,
    textTransform: 'uppercase',
  },
  button: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.md,
    textAlign: 'center',
  },
  language: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.extrabold,
    lineHeight: typography.lineHeight.xxl,
  },
  languageLarge: {
    fontSize: typography.size.languageDisplay,
    fontWeight: typography.weight.extrabold,
    lineHeight: typography.lineHeight.languageDisplay,
    textAlign: 'center',
  },
});
