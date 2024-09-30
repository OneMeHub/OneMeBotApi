import createDebug from 'debug';

import type { Api } from '../../api';
import { TamTamError, Update, UpdateType } from './api';

const debug = createDebug('one-me:polling');

export class Polling {
  private readonly abortController = new AbortController();

  private marker?: number;

  constructor(
    private readonly api: Api,
    private readonly allowedUpdates: UpdateType[] = [],
  ) {}

  loop = async (handleUpdate: (updates: Update) => Promise<void>) => {
    debug('Starting long polling');
    while (!this.abortController.signal.aborted) {
      try {
        const { updates, marker } = await this.api.getUpdates(this.allowedUpdates, {
          marker: this.marker,
        });
        this.marker = marker;
        await Promise.all(updates.map(handleUpdate));
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') return;
          if (
            err.name === 'FetchError'
              || (err instanceof TamTamError && err.status === 429)
              || (err instanceof TamTamError && err.status >= 500)
          ) {
            const retryAfter = 5;
            debug(`Failed to fetch updates, retrying after ${retryAfter}s.`, retryAfter, err);
            await new Promise((resolve) => {
              setTimeout(resolve, retryAfter * 1000);
            });
            return;
          }
        }
        throw err;
      }
    }
    debug('Long polling is done');
  };

  stop = () => {
    debug('Stopping long polling');
    this.abortController.abort();
  };
}
