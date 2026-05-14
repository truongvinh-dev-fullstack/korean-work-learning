import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { LearningRoute } from '@/types';

type ActionCardProps = LearningRoute;

export function ActionCard({ title, description, href }: ActionCardProps) {
  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView style={[styles.card, pressed && styles.pressed]}>
            <View style={styles.text}>
              <ThemedText type="subtitle">{title}</ThemedText>
              <ThemedText style={styles.description}>{description}</ThemedText>
            </View>
            <ThemedText style={styles.arrow}>›</ThemedText>
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderColor: '#D6DEE8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    padding: 16,
  },
  pressed: {
    opacity: 0.72,
  },
  text: {
    flex: 1,
    gap: 6,
  },
  description: {
    opacity: 0.72,
  },
  arrow: {
    fontSize: 28,
    lineHeight: 30,
    opacity: 0.48,
  },
});
