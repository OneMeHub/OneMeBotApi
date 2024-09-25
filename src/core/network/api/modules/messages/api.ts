import { Api } from '../api';
import type { FlattenReq } from '../types';
import type { SendMessageDTO } from './types';

export class MessagesApi extends Api {
  send = async ({
    chat_id, user_id, disable_link_preview, ...body
  }: FlattenReq<SendMessageDTO>) => {
    return this._post('messages', {
      body,
      query: { chat_id, user_id, disable_link_preview },
    });
  };
}