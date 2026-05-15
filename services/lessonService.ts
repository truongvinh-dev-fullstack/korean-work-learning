import type { EnglishLesson, LessonCategory, UserLevel, WorkDialogue, WritingPrompt } from '@/types';
import { validateLessons } from '@/utils/validateLessons';

let cachedLessons: EnglishLesson[] | null = null;
let hasLoggedJsonLoadError = false;

function loadRawLessons(): unknown {
  try {
    return require('../assets/data/lessons.json');
  } catch (error) {
    if (!hasLoggedJsonLoadError) {
      console.warn('[lessonService] Cannot load assets/data/lessons.json.', error);
      hasLoggedJsonLoadError = true;
    }

    return [];
  }
}

function loadLessons() {
  if (cachedLessons) {
    return cachedLessons;
  }

  const result = validateLessons(loadRawLessons(), true);
  cachedLessons = result.validLessons;

  return cachedLessons;
}

export function validateLessonsOnStartup() {
  loadLessons();
}

export function getAllLessons(): EnglishLesson[] {
  return [...loadLessons()];
}

export function getLessonById(id: string): EnglishLesson | null {
  return loadLessons().find((lesson) => lesson.id === id) ?? null;
}

export function getLessonsByCategory(category: LessonCategory): EnglishLesson[] {
  return loadLessons().filter((lesson) => lesson.category === category);
}

export function getLessonsByLevel(level: UserLevel): EnglishLesson[] {
  return loadLessons().filter((lesson) => lesson.level === level);
}

export function getNextLesson(
  currentLessonDay: number,
  completedLessonIds: string[] = []
): EnglishLesson | null {
  const lessons = loadLessons();

  return (
    lessons.find(
      (lesson) => lesson.dayNumber >= currentLessonDay && !completedLessonIds.includes(lesson.id)
    ) ??
    lessons.find((lesson) => !completedLessonIds.includes(lesson.id)) ??
    null
  );
}

export function getAllLessonWords() {
  return loadLessons().flatMap((lesson) => lesson.words);
}

export function getReviewLessonWords(completedLessonIds: string[]) {
  const lessons = loadLessons();
  const completedLessons = lessons.filter((lesson) => completedLessonIds.includes(lesson.id));

  if (completedLessons.length === 0) {
    return lessons[0]?.words ?? [];
  }

  return completedLessons.flatMap((lesson) => lesson.words);
}

export function getWorkDialogues(): WorkDialogue[] {
  return loadLessons().flatMap((lesson) =>
    lesson.sentences.map((sentence, index) => ({
      id: sentence.id ?? `${lesson.id}-dialogue-${index + 1}`,
      title: lesson.title,
      contextVi: lesson.description,
      englishSentence: sentence.english,
      meaningVi: sentence.meaningVi,
      suggestedReply: lesson.sentences[index + 1]?.english ?? sentence.english,
    }))
  );
}

export function getWritingPrompts(completedLessonIds: string[] = []): WritingPrompt[] {
  const lessons = loadLessons();
  const sourceLessons =
    completedLessonIds.length > 0
      ? lessons.filter((lesson) => completedLessonIds.includes(lesson.id))
      : lessons.slice(0, 1);

  return sourceLessons.flatMap((lesson) =>
    lesson.sentences.map((sentence, index) => ({
      id: `${lesson.id}-writing-${sentence.id ?? index + 1}`,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      dayNumber: lesson.dayNumber,
      targetEnglish: sentence.english,
      meaningVi: sentence.meaningVi,
      hint: sentence.english
        .split(' ')
        .map((word) => word.charAt(0))
        .join(' '),
    }))
  );
}
