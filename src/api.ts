import {
  AudioAttachment,
  FileAttachment,
  ImageAttachment,
  VideoAttachment,
} from './core/helpers/attachments';
import type { MaybeArray } from './core/helpers/types';
import { Upload } from './core/helpers/upload';
import type {
  UploadFileOptions, UploadImageOptions, UploadVideoOptions, UploadAudioOptions,
} from './core/helpers/upload';

import { RawApi } from './core/network/api';

import type {
  AnswerOnCallbackExtra, Client, DeleteMessageExtra,
  EditMessageExtra, SendMessageExtra, BotCommand,
  EditMyInfoDTO, FlattenReq, GetUpdatesDTO, UpdateType,
} from './core/network/api';

export class Api {
  raw: RawApi;

  upload: Upload;

  constructor(client: Client) {
    this.raw = new RawApi(client);
    this.upload = new Upload(this);
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
    text: string,
    extra?: SendMessageExtra,
  ) => {
    const { message } = await this.raw.messages.send({
      chat_id: chatId,
      text,
      ...extra,
    });
    return message;
  };

  sendMessageToUser = async (
    userId: number,
    text: string,
    extra?: SendMessageExtra,
  ) => {
    const { message } = await this.raw.messages.send({
      user_id: userId,
      text,
      ...extra,
    });
    return message;
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

  uploadImage = async (options: UploadImageOptions) => {
    const data = await this.upload.image(options);
    return new ImageAttachment(data);
  };

  uploadVideo = async (options: UploadVideoOptions) => {
    const data = await this.upload.video(options);
    return new VideoAttachment({ token: data.token });
  };

  uploadAudio = async (options: UploadAudioOptions) => {
    const data = await this.upload.audio(options);
    return new AudioAttachment({ token: data.token });
  };

  uploadFile = async (options: UploadFileOptions) => {
    const data = await this.upload.file(options);
    return new FileAttachment({ token: data.token });
  };
}
