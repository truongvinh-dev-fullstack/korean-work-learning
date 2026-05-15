import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AppProgress,
  DailyLesson,
  DailyLessonWord,
  LessonProgress,
  UserLevel,
  WordProgress,
  WordProgressMap,
  WordProgressStatus,
} from '@/types';

const STORAGE_KEYS = {
  hasCompletedOnboarding: 'hasCompletedOnboarding',
  hasCompletedLevelTest: 'hasCompletedLevelTest',
  userLevel: 'userLevel',
  streak: 'streak',
  learnedWordsCount: 'learnedWordsCount',
  practicedSentencesCount: 'practicedSentencesCount',
  writingPracticeCount: 'writingPracticeCount',
  flashcardReviews: 'flashcardReviews',
  wordProgress: 'wordProgress',
  completedWritingPromptIds: 'completedWritingPromptIds',
  completedLessonIds: 'completedLessonIds',
  currentLessonDay: 'currentLessonDay',
  lastStudyDate: 'lastStudyDate',
} as const;

export const defaultProgress: AppProgress = {
  hasCompletedOnboarding: false,
  hasCompletedLevelTest: false,
  userLevel: null,
  streak: 0,
  learnedWordsCount: 0,
  practicedSentencesCount: 0,
  writingPracticeCount: 0,
};

export const defaultLessonProgress: LessonProgress = {
  completedLessonIds: [],
  currentLessonDay: 1,
  lastStudyDate: null,
};

const userLevels: UserLevel[] = ['basic_review', 'work_communication', 'listening_speaking'];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseUserLevel(value: string | null): UserLevel | null {
  if (value === null) {
    return null;
  }

  return userLevels.includes(value as UserLevel) ? (value as UserLevel) : null;
}

async function getBoolean(key: string, fallback: boolean): Promise<boolean> {
  const value = await AsyncStorage.getItem(key);

  if (value === null) {
    return fallback;
  }

  return value === 'true';
}

async function getNumber(key: string, fallback: number): Promise<number> {
  const value = await AsyncStorage.getItem(key);
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

async function setNumber(key: string, value: number): Promise<void> {
  await AsyncStorage.setItem(key, String(Math.max(0, value)));
}

function isWordProgressStatus(value: unknown): value is WordProgressStatus {
  return value === 'new' || value === 'remembered' || value === 'unsure' || value === 'forgotten';
}

function parseWordProgress(value: string | null): WordProgressMap {
  if (value === null) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(value);

    if (typeof parsedValue !== 'object' || parsedValue === null || Array.isArray(parsedValue)) {
      return {};
    }

    return Object.entries(parsedValue).reduce<WordProgressMap>((progress, [wordId, item]) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return progress;
      }

      const candidate = item as Partial<WordProgress> & { korean?: unknown };
      const english = candidate.english ?? candidate.korean;

      if (
        candidate.wordId === wordId &&
        typeof english === 'string' &&
        typeof candidate.pronunciation === 'string' &&
        typeof candidate.meaningVi === 'string' &&
        typeof candidate.example === 'string' &&
        isWordProgressStatus(candidate.status) &&
        typeof candidate.reviewCount === 'number' &&
        Number.isFinite(candidate.reviewCount) &&
        (typeof candidate.lastReviewedAt === 'string' || candidate.lastReviewedAt === null)
      ) {
        progress[wordId] = {
          wordId,
          english,
          pronunciation: candidate.pronunciation,
          meaningVi: candidate.meaningVi,
          example: candidate.example,
          status: candidate.status,
          reviewCount: Math.max(0, candidate.reviewCount),
          lastReviewedAt: candidate.lastReviewedAt,
        };
      }

      return progress;
    }, {});
  } catch {
    return {};
  }
}

function createWordProgressItem(word: DailyLessonWord): WordProgress {
  return {
    wordId: word.id,
    english: word.english,
    pronunciation: word.pronunciation,
    meaningVi: word.meaningVi,
    example: word.example,
    status: 'new',
    reviewCount: 0,
    lastReviewedAt: null,
  };
}

function parseStringArray(value: string | null): string[] {
  if (value === null) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function normalizeStudyDateKey(value: string | null) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return toLocalDateKey(date);
}

function getDateKeyTime(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return Date.UTC(year, month - 1, day);
}

function getDateKeyDiffInDays(previousDateKey: string, nextDateKey: string) {
  return Math.round((getDateKeyTime(nextDateKey) - getDateKeyTime(previousDateKey)) / MS_PER_DAY);
}

function getActiveStreak(streak: number, lastStudyDate: string | null) {
  const lastStudyDateKey = normalizeStudyDateKey(lastStudyDate);

  if (streak <= 0) {
    return 0;
  }

  if (!lastStudyDateKey) {
    return streak;
  }

  const daysSinceLastStudy = getDateKeyDiffInDays(lastStudyDateKey, toLocalDateKey());

  return daysSinceLastStudy <= 1 ? streak : 0;
}

