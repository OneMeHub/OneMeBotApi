import type { MaybeArray } from './core/helpers/types';

import { createClient, RawApi } from './core/network/api';
import type {
  BotCommand, ClientOptions, EditMyInfoDTO, FlattenReq,
  GetUpdatesDTO, SendMessageDTO, UpdateType,
} from './core/network/api';

export class Api {
  raw: RawApi;

  constructor(token: string, options?: ClientOptions) {
    this.raw = new RawApi(createClient(token, options));
  }

  getMyInfo = async () => {
    return this.raw.bots.getMyInfo();
  };

  editMyInfo = async (extra: FlattenReq<EditMyInfoDTO>) => {
    return this.raw.bots.editMyInfo(extra);
  };

  setMyCommands = async (commands: BotCommand[]) => {
    return this.editMyInfo({ commands });
  };

  deleteMyCommands = async () => {
    return this.editMyInfo({ commands: [] });
  };

  sendMessageToChat = async (
    chatId: number,
    extra: Omit<FlattenReq<SendMessageDTO>, 'user_id' | 'chat_id'> = {},
  ) => {
    return this.raw.messages.send({
      chat_id: chatId,
      ...extra,
    });
  };

  sendMessageToUser = async (
    userId: number,
    extra: Omit<FlattenReq<SendMessageDTO>, 'user_id' | 'chat_id'> = {},
  ) => {
    return this.raw.messages.send({
      user_id: userId,
      ...extra,
    });
  };

  getUpdates = async (
    types: MaybeArray<UpdateType> = [],
    extra: Omit<FlattenReq<GetUpdatesDTO>, 'types'> = {},
  ) => {
    return this.raw.subscriptions.getUpdates({
      types: Array.isArray(types) ? types.join(',') : types,
      ...extra,
    });
  };
}
