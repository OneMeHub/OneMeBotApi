import type { MaybeArray } from './core/helpers/types';

import { Client, RawApi } from './core/network/api';
import type {
  BotCommand, EditMyInfoDTO, FlattenReq,
  GetUpdatesDTO, SendMessageDTO, UpdateType,
} from './core/network/api';

export class Api {
  raw: RawApi;

  constructor(client: Client) {
    this.raw = new RawApi(client);
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

  deleteMessage = async (messageId: string) => {
    return this.raw.messages.delete({ message_id: messageId });
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