function getNextStudyStreak(streak: number, lastStudyDate: string | null, studyDateKey: string) {
  const lastStudyDateKey = normalizeStudyDateKey(lastStudyDate);

  if (!lastStudyDateKey) {
    return 1;
  }

  const daysSinceLastStudy = getDateKeyDiffInDays(lastStudyDateKey, studyDateKey);

  if (daysSinceLastStudy === 0) {
    return Math.max(1, streak);
  }

  if (daysSinceLastStudy === 1) {
    return streak + 1;
  }

  return 1;
}

export const appStorage = {
  async getProgress(): Promise<AppProgress> {
    const [
      hasCompletedOnboarding,
      hasCompletedLevelTest,
      userLevel,
      streak,
      learnedWordsCount,
      practicedSentencesCount,
      writingPracticeCount,
      lastStudyDate,
    ] =
      await Promise.all([
        getBoolean(STORAGE_KEYS.hasCompletedOnboarding, defaultProgress.hasCompletedOnboarding),
        getBoolean(STORAGE_KEYS.hasCompletedLevelTest, defaultProgress.hasCompletedLevelTest),
        AsyncStorage.getItem(STORAGE_KEYS.userLevel),
        getNumber(STORAGE_KEYS.streak, defaultProgress.streak),
        getNumber(STORAGE_KEYS.learnedWordsCount, defaultProgress.learnedWordsCount),
        getNumber(
          STORAGE_KEYS.practicedSentencesCount,
          defaultProgress.practicedSentencesCount
        ),
        getNumber(STORAGE_KEYS.writingPracticeCount, defaultProgress.writingPracticeCount),
        AsyncStorage.getItem(STORAGE_KEYS.lastStudyDate),
      ]);

    return {
      hasCompletedOnboarding,
      hasCompletedLevelTest,
      userLevel: parseUserLevel(userLevel),
      streak: getActiveStreak(streak, lastStudyDate),
      learnedWordsCount,
      practicedSentencesCount,
      writingPracticeCount,
    };
  },

  async setHasCompletedOnboarding(value: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.hasCompletedOnboarding, String(value));
  },

  async setHasCompletedLevelTest(value: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.hasCompletedLevelTest, String(value));
  },

  async setUserLevel(value: UserLevel | null): Promise<void> {
    if (value === null) {
      await AsyncStorage.removeItem(STORAGE_KEYS.userLevel);
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.userLevel, value);
  },

  async setStreak(value: number): Promise<void> {
    await setNumber(STORAGE_KEYS.streak, value);
  },

  async setLearnedWordsCount(value: number): Promise<void> {
    await setNumber(STORAGE_KEYS.learnedWordsCount, value);
  },

  async setPracticedSentencesCount(value: number): Promise<void> {
    await setNumber(STORAGE_KEYS.practicedSentencesCount, value);
  },

  async setWritingPracticeCount(value: number): Promise<void> {
    await setNumber(STORAGE_KEYS.writingPracticeCount, value);
  },

  async getLessonProgress(): Promise<LessonProgress> {
    const [completedLessonIds, currentLessonDay, lastStudyDate] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.completedLessonIds),
      getNumber(STORAGE_KEYS.currentLessonDay, defaultLessonProgress.currentLessonDay),
      AsyncStorage.getItem(STORAGE_KEYS.lastStudyDate),
    ]);

    return {
      completedLessonIds: parseStringArray(completedLessonIds),
      currentLessonDay: Math.max(1, currentLessonDay),
      lastStudyDate: normalizeStudyDateKey(lastStudyDate),
    };
  },

  async setCompletedLessonIds(value: string[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.completedLessonIds, JSON.stringify(value));
  },

  async setCurrentLessonDay(value: number): Promise<void> {
    await setNumber(STORAGE_KEYS.currentLessonDay, Math.max(1, value));
  },

  async setLastStudyDate(value: string | null): Promise<void> {
    if (value === null) {
      await AsyncStorage.removeItem(STORAGE_KEYS.lastStudyDate);
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.lastStudyDate, value);
  },

  async incrementPracticedSentencesCount(amount = 1): Promise<number> {
    const currentProgress = await this.getProgress();
    const nextCount = currentProgress.practicedSentencesCount + amount;

    await this.setPracticedSentencesCount(nextCount);

    return nextCount;
  },

  async getCompletedWritingPromptIds(): Promise<string[]> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.completedWritingPromptIds);
    return parseStringArray(value);
  },

  async setCompletedWritingPromptIds(value: string[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.completedWritingPromptIds, JSON.stringify(value));
  },

  async completeWritingPrompt(promptId: string): Promise<number> {
    const [currentProgress, completedWritingPromptIds] = await Promise.all([
      this.getProgress(),
      this.getCompletedWritingPromptIds(),
    ]);

    if (completedWritingPromptIds.includes(promptId)) {
      return currentProgress.writingPracticeCount;
    }

    const nextCount = currentProgress.writingPracticeCount + 1;

    await Promise.all([
      this.setWritingPracticeCount(nextCount),
      this.setCompletedWritingPromptIds([...completedWritingPromptIds, promptId]),
    ]);

    return nextCount;
  },

  async getWordProgress(): Promise<WordProgressMap> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.wordProgress);
    return parseWordProgress(value);
  },

  async setWordProgress(value: WordProgressMap): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.wordProgress, JSON.stringify(value));
  },

  async addLessonWordsToProgress(lesson: DailyLesson): Promise<WordProgressMap> {
    const currentWordProgress = await this.getWordProgress();
    const nextWordProgress = { ...currentWordProgress };
    let hasChanges = false;

    lesson.words.forEach((word) => {
      if (!nextWordProgress[word.id]) {
        nextWordProgress[word.id] = createWordProgressItem(word);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      await this.setWordProgress(nextWordProgress);
    }

    return nextWordProgress;
  },

  async setWordProgressStatus(
    wordId: string,
    status: Exclude<WordProgressStatus, 'new'>
  ): Promise<WordProgress | null> {
    const currentWordProgress = await this.getWordProgress();
    const currentWord = currentWordProgress[wordId];

    if (!currentWord) {
      return null;
    }

    const nextWord: WordProgress = {
      ...currentWord,
      status,
      reviewCount: currentWord.reviewCount + 1,
      lastReviewedAt: new Date().toISOString(),
    };

    await this.setWordProgress({
      ...currentWordProgress,
      [wordId]: nextWord,
    });

    return nextWord;
  },

  async completeLevelTest(userLevel: UserLevel): Promise<void> {
    await Promise.all([
      this.setHasCompletedLevelTest(true),
      this.setUserLevel(userLevel),
    ]);
  },

  async resetLevelTest(): Promise<void> {
    await Promise.all([
      this.setHasCompletedLevelTest(false),
      this.setUserLevel(null),
    ]);
  },

  async completeDailyLesson(wordCount: number, sentenceCount: number): Promise<AppProgress> {
    const [currentProgress, lessonProgress] = await Promise.all([
      this.getProgress(),
      this.getLessonProgress(),
    ]);
    const studyDateKey = toLocalDateKey();
    const nextProgress: AppProgress = {
      ...currentProgress,
      streak: getNextStudyStreak(
        currentProgress.streak,
        lessonProgress.lastStudyDate,
        studyDateKey
      ),
      learnedWordsCount: currentProgress.learnedWordsCount + wordCount,
      practicedSentencesCount: currentProgress.practicedSentencesCount + sentenceCount,
      writingPracticeCount: currentProgress.writingPracticeCount,
    };

    await Promise.all([
      this.setLastStudyDate(studyDateKey),
      this.setStreak(nextProgress.streak),
      this.setLearnedWordsCount(nextProgress.learnedWordsCount),
      this.setPracticedSentencesCount(nextProgress.practicedSentencesCount),
    ]);

    return nextProgress;
  },

  async completeLesson(lesson: DailyLesson): Promise<AppProgress> {
    const [currentProgress, lessonProgress] = await Promise.all([
      this.getProgress(),
      this.getLessonProgress(),
    ]);
    const hasCompletedLesson = lessonProgress.completedLessonIds.includes(lesson.id);
    const completedLessonIds = hasCompletedLesson
      ? lessonProgress.completedLessonIds
      : [...lessonProgress.completedLessonIds, lesson.id];
    const studyDateKey = toLocalDateKey();
    const nextProgress: AppProgress = {
      ...currentProgress,
      streak: getNextStudyStreak(
        currentProgress.streak,
        lessonProgress.lastStudyDate,
        studyDateKey
      ),
      learnedWordsCount:
        currentProgress.learnedWordsCount + (hasCompletedLesson ? 0 : lesson.words.length),
      practicedSentencesCount:
        currentProgress.practicedSentencesCount + (hasCompletedLesson ? 0 : lesson.sentences.length),
      writingPracticeCount: currentProgress.writingPracticeCount,
    };

    await Promise.all([
      this.addLessonWordsToProgress(lesson),
      this.setCompletedLessonIds(completedLessonIds),
      this.setCurrentLessonDay(
        hasCompletedLesson
          ? lessonProgress.currentLessonDay
          : Math.max(lessonProgress.currentLessonDay, lesson.dayNumber + 1)
      ),
      this.setLastStudyDate(studyDateKey),
      this.setStreak(nextProgress.streak),
      this.setLearnedWordsCount(nextProgress.learnedWordsCount),
      this.setPracticedSentencesCount(nextProgress.practicedSentencesCount),
    ]);

    return nextProgress;
  },

  async resetProgress(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  },
};
