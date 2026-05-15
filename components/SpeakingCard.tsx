import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { RecordButton } from '@/components/RecordButton';
import { RecordingIndicator } from '@/components/RecordingIndicator';
import { SpeakButton } from '@/components/SpeakButton';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { SpeakingPracticeStatus } from '@/storage/speakingStorage';

type SpeakingCardProps = {
  sentenceEnglish: string;
  meaningVi: string;
  sentenceNumber: number;
  totalSentences: number;
  isSaving?: boolean;
  onSelfEvaluate: (status: SpeakingPracticeStatus) => void;
};

export function SpeakingCard({
  sentenceEnglish,
  meaningVi,
  sentenceNumber,
  totalSentences,
  isSaving = false,
  onSelfEvaluate,
}: SpeakingCardProps) {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [isStoppingRecording, setIsStoppingRecording] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      const currentRecording = recordingRef.current;
      const currentSound = soundRef.current;

      recordingRef.current = null;
      soundRef.current = null;

      if (currentRecording) {
        currentRecording.stopAndUnloadAsync().catch(() => undefined);
      }

      if (currentSound) {
        currentSound.unloadAsync().catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    setRecordingUri(null);
    setMessage(null);
    setIsPlayingRecording(false);

    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => undefined);
      soundRef.current = null;
    }
  }, [sentenceEnglish]);

  async function unloadCurrentSound() {
    if (!soundRef.current) {
      return;
    }

    const currentSound = soundRef.current;
    soundRef.current = null;
    setIsPlayingRecording(false);
    await currentSound.unloadAsync();
  }

  async function handleStartRecording() {
    if (isStartingRecording || isRecording) {
      return;
    }

    setIsStartingRecording(true);
    setMessage(null);

    try {
      await unloadCurrentSound();

      const permission = await Audio.requestPermissionsAsync();

      if (permission.status !== 'granted') {
        setMessage('App cần quyền microphone để ghi âm. Bạn có thể bật lại quyền này trong cài đặt máy.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setRecordingUri(null);
      setIsRecording(true);
      setMessage(null);
    } catch {
      setMessage('Không thể bắt đầu ghi âm. Hãy thử lại hoặc kiểm tra quyền microphone.');
    } finally {
      setIsStartingRecording(false);
    }
  }

  async function handleStopRecording() {
    const currentRecording = recordingRef.current;

    if (!currentRecording || isStoppingRecording) {
      return;
    }

    setIsStoppingRecording(true);

    try {
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();

      recordingRef.current = null;
      setIsRecording(false);
      setRecordingUri(uri);
      setMessage(uri ? 'Đã lưu bản ghi tạm thời. Bạn có thể phát lại để tự nghe.' : null);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch {
      recordingRef.current = null;
      setIsRecording(false);
      setRecordingUri(null);
      setMessage('Bản ghi quá ngắn hoặc bị lỗi. Hãy bấm ghi âm và thử lại.');
    } finally {
      setIsStoppingRecording(false);
    }
  }

  async function handlePlayRecording() {
    if (!recordingUri || isPlayingRecording) {
      return;
    }

    setMessage(null);

    try {
      await unloadCurrentSound();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri }, { shouldPlay: true });
      soundRef.current = sound;
      setIsPlayingRecording(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingRecording(false);
          sound.unloadAsync().catch(() => undefined);

          if (soundRef.current === sound) {
            soundRef.current = null;
          }
        }
      });
    } catch {
      setIsPlayingRecording(false);
      setMessage('Không thể phát bản ghi này. Hãy ghi âm lại rồi thử phát lại.');
    }
  }

  return (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <AppText variant="label" color={colors.primary}>
          Câu {sentenceNumber}/{totalSentences}
        </AppText>
        <SpeakButton text={sentenceEnglish} accessibilityLabel="Nghe câu mẫu tiếng Anh" />
      </View>

      <View style={styles.sentenceBox}>
        <AppText variant="language">{sentenceEnglish}</AppText>
        <AppText color={colors.textMuted}>{meaningVi}</AppText>
      </View>

      <RecordingIndicator isRecording={isRecording} />

      {message ? (
        <View style={styles.messageBox}>
          <AppText color={colors.textMuted}>{message}</AppText>
        </View>
      ) : null}

      <View style={styles.recordingActions}>
        <RecordButton
          disabled={isRecording || isStartingRecording || isSaving}
          iconName="mic-outline"
          onPress={handleStartRecording}
          title={isStartingRecording ? 'Đang mở mic...' : 'Bắt đầu ghi âm'}
          variant="primary"
        />
        <RecordButton
          disabled={!isRecording || isStoppingRecording}
          iconName="stop-circle-outline"
          onPress={handleStopRecording}
          title={isStoppingRecording ? 'Đang dừng...' : 'Dừng ghi âm'}
          variant="danger"
        />
        <RecordButton
          disabled={!recordingUri || isRecording || isPlayingRecording}
          iconName="play-circle-outline"
          onPress={handlePlayRecording}
          title={isPlayingRecording ? 'Đang phát...' : 'Phát lại recording'}
          variant="secondary"
        />
      </View>

      <View style={styles.selfReviewActions}>
        <RecordButton
          disabled={isRecording || isSaving}
          iconName="checkmark-circle-outline"
          onPress={() => onSelfEvaluate('good')}
          title="Tôi đọc tốt"
          variant="success"
        />
        <RecordButton
          disabled={isRecording || isSaving}
          iconName="refresh-circle-outline"
          onPress={() => onSelfEvaluate('need_practice')}
          title="Cần luyện thêm"
          variant="warning"
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  sentenceBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  messageBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing.md,
  },
  recordingActions: {
    gap: spacing.md,
  },
  selfReviewActions: {
    gap: spacing.md,
  },
});
