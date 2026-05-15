import type { LearningRoute } from '@/types';

export const APP_NAME = 'English Work Learning';

export const DEFAULT_STREAK = 0;

export const LEARNING_ROUTES: LearningRoute[] = [
  {
    title: 'Bai hoc moi ngay',
    description: 'Khung bai hoc ngan de on tu, mau cau va cach dung trong cong viec.',
    href: '/daily-lesson',
  },
  {
    title: 'Flashcards',
    description: 'On tu vung va cum tu quan trong bang the ghi nho.',
    href: '/flashcards',
  },
  {
    title: 'Hoi thoai cong viec',
    description: 'Luyen cac mau hoi thoai thuong gap khi di lam.',
    href: '/work-dialogues',
  },
  {
    title: 'Tien do',
    description: 'Xem streak, so tu da hoc va so cau da luyen.',
    href: '/progress',
  },
];
