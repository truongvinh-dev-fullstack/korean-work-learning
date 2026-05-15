import type { DailyLesson } from '@/types';

export const mockDailyLesson: DailyLesson = {
  id: 'day-1-work-greeting',
  dayNumber: 1,
  title: 'Bài học 5 phút: Chào hỏi và bắt đầu công việc',
  description: 'Làm quen với lời chào và các từ cơ bản ở nơi làm việc.',
  level: 'basic_review',
  estimatedMinutes: 5,
  words: [
    {
      id: 'meeting',
      english: 'meeting',
      pronunciation: 'MEE-ting',
      meaningVi: 'cuộc họp',
      example: 'We have a meeting today.',
    },
    {
      id: 'document',
      english: 'document',
      pronunciation: 'DOK-yuh-ment',
      meaningVi: 'tài liệu',
      example: 'Please send me the document.',
    },
    {
      id: 'schedule',
      english: 'schedule',
      pronunciation: 'SKEJ-ool',
      meaningVi: 'lịch trình',
      example: 'I will check the schedule.',
    },
    {
      id: 'confirm',
      english: 'confirm',
      pronunciation: 'kuhn-FURM',
      meaningVi: 'xác nhận',
      example: 'I will confirm the schedule.',
    },
    {
      id: 'ask-favor',
      english: 'ask for a favor',
      pronunciation: 'ask for uh FAY-ver',
      meaningVi: 'nhờ giúp một việc',
      example: 'Could I ask you for a favor?',
    },
  ],
  sentences: [
    {
      english: 'What time does the meeting start today?',
      meaningVi: 'Hôm nay cuộc họp bắt đầu lúc mấy giờ?',
    },
    {
      english: 'I will send the document by email.',
      meaningVi: 'Tôi sẽ gửi tài liệu qua email.',
    },
    {
      english: 'I will check and get back to you.',
      meaningVi: 'Tôi sẽ kiểm tra và phản hồi lại cho bạn.',
    },
  ],
  grammarTip:
    'Dùng I will + động từ nguyên mẫu để nói lịch sự về việc mình sẽ làm trong công việc.',
  quiz: [
    {
      id: 'meeting-meaning',
      question: '"meeting" nghĩa là gì?',
      options: ['Cuộc họp', 'Tài liệu', 'Lịch trình'],
      correctAnswer: 'Cuộc họp',
      explanationVi: '"meeting" là cuộc họp, thường gặp trong môi trường công sở.',
    },
    {
      id: 'send-docs',
      question: 'Câu nào dùng để nói "Tôi sẽ gửi tài liệu qua email"?',
      options: [
        'I will send the document by email.',
        'We have a meeting today.',
        'I will check the schedule.',
      ],
      correctAnswer: 'I will send the document by email.',
      explanationVi: 'Câu này dùng I will để nói lịch sự rằng mình sẽ gửi tài liệu.',
    },
    {
      id: 'formal-ending',
      question: '"I will..." phù hợp với tình huống nào?',
      options: ['Nói lịch sự ở nơi làm việc', 'Nói tên riêng', 'Chào thân mật với bạn bè'],
      correctAnswer: 'Nói lịch sự ở nơi làm việc',
      explanationVi: '"I will..." phù hợp khi báo việc mình sẽ làm trong môi trường công việc.',
    },
  ],
};
