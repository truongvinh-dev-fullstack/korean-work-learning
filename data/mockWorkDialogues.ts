import type { WorkDialogue } from '@/types';

export const mockWorkDialogues: WorkDialogue[] = [
  {
    id: 'greet-coworker',
    title: 'Chào đồng nghiệp',
    contextVi: 'Bạn gặp đồng nghiệp vào đầu giờ làm và muốn chào một cách tự nhiên.',
    koreanSentence: '안녕하세요. 좋은 아침입니다.',
    meaningVi: 'Xin chào. Chúc buổi sáng tốt lành.',
    suggestedReply: '안녕하세요. 오늘도 잘 부탁드립니다.',
  },
  {
    id: 'ask-task',
    title: 'Hỏi việc cần làm',
    contextVi: 'Bạn muốn hỏi quản lý hoặc đồng nghiệp hôm nay cần xử lý việc gì trước.',
    koreanSentence: '오늘 제가 먼저 해야 할 일이 뭐예요?',
    meaningVi: 'Hôm nay việc tôi cần làm trước là gì ạ?',
    suggestedReply: '먼저 이 자료를 확인해 주세요.',
  },
  {
    id: 'report-finished',
    title: 'Báo cáo đã hoàn thành',
    contextVi: 'Bạn đã làm xong một việc và cần báo lại ngắn gọn.',
    koreanSentence: '요청하신 일을 완료했습니다.',
    meaningVi: 'Tôi đã hoàn thành việc anh/chị yêu cầu.',
    suggestedReply: '확인해 보겠습니다. 수고하셨습니다.',
  },
  {
    id: 'request-day-off',
    title: 'Xin nghỉ',
    contextVi: 'Bạn cần xin nghỉ một ngày vì có việc cá nhân.',
    koreanSentence: '개인 사정으로 내일 하루 쉬어도 될까요?',
    meaningVi: 'Vì lý do cá nhân, ngày mai tôi nghỉ một ngày được không ạ?',
    suggestedReply: '네, 일정만 정리해 주세요.',
  },
  {
    id: 'apologize-mistake',
    title: 'Xin lỗi khi làm sai',
    contextVi: 'Bạn phát hiện mình làm sai và muốn xin lỗi kèm cam kết sửa lại.',
    koreanSentence: '제가 실수했습니다. 바로 수정하겠습니다.',
    meaningVi: 'Tôi đã mắc lỗi. Tôi sẽ sửa ngay.',
    suggestedReply: '괜찮습니다. 수정 후 다시 알려 주세요.',
  },
];
