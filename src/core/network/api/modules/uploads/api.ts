import { Api } from '../api';
import { FlattenReq } from '../types';

import { GetUploadUrlDTO } from './types';

export class UploadsApi extends Api {
  getUploadUrl = async ({ ...query }: FlattenReq<GetUploadUrlDTO>) => {
    return this._post('uploads', { query });
  };
}
