import vCard from 'vcf';
import type { Guard, Guarded, MaybeArray } from './core/helpers/types';
import type {
  AnswerOnCallbackExtra,
  BotInfo,
  EditMessageExtra,
  FilteredUpdate,
  Message,
  MessageCallbackUpdate,
  SendMessageExtra,
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
  | U extends MessageCallbackUpdate
    ? MessageCallbackUpdate['message']
    : U extends { message: Message }
      ? Message
      : undefined;

type GetChatId<U extends Update> =
    | U extends { chat_id: number }
      ? number
      : U extends MessageCallbackUpdate
        ? number | undefined
        : U extends { message: Message }
          ? number
          : undefined;

type GetMsgId<U extends Update> =
    | U extends { message_id: string }
      ? string
      : U extends MessageCallbackUpdate
        ? string | undefined
        : U extends { message: Message }
          ? string
          : undefined;

type GetCallback<U extends Update> =
    | U extends MessageCallbackUpdate
      ? MessageCallbackUpdate['callback']
      : undefined;

type ContactInfo = {
  tel?: string,
  fullName?: string,
};

type Location = {
  latitude: number
  longitude: number
};

type Sticker = {
  width: number;
  height: number;
  url: string;
  code: string;
};

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

  assert<T extends string | number | object>(
    value: T | undefined,
    method: string,
  ): asserts value is T {
    if (value === undefined) {
      throw new TypeError(
        `OneMe: "${method}" isn't available for "${this.updateType}"`,
      );
    }
  }

  get updateType() {
    return this.update.update_type;
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

  get messageId() {
    return getMessageId(this.update) as GetMsgId<U>;
  }

  get callback() {
    return getCallback(this.update) as GetCallback<U>;
  }

  private _contactInfo?: ContactInfo;

  get contactInfo() {
    return (this._contactInfo ??= getContactInfo(this.update));
  }

  private _location?: Location;

  get location() {
    return (this._location ??= getLocation(this.update));
  }

  private _sticker?: Sticker;

  get sticker() {
    return (this._sticker ??= getSticker(this.update));
  }

  reply = async (text: string, extra?: Omit<SendMessageExtra, 'text'>) => {
    this.assert(this.chatId, 'reply');
    return this.api.sendMessageToChat(this.chatId, { text, ...extra });
  };

  editMessage = async (extra: EditMessageExtra) => {
    this.assert(this.messageId, 'editMessage');
    return this.api.editMessage(this.messageId, extra);
  };

  deleteMessage = async (messageId?: string) => {
    if (messageId !== undefined) {
      return this.api.deleteMessage(messageId);
    }
    this.assert(this.messageId, 'deleteMessage');
    return this.api.deleteMessage(this.messageId);
  };

  answerOnCallback = async (extra: AnswerOnCallbackExtra) => {
    this.assert(this.callback, 'answerOnCallback');
    return this.api.answerOnCallback(this.callback.callback_id, extra);
  };
}

const getChatId = (update: Update) => {
  if ('chat_id' in update) {
    return update.chat_id;
  }
  if ('message' in update && update.message && 'recipient' in update.message) {
    return update.message.recipient.chat_id;
  }
  return undefined;
};

const getMessage = (update: Update) => {
  if ('message' in update) {
    return update.message;
  }
  return undefined;
};

const getMessageId = (update: Update) => {
  if ('message_id' in update) {
    return update.message_id;
  }

  if ('message' in update) {
    return update.message?.body.mid;
  }

  return undefined;
};

const getCallback = (update: Update) => {
  if ('callback' in update) {
    return update.callback;
  }
  return undefined;
};

const getContactInfo = (update: Update): ContactInfo | undefined => {
  const message = getMessage(update);
  if (!message) return undefined;
  const contact = message.body.attachments?.find((attachment) => {
    return attachment.type === 'contact';
  });
  if (!contact?.payload.vcf_info) return undefined;
  // eslint-disable-next-line new-cap
  const vcf = new vCard().parse(contact.payload.vcf_info);
  return {
    tel: vcf.get('tel').valueOf() as string | undefined,
    fullName: vcf.get('fn').valueOf() as string | undefined,
  };
};

const getLocation = (update: Update): Location | undefined => {
  const message = getMessage(update);
  if (!message) return undefined;
  const location = message.body.attachments?.find((attachment) => {
    return attachment.type === 'location';
  });
  if (!location) return undefined;
  return {
    latitude: location.latitude,
    longitude: location.longitude,
  };
};

const getSticker = (update: Update): Sticker | undefined => {
  const message = getMessage(update);

  if (!message) return undefined;

  const sticker = message.body.attachments?.find((attachment) => {
    return attachment.type === 'sticker';
  });

  if (!sticker) return undefined;

  return {
    width: sticker.width,
    height: sticker.height,
    url: sticker.payload.url,
    code: sticker.payload.code,
  };
};
