import { BotCommand, BotInfo } from '../../types';

export type GetMyInfoResponse = BotInfo;

export type EditMyInfoDTO = {
  body: {
    name?: string | null;
    description?: string | null;
    commands?: BotCommand[] | null;
    photo?: {
      url?: string | null;
      token?: string | null;
      photos?: Record<string, string> | null;
    }
  }
};

export type EditMyInfoResponse = BotInfo;
