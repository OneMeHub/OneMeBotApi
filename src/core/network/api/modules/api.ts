import type { Client, ReqOptions } from '../client';
import { OneMeError } from '../error';

import type { ApiMethods } from './types';

type ApiCallFn<HTTPMethod extends keyof ApiMethods, Res = unknown> = <
  Method extends keyof ApiMethods[HTTPMethod],
  MethodInput extends Method | string,
>(
  method: MethodInput,
  options: MethodInput extends Method
    // @ts-ignore
    ? ApiMethods[HTTPMethod][MethodInput]['req']
    : Omit<ReqOptions, 'method'>,
) => Promise<MethodInput extends Method
  // @ts-ignore
  ? ApiMethods[HTTPMethod][MethodInput]['res']
  : Res>;

export class Api {
  private readonly call: Client['call'];

  constructor(client: Client) {
    this.call = client.call;
  }

  private callApi = async (method: string, options: ReqOptions) => {
    const result = await this.call({
      method,
      options,
    });
    if (result.status !== 200) {
      throw new OneMeError(result.status, result.data);
    }
    return result.data;
  };

  protected _get: ApiCallFn<'GET'> = async (method, options) => {
    return this.callApi(method, { ...options, method: 'GET' });
  };

  protected _post: ApiCallFn<'POST'> = async (method, options) => {
    return this.callApi(method, { ...options, method: 'POST' });
  };

  protected _patch: ApiCallFn<'PATCH'> = async (method, options) => {
    return this.callApi(method, { ...options, method: 'PATCH' });
  };

  protected _put: ApiCallFn<'PUT'> = async (method, options) => {
    return this.callApi(method, { ...options, method: 'PUT' });
  };

  protected _delete: ApiCallFn<'DELETE'> = async (method, options) => {
    return this.callApi(method, { ...options, method: 'DELETE' });
  };
}
