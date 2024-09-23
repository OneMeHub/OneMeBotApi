import createDebug from 'debug';

import type {
  BotInfo, ClientOptions, Update, UpdateType,
} from './core/network/api';
import { Polling } from './core/network/polling';

import { Api } from './api';

const debug = createDebug('one-me:main');

type BotConfig = {
  clientOptions?: ClientOptions
};

type LaunchOptions = {
  allowedUpdates: UpdateType[]
};

export class Bot {
  api: Api;

  public botInfo?: BotInfo;

  private polling?: Polling;

  private pollingIsStarted = false;

  config: BotConfig;

  constructor(token: string, config?: BotConfig) {
    this.config = { ...config };
    this.api = new Api(token, this.config.clientOptions);
    debug('Created `Bot` instance');
  }

  start = async (options?: LaunchOptions) => {
    if (this.pollingIsStarted) {
      debug('Long polling already running');
      return;
    }

    this.polling = new Polling(this.api, options?.allowedUpdates);
    this.pollingIsStarted = true;

    this.botInfo ??= await this.api.getMyInfo();

    debug(`Starting @${this.botInfo.username}`);
    await this.polling.loop(this.handleUpdate);
  };

  stop = () => {
    if (!this.pollingIsStarted) {
      debug('Long polling is not running');
      return;
    }

    this.polling?.stop();
    this.pollingIsStarted = false;
  };

  private handleUpdate = async (update: Update) => {
    const updateId = `${update.update_type}:${update.timestamp}`;
    debug(`Processing update ${updateId}`);

    try {
      // Handle update here
    } finally {
      debug(`Finished processing update ${updateId}`);
    }
  };
}
