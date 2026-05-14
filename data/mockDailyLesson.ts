import type { DailyLesson } from '@/types';

export const mockDailyLesson: DailyLesson = {
  id: 'day-1-work-greeting',
  dayNumber: 1,
  title: 'Bai hoc 5 phut: Chao hoi va bat dau cong viec',
  description: 'Lam quen voi loi chao va cac tu co ban o noi lam viec.',
  level: 'basic_review',
  estimatedMinutes: 5,
  words: [
    {
      id: 'meeting',
      korean: '회의',
      pronunciation: 'hoe-ui',
      meaningVi: 'cuoc hop',
      example: '오늘 회의가 있어요.',
    },
    {
      id: 'document',
      korean: '자료',
      pronunciation: 'ja-ryo',
      meaningVi: 'tai lieu',
      example: '자료를 보내 주세요.',
    },
    {
      id: 'schedule',
      korean: '일정',
      pronunciation: 'il-jeong',
      meaningVi: 'lich trinh',
      example: '일정을 확인할게요.',
    },
    {
      id: 'confirm',
      korean: '확인하다',
      pronunciation: 'hwak-in-ha-da',
      meaningVi: 'kiem tra, xac nhan',
      example: '메일을 확인했어요.',
    },
    {
      id: 'ask-favor',
      korean: '부탁하다',
      pronunciation: 'bu-tak-ha-da',
      meaningVi: 'nho, yeu cau giup',
      example: '하나만 부탁해도 될까요?',
    },
  ],
  sentences: [
    {
      korean: '오늘 회의는 몇 시에 시작해요?',
      meaningVi: 'Hom nay cuoc hop bat dau luc may gio?',
    },
    {
      korean: '자료를 이메일로 보내 드릴게요.',
      meaningVi: 'Toi se gui tai lieu qua email cho anh/chi.',
    },
    {
      korean: '확인하고 다시 말씀드리겠습니다.',
      meaningVi: 'Toi se kiem tra va bao lai sau.',
    },
  ],
  grammarTip:
    'Duoi cau "-겠습니다" dung trong moi truong cong viec de noi lich su ve viec minh se lam.',
  quiz: [
    {
      id: 'meeting-meaning',
      question: '"회의" nghia la gi?',
      options: ['Cuoc hop', 'Tai lieu', 'Lich trinh'],
      correctAnswer: 'Cuoc hop',
      explanationVi: '"회의" la cuoc hop, thuong gap trong moi truong cong so.',
    },
    {
      id: 'send-docs',
      question: 'Cau nao dung de noi "Toi se gui tai lieu qua email"?',
      options: [
        '자료를 이메일로 보내 드릴게요.',
        '오늘 회의가 있어요.',
        '일정을 확인할게요.',
      ],
      correctAnswer: '자료를 이메일로 보내 드릴게요.',
      explanationVi: 'Cau nay dung "보내 드릴게요" de noi lich su rang minh se gui cho nguoi nghe.',
    },
    {
      id: 'formal-ending',
      question: '"-겠습니다" phu hop voi tinh huong nao?',
      options: ['Noi lich su o noi lam viec', 'Noi voi ban than', 'Viet ten rieng'],
      correctAnswer: 'Noi lich su o noi lam viec',
      explanationVi: '"-겠습니다" tao sac thai trang trong, phu hop khi bao viec se lam o noi lam viec.',
    },
  ],
};
