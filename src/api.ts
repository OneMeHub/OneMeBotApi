import type { MaybeArray } from './core/helpers/types';

import {
  AnswerOnCallbackExtra,
  Client, DeleteMessageExtra, EditMessageExtra, RawApi, SendMessageExtra,
} from './core/network/api';
import type {
  BotCommand, EditMyInfoDTO, FlattenReq,
  GetUpdatesDTO, UpdateType,
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
    extra?: SendMessageExtra,
  ) => {
    return this.raw.messages.send({
      chat_id: chatId,
      ...extra,
    });
  };

  sendMessageToUser = async (
    userId: number,
    extra?: SendMessageExtra,
  ) => {
    return this.raw.messages.send({
      user_id: userId,
      ...extra,
    });
  };

  editMessage = async (
    messageId: string,
    extra?: EditMessageExtra,
  ) => {
    return this.raw.messages.edit({
      message_id: messageId,
      ...extra,
    });
  };

  deleteMessage = async (
    messageId: string,
    extra?: DeleteMessageExtra,
  ) => {
    return this.raw.messages.delete({ message_id: messageId, ...extra });
  };

  answerOnCallback = async (
    callbackId: string,
    extra?: AnswerOnCallbackExtra,
  ) => {
    return this.raw.messages.answerOnCallback({ callback_id: callbackId, ...extra });
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
