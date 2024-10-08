export type ChatType = 'dialog' | 'chat' | 'channel';

export type ChatStatus = 'active' | 'removed' | 'left' | 'closed' | 'suspended';

export type Chat = {
  chat_id: number;
  type: ChatType;
  status: ChatStatus;
  title: string | null;
  icon: { url: string } | null;
  last_event_time: number;
  participants_count: number;
  owner_id?: number | null;
  participants?: { [key: string]: number | undefined } | null;
  is_public: boolean;
  link?: string | null;
  description?: string | null;
  dialog_with_user?: {} | null;
  messages_count?: number | null;
  chat_message_id?: string | null;
  pinned_message?: object | null;
};
