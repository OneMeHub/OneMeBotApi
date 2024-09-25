import { Api } from '../api';
import type { FlattenReq } from '../types';
import type { EditMyInfoDTO } from './types';

export class BotsApi extends Api {
  getMyInfo = async () => {
    return this._get('me', {});
  };

  editMyInfo = async ({ ...body }: FlattenReq<EditMyInfoDTO>) => {
    return this._patch('me', { body });
  };
}
