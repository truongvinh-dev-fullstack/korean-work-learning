import type { LevelTestQuestion } from '@/types';

export const mockLevelTestQuestions: LevelTestQuestion[] = [
  {
    id: 'level-test-1',
    question: 'Từ nào có nghĩa là "công ty"?',
    options: ['회사', '학교', '병원', '시장'],
    correctAnswer: '회사',
  },
  {
    id: 'level-test-2',
    question: 'Câu nào dùng để chào trong môi trường làm việc?',
    options: ['안녕하세요', '잘 먹겠습니다', '괜찮아요', '미안합니다'],
    correctAnswer: '안녕하세요',
  },
  {
    id: 'level-test-3',
    question: '"Tôi đang làm việc" trong tiếng Hàn là câu nào?',
    options: ['저는 일하고 있어요', '저는 자고 있어요', '저는 먹고 있어요', '저는 가고 있어요'],
    correctAnswer: '저는 일하고 있어요',
  },
  {
    id: 'level-test-4',
    question: 'Khi muốn hỏi "Bạn có hiểu không?", chọn câu nào?',
    options: ['이해했어요?', '어디에 가요?', '몇 시예요?', '얼마예요?'],
    correctAnswer: '이해했어요?',
  },
  {
    id: 'level-test-5',
    question: 'Cách nói lịch sự của "Hãy giúp tôi với" là gì?',
    options: ['도와주세요', '빨리 와', '하지 마', '괜찮아'],
    correctAnswer: '도와주세요',
  },
];
