import { sleep } from '../../../../../utils';
import { OneMeError } from '../../error';
import { Api } from '../api';
import type { FlattenReq, SendMessageResponse } from '../types';
import type { SendMessageDTO, DeleteMessageDTO } from './types';

export class MessagesApi extends Api {
  send = async ({
    chat_id, user_id, disable_link_preview, ...body
  }: FlattenReq<SendMessageDTO>): Promise<SendMessageResponse> => {
    try {
      return await this._post('messages', {
        body,
        query: { chat_id, user_id, disable_link_preview },
      });
    } catch (err) {
      if (err instanceof OneMeError) {
        if (err.code === 'attachment.not.ready') {
          console.log('Attachment not ready');
          await sleep(1000);
          return this.send({
            chat_id, user_id, disable_link_preview, ...body,
          });
        }
      }
      throw err;
    }
  };

  edit = async ({ message_id, ...body }) => {
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

  answerOnCallback = async ({ callback_id, ...body }) => {
    return this._post('answers', {
      query: { callback_id },
      body,
    });
  };
}
