export type UserLevel = 'basic_review' | 'work_communication' | 'listening_speaking';

export type LessonCategory = 'daily_work' | 'work_dialogue' | 'business_korean';

export type LevelTestQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type DailyLessonWord = {
  id: string;
  korean: string;
  pronunciation: string;
  meaningVi: string;
  example: string;
};

export type DailyLessonSentence = {
  id?: string;
  korean: string;
  meaningVi: string;
};

export type LessonGrammar = {
  title: string;
  explanationVi: string;
  examples: string[];
};

export type DailyLessonQuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanationVi: string;
};

export type DailyLesson = {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  level: UserLevel;
  estimatedMinutes: number;
  words: DailyLessonWord[];
  sentences: DailyLessonSentence[];
  grammarTip: string;
  quiz: DailyLessonQuizQuestion[];
};

export type KoreanLesson = DailyLesson & {
  category: LessonCategory;
  objectives: string[];
  grammar: LessonGrammar;
};

export type LessonProgress = {
  completedLessonIds: string[];
  currentLessonDay: number;
  lastStudyDate: string | null;
};

export type WordProgressStatus = 'new' | 'remembered' | 'unsure' | 'forgotten';

export type WordProgress = {
  wordId: string;
  korean: string;
  pronunciation: string;
  meaningVi: string;
  example: string;
  status: WordProgressStatus;
  reviewCount: number;
  lastReviewedAt: string | null;
};

export type WordProgressMap = Record<string, WordProgress>;

export type WorkDialogue = {
  id: string;
  title: string;
  contextVi: string;
  koreanSentence: string;
  meaningVi: string;
  suggestedReply: string;
};

export type AppProgress = {
  hasCompletedOnboarding: boolean;
  hasCompletedLevelTest: boolean;
  userLevel: UserLevel | null;
  streak: number;
  learnedWordsCount: number;
  practicedSentencesCount: number;
};

export type StorageKey = keyof AppProgress;

export type LearningRoute = {
  title: string;
  description: string;
  href: '/daily-lesson' | '/lessons' | '/flashcards' | '/work-dialogues' | '/progress';
};
