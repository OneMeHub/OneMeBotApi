import { ReqOptions } from '../client';
import type { EditMyInfoDTO, EditMyInfoResponse, GetMyInfoResponse } from './bots/types';
import type {
  DeleteMessageDTO,
  DeleteMessageResponse,
  SendMessageDTO,
  SendMessageResponse,
} from './messages/types';
import type { GetUpdatesDTO, GetUpdatesResponse } from './subscriptions/types';

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
    }
  },
  PATCH: {
    me: {
      req: EditMyInfoDTO,
      res: EditMyInfoResponse,
    }
  },
  DELETE: {
    messages: {
      req: DeleteMessageDTO,
      res: DeleteMessageResponse,
    }
  }
};
