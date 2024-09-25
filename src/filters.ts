import type { Message, MessageCreatedUpdate, Update } from './core/network/api';

export const createdMessage = (...keys: Array<keyof Message['body']>) => {
  return (update: Update): update is MessageCreatedUpdate => {
    if (update.update_type !== 'message_created') return false;
    for (const key of keys) {
      if (!(key in update.message.body)) return false;
    }
    return true;
  };
};
