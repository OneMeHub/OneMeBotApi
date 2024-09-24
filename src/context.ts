import type { Guard, Guarded, MaybeArray } from './core/helpers/types';
import type {
  BotInfo,
  BotStartedUpdate,
  FilteredUpdate,
  MessageCallbackUpdate,
  MessageCreatedUpdate,
  MessageEditedUpdate,
  MessageRemovedUpdate,
  Update,
  UpdateType,
} from './core/network/api';

import { type Api } from './api';

export type FilteredContext<
  Ctx extends Context,
  Filter extends UpdateType | Guard<Ctx['update']>,
> = Filter extends UpdateType
  ? Ctx & Context<FilteredUpdate<Filter>>
  : Ctx & Context<Guarded<Filter>>;

type GetMessage<U extends Update> =
  | U extends MessageCallbackUpdate ? U['message']
    : U extends MessageCreatedUpdate ? U['message']
      : undefined;

type GetChatId<U extends Update> =
    | U extends MessageRemovedUpdate | BotStartedUpdate | MessageCreatedUpdate | MessageEditedUpdate ? number
      : number | null | undefined;

export class Context<U extends Update = Update> {
  constructor(
    readonly update: U,
    readonly api: Api,
    readonly botInfo?: BotInfo,
  ) {}

  has<Ctx extends Context, Filter extends UpdateType | Guard<Ctx['update']>>(
    this: Ctx,
    filters: MaybeArray<Filter>,
  ): this is FilteredContext<Ctx, Filter> {
    for (const filter of Array.isArray(filters) ? filters : [filters]) {
      if (typeof filter === 'function'
        ? filter(this.update)
        : filter === this.update.update_type
      ) {
        return true;
      }
    }

    return false;
  }

  get myId() {
    return this.botInfo?.user_id;
  }

  get chatId() {
    return getChatId(this.update) as GetChatId<U>;
  }

  get message() {
    return getMessage(this.update) as GetMessage<U>;
  }

  reply = async (text: string) => {
    if (!this.chatId) return;
    await this.api.sendMessageToChat(this.chatId, { text });
  };
}

const getChatId = (update: Update) => {
  if ('chat_id' in update) {
    return update.chat_id;
  }

  if ('message' in update) {
    return update.message?.recipient?.chat_id;
  }
};

const getMessage = (update: Update) => {
  if ('message' in update) {
    return update.message;
  }
};
