import { AttachmentRequest, Message, MessageLinkType } from '../../types';
import type { FlattenReq } from '../types';

export type SendMessageDTO = {
  query: {
    user_id?: number;
    chat_id?: number;
    disable_link_preview?: boolean,
  },
  body: {
    text?: string | null;
    attachments?: AttachmentRequest[] | null;
    link?: { type: MessageLinkType; mid: string } | null;
    notify?: boolean;
    format?: 'markdown' | 'html' | null;
  }
};

export type SendMessageExtra = Omit<FlattenReq<SendMessageDTO>, 'chat_id' | 'user_id'>;

export type SendMessageResponse = Message;

export type DeleteMessageDTO = {
  query: {
    message_id: string;
  }
};

export type DeleteMessageExtra = Omit<FlattenReq<DeleteMessageDTO>, 'message_id'>;

export type DeleteMessageResponse =
    | { success: true; }
    | { success: false; message: string };

export type EditMessageDTO = {
  query: {
    message_id: string
  },
  body: SendMessageDTO['body']
};

export type EditMessageExtra = Omit<FlattenReq<EditMessageDTO>, 'message_id'>;

export type EditMessageResponse =
    | { success: true; }
    | { success: false; message: string };
