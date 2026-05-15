import type { WorkDialogue } from '@/types';

export const mockWorkDialogues: WorkDialogue[] = [
  {
    id: 'greet-coworker',
    title: 'Chào đồng nghiệp',
    contextVi: 'Bạn gặp đồng nghiệp vào đầu giờ làm và muốn chào một cách tự nhiên.',
    englishSentence: 'Good morning. How are you today?',
    meaningVi: 'Xin chào. Chúc buổi sáng tốt lành.',
    suggestedReply: 'Good morning. I am doing well, thank you.',
  },
  {
    id: 'ask-task',
    title: 'Hỏi việc cần làm',
    contextVi: 'Bạn muốn hỏi quản lý hoặc đồng nghiệp hôm nay cần xử lý việc gì trước.',
    englishSentence: 'What should I do first today?',
    meaningVi: 'Hôm nay việc tôi cần làm trước là gì ạ?',
    suggestedReply: 'Please check this document first.',
  },
  {
    id: 'report-finished',
    title: 'Báo cáo đã hoàn thành',
    contextVi: 'Bạn đã làm xong một việc và cần báo lại ngắn gọn.',
    englishSentence: 'I have completed the task you requested.',
    meaningVi: 'Tôi đã hoàn thành việc anh/chị yêu cầu.',
    suggestedReply: 'I will review it. Thank you for your work.',
  },
  {
    id: 'request-day-off',
    title: 'Xin nghỉ',
    contextVi: 'Bạn cần xin nghỉ một ngày vì có việc cá nhân.',
    englishSentence: 'Could I take tomorrow off for personal reasons?',
    meaningVi: 'Vì lý do cá nhân, ngày mai tôi nghỉ một ngày được không ạ?',
    suggestedReply: 'Yes, please organize your schedule first.',
  },
  {
    id: 'apologize-mistake',
    title: 'Xin lỗi khi làm sai',
    contextVi: 'Bạn phát hiện mình làm sai và muốn xin lỗi kèm cam kết sửa lại.',
    englishSentence: 'I made a mistake. I will fix it right away.',
    meaningVi: 'Tôi đã mắc lỗi. Tôi sẽ sửa ngay.',
    suggestedReply: 'No problem. Please let me know after you fix it.',
  },
];
