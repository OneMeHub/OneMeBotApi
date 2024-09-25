import { Attachment, Message, MessageLinkType } from '../../types';

export type SendMessageDTO = {
  query: {
    user_id?: number;
    chat_id?: number;
    disable_link_preview?: boolean,
  },
  body: {
    text?: string | null;
    attachments?: Attachment[] | null;
    link?: { type: MessageLinkType; mid: string } | null;
    notify?: boolean;
    format?: 'markdown' | 'html' | null;
  }
};

export type SendMessageResponse = Message;
