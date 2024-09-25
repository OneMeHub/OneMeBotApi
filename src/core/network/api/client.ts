import createDebug from 'debug';

const debug = createDebug('one-me:client');

const defaultOptions = {
  baseUrl: 'https://botapi.tamtam.chat',
} as const;

export type ClientOptions = Partial<typeof defaultOptions>;

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ReqOptions = {
  method?: HTTPMethod;
  body?: object | null,
  query?: Record<string, string | number | boolean | null | undefined>,
  path?: Record<string, string | number>
};

type CallOptions = {
  method: string;
  options: ReqOptions;
};

export const createClient = (token: string, options: ClientOptions = {}) => {
  const { baseUrl } = { ...defaultOptions, ...options };

  const call = async ({ method, options: callOptions }: CallOptions) => {
    const httpMethod = callOptions.method || 'GET';
    debug(`Call method ${httpMethod} /${method}`, JSON.stringify(callOptions, null, 2));

    if (!token) {
      return {
        status: 401,
        data: {
          code: 'verify.token',
          message: 'Empty access_token',
        },
      };
    }

    const url = new URL(`${method}?access_token=${token}`, baseUrl);

    Object.keys(callOptions.query ?? {}).forEach((param) => {
      const value = callOptions.query?.[param];
      if (!value) return;
      url.searchParams.set(param, value.toString());
    });

    const init: RequestInit = { ...getResponseInit(callOptions?.body), method: httpMethod };
    const res = await fetch(url.href, init);

    if (res.status === 401) {
      return {
        status: 401,
        data: {
          code: 'verify.token',
          message: 'Invalid access_token',
        },
      };
    }

    return {
      status: res.status,
      data: await res.json(),
    };
  };

  return { call };
};

export type Client = ReturnType<typeof createClient>;

const getResponseInit = (body?: ReqOptions['body']): RequestInit => {
  if (!body) return {};

  return {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  };
};
