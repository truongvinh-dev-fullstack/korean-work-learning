import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type AppScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function AppScreen({ title, subtitle, children, contentStyle }: AppScreenProps) {
  return (
    <SafeAreaView style={styles.root} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]}>
        <View style={styles.header}>
          <AppText variant="title">{title}</AppText>
          {subtitle ? (
            <AppText variant="body" color={colors.textMuted}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    gap: spacing.sm,
  },
});
