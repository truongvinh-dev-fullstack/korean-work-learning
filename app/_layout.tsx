import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { validateLessonsOnStartup } from '@/services/lessonService';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    validateLessonsOnStartup();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="level-test"
          options={{ title: 'Kiểm tra trình độ', headerTintColor: colors.primaryDark }}
        />
        <Stack.Screen
          name="home"
          options={{ title: 'Học tiếng Hàn đi làm', headerTintColor: colors.primaryDark }}
        />
        <Stack.Screen
          name="daily-lesson"
          options={{ title: 'Bài học mỗi ngày', headerTintColor: colors.primaryDark }}
        />
        <Stack.Screen
          name="lessons"
          options={{ title: 'Lộ trình học', headerTintColor: colors.primaryDark }}
        />
        <Stack.Screen
          name="flashcards"
          options={{ title: 'Flashcards', headerTintColor: colors.primaryDark }}
        />
        <Stack.Screen
          name="work-dialogues"
          options={{ title: 'Hội thoại công việc', headerTintColor: colors.primaryDark }}
        />
        <Stack.Screen
          name="progress"
          options={{ title: 'Tiến độ học tập', headerTintColor: colors.primaryDark }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Cài đặt', headerTintColor: colors.primaryDark }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
