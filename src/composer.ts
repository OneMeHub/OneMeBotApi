import type { MaybeArray } from './core/helpers/types';
import type { UpdateType } from './core/network/api';

import { Context, type FilteredContext } from './context';

type MaybePromise<T> = T | Promise<T>;

type NextFn = () => Promise<void>;

type MiddlewareFn<Ctx extends Context> = (
  ctx: Ctx,
  next: NextFn,
) => MaybePromise<unknown>;

interface MiddlewareObj<Ctx extends Context> {
  middleware: () => MiddlewareFn<Ctx>;
}

type Middleware<Ctx extends Context> = MiddlewareFn<Ctx> | MiddlewareObj<Ctx>;

export class Composer<Ctx extends Context> implements MiddlewareObj<Ctx> {
  private handler: MiddlewareFn<Ctx>;

  constructor(...middlewares: Array<Middleware<Ctx>>) {
    this.handler = compose(middlewares);
  }

  middleware = () => {
    return this.handler;
  };

  use = (...middlewares: Array<Middleware<Ctx>>) => {
    this.handler = compose([this.handler, ...middlewares]);
    return this;
  };

  on = <Filter extends UpdateType>(
    filters: MaybeArray<Filter>,
    ...middlewares: Array<Middleware<FilteredContext<Ctx, Filter>>>
  ) => {
    const handler = compose(middlewares);
    return this.use((ctx, next) => {
      if (ctx.has(filters)) return handler(ctx, next);
      return next();
    });
  };
}

const flatten = <Ctx extends Context>(mw: Middleware<Ctx>): MiddlewareFn<Ctx> => {
  return typeof mw === 'function'
    ? mw
    : (ctx, next) => mw.middleware()(ctx, next);
};

const concat = <Ctx extends Context>(first: MiddlewareFn<Ctx>, andThen: MiddlewareFn<Ctx>): MiddlewareFn<Ctx> => {
  return async (ctx, next) => {
    let nextCalled = false;
    await first(ctx, async () => {
      if (nextCalled) {
        throw new Error('`next` already called before!');
      }
      nextCalled = true;
      await andThen(ctx, next);
    });
  };
};

const pass = <Ctx extends Context>(_ctx: Ctx, next: NextFn) => {
  return next();
};

const compose = <Ctx extends Context>(middlewares: Array<Middleware<Ctx>>) => {
  if (!Array.isArray(middlewares)) {
    throw new Error('Middlewares must be an array');
  }
  if (middlewares.length === 0) {
    return pass;
  }
  return middlewares.map(flatten).reduce(concat);
};
