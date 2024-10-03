import { ReqOptions } from '../client';
import type { EditMyInfoDTO, EditMyInfoResponse, GetMyInfoResponse } from './bots/types';
import type {
  AnswerOnCallbackDTO, AnswerOnCallbackResponse,
  DeleteMessageDTO,
  DeleteMessageResponse, EditMessageDTO, EditMessageResponse,
  SendMessageDTO,
  SendMessageResponse,
} from './messages/types';
import type { GetUpdatesDTO, GetUpdatesResponse } from './subscriptions/types';
import { GetUploadUrlResponse, GetUploadUrlDTO } from './uploads/types';

export * from './bots/types';
export * from './messages/types';
export * from './subscriptions/types';

export type FlattenReq<T extends Omit<ReqOptions, 'method'>> = T['body'] & T['query'] & T['path'];

export type ApiMethods = {
  GET: {
    me: {
      req: {};
      res: GetMyInfoResponse
    },
    updates: {
      req: GetUpdatesDTO
      res: GetUpdatesResponse
    }
  },
  POST: {
    messages: {
      req: SendMessageDTO,
      res: SendMessageResponse,
    },
    uploads: {
      req: GetUploadUrlDTO,
      res: GetUploadUrlResponse,
    },
    answers: {
      req: AnswerOnCallbackDTO,
      res: AnswerOnCallbackResponse,
    }
  },
  PATCH: {
    me: {
      req: EditMyInfoDTO,
      res: EditMyInfoResponse,
    }
  },
  PUT: {
    messages: {
      req: EditMessageDTO,
      res: EditMessageResponse,
    }
  },
  DELETE: {
    messages: {
      req: DeleteMessageDTO,
      res: DeleteMessageResponse,
    }
  }
};
