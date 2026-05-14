import type { DailyLesson, UserLevel } from '@/types';

function createLesson(
  dayNumber: number,
  title: string,
  description: string,
  level: UserLevel,
  focus: string
): DailyLesson {
  const lessonId = `day-${dayNumber}`;

  return {
    id: lessonId,
    dayNumber,
    title,
    description,
    level,
    estimatedMinutes: 5,
    words: [
      {
        id: `${lessonId}-word-1`,
        korean: focus,
        pronunciation: 'mock',
        meaningVi: 'tu khoa chinh cua bai',
        example: `${focus}를 확인하겠습니다.`,
      },
      {
        id: `${lessonId}-word-2`,
        korean: '업무',
        pronunciation: 'eop-mu',
        meaningVi: 'cong viec, nghiep vu',
        example: '업무를 시작하겠습니다.',
      },
      {
        id: `${lessonId}-word-3`,
        korean: '동료',
        pronunciation: 'dong-ryo',
        meaningVi: 'dong nghiep',
        example: '동료에게 물어보겠습니다.',
      },
      {
        id: `${lessonId}-word-4`,
        korean: '확인',
        pronunciation: 'hwak-in',
        meaningVi: 'xac nhan, kiem tra',
        example: '다시 확인해 주세요.',
      },
      {
        id: `${lessonId}-word-5`,
        korean: '요청',
        pronunciation: 'yo-cheong',
        meaningVi: 'yeu cau',
        example: '요청하신 일을 하겠습니다.',
      },
    ],
    sentences: [
      {
        korean: '오늘 어떤 업무를 먼저 하면 될까요?',
        meaningVi: 'Hom nay toi nen lam viec nao truoc?',
      },
      {
        korean: '확인하고 다시 말씀드리겠습니다.',
        meaningVi: 'Toi se kiem tra va bao lai sau.',
      },
      {
        korean: '도와주셔서 감사합니다.',
        meaningVi: 'Cam on anh/chi da giup do.',
      },
    ],
    grammarTip:
      'Trong moi truong lam viec, hay dung duoi cau "-겠습니다" de noi lich su ve hanh dong minh se lam.',
    quiz: [
      {
        id: `${lessonId}-quiz-1`,
        question: `"${focus}" la tu khoa cua bai nao?`,
        options: [title, 'Mua sam', 'Du lich'],
        correctAnswer: title,
        explanationVi: `Tu "${focus}" duoc dung lam tu khoa cho bai "${title}".`,
      },
      {
        id: `${lessonId}-quiz-2`,
        question: 'Cau nao dung de noi "Toi se kiem tra va bao lai sau"?',
        options: [
          '확인하고 다시 말씀드리겠습니다.',
          '지금 집에 갑니다.',
          '커피를 마시겠습니다.',
        ],
        correctAnswer: '확인하고 다시 말씀드리겠습니다.',
        explanationVi:
          'Cau nay dung "확인하고" la kiem tra va "다시 말씀드리겠습니다" la se bao lai mot cach lich su.',
      },
      {
        id: `${lessonId}-quiz-3`,
        question: '"업무" nghia la gi?',
        options: ['Cong viec', 'Ngay nghi', 'Bua trua'],
        correctAnswer: 'Cong viec',
        explanationVi: '"업무" thuong chi cong viec hoac nhiem vu trong moi truong lam viec.',
      },
    ],
  };
}

export const lessonCatalog: DailyLesson[] = [
  createLesson(1, 'Chao hoi va bat dau ngay lam', 'On loi chao va cach bat dau cong viec moi ngay.', 'basic_review', '인사'),
  createLesson(2, 'Hoi viec can lam', 'Luyen cach hoi uu tien cong viec va nhiem vu trong ngay.', 'basic_review', '업무'),
  createLesson(3, 'Xac nhan thong tin', 'Luyen cach xac nhan email, lich hop va tai lieu.', 'work_communication', '확인'),
  createLesson(4, 'Bao cao tien do', 'Noi ngan gon ve viec dang lam va viec da hoan thanh.', 'work_communication', '보고'),
  createLesson(5, 'Nho dong nghiep giup do', 'Luyen cach nho giup mot cach lich su.', 'work_communication', '부탁'),
  createLesson(6, 'Xin nghi va doi lich', 'Luyen cach xin nghi, doi lich hop, va bao ly do ngan gon.', 'listening_speaking', '휴가'),
  createLesson(7, 'Xin loi va sua loi', 'Luyen cach xin loi khi lam sai va de xuat cach sua.', 'listening_speaking', '실수'),
];

export function getNextLesson(completedLessonIds: string[], currentLessonDay: number) {
  return (
    lessonCatalog.find(
      (lesson) => lesson.dayNumber >= currentLessonDay && !completedLessonIds.includes(lesson.id)
    ) ?? lessonCatalog.find((lesson) => !completedLessonIds.includes(lesson.id)) ?? null
  );
}

export function getLessonById(lessonId: string) {
  return lessonCatalog.find((lesson) => lesson.id === lessonId) ?? null;
}

export function getAllLessonWords() {
  return lessonCatalog.flatMap((lesson) => lesson.words);
}

export function getReviewLessonWords(completedLessonIds: string[]) {
  const completedLessons = lessonCatalog.filter((lesson) => completedLessonIds.includes(lesson.id));

  if (completedLessons.length === 0) {
    return lessonCatalog[0]?.words ?? [];
  }

  return completedLessons.flatMap((lesson) => lesson.words);
}
