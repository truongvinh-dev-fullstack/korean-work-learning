import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '@/constants/colors';
import { radius } from '@/constants/spacing';

type SpeakButtonProps = {
  text: string;
  accessibilityLabel?: string;
};

export function SpeakButton({ text, accessibilityLabel = 'Nghe phat am tieng Han' }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      Speech.stop();
    };
  }, []);

  function updateSpeaking(value: boolean) {
    if (isMountedRef.current) {
      setIsSpeaking(value);
    }
  }

  function handleSpeak() {
    if (isSpeaking) {
      Speech.stop();
      updateSpeaking(false);
      return;
    }

    Speech.stop();
    updateSpeaking(true);
    Speech.speak(text, {
      language: 'ko-KR',
      rate: 0.88,
      onDone: () => updateSpeaking(false),
      onStopped: () => updateSpeaking(false),
      onError: () => updateSpeaking(false),
    });
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={handleSpeak}
      style={({ pressed }) => [
        styles.button,
        isSpeaking && styles.active,
        pressed && styles.pressed,
      ]}>
      <Ionicons
        name={isSpeaking ? 'volume-high' : 'volume-high-outline'}
        size={18}
        color={colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  active: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
