import { Attachment } from './attachment';
import { ChatType } from './chat';
import { MarkupElement } from './markup';
import { User } from './user';

export type MessageSender = User;

export type MessageRecipient = {
  chat_id: number | null;
  chat_type: ChatType;
};

export type MessageBody = {
  mid: string;
  seq: number;
  text: string | null;
  attachments: Attachment[] | null;
  markup?: MarkupElement[] | null;
};

export const enum MessageLinkType {
  forward = 'forward',
  reply = 'reply',
}

export type LinkedMessage = {
  type: MessageLinkType;
  sender?: MessageSender | null;
  chat_id?: number;
  message: MessageBody;
};

export type MessageStat = {
  views: number;
};

export type MessageConstructor = User;

export type Message = {
  sender?: MessageSender | null;
  recipient: MessageRecipient;
  timestamp: number;
  link?: LinkedMessage | null;
  body: MessageBody;
  stat?: MessageStat | null;
  url?: string | null;
  constructor?: MessageConstructor | null;
};
