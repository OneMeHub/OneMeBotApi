import type { Client } from './client';
import {
  Api, BotsApi, MessagesApi, SubscriptionsApi,
} from './modules';

export class RawApi extends Api {
  constructor(private readonly client: Client) {
    super(client);
  }

  public get = this._get;

  public post = this._post;

  public patch = this._patch;

  private _bots?: BotsApi;

  get bots() {
    return (this._bots ??= new BotsApi(this.client));
  }

  private _messages?: MessagesApi;

  get messages() {
    return (this._messages ??= new MessagesApi(this.client));
  }

  private _subscriptions?: SubscriptionsApi;

  get subscriptions() {
    return (this._subscriptions ??= new SubscriptionsApi(this.client));
  }
}