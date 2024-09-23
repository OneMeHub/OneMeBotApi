import { Api } from '../api';
import { FlattenReq } from '../types';
import { GetUpdatesDTO } from './types';

export class SubscriptionsApi extends Api {
  getUpdates = async ({ ...query }: FlattenReq<GetUpdatesDTO>) => {
    return this._get('updates', { query });
  };
}
