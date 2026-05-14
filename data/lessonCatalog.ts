import {
  getAllLessonWords,
  getAllLessons,
  getLessonById as getLessonByIdFromService,
  getNextLesson as getNextLessonFromService,
  getReviewLessonWords,
} from '@/services/lessonService';

export const lessonCatalog = getAllLessons();

export function getNextLesson(completedLessonIds: string[], currentLessonDay: number) {
  return getNextLessonFromService(currentLessonDay, completedLessonIds);
}

export function getLessonById(lessonId: string) {
  return getLessonByIdFromService(lessonId);
}

export { getAllLessonWords, getReviewLessonWords };
