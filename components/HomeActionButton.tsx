import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { LearningRoute } from '@/types';

type HomeActionButtonProps = LearningRoute;

export function HomeActionButton({ title, description, href }: HomeActionButtonProps) {
  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <View style={[styles.button, pressed && styles.pressed]}>
            <View style={styles.copy}>
              <AppText variant="subtitle">{title}</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {description}
              </AppText>
            </View>
            <View style={styles.icon}>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 86,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.72,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
