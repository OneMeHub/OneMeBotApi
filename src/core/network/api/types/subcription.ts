import { Message } from './message';
import { User } from './user';

type MakeUpdate<Type extends string, Payload extends object> = {
  update_type: Type;
  timestamp: number;
} & {
  [key in keyof Payload]: Payload[key];
};

export type MessageCallbackUpdate = MakeUpdate<'message_callback', {
  callback: {
    timestamp: number;
    callback_id: string;
    payload?: string;
    user: User;
  }
  message?: Message | null;
  user_locale?: string | null;
}>;

export type MessageCreatedUpdate = MakeUpdate<'message_created', {
  message: Message;
  user_locale?: string | null;
}>;

export type MessageRemovedUpdate = MakeUpdate<'message_removed', {
  message_id: string;
  chat_id: number;
  user_id: number;
}>;

export type BotStartedUpdate = MakeUpdate<'bot_started', {
  chat_id: number;
  user: User;
  payload?: string | null;
  user_locale?: string;
}>;

export type MessageEditedUpdate = MakeUpdate<'message_edited', {
  message: Message;
}>;

export type UpdateType = Update['update_type'];

export type FilteredUpdate<Type extends UpdateType> =
    | Type extends 'message_created' ? MessageCreatedUpdate
      : Type extends 'message_callback' ? MessageCallbackUpdate
        : Type extends 'message_removed' ? MessageRemovedUpdate
          : Type extends 'message_edited' ? MessageEditedUpdate
            : Type extends 'bot_started' ? BotStartedUpdate
              : never;

export type Update =
  | BotStartedUpdate
  | MessageCallbackUpdate
  | MessageCreatedUpdate
  | MessageEditedUpdate
  | MessageRemovedUpdate;
