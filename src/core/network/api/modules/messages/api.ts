import { Api } from '../api';
import type { AnswerOnCallbackDTO, EditMessageDTO, FlattenReq } from '../types';
import type { SendMessageDTO, DeleteMessageDTO } from './types';

export class MessagesApi extends Api {
  send = async ({
    chat_id, user_id, disable_link_preview, ...body
  }: FlattenReq<SendMessageDTO>) => {
    return this._post('messages', {
      body,
      query: { chat_id, user_id, disable_link_preview },
    });
  };

  edit = async ({ message_id, ...body }: FlattenReq<EditMessageDTO>) => {
    return this._put('messages', {
      query: { message_id },
      body,
    });
  };

  delete = async ({ ...query }: FlattenReq<DeleteMessageDTO>) => {
    return this._delete('messages', {
      query,
    });
  };

  answerOnCallback = async ({ callback_id, ...body }: FlattenReq<AnswerOnCallbackDTO>) => {
    return this._post('answers', {
      query: { callback_id },
      body,
    });
  };
}
