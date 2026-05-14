import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type StatCardProps = {
  label: string;
  value: string | number;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">{value}</ThemedText>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: '#D6DEE8',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minWidth: 140,
    padding: 16,
  },
  label: {
    opacity: 0.72,
  },
});
