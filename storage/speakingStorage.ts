import AsyncStorage from '@react-native-async-storage/async-storage';

export type SpeakingPracticeStatus = 'good' | 'need_practice';

export type SpeakingPracticeRecord = {
  lessonId: string;
  sentenceId: string;
  status: SpeakingPracticeStatus;
  practicedAt: string;
  practiceCount: number;
};

export type SpeakingPracticeStats = {
  totalPracticedSentences: number;
  needPracticeCount: number;
  speakingStreak: number;
  totalPracticeAttempts: number;
};

type SpeakingPracticeMap = Record<string, SpeakingPracticeRecord>;

const SPEAKING_PROGRESS_KEY = 'speakingPracticeProgress';

function getRecordKey(lessonId: string, sentenceId: string) {
  return `${lessonId}:${sentenceId}`;
}

function isSpeakingPracticeStatus(value: unknown): value is SpeakingPracticeStatus {
  return value === 'good' || value === 'need_practice';
}

function parseSpeakingPracticeMap(value: string | null): SpeakingPracticeMap {
  if (value === null) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(value);

    if (typeof parsedValue !== 'object' || parsedValue === null || Array.isArray(parsedValue)) {
      return {};
    }

    return Object.entries(parsedValue).reduce<SpeakingPracticeMap>((progress, [key, item]) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return progress;
      }

      const candidate = item as Partial<SpeakingPracticeRecord>;

      if (
        typeof candidate.lessonId === 'string' &&
        typeof candidate.sentenceId === 'string' &&
        isSpeakingPracticeStatus(candidate.status) &&
        typeof candidate.practicedAt === 'string' &&
        typeof candidate.practiceCount === 'number' &&
        Number.isFinite(candidate.practiceCount)
      ) {
        progress[key] = {
          lessonId: candidate.lessonId,
          sentenceId: candidate.sentenceId,
          status: candidate.status,
          practicedAt: candidate.practicedAt,
          practiceCount: Math.max(1, candidate.practiceCount),
        };
      }

      return progress;
    }, {});
  } catch {
    return {};
  }
}

function toDateKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function subtractDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - days);

  return date.toISOString().slice(0, 10);
}

function getSpeakingStreak(records: SpeakingPracticeRecord[]) {
  const practicedDateKeys = new Set(
    records
      .map((record) => toDateKey(record.practicedAt))
      .filter((dateKey): dateKey is string => Boolean(dateKey))
  );
  const sortedDateKeys = Array.from(practicedDateKeys).sort();
  const latestDateKey = sortedDateKeys[sortedDateKeys.length - 1];

  if (!latestDateKey) {
    return 0;
  }

  let streak = 0;

  while (practicedDateKeys.has(subtractDays(latestDateKey, streak))) {
    streak += 1;
  }

  return streak;
}

export const speakingStorage = {
  async getSpeakingProgress(): Promise<SpeakingPracticeMap> {
    const value = await AsyncStorage.getItem(SPEAKING_PROGRESS_KEY);
    return parseSpeakingPracticeMap(value);
  },

  async setSpeakingProgress(value: SpeakingPracticeMap): Promise<void> {
    await AsyncStorage.setItem(SPEAKING_PROGRESS_KEY, JSON.stringify(value));
  },

  async saveSentenceProgress({
    lessonId,
    sentenceId,
    status,
  }: {
    lessonId: string;
    sentenceId: string;
    status: SpeakingPracticeStatus;
  }): Promise<SpeakingPracticeRecord> {
    const currentProgress = await this.getSpeakingProgress();
    const recordKey = getRecordKey(lessonId, sentenceId);
    const currentRecord = currentProgress[recordKey];
    const nextRecord: SpeakingPracticeRecord = {
      lessonId,
      sentenceId,
      status,
      practicedAt: new Date().toISOString(),
      practiceCount: (currentRecord?.practiceCount ?? 0) + 1,
    };

    await this.setSpeakingProgress({
      ...currentProgress,
      [recordKey]: nextRecord,
    });

    return nextRecord;
  },

  async getLessonSpeakingProgress(lessonId: string): Promise<SpeakingPracticeRecord[]> {
    const currentProgress = await this.getSpeakingProgress();

    return Object.values(currentProgress).filter((record) => record.lessonId === lessonId);
  },

  async getSpeakingStats(): Promise<SpeakingPracticeStats> {
    const currentProgress = await this.getSpeakingProgress();
    const records = Object.values(currentProgress);

    return {
      totalPracticedSentences: records.length,
      needPracticeCount: records.filter((record) => record.status === 'need_practice').length,
      speakingStreak: getSpeakingStreak(records),
      totalPracticeAttempts: records.reduce(
        (total, record) => total + Math.max(0, record.practiceCount),
        0
      ),
    };
  },

  async resetSpeakingProgress(): Promise<void> {
    await AsyncStorage.removeItem(SPEAKING_PROGRESS_KEY);
  },
};
