import type { LevelTestQuestion } from '@/types';

export const mockLevelTestQuestions: LevelTestQuestion[] = [
  {
    id: 'level-test-1',
    question: 'Từ nào có nghĩa là "công ty"?',
    options: ['company', 'school', 'hospital', 'market'],
    correctAnswer: 'company',
  },
  {
    id: 'level-test-2',
    question: 'Câu nào dùng để chào trong môi trường làm việc?',
    options: ['Good morning.', 'Enjoy your meal.', 'Never mind.', 'I am sorry.'],
    correctAnswer: 'Good morning.',
  },
  {
    id: 'level-test-3',
    question: '"Tôi đang làm việc" trong tiếng Anh là câu nào?',
    options: ['I am working.', 'I am sleeping.', 'I am eating.', 'I am leaving.'],
    correctAnswer: 'I am working.',
  },
  {
    id: 'level-test-4',
    question: 'Khi muốn hỏi "Bạn có hiểu không?", chọn câu nào?',
    options: ['Do you understand?', 'Where are you going?', 'What time is it?', 'How much is it?'],
    correctAnswer: 'Do you understand?',
  },
  {
    id: 'level-test-5',
    question: 'Cách nói lịch sự của "Hãy giúp tôi với" là gì?',
    options: ['Could you help me, please?', 'Come here now.', 'Do not do that.', 'It is fine.'],
    correctAnswer: 'Could you help me, please?',
  },
];
