import createDebug from 'debug';

import type { Api } from '../../api';
import type { Update, UpdateType } from './api';

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
        debug('Error:', err);
      }
    }
    debug('Long polling is done');
  };

  stop = () => {
    debug('Stopping long polling');
    this.abortController.abort();
  };
}
