import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type ScreenContainerProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function ScreenContainer({ title, subtitle, children }: ScreenContainerProps) {
  return (
    <ThemedView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">{title}</ThemedText>
          {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
        </View>
        {children}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    gap: 20,
    padding: 20,
  },
  header: {
    gap: 8,
  },
  subtitle: {
    opacity: 0.72,
  },
});
